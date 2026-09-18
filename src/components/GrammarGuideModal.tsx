import React, { useState, useMemo } from 'react';
import { X, BookOpen, Search, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface StudyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  subjectId: string;
}

import { 
  GuideRuleSection, 
  englishRules, 
  biologyRules, 
  historyRules, 
  mathRules,
  cRules,
  physicsRules
} from '../data/subjectGuides';

export const GrammarGuideModal: React.FC<StudyGuideModalProps> = ({
  isOpen,
  onClose,
  theme,
  subjectId,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isDark = theme === 'dark';

  // Select rules according to subject
  const currentRules = useMemo(() => {
    if (subjectId === 'biology') return biologyRules;
    if (subjectId === 'history') return historyRules;
    if (subjectId === 'math') return mathRules;
    if (subjectId === 'c-programming') return cRules;
    if (subjectId === 'physics') return physicsRules;
    return englishRules;
  }, [subjectId]);

  const subjectTitle = useMemo(() => {
    if (subjectId === 'biology') return 'คู่มือสรุปชีววิทยา ม.5 (พืช & สังเคราะห์ด้วยแสง)';
    if (subjectId === 'history') return 'คู่มือสรุปประวัติศาสตร์ & อารยธรรมโลก (กรีก โรมัน จีน อินเดีย)';
    if (subjectId === 'math') return 'คู่มือสรุปคณิตศาสตร์ ม.5 (ความน่าจะเป็น & กฎการนับ)';
    if (subjectId === 'c-programming') return 'คู่มือสรุปการเขียนโปรแกรมภาษาซี (C Programming)';
    if (subjectId === 'physics') return 'คู่มือสรุปฟิสิกส์ ม.5 (แสง & ทัศนอุปกรณ์)';
    return 'คู่มือสรุปหลักไวยากรณ์ภาษาอังกฤษ (Grammar Guide)';
  }, [subjectId]);

  const searchPlaceholder = useMemo(() => {
    if (subjectId === 'biology') return "ค้นหาเนื้อหา (พิมพ์คำค้นหา เช่น 'สปอโรไฟต์', 'วัฏจักรชีวิต', 'C4')...";
    if (subjectId === 'history') return "ค้นหาเนื้อหา (พิมพ์คำค้นหา เช่น 'กรีก', 'โรมัน', 'อเล็กซานเดอร์')...";
    if (subjectId === 'math') return "ค้นหาเนื้อหา (พิมพ์คำค้นหา เช่น 'ความน่าจะเป็น', 'หยิบของ', 'ลูกเต๋า')...";
    if (subjectId === 'c-programming') return "ค้นหาเนื้อหา (พิมพ์คำค้นหา เช่น 'printf', 'switch-case', 'ตัวแปร')...";
    if (subjectId === 'physics') return "ค้นหาเนื้อหา (พิมพ์คำค้นหา เช่น 'สเนลล์', 'เลนส์นูน', 'รุ้งกินน้ำ', 'สลิต')...";
    return "ค้นหาเนื้อหา (พิมพ์คำค้นหา เช่น 'mustn't', 'Modal Verbs', 'Future')...";
  }, [subjectId]);


  const categories = useMemo(() => {
    const set = new Set<string>();
    currentRules.forEach((r) => set.add(r.category));
    return ['all', ...Array.from(set)];
  }, [currentRules]);

  const filteredRules = currentRules.filter((rule) => {
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
    const matchesSearch =
      search.trim() === '' ||
      rule.title.toLowerCase().includes(search.toLowerCase()) ||
      rule.summary.toLowerCase().includes(search.toLowerCase()) ||
      rule.formula.toLowerCase().includes(search.toLowerCase()) ||
      rule.examples.some((ex) => ex.toLowerCase().includes(search.toLowerCase())) ||
      rule.keyDistinctions.some((d) => d.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-[#12141c] border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-stone-900'
        }`}
        id="grammar-guide-modal"
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between gap-4 ${
            isDark ? 'border-zinc-800 bg-[#161823]' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isDark ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-stone-900 text-white'
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>{subjectTitle}</span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                สรุปเนื้อหาสำคัญ สูตรโครงสร้าง ตัวอย่าง และจุดที่มักออกข้อสอบ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              isDark
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                : 'hover:bg-stone-200 text-stone-500 hover:text-stone-900'
            }`}
            id="close-grammar-guide-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div
          className={`p-4 border-b flex flex-col sm:flex-row items-center gap-3 ${
            isDark ? 'border-zinc-800 bg-[#12141c]' : 'border-stone-200 bg-white'
          }`}
        >
          <div className="relative flex-1 w-full">
            <Search
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-zinc-500' : 'text-stone-400'
              }`}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border focus:outline-hidden ${
                isDark
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-200 placeholder-zinc-500'
                  : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          {/* Category Tabs */}
          <div
            className={`flex flex-wrap items-center rounded-xl p-1 border text-xs shrink-0 ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-stone-100 border-stone-200'
            }`}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedCategory === cat
                    ? isDark
                      ? 'bg-zinc-800 text-white shadow-xs'
                      : 'bg-white text-stone-950 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat === 'all' ? 'ทุกหมวดหมู่' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {filteredRules.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                ไม่พบหัวข้อที่ตรงกับ "{search}"
              </p>
            </div>
          ) : (
            filteredRules.map((rule, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-colors ${
                  isDark
                    ? 'bg-[#181a24] border-zinc-800/80 text-zinc-200'
                    : 'bg-white border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-stone-900'}`}>
                    {rule.title}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      isDark ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {rule.category}
                  </span>
                </div>

                <p className={`text-xs sm:text-sm mb-3 ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                  {rule.summary}
                </p>

                {/* Formula box */}
                <div
                  className={`p-3 rounded-xl mb-3 font-mono text-xs border whitespace-pre-line leading-relaxed ${
                    isDark
                      ? 'bg-zinc-900/90 border-zinc-800 text-amber-300'
                      : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                >
                  <span className="font-bold text-amber-500 mr-2">สรุปแก่นสำคัญ:</span>
                  {rule.formula}
                </div>

                {/* Examples */}
                <div className="space-y-1 mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
                    ตัวอย่างและการประยุกต์
                  </span>
                  <ul className="space-y-1 text-xs">
                    {rule.examples.map((ex, exIdx) => (
                      <li key={exIdx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span className={isDark ? 'text-zinc-300' : 'text-stone-700'}>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key distinctions */}
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    isDark
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-200/90'
                      : 'bg-amber-50/70 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-amber-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ข้อควรจำ & จุดหลอกในข้อสอบ:</span>
                  </div>
                  <ul className="space-y-1 pl-4 list-disc list-outside">
                    {rule.keyDistinctions.map((d, dIdx) => (
                      <li key={dIdx} className="leading-relaxed">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t text-center text-xs ${
            isDark ? 'border-zinc-800 bg-[#161823] text-zinc-400' : 'border-stone-200 bg-stone-50 text-stone-500'
          }`}
        >
          <span>สรุปเนื้อหาเพื่อความเข้าใจอย่างแท้จริง • WINTER • กด Esc หรือคลิกปิดเพื่อกลับสู่แบบทดสอบ</span>
        </div>
      </div>
    </div>
  );
};
