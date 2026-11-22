"""LRU model manager for AI4Bharat IndicTrans2 1B model families."""

import logging
import os
import time
from collections import OrderedDict
from typing import Dict, Optional, Tuple

from app.models.model_config import settings
from app.models.language_router import get_family_model_name

logger = logging.getLogger("IndicTrans2ModelLoader")


class ModelManager:
    max_loaded_models = 1

    def __init__(self):
        self.device = self._resolve_device()
        self.torch = None
        self.AutoTokenizer = None
        self.AutoModelForSeq2SeqLM = None
        self.is_neural_ready = False
        self._cache: OrderedDict[str, Dict[str, object]] = OrderedDict()
        self._bootstrap_frameworks()

    def _resolve_device(self) -> str:
        override = settings.device_override
        if override:
            return override
        try:
            import torch
            return "cuda" if torch.cuda.is_available() else "cpu"
        except ImportError:
            return "cpu"

    def _bootstrap_frameworks(self) -> None:
        try:
            import torch
            from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

            self.torch = torch
            self.AutoTokenizer = AutoTokenizer
            self.AutoModelForSeq2SeqLM = AutoModelForSeq2SeqLM
            self.is_neural_ready = True

            if self.device == "cpu":
                torch.set_num_threads(min(8, max(2, os.cpu_count() or 4)))
        except ImportError as exc:
            logger.error("IndicTrans2 dependencies unavailable: %s", exc)
            self.is_neural_ready = False

    def _evict_if_needed(self) -> None:
        while len(self._cache) >= self.max_loaded_models:
            family, entry = self._cache.popitem(last=False)
            logger.info("Evicting IndicTrans2 family '%s' from LRU cache", family)
            del entry
            if self.torch is not None and self.torch.cuda.is_available():
                self.torch.cuda.empty_cache()

    def get_model(self, family: str) -> Tuple[object, object]:
        if family in self._cache:
            self._cache.move_to_end(family)
            entry = self._cache[family]
            return entry["tokenizer"], entry["model"], entry["engine"]

        if not self.is_neural_ready:
            raise RuntimeError("PyTorch and Transformers are required for IndicTrans2 inference.")

        self._evict_if_needed()
        model_name = get_family_model_name(family)
        logger.info("Loading IndicTrans2 family '%s' from '%s'", family, model_name)

        if settings.use_nllb_fallback:
            fallback_name = settings.fallback_model_name
            logger.info("Using public NLLB fallback family for '%s'", family)
            dtype = self.torch.float16 if self.device == "cuda" and settings.use_fp16 else self.torch.float32
            tokenizer = self.AutoTokenizer.from_pretrained(
                fallback_name,
                src_lang="eng_Latn",
                trust_remote_code=True,
                token=settings.hf_token,
            )
            model = self.AutoModelForSeq2SeqLM.from_pretrained(
                fallback_name,
                trust_remote_code=True,
                torch_dtype=dtype,
                token=settings.hf_token,
            )
            model.to(self.device)
            model.eval()
            engine = f"NLLB-200 Fallback ({fallback_name})"
            self._cache[family] = {"tokenizer": tokenizer, "model": model, "engine": engine}
            return tokenizer, model, engine

        def load(dtype, device):
            tokenizer = self.AutoTokenizer.from_pretrained(
                model_name,
                trust_remote_code=True,
                token=settings.hf_token,
            )
            model = self.AutoModelForSeq2SeqLM.from_pretrained(
                model_name,
                trust_remote_code=True,
                torch_dtype=dtype,
                token=settings.hf_token,
            )
            model.to(device)
            model.eval()
            return tokenizer, model

        dtype = self.torch.float16 if self.device == "cuda" and settings.use_fp16 else self.torch.float32
        try:
            tokenizer, model = load(dtype, self.device)
        except Exception as exc:
            logger.warning("IndicTrans2 family '%s' unavailable (%s); loading public NLLB fallback", family, exc)
            fallback_name = settings.fallback_model_name
            tokenizer = self.AutoTokenizer.from_pretrained(
                fallback_name,
                src_lang="eng_Latn",
                trust_remote_code=True,
                token=settings.hf_token,
            )
            model = self.AutoModelForSeq2SeqLM.from_pretrained(
                fallback_name,
                trust_remote_code=True,
                torch_dtype=dtype,
                token=settings.hf_token,
            )
            try:
                model.to(self.device)
            except RuntimeError:
                if self.device == "cuda":
                    if self.torch.cuda.is_available():
                        self.torch.cuda.empty_cache()
                    model = self.AutoModelForSeq2SeqLM.from_pretrained(
                        fallback_name,
                        trust_remote_code=True,
                        torch_dtype=self.torch.float32,
                        token=settings.hf_token,
                    ).to("cpu")
                    self.device = "cpu"
                else:
                    raise
            model.eval()
            engine = f"NLLB-200 Fallback ({fallback_name})"
            self._cache[family] = {"tokenizer": tokenizer, "model": model, "engine": engine}
            return tokenizer, model, engine

        engine = f"AI4Bharat IndicTrans2 1B ({family})"
        self._cache[family] = {"tokenizer": tokenizer, "model": model, "engine": engine}
        return tokenizer, model, engine

    def unload_all(self) -> None:
        self._cache.clear()
        if self.torch is not None and self.torch.cuda.is_available():
            self.torch.cuda.empty_cache()


model_manager = ModelManager()
