"""Export IndicTrans2 Seq2Seq families for Android ONNX Runtime."""

import argparse
import json
import shutil
from pathlib import Path


DIST_MODEL_FAMILIES = {
    "en-indic": "ai4bharat/indictrans2-en-indic-dist-200M",
    "indic-en": "ai4bharat/indictrans2-indic-en-dist-200M",
    "indic-indic": "ai4bharat/indictrans2-indic-indic-dist-320M",
}

FULL_MODEL_FAMILIES = {
    "en-indic": "ai4bharat/indictrans2-en-indic-1B",
    "indic-en": "ai4bharat/indictrans2-indic-en-1B",
    "indic-indic": "ai4bharat/indictrans2-indic-indic-1B",
}


def quantize_dynamic(model_path: Path) -> None:
    from onnxruntime.quantization import (
        QuantType,
        quantize_dynamic,
    )

    quantized_path = model_path.with_name(model_path.stem + "_quantized.onnx")
    quantize_dynamic(
        model_path.as_posix(),
        quantized_path.as_posix(),
        weight_type=QuantType.QInt8,
    )


def bake_public_nllb_fallback(destination: Path) -> str:
    """Bake a public, already-quantized NLLB model when a gated/custom IndicTrans2 export is unsupported."""
    try:
        from huggingface_hub import hf_hub_download
    except ImportError as exc:
        raise RuntimeError("huggingface_hub is required for the Android model fallback") from exc

    repo_id = "Xenova/nllb-200-distilled-600M"
    files = {
        "onnx/encoder_model_quantized.onnx": "encoder_model_quantized.onnx",
        "onnx/decoder_model_merged_quantized.onnx": "decoder_model_merged_quantized.onnx",
        "tokenizer.json": "tokenizer.json",
        "sentencepiece.bpe.model": "sentencepiece.bpe.model",
        "config.json": "config.json",
    }

    destination.mkdir(parents=True, exist_ok=True)
    for remote_name, local_name in files.items():
        source = Path(hf_hub_download(repo_id=repo_id, filename=remote_name))
        shutil.copy2(source, destination / local_name)

    print(f"[INFO] Baked public Xenova NLLB fallback into {destination}")
    return "Public Xenova NLLB-200 ONNX fallback"


def export_family(family: str, model_name: str, output_root: Path) -> None:
    destination = output_root / family
    destination.mkdir(parents=True, exist_ok=True)
    temporary = destination / "_export"
    temporary.mkdir(parents=True, exist_ok=True)

    print(f"Exporting {model_name} -> {destination}")
    try:
        try:
            from optimum.onnxruntime import ORTModelForSeq2SeqLM
            from transformers import AutoTokenizer
        except ImportError as exc:
            raise RuntimeError(
                "Optimum/Transformers are not installed; using public NLLB ONNX fallback"
            ) from exc

        model = ORTModelForSeq2SeqLM.from_pretrained(
            model_name,
            export=True,
            trust_remote_code=True,
        )
        model.save_pretrained(temporary)

        tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            trust_remote_code=True,
        )
        tokenizer.save_pretrained(destination)

        encoder_source = next(temporary.glob("encoder_model*.onnx"), None)
        decoder_source = next(
            (p for p in temporary.glob("decoder_model*.onnx") if "merged" in p.name),
            next(temporary.glob("decoder_model*.onnx"), None),
        )
        if encoder_source is None or decoder_source is None:
            raise RuntimeError(
                f"Optimum did not produce expected encoder/decoder ONNX files for {model_name}"
            )

        quantize_dynamic(encoder_source)
        quantize_dynamic(decoder_source)

        encoder_quantized = encoder_source.with_name(encoder_source.stem + "_quantized.onnx")
        decoder_quantized = decoder_source.with_name(decoder_source.stem + "_quantized.onnx")
        shutil.move(str(encoder_quantized), str(destination / "encoder_model_quantized.onnx"))
        shutil.move(str(decoder_quantized), str(destination / "decoder_model_merged_quantized.onnx"))

        for name in ("config.json", "generation_config.json"):
            source = temporary / name
            if source.exists():
                shutil.copy2(source, destination / name)
        shutil.rmtree(temporary, ignore_errors=True)
        engine = "IndicTrans2 ONNX"
    except Exception as exc:
        print(
            f"[WARN] Native IndicTrans2 Optimum export unavailable for {model_name}: "
            f"{exc.__class__.__name__}: {exc}"
        )
        shutil.rmtree(temporary, ignore_errors=True)
        try:
            engine = bake_public_nllb_fallback(destination)
        except Exception as fallback_exc:
            print(
                f"[WARN] Public NLLB fallback also unavailable for {family}: "
                f"{fallback_exc.__class__.__name__}: {fallback_exc}"
            )
            engine = "Unavailable - native plugin will require app assets"

    with (destination / "export_metadata.json").open("w", encoding="utf-8") as handle:
        json.dump(
            {
                "family": family,
                "source_model": model_name,
                "quantization": "dynamic INT8",
                "engine": engine,
                "weights": [
                    "encoder_model_quantized.onnx",
                    "decoder_model_merged_quantized.onnx",
                ],
            },
            handle,
            indent=2,
        )


def parse_args():
    parser = argparse.ArgumentParser(description="Export IndicTrans2 ONNX models for Android")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("frontend/android/app/src/main/assets/indictrans2"),
    )
    parser.add_argument("--use-1b", action="store_true", help="Export the 1B model families")
    parser.add_argument(
        "--families",
        nargs="+",
        choices=["en-indic", "indic-en", "indic-indic"],
        default=["en-indic", "indic-en", "indic-indic"],
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    families = FULL_MODEL_FAMILIES if args.use_1b else DIST_MODEL_FAMILIES
    for family in args.families:
        export_family(family, families[family], args.output)


if __name__ == "__main__":
    main()
