# LinguaBridge AI - Setup & Execution Guide

This guide walks through setting up the environment, preparing datasets, running back-translation, fine-tuning with LoRA, evaluating the models, and running the web UI.

---

## 1. Environment Installation

Ensure you have Python 3.10+ installed.

```bash
# 1. Create a virtual environment
python -m venv venv

# Windows activate:
.\venv\Scripts\activate

# Linux/macOS activate:
source venv/bin/activate

# 2. Install ML dependencies
pip install -r ml/requirements.txt

# 3. Install Backend dependencies
pip install -r backend/requirements.txt
```

---

## 2. Step-by-Step Pipeline Execution

### Step 1: Generate or Place Raw Parallel Corpus
Generate seed datasets or place your `~3,500` pair corpus at `ml/data/parallel_corpus_raw.jsonl`:

```bash
python ml/generate_sample_data.py
```

### Step 2: Clean, Deduplicate & Split Corpus (80 / 10 / 10)
Applies Unicode NFC normalization, deduplication, script purity checks, and splits data into `train.jsonl` (80%), `val.jsonl` (10%), and `test.jsonl` (10%):

```bash
python ml/data_cleaning.py --input ml/data/parallel_corpus_raw.jsonl --output_dir ml/data --seed 42
```

Outputs generated:
- `ml/data/train.jsonl`
- `ml/data/val.jsonl`
- `ml/data/test.jsonl`
- `ml/data/cleaning_summary.json`

### Step 3: Run Monolingual Back-Translation
Translates native Kannada text (`kan_Knda`) to English (`eng_Latn`) with beam search, filters out low-quality/repeating pairs, and combines them with `train.jsonl`:

```bash
python ml/back_translation.py \
    --input_kannada ml/data/monolingual_kannada.txt \
    --output_synthetic ml/data/synthetic_parallel.jsonl \
    --merge_train ml/data/train.jsonl \
    --output_augmented ml/data/train_augmented.jsonl \
    --batch_size 16
```

Outputs generated:
- `ml/data/synthetic_parallel.jsonl`
- `ml/data/train_augmented.jsonl`

### Step 4: Fine-Tune with PEFT LoRA
Train LoRA adapter on parallel data or parallel + back-translated synthetic data:

```bash
# Train on clean parallel data only
python ml/train_lora.py \
    --data_path ml/data/train.jsonl \
    --output_dir ml/adapters/nllb_lora_baseline_data \
    --epochs 5 \
    --batch_size 8

# Train on augmented (Parallel + Back-Translation) data
python ml/train_lora.py \
    --data_path ml/data/train_augmented.jsonl \
    --output_dir ml/adapters/nllb_lora_bt \
    --epochs 5 \
    --batch_size 8
```

### Step 5: Comparative Evaluation (SacreBLEU & chrF++)
Compare Baseline vs. LoRA vs. LoRA+BT:

```bash
# Full evaluation:
python ml/evaluate.py \
    --test_file ml/data/test.jsonl \
    --lora_adapter ml/adapters/nllb_lora_baseline_data \
    --lora_bt_adapter ml/adapters/nllb_lora_bt \
    --metrics_out ml/outputs/metrics.json \
    --comparisons_out ml/outputs/comparison_examples.json

# Dry-run / fast schema verification:
python ml/evaluate.py --dry_run
```

Outputs generated:
- `ml/outputs/metrics.json`
- `ml/outputs/comparison_examples.json`

### Step 6: Push LoRA Adapter & Tokenizer to Hugging Face Hub
Uploads the adapter weights, tokenizer, and an automated Model Card to Hugging Face Hub:

```bash
# Set your Hugging Face write token
set HF_TOKEN=your_token_here

python ml/push_to_hub.py \
    --adapter_dir ml/adapters/nllb_lora_bt \
    --repo_id your-username/linguabridge-nllb200-lora-kan
```

---

## 3. Running the Full-Stack Application

### Start the FastAPI Backend:
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### Open the Frontend:
Simply open `frontend/index.html` in any web browser, or serve it using Python's built-in static server:
```bash
cd frontend
python -m http.server 3000
```
Open `http://localhost:3000` to interact with the translation UI, toggle models, view metrics, and inspect qualitative comparison examples.
