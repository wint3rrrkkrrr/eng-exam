import React, { useState } from 'react';
import { X, BookOpen, Search, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface GrammarGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

interface GrammarRuleSection {
  title: string;
  category: 'Modals' | 'Future Forms';
  summary: string;
  formula: string;
  examples: string[];
  keyDistinctions: string[];
}

const grammarRules: GrammarRuleSection[] = [
  {
    title: '1. การบอกความสามารถ (Ability: Can / Could / Will be able to)',
    category: 'Modals',
    summary: 'ใช้บอกความสามารถทั้งในอดีต ปัจจุบัน และอนาคตอย่างถูกต้องตามกาลเวลา (Tenses)',
    formula: 'ปัจจุบัน: Can + V.inf | อดีต: Could + V.inf | อนาคต: Will be able to + V.inf',
    examples: [
      'She can speak three languages now. (ปัจจุบันทำได้)',
      'When I was six, I could ride a bike. (ในอดีตเคยทำได้)',
      'I will be able to help you tomorrow. (อนาคตจะทำได้ *ห้ามใช้ will can*)',
    ],
    keyDistinctions: [
      'ห้ามใช้ will can หรือ will could ซ้อนกันเด็ดขาด ต้องใช้รูป will be able to เสมอ',
      'หากเป็นความสามารถเฉพาะกิจในอดีตที่ทำสำเร็จได้ในสถานการณ์เจาะจง นิยมใช้ was/were able to',
    ],
  },
  {
    title: '2. การขออนุญาตและการให้อนุญาต (Permission: May / Can / Could / Be allowed to)',
    category: 'Modals',
    summary: 'ใช้ในการขออนุญาตอย่างสุภาพ หรือระบุกฎเกณฑ์ว่าได้รับอนุญาตให้ทำสิ่งใดได้บ้าง',
    formula: 'May / Can / Could I + V.inf ...? | ประธาน + is/am/are (not) allowed to + V.inf',
    examples: [
      'May I come in, please? (ขออนุญาตอย่างสุภาพและเป็นทางการมากที่สุด)',
      'Can I borrow your pen? (ขออนุญาตแบบเป็นกันเองในชีวิตประจำวัน)',
      'Students are allowed to use calculators during the test. (ได้รับอนุญาตตามระเบียบ)',
    ],
    keyDistinctions: [
      'May สุภาพ/เป็นทางการที่สุด > Could สุภาพกลางๆ > Can เป็นกันเอง',
      'be allowed to ใช้เมื่อพูดถึงกฎระเบียบหรือข้อบังคับของสถานที่/สถาบัน',
    ],
  },
  {
    title: '3. ข้อห้ามเด็ดขาด vs ไม่จำเป็นต้องทำ (Mustn\'t vs. Don\'t have to)',
    category: 'Modals',
    summary: 'ข้อแตกต่างที่สำคัญที่สุดในการสอบ: "ห้ามทำ" กับ "จะทำหรือไม่ทำก็ได้"',
    formula: 'ห้ามเด็ดขาด (Prohibition): Mustn\'t / May not + V.inf | ไม่จำเป็น (No Obligation): Don\'t have to / Needn\'t + V.inf',
    examples: [
      'You mustn\'t smoke here. (ห้ามสูบบุหรี่เด็ดขาด = ผิดกฎหมาย/อันตราย)',
      'Visitors may not enter this area. (ป้ายประกาศห้ามเข้าอย่างเป็นทางการ)',
      'You don\'t have to wear a tie; it\'s casual. (ไม่จำเป็นต้องผูกเนคไท แต่ถ้าอยากผูกก็ไม่ห้าม)',
      'Tomorrow is Sunday, so I needn\'t get up early. (พรุ่งนี้วันอาทิตย์ ไม่ต้องตื่นเช้าก็ได้)',
    ],
    keyDistinctions: [
      'Mustn\'t = ห้ามทำเด็ดขาด (You are forbidden to do it)',
      'Don\'t have to / Needn\'t = ไม่จำเป็นต้องทำ มีทางเลือกให้ทำหรือไม่ทำก็ได้',
    ],
  },
  {
    title: '4. ความจำเป็นและหน้าที่ (Obligation: Must vs. Have to / Have got to)',
    category: 'Modals',
    summary: 'บอกความจำเป็นจากใจตนเอง (Internal) หรือถูกบังคับจากกฎหมายภายนอก (External)',
    formula: 'Must + V.inf | Have to / Has to + V.inf | Have got to + V.inf | อดีต: Had to + V.inf',
    examples: [
      'I must stop eating junk food. (ความตั้งใจจากตัวเราเอง)',
      'In Britain, you have to drive on the left. (กฎหมายจราจรภายนอกบังคับ)',
      'I\'ve got to go now, I\'m late! (ภาษาพูดบอกความจำเป็นเร่งด่วน)',
      'Yesterday, I had to work late. (ความจำเป็นในอดีตต้องใช้ had to เพราะ must ไม่มีรูปอดีต)',
    ],
    keyDistinctions: [
      'รูปอดีตของทั้ง must และ have to คือ "had to" เท่านั้น',
    ],
  },
  {
    title: '5. การแนะนำและตักเตือน (Advice: Should / Ought to / Had better)',
    category: 'Modals',
    summary: 'ให้คำแนะนำทางศีลธรรม ความเหมาะสม หรือตักเตือนเรื่องผลเสียที่จะตามมา',
    formula: 'Should / Ought to + V.inf | Had better (\'d better) + Bare Infinitive (ไม่มี to)',
    examples: [
      'You should see a doctor. (แนะนำทั่วไป)',
      'You ought not to drive so fast. (ปฏิเสธ: ought not to)',
      'You\'d better leave now, or you will miss the train. (เตือนว่าถ้าไม่ทำจะมีผลเสียตามมา)',
    ],
    keyDistinctions: [
      'Had better ต้องตามด้วย V.inf โดยไม่มี to เสมอ (รูปปฏิเสธคือ had better not)',
      'รูปปฏิเสธของ ought to คือ ought not to',
    ],
  },
  {
    title: '6. การคาดเดาและฟันธงความจริง (Logical Deduction: Must / Can\'t / Might)',
    category: 'Modals',
    summary: 'สรุปอนุมานจากหลักฐานที่เห็นว่า "ต้องเป็นแบบนั้นแน่ๆ" หรือ "ไม่มีทางเป็นไปได้เด็ดขาด"',
    formula: 'มั่นใจว่าจริง 99%: Must + V.inf | มั่นใจว่าไม่มีทางจริง: Can\'t + V.inf | ไม่แน่ใจ 50%: Might / May / Could + V.inf',
    examples: [
      'He has three cars. He must be rich. (มีหลักฐาน 3 คัน = ต้องรวยแน่ๆ)',
      'She just ate a huge meal. She can\'t be hungry. (เพิ่งกินอิ่ม = ไม่มีทางหิวแน่นอน)',
      'Where is John? - He might be in the library. (อาจจะอยู่ที่นั่น แต่ไม่แน่ใจ)',
    ],
    keyDistinctions: [
      'ในการคาดเดาเชิงปฏิเสธ ห้ามใช้ mustn\'t ให้ใช้ "can\'t" เท่านั้น (can\'t be = ไม่มีทางเป็นไปได้)',
    ],
  },
  {
    title: '7. รูปแบบบอกอนาคต (Future Forms: Will vs. Be Going To vs. Present Continuous)',
    category: 'Future Forms',
    summary: 'แยกแยะการตัดสินใจทันที, การวางแผนล่วงหน้า, การทำนายจากหลักฐาน, และการนัดหมายแน่นอน',
    formula: 'Will + V.inf | Be going to + V.inf | Present Continuous (is/am/are + V.ing)',
    examples: [
      'The phone is ringing. I\'ll get it. (ตัดสินใจทันทีขณะพูด ณ วินาทีนั้น = Will)',
      'Look at those dark clouds! It is going to rain. (ทำนายจากหลักฐานที่เห็นตรงหน้า = Be going to)',
      'We are going to paint our room next week. (วางแผนตั้งใจไว้ล่วงหน้า = Be going to)',
      'I am seeing the dentist at 3 PM tomorrow. (นัดหมายระบุวันเวลาแน่นอน = Present Continuous)',
      'The train leaves at 8:00 tonight. (ตารางเวลาสาธารณะ = Present Simple)',
    ],
    keyDistinctions: [
      'นัดหมายมีวันเวลา/สถานที่แน่นอน = Present Continuous (am/is/are + V.ing)',
      'ตารางรถ/เครื่องบิน/รอบหนัง = Present Simple (V.1)',
      'เห็นหลักฐานตรงหน้า (เมฆดำ, บันไดโยก) = be going to',
      'ตัดสินใจทันที/สัญญา/เสนอช่วยเหลือ = will',
    ],
  },
  {
    title: '8. เหตุการณ์กำลังดำเนินอยู่ในอนาคต & อนุประโยคบอกเวลา (Future Continuous & Time Clauses)',
    category: 'Future Forms',
    summary: 'การกระทำที่กำลังดำเนินอยู่ ณ เวลาเจาะจงในอนาคต และกฎการใช้ Time Clauses',
    formula: 'Future Continuous: Will be + V.ing | Time Clauses: When / As soon as / After + Present Simple (V.1), will + V.inf',
    examples: [
      'This time tomorrow, I will be lying on the beach. (เวลานี้พรุ่งนี้จะกำลังนอนอยู่บนชายหาด)',
      'I will call you when I get home. (หลัง when ใช้ get ห้ามใช้ will get)',
      'As soon as she arrives, we will start the meeting. (หลัง as soon as ใช้ arrives)',
    ],
    keyDistinctions: [
      'หลังคำเชื่อมบอกเวลา (when, as soon as, before, after, until) ห้ามใส่ will เด็ดขาด ให้ใช้ Present Simple เสมอ',
    ],
  },
];

export const GrammarGuideModal: React.FC<GrammarGuideModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Modals' | 'Future Forms'>('all');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const filteredRules = grammarRules.filter((rule) => {
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
    const matchesSearch =
      search === '' ||
      rule.title.toLowerCase().includes(search.toLowerCase()) ||
      rule.summary.toLowerCase().includes(search.toLowerCase()) ||
      rule.formula.toLowerCase().includes(search.toLowerCase()) ||
      rule.keyDistinctions.some((d) => d.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-[#12141c] border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
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
              <h2 className="text-base sm:text-lg font-bold">
                สรุปหลักไวยากรณ์ภาษาอังกฤษ (Grammar Guide)
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                กฎสำคัญของ Modal Verbs และ Future Forms พร้อมคำอธิบายภาษาไทย
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
              placeholder="ค้นหากฎไวยากรณ์ (เช่น 'mustn\'t', 'going to', 'ความสามารถ', 'ขออนุญาต')..."
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
            className={`flex items-center rounded-xl p-1 border text-xs shrink-0 ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-stone-100 border-stone-200'
            }`}
          >
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedCategory === 'all'
                  ? isDark
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'bg-white text-stone-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ทุกหมวดหมู่
            </button>
            <button
              onClick={() => setSelectedCategory('Modals')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedCategory === 'Modals'
                  ? isDark
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'bg-white text-stone-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Modal Verbs
            </button>
            <button
              onClick={() => setSelectedCategory('Future Forms')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedCategory === 'Future Forms'
                  ? isDark
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'bg-white text-stone-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Future Forms
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {filteredRules.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                ไม่พบหัวข้อไวยากรณ์ที่ตรงกับ "{search}"
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
                  className={`p-3 rounded-xl mb-3 font-mono text-xs border ${
                    isDark
                      ? 'bg-zinc-900/90 border-zinc-800 text-amber-300'
                      : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                >
                  <span className="font-bold text-amber-500 mr-2">โครงสร้าง:</span>
                  {rule.formula}
                </div>

                {/* Examples */}
                <div className="space-y-1 mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
                    ตัวอย่างประโยคจริง
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
                    <span>ข้อควรระวัง & เคล็ดลับทำข้อสอบ:</span>
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
          <span>สรุปเนื้อหาเพื่อความเข้าใจอย่างแท้จริง • กด Esc หรือคลิกปิดเพื่อกลับสู่หน้าแบบทดสอบ</span>
        </div>
      </div>
    </div>
  );
};
