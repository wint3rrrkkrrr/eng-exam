import { Question } from '../types';

export const m5EnglishQuestionsPart3: Question[] = [
  // --- Advanced M.5 English Grammar & Tenses Booster (601 - 620) ---
  {
    id: 601,
    setId: 'm5_grammar',
    topic: 'Advanced Inversion: Not only ... but also',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: 'Not only ___ the national science competition, but she also won a prestigious scholarship to MIT.',
    options: ['did she win', 'she won', 'she did win', 'has she won'],
    answer: 'did she win',
    explanation: 'เมื่อนำคำปฏิเสธหรือกึ่งปฏิเสธ เช่น "Not only" มาวางไว้หน้าประโยค ประโยคหลักจะต้องเกิด Inversion (นำกริยาช่วยมาไว้หน้าประธาน) ในรูปอดีตคือ did + S + V.inf (did she win)',
    ruleSummary: 'Inversion: Not only + auxiliary verb + S + V ... but also ...'
  },
  {
    id: 602,
    setId: 'm5_grammar',
    topic: 'Subjunctive: Suggest / Recommend that S + (should) V.inf',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: 'The academic advisor strongly recommended that each applicant ___ their portfolio well in advance.',
    options: ['submit', 'submits', 'submitted', 'would submit'],
    answer: 'submit',
    explanation: 'Present Subjunctive: หลังกริยาแสดงการขอร้อง/แนะนำ เช่น recommend, suggest, insist, demand, propose + that + S + (should) V.inf กริยาจะต้องเป็นรูป infinitive ไม่ผันตามประธานเอกพจน์ จึงใช้ "submit" (ละ should ไว้)',
    ruleSummary: 'Recommend / Suggest that + S + (should) + V.inf (ห้ามเติม s/es)'
  },
  {
    id: 603,
    setId: 'm5_grammar',
    topic: 'Subjunctive: It is essential / imperative that...',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: 'It is vital that every laboratory worker ___ protective goggles during chemical experiments.',
    options: ['wear', 'wears', 'wore', 'must wear'],
    answer: 'wear',
    explanation: 'หลัง Adjective แสดงความจำเป็นเร่งด่วน เช่น vital, essential, imperative, crucial, necessary ในโครงสร้าง "It is vital that + S + (should) V.inf" กริยาใช้รูป Base Form ไม่เติม -s เสมอ',
    ruleSummary: 'It is vital/essential that + S + V.inf (Base form)'
  },
  {
    id: 604,
    setId: 'm5_grammar',
    topic: 'Dangling Participle: การจับคู่ประธานกับกริยา 분사',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: 'Walking through the quiet autumn forest, ___.',
    options: [
      'the colorful leaves fell gently on the damp path',
      'a sudden gust of wind blew my hat off',
      'I was captivated by the tranquil morning scenery',
      'the path became slippery and difficult to follow'
    ],
    answer: 'I was captivated by the tranquil morning scenery',
    explanation: 'กฎ Dangling Participle: วลี "Walking through the quiet autumn forest" ต้องมีประธานหลังเครื่องหมาย comma เป็นผู้กระทำกริยาเดินเอง ซึ่ง "I" (ฉัน) เท่านั้นที่เป็นคนเดิน ส่วนใบไม้ ลม หรือทางเดินไม่สามารถเดินได้',
    ruleSummary: 'ประธานหลัง Comma ต้องเป็นผู้ลงมือทำกริยาใน Participle phrase เสมอ'
  },
  {
    id: 605,
    setId: 'm5_grammar',
    topic: 'Tenses: Future Perfect Continuous (ณ จุดนั้นในอนาคตจะทำมาครบ...)',
    category: '12 Tenses ม.5',
    difficulty: 'Hard',
    question: 'By December next year, Dr. Anderson ___ at the national research institute for a quarter of a century.',
    options: [
      'will have been working',
      'will be working',
      'will have worked',
      'has been working'
    ],
    answer: 'will have been working',
    explanation: 'มีวลีเวลาบอกอนาคต "By December next year" ควบคู่กับระยะเวลาต่อเนื่อง "for a quarter of a century (25 ปี)" แสดงการดำเนินต่อเนื่องไปจนถึงจุดเวลานั้นในอนาคต จึงใช้ Future Perfect Continuous: will have been + V.ing',
    ruleSummary: 'By + เวลาอนาคต + for + ระยะเวลา = Future Perfect Continuous'
  },
  {
    id: 606,
    setId: 'm5_grammar',
    topic: 'Mixed Conditionals: สมมุติตรงข้ามความจริงอดีต ส่งผลถึงปัจจุบัน',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: 'If you had reserved the flight tickets earlier, we ___ in this overcrowded airport lounge right now.',
    options: [
      "wouldn't be waiting",
      "wouldn't have waited",
      "won't be waiting",
      "weren't waiting"
    ],
    answer: "wouldn't be waiting",
    explanation: 'Mixed Conditional: เงื่อนไขในอดีต (had reserved) ส่งผลลัพธ์มายังปัจจุบันที่มีคำว่า "right now" ประโยคผลลัพธ์จึงต้องใช้ would/wouldn\'t + be + V.ing ไม่ใช่ would have + V.3',
    ruleSummary: 'If + had + V.3 (อดีต), S + would (not) + V.inf / be V.ing (ผลปัจจุบัน right now)'
  },
  {
    id: 607,
    setId: 'm5_grammar',
    topic: 'Causative: Have something done vs Get someone to do',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Medium',
    question: 'Instead of fixing the broken transmission himself, Mark decided to ___ by a certified mechanic.',
    options: ['have it repaired', 'have it repair', 'get it repair', 'make it to repair'],
    answer: 'have it repaired',
    explanation: 'โครงสร้าง Causative Passive: "Have / Get + something + V.3" คือ จ้างให้ผู้อื่นซ่อมสิ่งนั้นให้ (have it repaired by a mechanic)',
    ruleSummary: 'have / get + สิ่งของ + V.3'
  },
  {
    id: 608,
    setId: 'm5_grammar',
    topic: 'Inversion: Seldom / Rarely / Scarcely',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: 'Seldom ___ such dedication and meticulous attention to detail in a rookie software developer.',
    options: ['have I witnessed', 'I have witnessed', 'I witnessed', 'witnessed I'],
    answer: 'have I witnessed',
    explanation: 'เมื่อคำบอกความถี่เชิงปฏิเสธ เช่น Seldom, Rarely, Never, Scarcely วางต้นประโยค ต้องตามด้วยกริยาช่วย + ประธาน (Inversion: have I witnessed)',
    ruleSummary: 'Seldom / Rarely + กริยาช่วย + ประธาน + กริยาแท้'
  },
  {
    id: 609,
    setId: 'm5_grammar',
    topic: 'Prepositional Phrases + Gerund',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Medium',
    question: 'The government came under severe public criticism for ___ to implement stringent environmental safeguards.',
    options: ['failing', 'fail', 'having failed to fail', 'failed'],
    answer: 'failing',
    explanation: 'หลังคำบุพบท (Preposition ในที่นี้คือ "for") คำกริยาที่ตามมาต้องเปลี่ยนรูปเป็น Gerund (V.ing) เสมอ จึงใช้ "failing"',
    ruleSummary: 'Preposition (for, by, in, of, about) + Gerund (V.ing)'
  },
  {
    id: 610,
    setId: 'm5_grammar',
    topic: 'Relative Clauses: Preposition + Relative Pronoun',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: 'The committee outlined several ambitious proposals, none of ___ were deemed feasible by the finance board.',
    options: ['which', 'whom', 'them', 'that'],
    answer: 'which',
    explanation: 'ใน Relative clause ที่ขยายสิ่งของ (proposals) และอยู่หลังบุพบทวลีบอกปริมาณ "none of..." จะต้องใช้ relative pronoun "which" (ห้ามใช้ that หรือ them ในประโยคเชื่อมที่ไม่มี coordinate conjunction)',
    ruleSummary: 'All of / None of / Most of + which (สิ่งของ) หรือ whom (คน)'
  },
  {
    id: 611,
    setId: 'm5_grammar',
    topic: 'Time Clauses: กฎห้ามใช้ will ในประโยคเวลา',
    category: '12 Tenses ม.5',
    difficulty: 'Medium',
    question: 'As soon as the flight attendant ___ the cabin doors, all passengers will be asked to turn off cellular data.',
    options: ['secures', 'will secure', 'secured', 'is securing'],
    answer: 'secures',
    explanation: 'ใน Time Clause (อนุประโยคบอกเวลาที่ขึ้นต้นด้วย As soon as, When, Before, After, Until) แม้เหตุการณ์จะเกิดขึ้นในอนาคต กฎไวยากรณ์ห้ามใช้ will ให้ใช้ Present Simple แทน',
    ruleSummary: 'As soon as / When / Until + Present Simple, will + V.inf'
  },
  {
    id: 612,
    setId: 'm5_grammar',
    topic: 'Stative Verbs: Smell / Taste / Look สัมผัส vs อาการกระทำ',
    category: '12 Tenses ม.5',
    difficulty: 'Medium',
    question: 'Why are you ___ the mushroom soup? Does it ___ sour or spoiled to you?',
    options: [
      'smelling; smell',
      'smell; smell',
      'smelling; is smelling',
      'smell; smells'
    ],
    answer: 'smelling; smell',
    explanation: 'ประโยคแรกเป็นการกระทำเจตนาดมกลิ่น (Action) จึงใช้ Present Continuous ได้ (are smelling) ส่วนประโยคหลัง smell เป็น Stative verb บอกกลิ่น (Sense) ห้ามใช้รูป -ing จึงใช้ Does it smell',
    ruleSummary: 'Smell ที่เป็น Action (ดม) ใช้ -ing ได้ / กริยาบอกสภาพกลิ่นเป็น Stative verb'
  },
  {
    id: 613,
    setId: 'm5_grammar',
    topic: 'Subject-Verb Agreement: Together with / In addition to',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Medium',
    question: 'The lead astronaut, together with several aerospace engineers, ___ conducting final system verifications.',
    options: ['is', 'are', 'were', 'have been'],
    answer: 'is',
    explanation: 'เมื่อประธานเชื่อมด้วยวลี together with, along with, as well as, accompanied by กริยาจะต้องผันตาม "ประธานตัวหน้าสุด" เท่านั้น (The lead astronaut = เอกพจน์ จึงใช้ is)',
    ruleSummary: 'S1 + together with / along with / as well as + S2 -> กริยาผันตาม S1'
  },
  {
    id: 614,
    setId: 'm5_grammar',
    topic: 'Modals of Deduction in the Past: Must have + V.3',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Medium',
    question: 'The streets are completely soaked and puddles have formed everywhere. It ___ heavily while we were asleep.',
    options: ['must have rained', 'should have rained', 'can have rained', 'might rain'],
    answer: 'must have rained',
    explanation: '"Must have + V.3" ใช้เพื่ออนุมานหรือสรุปข้อเท็จจริงในอดีตด้วยความมั่นใจเกือบ 100% จากหลักฐานที่เห็น (ถนนเปียกโชกและมีแอ่งน้ำ = ฝนต้องตกหนักตอนเราหลับอย่างแน่นอน)',
    ruleSummary: 'Must have + V.3 = ต้องเกิดขึ้นในอดีตแน่ๆ (มีหลักฐานชัดเจน)'
  },
  {
    id: 615,
    setId: 'm5_grammar',
    topic: 'Modals of Deduction: Can\'t have + V.3 (เป็นไปไม่ได้เด็ดขาดในอดีต)',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: 'George ___ the luxury sports car yesterday because he had not yet received his driver\'s permit.',
    options: ["can't have driven", "mustn't have driven", "could have driven", "wouldn't drive"],
    answer: "can't have driven",
    explanation: '"Can\'t have + V.3" หรือ "Couldn\'t have + V.3" ใช้ปฏิเสธเหตุการณ์ในอดีตว่า "ไม่มีทางเป็นไปได้เด็ดขาด" (จอร์จยังไม่มีใบขับขี่ จึงเป็นไปไม่ได้เลยที่เขาจะเป็นคนขับเมื่อวานนี้)',
    ruleSummary: "Can't have + V.3 = ไม่มีทางเป็นไปได้อย่างแน่นอนในอดีต"
  },
  {
    id: 616,
    setId: 'm5_grammar',
    topic: 'Gerund vs Infinitive: Mean + V.ing vs Mean + to V.inf',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: 'Accepting the international scholarship will mean ___ in another country for at least four full years.',
    options: ['living', 'to live', 'live', 'to have lived'],
    answer: 'living',
    explanation: '"Mean + V.ing" แปลว่า "หมายถึง / มีผลลัพธ์ว่า" (Involve) ส่วน "Mean + to V.inf" แปลว่า "ตั้งใจ / เจตนาจะทำ" (Intend) ในที่นี้การรับทุนหมายถึงการต้องไปใช้ชีวิตอยู่ต่างประเทศ จึงตามด้วย Gerund (living)',
    ruleSummary: 'Mean + V.ing = หมายถึง / มีผลให้เกิด / Mean + to V.inf = ตั้งใจจะทำ'
  },
  {
    id: 617,
    setId: 'm5_grammar',
    topic: 'Conjunctions of Contrast: In spite of / Despite + Noun',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Medium',
    question: '___ facing formidable logistical obstacles, the rescue team successfully delivered humanitarian supplies.',
    options: ['Despite', 'Although', 'Even though', 'Whereas'],
    answer: 'Despite',
    explanation: '"Despite" และ "In spite of" เป็น Preposition ต้องตามด้วยคำนามหรือ Gerund (facing obstacles) ส่วน Although / Even though ต้องตามด้วยประโยคที่มีประธานและกริยาแท้',
    ruleSummary: 'Despite / In spite of + Noun / V.ing (ห้ามใช้ Despite of)'
  },
  {
    id: 618,
    setId: 'm5_grammar',
    topic: 'Passive Voice: Perfect Participle Passive (Having been + V.3)',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: '___ by multiple international film critics, the director\'s debut feature became an instant box-office hit.',
    options: [
      'Having been acclaimed',
      'Having acclaimed',
      'Acclaiming',
      'Was acclaimed'
    ],
    answer: 'Having been acclaimed',
    explanation: 'ภาพยนตร์ "ถูกยกย่องชื่นชม" โดยนักวิจารณ์ก่อนหน้าที่จะฉายประสบความสำเร็จ โครงสร้าง Perfect Participle ในรูป Passive คือ "Having been + V.3" (Having been acclaimed)',
    ruleSummary: 'Having been + V.3 = ถูกกระทำเสร็จสิ้นเรียบร้อยแล้วในอดีต'
  },
  {
    id: 619,
    setId: 'm5_grammar',
    topic: 'Conditional Inversion: Had + S + not + V.3',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: '___ for the prompt intervention of the paramedic, the cardiac patient might not have survived.',
    options: ['Had it not been', 'Were it not been', 'Should it not be', 'If it had not'],
    answer: 'Had it not been',
    explanation: 'การละ If ในโครงสร้าง "If it had not been for..." เมื่อตัด If ออก จะนำ Had ขึ้นหน้าประธานเป็น "Had it not been for..." (ถ้าหากไม่ใช่เพราะ...) คู่กับ might not have survived',
    ruleSummary: 'Had it not been for + Noun = ถ้าหากไม่มี...ในอดีต'
  },
  {
    id: 620,
    setId: 'm5_grammar',
    topic: 'Subjunctive: It is high time + Past Simple (V.2)',
    category: 'ไวยากรณ์ ม.5',
    difficulty: 'Hard',
    question: 'It is high time you ___ wasting your valuable study hours on pointless social media disputes.',
    options: ['stopped', 'stop', 'should stop', 'had stopped'],
    answer: 'stopped',
    explanation: 'สำนวน "It is high time..." หรือ "It is about time..." (ถึงเวลาอันสมควรแล้วที่ควรจะ...) ต้องตามด้วยอนุประโยคที่เป็นรูป Past Simple (V.2) เพื่อเน้นย้ำว่าล่าช้ากว่าที่ควรจะเป็น จึงใช้ "stopped"',
    ruleSummary: 'It is (high / about) time + S + Past Simple (V.2)'
  }
];
