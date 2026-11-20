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
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden my-8 transition-all animate-fadeIn">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Columns className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-bold text-base tracking-tight">Side-by-Side Architectural Comparison</h3>
            <p className="text-xs text-slate-300">Evaluating outputs on identical input sentence</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close comparison"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Input Sentence Reminder */}
      <div className="bg-indigo-50/60 px-6 py-3 border-b border-indigo-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div>
          <span className="font-bold text-indigo-900 uppercase tracking-wider">Input Source:</span>{' '}
          <span className="text-indigo-950 font-medium italic">"{comparisonData.source_text}"</span>
        </div>
        <div className="flex items-center space-x-3 font-mono font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>LoRA+BT BLEU Gain: {relative_gain_summary.lora_bt_vs_baseline_bleu}</span>
        </div>
      </div>

      {/* 3-Column Comparative Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        
        {/* Column 1: Baseline Pretrained */}
        <div className="p-5 flex flex-col justify-between space-y-4 bg-slate-50/40">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                1. Baseline NLLB-200
              </span>
              <span className="text-[11px] font-mono text-slate-500">{baseline.latency_ms} ms</span>
            </div>
            <div className="text-sm text-slate-800 font-kannada leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 min-h-[90px]">
              {baseline.translated_text}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 flex justify-between font-mono">
            <span>BLEU: <strong className="text-slate-800">{baseline.benchmark_bleu}</strong></span>
            <span>chrF++: <strong className="text-slate-800">{baseline.benchmark_chrf}</strong></span>
          </div>
        </div>

        {/* Column 2: LoRA Fine-Tuned (Parallel Only) */}
        <div className="p-5 flex flex-col justify-between space-y-4 bg-blue-50/20">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                2. LoRA Fine-Tuned
              </span>
              <span className="text-[11px] font-mono text-slate-500">{finetuned_lora.latency_ms} ms</span>
            </div>
            <div className="text-sm text-slate-900 font-kannada leading-relaxed bg-white p-3.5 rounded-xl border border-blue-200 min-h-[90px]">
              {finetuned_lora.translated_text}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 flex justify-between font-mono">
            <span>BLEU: <strong className="text-blue-700">{finetuned_lora.benchmark_bleu}</strong></span>
            <span>chrF++: <strong className="text-blue-700">{finetuned_lora.benchmark_chrf}</strong></span>
          </div>
        </div>

        {/* Column 3: LoRA + Back-Translation (Best) */}
        <div className="p-5 flex flex-col justify-between space-y-4 bg-emerald-50/30 ring-1 ring-emerald-500/30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3. LoRA + Back-Translation</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">{finetuned_lora_bt.latency_ms} ms</span>
            </div>
            <div className="text-sm text-emerald-950 font-semibold font-kannada leading-relaxed bg-white p-3.5 rounded-xl border border-emerald-300 min-h-[90px] shadow-sm">
              {finetuned_lora_bt.translated_text}
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-200/60 text-xs text-emerald-900 flex justify-between font-mono">
            <span>BLEU: <strong className="text-emerald-700 font-bold">{finetuned_lora_bt.benchmark_bleu}</strong></span>
            <span>chrF++: <strong className="text-emerald-700 font-bold">{finetuned_lora_bt.benchmark_chrf}</strong></span>
          </div>
        </div>

      </div>

      {/* Qualitative Takeaway Banner */}
      <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 leading-relaxed">
        💡 <strong className="text-slate-800">Linguistic Observation:</strong> In morphologically rich Kannada, LoRA + Back-Translation correctly synthesizes case suffixes (e.g. <em>-ಗಳಿಗಾಗಿ</em> for plural dative) and preserves authentic vocabulary without the degenerate repetitions or omissions observed in the baseline.
      </div>

    </div>
  );
}
