import React, { useState, useMemo } from 'react';
import { X, BookOpen, Search, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface StudyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  subjectId: string;
}

interface GuideRuleSection {
  title: string;
  category: string;
  summary: string;
  formula: string;
  examples: string[];
  keyDistinctions: string[];
}

const englishRules: GuideRuleSection[] = [
  {
    title: '1. การบอกความสามารถ (Ability: Can / Could / Will be able to)',
    category: 'Modal Verbs',
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
    category: 'Modal Verbs',
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
    category: 'Modal Verbs',
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
    category: 'Modal Verbs',
    summary: 'บอกความจำเป็นจากใจตนเอง (Internal) หรือถูกบังคับจากกฎหมายภายนอก (External)',
    formula: 'Must + V.inf (ความรู้สึกผู้พูด) | Have to + V.inf (กฎระเบียบภายนอก)',
    examples: [
      'I must study hard; the exam is tomorrow. (ฉันรู้สึกว่าต้องตั้งใจ)',
      'In Thailand, drivers have to drive on the left. (กฎหมายจราจรกำหนดไว้)',
    ],
    keyDistinctions: [
      'Have to ผันตามประธานและ Tense ได้ (He has to / I had to / will have to)',
      'Must ไม่มีรูปอดีต หากเป็นอดีตต้องเปลี่ยนเป็น had to เสมอ',
    ],
  },
  {
    title: '5. การคาดเดาความน่าจะเป็น (Deduction: Must / Might / Can\'t)',
    category: 'Modal Verbs',
    summary: 'ประเมินความมั่นใจจากหลักฐานที่มี 100% มั่นใจว่าใช่ vs 100% มั่นใจว่าไม่ใช่ vs 50% อาจจะ',
    formula: 'มั่นใจ 100% ว่าใช่: Must be | คาดว่า 50%: Might / May / Could be | มั่นใจ 100% ว่าไม่ใช่: Can\'t be',
    examples: [
      'The ground is wet; it must have rained. (มั่นใจมากเพราะมีหลักฐานพื้นเปียก)',
      'He is not at home; he might be at the gym. (อาจจะอยู่ที่ยิม)',
      'He has lived in London for 10 years; he can\'t be a stranger there. (เป็นไปไม่ได้ที่จะไม่คุ้นเคย)',
    ],
    keyDistinctions: [
      'ห้ามใช้ mustn\'t ในการคาดเดาว่า "เป็นไปไม่ได้" ต้องใช้ can\'t be เสมอ',
    ],
  },
  {
    title: '6. การบอกอนาคต (Future: Will vs. Be going to vs. Present Continuous)',
    category: 'Future Forms',
    summary: 'ตัดสินใจทันที vs วางแผนล่วงหน้า vs นัดหมายระบุเวลาชัดเจน',
    formula: 'Will + V.inf (Spontaneous/Prediction) | Be going to + V.inf (Plan/Evidence) | Is/Am/Are + V.ing (Arrangement)',
    examples: [
      'Look at those dark clouds! It is going to rain. (มีหลักฐานเห็นชัดเจน)',
      'I\'m thirsty. I will get some water. (ตัดสินใจทันทีตอนพูด)',
      'I am flying to Tokyo next Monday at 9 AM. (จองตั๋วนัดหมายแน่นอนแล้ว)',
    ],
    keyDistinctions: [
      'มีหลักฐานตรงหน้า (Evidence) ให้ใช้ be going to เสมอ',
      'ข้อเสนอช่วยเหลือหรือสัญญา (Offers/Promises) ใช้ will',
    ],
  },
];

const biologyRules: GuideRuleSection[] = [
  {
    title: '1. วัฏจักรชีวิตแบบสลับ (Alternation of Generations)',
    category: 'วัฏจักรชีวิตพืช',
    summary: 'พืชมีสองระยะสลับกัน คือ สปอโรไฟต์ (Sporophyte 2n) และแกมีโทไฟต์ (Gametophyte n)',
    formula: 'สปอโรไฟต์ (2n) --[ไมโอซิส]--> สปอร์ (n) --[ไมโทซิส]--> แกมีโทไฟต์ (n) --[สร้างเซลล์สืบพันธุ์]--> ไซโกต (2n) --[ไมโทซิส]--> สปอโรไฟต์ (2n)',
    examples: [
      'มอส/ลิเวอร์เวิร์ต: แกมีโทไฟต์เด่น (n)',
      'เฟิร์น: สปอโรไฟต์เด่น (2n) แต่แกมีโทไฟต์ (โพรทัลลัส) ดำรงชีวิตอิสระได้',
      'พืชมีเมล็ด (สน, พืชดอก): สปอโรไฟต์เด่นชัดเจน แกมีโทไฟต์ลดรูปอยู่บนสปอโรไฟต์',
    ],
    keyDistinctions: [
      'พืชสร้างสปอร์ด้วยไมโอซิส (Meiosis) และสร้างเซลล์สืบพันธุ์ด้วยไมโทซิส (Mitosis) แตกต่างจากสัตว์',
      'ไซโกต (2n) พัฒนาไปเป็นเอ็มบริโอ (Embryo 2n)',
    ],
  },
  {
    title: '2. การปฏิสนธิซ้อนของพืชดอก (Double Fertilization)',
    category: 'การสืบพันธุ์พืชดอก',
    summary: 'ลักษณะเฉพาะของพืชดอก โดยสเปิร์ม 2 ตัวเข้าปฏิสนธิพร้อมกัน 2 จุดในถุงเอ็มบริโอ (Embryo sac)',
    formula: 'สเปิร์มที่ 1 (n) + เซลล์ไข่ (Egg n) = ไซโกต (Zygote 2n) --> พัฒนาเป็น เอ็มบริโอ (ต้นอ่อน)\nสเปิร์มที่ 2 (n) + โพลาร์นิวคลีไอ (Polar nuclei n+n) = เอนโดสเปิร์ม (Endosperm 3n) --> อาหารเลี้ยงต้นอ่อน',
    examples: [
      'ละอองเรณู (Pollen grain) ตกบนยอดเกสรเพศเมีย แล้วงอกหลอดเรณู (Pollen tube) เจาะผ่านไมโครไพล์',
      'รังไข่ (Ovary) เจริญไปเป็น ผล (Fruit)',
      'ออวุล (Ovule) เจริญไปเป็น เมล็ด (Seed)',
    ],
    keyDistinctions: [
      'เซลล์ในถุงเอ็มบริโอที่สมบูรณ์มี 7 เซลล์ 8 นิวเคลียส (แอนติโพดัล 3, โพลาร์นิวเคลียส 2 ในเซลล์กลาง, ซินเนอร์จิด 2, ไข่ 1)',
      'เอนโดสเปิร์มมีโครโมโซม 3n เสมอในพืชดอก',
    ],
  },
  {
    title: '3. การลำเลียงสารในพืช (Xylem & Phloem)',
    category: 'โครงสร้างและการลำเลียง',
    summary: 'ไซเล็มลำเลียงน้ำและแร่ธาตุขึ้นทิศทางเดียว โฟลเอ็มลำเลียงสารอาหารซูโครสทุกทิศทาง',
    formula: 'ไซเล็ม (Xylem): เซลล์หลักคือ Tracheid & Vessel member (เซลล์ตายเมื่อโตเต็มที่)\nโฟลเอ็ม (Phloem): เซลล์หลักคือ Sieve tube member & Companion cell (เซลล์มีชีวิต ไม่มีนิวเคลียส)',
    examples: [
      'แรงดึงจากการคายน้ำ (Transpiration pull): แรงหลักในการดึงน้ำขึ้นสู่ยอดต้นไม้สูง',
      'แรงดันราก (Root pressure): ทำให้เกิดปรากฏการณ์ กัตเตชัน (Guttation) หยดน้ำออกทางรูไฮดาโทด (Hydathode)',
      'กลไกการไหลของสารละลาย (Pressure-flow hypothesis): ลำเลียงจากแหล่งสร้าง (Source) ไปยังแหล่งรับ (Sink)',
    ],
    keyDistinctions: [
      'น้ำเคลื่อนที่ผ่านเซลล์พืชได้ 3 ทาง: Apoplast (ผ่านผนังเซลล์), Symplast (ผ่านพลาสโมเดสมาตา), Transmembrane (ผ่านเยื่อหุ้มเซลล์)',
      'แถบแคสพาเรียน (Casparian strip) ที่เอนโดเดอร์มิส สกัดกั้นวิถี Apoplast บังคับให้น้ำเข้าสู่ Symplast',
    ],
  },
  {
    title: '4. การสังเคราะห์ด้วยแสงและการเปรียบเทียบพืช C3, C4, CAM',
    category: 'การสังเคราะห์ด้วยแสง',
    summary: 'ปฏิกิริยาแสง (Thylakoid) ได้ ATP + NADPH + O2 และวัฏจักรคัลวิน (Stroma) ตรึง CO2 เป็นน้ำตาล',
    formula: 'C3: ตรึง CO2 โดยเอนไซม์ Rubisco ได้สารตัวแรกคือ PGA (3C) เกิดที่ Mesophyll อย่างเดียว\nC4: ตรึง CO2 สองครั้ง ครั้งแรกด้วย PEP carboxylase ได้ OAA (4C) ที่ Mesophyll แล้วส่งไปทำ Calvin cycle ที่ Bundle sheath\nCAM: ตรึง CO2 สองครั้งเหมือน C4 แต่แยกด้วย "เวลา" (เปิดปากใบตรึงกลางคืน เก็บใน Vacuole รูป Malate ทำ Calvin cycle กลางวัน)',
    examples: [
      'พืช C3: ข้าวเจ้า ข้าวสาลี ถั่ว ทั่วไป',
      'พืช C4: ข้าวโพด ข้าวฟ่าง อ้อย หญ้าแพรก (มี Kranz anatomy)',
      'พืช CAM: สับปะรด กระบองเพชร กล้วยไม้ ว่านหางจระเข้ ศรนารายณ์',
    ],
    keyDistinctions: [
      'พืช C4 และ CAM ลดการเกิด Photorespiration (การหายใจเชิงแสง) ได้อย่างมีประสิทธิภาพ',
      'พืช C4 แยกบริเวณที่เกิด (Spatial separation) ส่วน CAM แยกตามช่วงเวลา (Temporal separation)',
    ],
  },
];

const historyRules: GuideRuleSection[] = [
  {
    title: '1. อารยธรรมกรีกโบราณ (Ancient Greece)',
    category: 'อารยธรรมตะวันตก',
    summary: 'กำเนิดบนคาบสมุทรบอลข่านและหมู่เกาะอีเจียน ภูมิประเทศเป็นภูเขาสูงทำให้เกิดนครรัฐอิสระ (Polis)',
    formula: 'เอเธนส์ (Athens) = ต้นกำเนิดประชาธิปไตย & ปรัชญา | สปาร์ตา (Sparta) = ระบอบทหารนิยม (Militarism) & คณาธิปไตย',
    examples: [
      'นักปรัชญาสำคัญ: โสเครติส (Socrates) -> เพลโต (Plato เขียน The Republic) -> อริสโตเติล (Aristotle บิดาแห่งชีววิทยา/ตรรกศาสตร์)',
      'มหากาพย์อีเลียดและโอดิสซีย์ โดย โฮเมอร์ (Homer)',
      'สถาปัตยกรรมหัวเสา 3 แบบ: ดอริก (Doric เรียบง่าย), ไอโอนิก (Ionic หัวม้วน), โครินเธียน (Corinthian หรูหราใบไม้)',
      'วิหารพาร์เธนอน (Parthenon) บนเนินอะโครโพลิส สร้างถวายเทพีเอเธนา',
    ],
    keyDistinctions: [
      'ยุคเฮเลนิก (Hellenic): ยุคคลาสสิกของกรีกแท้',
      'ยุคเฮลเลนิสติก (Hellenistic): ยุคที่พระเจ้าอเล็กซานเดอร์มหาราชเผยแพร่วัฒนธรรมกรีกผสมผสานกับอียิปต์และเปอร์เซีย',
    ],
  },
  {
    title: '2. อารยธรรมโรมัน (Ancient Rome)',
    category: 'อารยธรรมตะวันตก',
    summary: 'กำเนิดบริเวณลุ่มแม่น้ำไทเบอร์ คาบสมุทรอิตาลี โดดเด่นด้านกฎหมาย วิศวกรรม และการปกครองจักรวรรดิ',
    formula: 'กษัตริย์ (Monarchy) -> สาธารณรัฐ (Republic ปกครองโดยกงสุล & วุฒิสภา) -> จักรวรรดิ (Empire เริ่มต้นที่ ออกัสตัส ซีซาร์)',
    examples: [
      'กฎหมายสิบสองโต๊ะ (Twelve Tables): รากฐานกฎหมายลายลักษณ์อักษรของโลกตะวันตก ความเสมอภาคหน้ากฎหมาย',
      'วิศวกรรม: การใช้คอนกรีต ประตูโค้ง (Arch) หลังคาโดม (Dome) ท่อส่งน้ำ (Aqueduct) และถนนโรมัน (Appian Way)',
      'สิ่งก่อสร้างเด่น: โคลอสเซียม (Colosseum) สนามประลองกลาดิเอเตอร์, วิหารแพนธีออน (Pantheon)',
      'ยุคสันติภาพโรมัน (Pax Romana): ยุคทอง 200 ปีที่สงบสุขและรุ่งเรืองที่สุด',
    ],
    keyDistinctions: [
      'จักรพรรดิคอนสแตนติน (Constantine) ทรงออกพระราชกฤษฎีกาแห่งมิลาน (Edict of Milan) ให้เสรีภาพในการนับถือศาสนาคริสต์',
      'จักรพรรดิยุสตินเนียน (Justinian) แห่งโรมันตะวันออก (ไบแซนไทน์) ทรงรวบรวมประมวลกฎหมายจัสติเนียน (Corpus Juris Civilis)',
    ],
  },
  {
    title: '3. อารยธรรมจีนโบราณ (Ancient China)',
    category: 'อารยธรรมตะวันออก',
    summary: 'กำเนิดบริเวณลุ่มแม่น้ำหวางเหอ (แม่น้ำเหลือง) โดดเด่นด้านแนวคิดปรัชญา ราชวงศ์ และ 4 ยอดสิ่งประดิษฐ์',
    formula: 'ราชวงศ์สำคัญ: เซี่ย -> ซาง (อักษรกระดูกเสือ) -> โจว (อาณัติแห่งสวรรค์, ขงจื๊อ/เล่าจื๊อ) -> ฉิน (จิ๋นซี, รวมแผ่นดิน, กำแพงเมืองจีน) -> ฮั่น (สอบจอหงวน, เส้นทางสายไหม) -> ถัง -> ซ่ง -> หมิง',
    examples: [
      '4 ยอดสิ่งประดิษฐ์ของจีน: กระดาษ (ไช่หลุน สมัยฮั่น), ดินปืน, เข็มทิศ, แท่นพิมพ์ (สมัยซ่ง)',
      'ลัทธิขงจื๊อ (Confucianism): เน้นความกตัญญู (Filial piety) คุณธรรม มนุษยธรรม และระเบียบทางสังคม',
      'ลัทธิเต๋า (Taoism โดย เล่าจื๊อ): เน้นการกลมกลืนกับธรรมชาติและพลังหยิน-หยาง',
      'นิติธรรมนิยม (Legalism / ฝ่าเจีย): กฎหมายเข้มงวด ลงโทษรุนแรง ใช้ในราชวงศ์ฉิน',
    ],
    keyDistinctions: [
      'แนวคิด "อาณัติแห่งสวรรค์" (Mandate of Heaven) เกิดขึ้นในสมัยราชวงศ์โจว เพื่อสร้างความชอบธรรมในการเปลี่ยนราชวงศ์',
      'ระบบการสอบคัดเลือกข้าราชการ (จอหงวน/เคอจวี่) เริ่มใช้อย่างเป็นระบบในสมัยราชวงศ์สุยและฮั่น และรุ่งเรืองในสมัยถัง-ซ่ง',
    ],
  },
  {
    title: '4. อารยธรรมอินเดียโบราณ (Ancient India)',
    category: 'อารยธรรมตะวันออก',
    summary: 'กำเนิดลุ่มแม่น้ำสินธุ (โมเฮนโจ-ดาโร & ฮารัปปา) โดดเด่นด้านการวางผังเมือง ศาสนาพราหมณ์-ฮินดู พุทธ และคณิตศาสตร์',
    formula: 'อารยธรรมลุ่มน้ำสินธุ (ดราวิเดียน) -> ยุคพระเวท (อารยันนำระบบวรรณะเข้ามา) -> ยุคพุทธกาลและมหาชนบท -> จักรวรรดิเมารยะ (พระเจ้าอโศกมหาราช) -> จักรวรรดิคุปตะ (ยุคทอง)',
    examples: [
      'ระบบวรรณะ 4 วรรณะ: พราหมณ์ (นักบวช), กษัตริย์ (นักรบ/ผู้ปกครอง), แพศย์ (พ่อค้า/กสิกร), ศูทร (กรรมกร) และนอกวรรณะคือ จัณฑาล',
      'พระเจ้าอโศกมหาราช: ทรงหันมาอุปถัมภ์พระพุทธศาสนาหลังสงครามกาลิงคะ ส่งสมณทูต 9 สายเผยแผ่ทั่วโลก',
      'คณิตศาสตร์และดาราศาสตร์ (ยุคคุปตะ): การคิดค้นระบบเลขฐานสิบ เลขอารบิก และเลขศูนย์ (0) โดย อารยภัฏ (Aryabhata)',
      'วรรณคดีเอก: มหากาพย์มหาภารตะ (มีคัมภีร์ภควัทคีตา) และมหากาพย์รามายณะ โดย ฤาษีวาลมีกิ',
    ],
    keyDistinctions: [
      'อารยธรรมลุ่มน้ำสินธุมีการวางผังเมืองเป็นตารางกริด มีระบบระบายน้ำใต้ดิน และสระน้ำสาธารณะ (The Great Bath) ที่ล้ำสมัย',
      'ยุคราชวงศ์คุปตะ (Gupta Empire) ได้รับการยกย่องให้เป็น "ยุคทองของอารยธรรมอินเดียโบราณ" ด้านศิลปะ วรรณคดี และวิทยาศาสตร์',
    ],
  },
];

const mathRules: GuideRuleSection[] = [
  {
    title: '1. กฎเกณฑ์เบื้องต้นเกี่ยวกับการนับ (Fundamental Counting Principle)',
    category: 'การนับและความน่าจะเป็น',
    summary: 'หลักการนับแบบกฎการคูณ (ทำงานต่อเนื่องกันหลายขั้นตอน) และกฎการบวก (ทำงานเสร็จสิ้นแยกกรณีกัน)',
    formula: 'กฎการคูณ: n = n1 × n2 × ... × nk (ทำงาน k ขั้นตอนต่อเนื่อง)\nกฎการบวก: n = n1 + n2 + ... + nk (แยกกรณีอิสระ แต่ละกรณีจบในตัวเอง)',
    examples: [
      'เสื้อ 4 ตัว กางเกง 3 ตัว แต่งตัวได้: 4 × 3 = 12 แบบ (กฎการคูณ)',
      'เลือกอาหาร 5 อย่าง และเครื่องดื่ม 4 อย่าง = 5 × 4 = 20 ชุด',
      'สร้างรหัส 3 หลักจากเลข 0-9 ซ้ำได้ = 10 × 10 × 10 = 1,000 รหัส',
    ],
    keyDistinctions: [
      'ถ้าขั้นตอน "ยังไม่เสร็จ" ต้องทำต่อ ให้เอาจำนวนวิธีมา "คูณกัน"',
      'ถ้าแต่ละกรณี "เสร็จสมบูรณ์ในตัวเอง" ให้เอาผลของแต่ละกรณีมา "บวกกัน"',
    ],
  },
  {
    title: '2. แฟกทอเรียล การเรียงสับเปลี่ยน และการจัดหมู่ (P(n,r) & C(n,r))',
    category: 'การเรียงสับเปลี่ยนและการจัดหมู่',
    summary: 'การเรียงสับเปลี่ยน (มีลำดับก่อนหลัง) vs การจัดหมู่ (เลือกกลุ่ม ไม่สนลำดับ)',
    formula: 'แฟกทอเรียล: n! = n × (n-1) × ... × 2 × 1 โดย 0! = 1\nเรียงสับเปลี่ยน (Permutation): P(n, r) = n! / (n - r)!\nจัดหมู่ (Combination): C(n, r) = n! / [r! × (n - r)!]',
    examples: [
      'เรียงสับเปลี่ยนคน 4 คนแถวตรง = 4! = 24 วิธี',
      'เลือกประธาน, รอง, เลขา จาก 6 คน (มีลำดับ) = P(6, 3) = 6 × 5 × 4 = 120 วิธี',
      'เลือกตัวแทน 2 คน จาก 8 คน (ไม่มีลำดับ) = C(8, 2) = (8 × 7) / 2 = 28 วิธี',
      'คำว่า LEVEL เรียงสับเปลี่ยนตัวอักษรซ้ำ = 5! / (2! × 2!) = 30 แบบ',
    ],
    keyDistinctions: [
      'มีตำแหน่งชัดเจน (ประธาน/รอง, ยืนแถว, สร้างตัวเลข) → ใช้ Permutation P(n,r)',
      'เลือกเป็นกลุ่ม (กรรมการ, ตัวแทน, หยิบพร้อมกัน) → ใช้ Combination C(n,r)',
    ],
  },
  {
    title: '3. ความน่าจะเป็นและสมบัติพื้นฐาน (Probability & Properties)',
    category: 'ความน่าจะเป็น',
    summary: 'อัตราส่วนของจำนวนผลลัพธ์ในเหตุการณ์ที่สนใจ ต่อจำนวนผลลัพธ์ทั้งหมดในแซมเปิลสเปซ',
    formula: 'P(E) = n(E) / n(S) โดย 0 ≤ P(E) ≤ 1 เสมอ\nเหตุการณ์ตรงข้าม (Complement): P(E\') = 1 - P(E)\nยูเนียนของสองเหตุการณ์: P(A∪B) = P(A) + P(B) - P(A∩B)',
    examples: [
      'ทอยลูกเต๋า 1 ลูก ได้แต้มคู่ = 3/6 = 1/2',
      'โยนเหรียญ 3 อัน ออกหัวอย่างน้อย 1 อัน = 1 - P(ก้อยหมด) = 1 - 1/8 = 7/8',
      'ถ้า P(A) = 0.35 จะได้ P(A\') = 1 - 0.35 = 0.65',
      'ถ้า P(A) = 0 หมายถึงเหตุการณ์ที่เป็นไปไม่ได้ (Impossible event)',
    ],
    keyDistinctions: [
      'คำว่า "อย่างน้อย 1" ให้ใช้เทคนิค 1 - P(ไม่เกิดเลย) เสมอ จะคิดง่ายและรวดเร็วกว่า',
      'ถ้า A และ B ไม่เกิดร่วมกัน (Mutually Exclusive) จะได้ P(A∩B) = 0 ดังนั้น P(A∪B) = P(A) + P(B)',
    ],
  },
  {
    title: '4. ความน่าจะเป็นแบบมีเงื่อนไขและเหตุการณ์อิสระ (Conditional & Independent)',
    category: 'ความน่าจะเป็นขั้นสูง',
    summary: 'โอกาสเกิดเหตุการณ์ A เมื่อรู้ว่าเหตุการณ์ B เกิดขึ้นแล้ว และเงื่อนไขของเหตุการณ์อิสระ',
    formula: 'ความน่าจะเป็นแบบมีเงื่อนไข: P(A|B) = P(A∩B) / P(B)\nเหตุการณ์อิสระ (Independent Events): P(A∩B) = P(A) × P(B)',
    examples: [
      'ถ้า P(A∩B) = 0.2 และ P(B) = 0.5 จะได้ P(A|B) = 0.2 / 0.5 = 0.4',
      'โยนเหรียญ 2 ครั้ง การออกของเหรียญครั้งแรกไม่มีผลต่อครั้งที่สอง = เหตุการณ์อิสระ',
      'ถ้า A, B เป็นอิสระกัน P(A) = 0.3, P(B) = 0.6 จะได้ P(A∪B) = 0.3 + 0.6 - (0.3 × 0.6) = 0.72',
    ],
    keyDistinctions: [
      'หยิบสิ่งของ "โดยไม่คืนที่" แซมเปิลสเปซจะลดลง เหตุการณ์จะไม่เป็นอิสระต่อกัน',
      'การโยนลูกเต๋าแต่ละครั้ง หรือโยนเหรียญแต่ละครั้ง เป็น "เหตุการณ์อิสระต่อกันเสมอ"',
    ],
  },
];

export const GrammarGuideModal: React.FC<StudyGuideModalProps> = ({
  isOpen,
  onClose,
  theme,
  subjectId,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  // Select rules according to subject
  const currentRules = useMemo(() => {
    if (subjectId === 'biology') return biologyRules;
    if (subjectId === 'history') return historyRules;
    if (subjectId === 'math') return mathRules;
    return englishRules;
  }, [subjectId]);

  const subjectTitle = useMemo(() => {
    if (subjectId === 'biology') return 'คู่มือสรุปชีววิทยา ม.5 (พืช & สังเคราะห์ด้วยแสง)';
    if (subjectId === 'history') return 'คู่มือสรุปประวัติศาสตร์ & อารยธรรมโลก (กรีก โรมัน จีน อินเดีย)';
    if (subjectId === 'math') return 'คู่มือสรุปคณิตศาสตร์ ม.5 (ความน่าจะเป็น & กฎการนับ)';
    return 'คู่มือสรุปหลักไวยากรณ์ภาษาอังกฤษ (Grammar Guide)';
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
              placeholder="ค้นหาเนื้อหา (พิมพ์คำค้นหา เช่น 'สปอโรไฟต์', 'กรีก', 'mustn\'t', 'C4')..."
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
