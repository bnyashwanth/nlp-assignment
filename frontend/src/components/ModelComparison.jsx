/**
 * LinguaBridge AI - ModelComparison Component
 * ===========================================
 * Module: frontend/src/components/ModelComparison.jsx
 * Side-by-side comparison view evaluating Baseline vs. LoRA vs. LoRA+BT
 * outputs with quantitative benchmark metrics and qualitative linguistic notes.
 */

import React from 'react';
import { Award, CheckCircle2, Columns, X, Zap } from 'lucide-react';

export default function ModelComparison({ comparisonData, onClose }) {
  if (!comparisonData) return null;

  const { baseline, finetuned_lora, finetuned_lora_bt, relative_gain_summary } = comparisonData;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-[#E5E5EA] overflow-hidden my-8 transition-all animate-fadeIn">
      
      {/* Header */}
      <div className="bg-[#1D1D1F] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Columns className="w-5 h-5 text-white/80" />
          <div>
            <h3 className="font-bold text-base tracking-tight">Side-by-Side Architectural Comparison</h3>
            <p className="text-xs text-white/60">Evaluating outputs on identical input sentence</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Close comparison"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Input Sentence Reminder */}
      <div className="bg-[#F5F5F7] px-6 py-3 border-b border-[#E5E5EA] flex items-center justify-between flex-wrap gap-2 text-xs">
        <div>
          <span className="font-bold text-[#1D1D1F] uppercase tracking-wider">Input Source:</span>{' '}
          <span className="text-[#1D1D1F] font-medium italic">"{comparisonData.source_text}"</span>
        </div>
        <div className="flex items-center space-x-2 font-mono font-semibold text-[#0F766E] bg-[#F0FDFA] border border-[#0F766E]/20 px-2.5 py-0.5 rounded-full">
          <Award className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>LoRA+BT BLEU Gain: {relative_gain_summary.lora_bt_vs_baseline_bleu}</span>
        </div>
      </div>

      {/* 3-Column Comparative Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E5EA]">
        
        {/* Column 1: Baseline Pretrained */}
        <div className="p-5 flex flex-col justify-between space-y-4 bg-white">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]">
                1. Baseline NLLB-200
              </span>
              <span className="text-[11px] font-mono text-[#6E6E73]">{baseline.latency_ms} ms</span>
            </div>
            <div className="text-sm text-[#1D1D1F] font-kannada leading-relaxed bg-[#F5F5F7] p-3.5 rounded-xl border border-[#E5E5EA] min-h-[90px]">
              {baseline.translated_text}
            </div>
          </div>
          <div className="pt-2 border-t border-[#E5E5EA] text-xs text-[#6E6E73] flex justify-between font-mono">
            <span>BLEU: <strong className="text-[#1D1D1F]">{baseline.benchmark_bleu}</strong></span>
            <span>chrF++: <strong className="text-[#1D1D1F]">{baseline.benchmark_chrf}</strong></span>
          </div>
        </div>

        {/* Column 2: LoRA Fine-Tuned (Parallel Only) */}
        <div className="p-5 flex flex-col justify-between space-y-4 bg-white">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA]">
                2. LoRA Fine-Tuned
              </span>
              <span className="text-[11px] font-mono text-[#6E6E73]">{finetuned_lora.latency_ms} ms</span>
            </div>
            <div className="text-sm text-[#1D1D1F] font-kannada leading-relaxed bg-[#F5F5F7] p-3.5 rounded-xl border border-[#E5E5EA] min-h-[90px]">
              {finetuned_lora.translated_text}
            </div>
          </div>
          <div className="pt-2 border-t border-[#E5E5EA] text-xs text-[#6E6E73] flex justify-between font-mono">
            <span>BLEU: <strong className="text-[#1D1D1F]">{finetuned_lora.benchmark_bleu}</strong></span>
            <span>chrF++: <strong className="text-[#1D1D1F]">{finetuned_lora.benchmark_chrf}</strong></span>
          </div>
        </div>

        {/* Column 3: LoRA + Back-Translation (Best) */}
        <div className="p-5 flex flex-col justify-between space-y-4 bg-[#F0FDFA]/40 ring-1 ring-[#0F766E]/20">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/20 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>3. LoRA + Back-Translation</span>
              </span>
              <span className="text-[11px] font-mono text-[#6E6E73]">{finetuned_lora_bt.latency_ms} ms</span>
            </div>
            <div className="text-sm text-[#0F766E] font-semibold font-kannada leading-relaxed bg-white p-3.5 rounded-xl border border-[#0F766E]/30 min-h-[90px] shadow-sm">
              {finetuned_lora_bt.translated_text}
            </div>
          </div>
          <div className="pt-2 border-t border-[#E5E5EA] text-xs text-[#0F766E] flex justify-between font-mono">
            <span>BLEU: <strong className="text-[#0F766E] font-bold">{finetuned_lora_bt.benchmark_bleu}</strong></span>
            <span>chrF++: <strong className="text-[#0F766E] font-bold">{finetuned_lora_bt.benchmark_chrf}</strong></span>
          </div>
        </div>

      </div>

      {/* Qualitative Takeaway Banner */}
      <div className="px-6 py-3.5 bg-[#F5F5F7] border-t border-[#E5E5EA] text-xs text-[#6E6E73] leading-relaxed">
        💡 <strong className="text-[#1D1D1F]">Linguistic Observation:</strong> In morphologically rich Kannada, LoRA + Back-Translation correctly synthesizes case suffixes (e.g. <em>-ಗಳಿಗಾಗಿ</em> for plural dative) and preserves authentic vocabulary without the degenerate repetitions or omissions observed in the baseline.
      </div>

    </div>
  );
}
