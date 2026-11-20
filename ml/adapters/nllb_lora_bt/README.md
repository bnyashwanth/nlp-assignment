---
language:
- en
- kn
language_bcp47:
- eng_Latn
- kan_Knda
tags:
- translation
- nllb
- nllb-200
- lora
- peft
- low-resource
- kannada
- english
- back-translation
license: apache-2.0
base_model: facebook/nllb-200-distilled-600M
metrics:
- bleu
- chrf
pipeline_tag: translation
---

# LinguaBridge AI: English ↔ Kannada NMT (LoRA + Back-Translation)

**LinguaBridge AI** provides high-quality, parameter-efficient Neural Machine Translation for the **English (eng_Latn) ↔ Kannada (kan_Knda)** low-resource language pair.

This model is a parameter-efficient adapter fine-tuned on [`facebook/nllb-200-distilled-600M`](https://huggingface.co/facebook/nllb-200-distilled-600M) using **LoRA (Low-Rank Adaptation)** with authentic low-resource parallel data augmented via **synthetic back-translation**.

---

## 📊 Benchmark Evaluation (SacreBLEU & chrF++)

Evaluated on an independent, held-out test split of English-Kannada sentences:

| System / Model Configuration | SacreBLEU (↑) | chrF++ (↑) | Relative BLEU Gain |
| :--------------------------- | :-----------: | :--------: | :----------------: |
| **1. Baseline Pretrained NLLB-200 (600M)** | 18.45 | 41.2 | Reference |
| **2. LoRA Fine-Tuned (Parallel Data Only)** | 25.8 | 52.65 | **+39.8%** |
| **3. LoRA + Back-Translation (Augmented)** | **29.35** | **57.8** | **+59.1%** |

> **Note on Kannada & chrF++:**  
> Kannada is a morphologically rich, agglutinative Dravidian language with complex case inflections (*vibhakti*). While word-level BLEU is sensitive to minor suffix mismatches, **chrF++** evaluates character n-grams and accurately reflects genuine semantic fluency and inflectional correctness.

---

## 🛠️ Pipeline & Engineering Details

1. **Preprocessing & Filtering:**
   - Unicode Normalization (NFC) preserving Kannada conjuncts (*aksharas*) and virama (U+0CCD).
   - Strict script-purity filtering (Kannada block `U+0C80` to `U+0CFF`).
   - Length-ratio and degenerate repetition filtering.
2. **Back-Translation (Target -> Source):**
   - Monolingual native Kannada sentences translated to English using beam search.
   - Filtered for quality and merged to train the forward translation decoder on authentic native Kannada syntax.
3. **Parameter-Efficient LoRA:**
   - Rank $r = 16$, $\alpha = 32$, target attention projections (`q_proj`, `v_proj`, `k_proj`, `out_proj`).
   - Trains $< 1\%$ of total parameters, preventing catastrophic forgetting.

---

## 🚀 Quickstart & Inference

```python
import torch
from peft import PeftModel
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

base_model_name = "facebook/nllb-200-distilled-600M"
adapter_id = "linguabridge-ai/nllb200-lora-eng-kan"

# 1. Load Tokenizer
tokenizer = AutoTokenizer.from_pretrained(base_model_name, src_lang="eng_Latn")

# 2. Load Base Model and LoRA Adapter
base_model = AutoModelForSeq2SeqLM.from_pretrained(
    base_model_name,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto",
)
model = PeftModel.from_pretrained(base_model, adapter_id)
model.eval()

# 3. Translate
english_text = "The government announced new educational policies for rural schools."
inputs = tokenizer(english_text, return_tensors="pt").to(model.device)

target_lang_id = tokenizer.convert_tokens_to_ids("kan_Knda")
generated_tokens = model.generate(
    **inputs,
    forced_bos_token_id=target_lang_id,
    max_length=128,
    num_beams=4,
)

kannada_translation = tokenizer.decode(generated_tokens[0], skip_special_tokens=True)
print("Kannada Output:", kannada_translation)
```

---

## 📜 Citation & Credits
- **Project:** LinguaBridge AI
- **Foundation Model:** NLLB Team (Meta AI), *No Language Left Behind: Scaling Human-Centered Machine Translation*, 2022.
- **LoRA:** Hu et al., *LoRA: Low-Rank Adaptation of Large Language Models*, 2021.
- **Back-Translation:** Sennrich et al., *Improving Neural Machine Translation Models with Monolingual Data*, 2016.