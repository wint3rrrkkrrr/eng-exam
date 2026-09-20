import { Question } from '../types';

export const physicsQuestionsPart3: Question[] = [
  // ================================================================
  // หัวข้อ 4: สีของแสง (ต่อ ข้อ 101–120) IDs 3101–3120
  // ================================================================
  {
    id: 3101,
    topic: 'การผสมสีหมึก (Subtractive)',
    category: 'สีของแสง',
    difficulty: 'Medium',
    question: 'สีปฐมภูมิของหมึก/สี (Subtractive) คืออะไร?',
    options: [
      'แดง เขียว น้ำเงิน',
      'ฟ้าเขียว (Cyan), ม่วงแดง (Magenta), เหลือง (Yellow)',
      'แดง เหลือง น้ำเงิน',
      'ส้ม เขียว ม่วง'
    ],
    answer: 'ฟ้าเขียว (Cyan), ม่วงแดง (Magenta), เหลือง (Yellow)',
    explanation: 'Subtractive: CMY ผสมรวมได้ดำ (ดูดซับทุกสี) ใช้ในการพิมพ์ พิมพ์ + K (Black) = CMYK',
    ruleSummary: 'หมึก Subtractive: CMY; ผสมรวม = ดำ'
  },
  {
    id: 3102,
    topic: 'การผสม Cyan + Yellow (หมึก)',
    category: 'สีของแสง',
    difficulty: 'Medium',
    question: 'ผสมหมึก Cyan + Yellow ได้สีอะไร?',
    options: [
      'ขาว',
      'แดง',
      'เขียว',
      'ดำ'
    ],
    answer: 'เขียว',
    explanation: 'Cyan ดูดซับแดง สะท้อน G+B; Yellow ดูดซับน้ำเงิน สะท้อน R+G; ทั้งคู่สะท้อนเฉพาะเขียว (G)',
    ruleSummary: 'Subtractive: C+Y=Green, C+M=Blue, M+Y=Red'
  },
  {
    id: 3103,
    topic: 'สีวัตถุภายใต้แสงสี',
    category: 'สีของแสง',
    difficulty: 'Medium',
    question: 'วัตถุสีแดงดูใต้แสงสีเขียว (Green light only) จะเห็นสีอะไร?',
    options: [
      'แดง',
      'เขียว',
      'เหลือง',
      'ดำ'
    ],
    answer: 'ดำ',
    explanation: 'วัตถุแดงสะท้อนเฉพาะแสงแดง ดูดซับสีอื่น เมื่อส่องด้วยแสงเขียวล้วน ไม่มีแสงแดงให้สะท้อน วัตถุดูดซับแสงเขียวทั้งหมด → เห็นดำ',
    ruleSummary: 'วัตถุสะท้อนเฉพาะสีตัวเอง ถ้าไม่มีสีนั้น → เห็นดำ'
  },
  {
    id: 3104,
    topic: 'สีวัตถุขาวใต้แสงสี',
    category: 'สีของแสง',
    difficulty: 'Easy',
    question: 'วัตถุสีขาวส่องด้วยแสงสีน้ำเงิน จะเห็นสีอะไร?',
    options: [
      'ขาว',
      'น้ำเงิน',
      'ดำ',
      'เทา'
    ],
    answer: 'น้ำเงิน',
    explanation: 'วัตถุขาวสะท้อนทุกสีที่ตกกระทบ เมื่อส่องน้ำเงิน จะสะท้อนน้ำเงินออกมา ดูเป็นสีน้ำเงิน',
    ruleSummary: 'ขาว = สะท้อนทุกสีที่ตกกระทบ'
  },
  {
    id: 3105,
    topic: 'Luminosity: ความสว่างของสีต่างๆ',
    category: 'สีของแสง',
    difficulty: 'Medium',
    question: 'ตามองเห็นแสงสีใดสว่างที่สุดที่ความเข้มเท่ากัน?',
    options: [
      'น้ำเงิน (λ~450 nm)',
      'เขียว-เหลือง (λ~555 nm)',
      'แดง (λ~700 nm)',
      'ม่วง (λ~400 nm)'
    ],
    answer: 'เขียว-เหลือง (λ~555 nm)',
    explanation: 'ตามนุษย์ไวต่อแสงสีเขียว-เหลือง (λ~555 nm) มากที่สุด Luminosity function V(λ) สูงสุดที่ 555 nm',
    ruleSummary: 'ตาไวแสงสีเขียว-เหลือง 555 nm มากสุด'
  },
  {
    id: 3106,
    topic: 'ท้องฟ้าพระอาทิตย์ตก: สีม่วงหายไปไหน',
    category: 'สีของแสง',
    difficulty: 'Hard',
    question: 'ท้องฟ้าพระอาทิตย์ตกสีแดง-ส้ม ทำไมไม่เห็นสีม่วง (แม้กระเจิงน้อยกว่าน้ำเงิน)?',
    options: [
      'ม่วงกระเจิงมากกว่าน้ำเงิน จึงหายออกไปก่อน',
      'ตาไม่ค่อยไวต่อแสงม่วง + ม่วงกระเจิงมากกว่าน้ำเงินด้วย',
      'ดวงอาทิตย์ไม่ปล่อยแสงม่วง',
      'บรรยากาศดูดซับสีม่วงหมด'
    ],
    answer: 'ตาไม่ค่อยไวต่อแสงม่วง + ม่วงกระเจิงมากกว่าน้ำเงินด้วย',
    explanation: 'ม่วง (λ สั้นกว่าน้ำเงิน) กระเจิง Rayleigh มากกว่า แต่ตาไม่ค่อยไวต่อม่วง และดวงอาทิตย์ปล่อยม่วงน้อยกว่าน้ำเงิน จึงไม่เห็นม่วงเด่น',
    ruleSummary: 'ม่วงไม่เด่นตอนตก: กระเจิงมาก + ตาไวน้อย + อาทิตย์ปล่อยน้อย'
  },
  {
    id: 3107,
    topic: 'ฟิลเตอร์สี',
    category: 'สีของแสง',
    difficulty: 'Easy',
    question: 'ฟิลเตอร์สีแดง (Red Filter) ทำหน้าที่อะไร?',
    options: [
      'ปล่อยให้แสงสีแดงผ่าน ดูดซับสีอื่น',
      'ปล่อยให้ทุกสีผ่าน ยกเว้นแดง',
      'เปลี่ยนทุกสีเป็นแดง',
      'สะท้อนแสงสีแดงออกมา'
    ],
    answer: 'ปล่อยให้แสงสีแดงผ่าน ดูดซับสีอื่น',
    explanation: 'ฟิลเตอร์สี (Color Filter) ดูดซับแสงที่ไม่ใช่สีของตัวเอง ฟิลเตอร์แดงปล่อยแสงแดงผ่าน ดูดซับน้ำเงิน-เขียว',
    ruleSummary: 'ฟิลเตอร์สี = ปล่อยสีตัวเอง ดูดซับสีอื่น'
  },
  {
    id: 3108,
    topic: 'จอ TV: การสร้างสี',
    category: 'สีของแสง',
    difficulty: 'Easy',
    question: 'จอโทรทัศน์ (TV/Monitor) สร้างสีต่างๆ ได้อย่างไร?',
    options: [
      'ใช้หมึกหลายสีผสมกัน',
      'Additive mixing: ใช้จุดเล็กๆ สีแดง เขียว น้ำเงิน (RGB) ในสัดส่วนต่างกัน',
      'Subtractive mixing: CMYK',
      'ใช้ฟิลเตอร์สีหมุน'
    ],
    answer: 'Additive mixing: ใช้จุดเล็กๆ สีแดง เขียว น้ำเงิน (RGB) ในสัดส่วนต่างกัน',
    explanation: 'จอ TV ใช้ pixel ที่มี subpixel R G B สามารถผสมแสงในสัดส่วนต่างกันได้สีทุกสี (Additive Mixing)',
    ruleSummary: 'จอ TV = RGB Additive Mixing'
  },
  {
    id: 3109,
    topic: 'แสงสีและเงา',
    category: 'สีของแสง',
    difficulty: 'Medium',
    question: 'ส่องแสง 2 สี: แดง (R) และเขียว (G) ตกบนฉากขาว เงาที่เกิดจากวัตถุกั้นแสงแดงเห็นสีอะไร?',
    options: [
      'แดง',
      'เขียว',
      'เหลือง',
      'ดำ'
    ],
    answer: 'เขียว',
    explanation: 'เงาของวัตถุที่กั้นแสงแดง = บริเวณที่ไม่ได้รับแสงแดง แต่ยังได้รับแสงเขียว ฉากจึงเห็นสีเขียวในเงานั้น',
    ruleSummary: 'เงาในแสง 2 สี = สีที่เหลือเมื่อสีหนึ่งถูกกั้น'
  },
  {
    id: 3110,
    topic: 'แสงโพลาไรซ์',
    category: 'สีของแสง',
    difficulty: 'Easy',
    question: 'แสงธรรมชาติ (Unpolarized) ต่างจากแสงโพลาไรซ์อย่างไร?',
    options: [
      'แสงธรรมชาติสว่างกว่า',
      'แสงธรรมชาติสั่นในทิศทางสุ่มทุกทิศ; โพลาไรซ์สั่นในแนวเดียว',
      'แสงธรรมชาติมีสีมากกว่า',
      'ไม่มีความแตกต่าง'
    ],
    answer: 'แสงธรรมชาติสั่นในทิศทางสุ่มทุกทิศ; โพลาไรซ์สั่นในแนวเดียว',
    explanation: 'Unpolarized light: สนามไฟฟ้าสั่นสุ่มทุกทิศตั้งฉากกับทิศเดิน; Polarized: สั่นในแนวเดียวเท่านั้น',
    ruleSummary: 'Unpolarized: สั่นทุกทิศ; Polarized: สั่นแนวเดียว'
  },
  {
    id: 3111,
    topic: 'แผ่น Polarizer',
    category: 'สีของแสง',
    difficulty: 'Easy',
    question: 'แผ่น Polarizer ทำหน้าที่อะไร?',
    options: [
      'เพิ่มความเข้มแสง',
      'ให้แสงผ่านเฉพาะแนวสั่นที่ตรงกับแกนของมัน',
      'เปลี่ยนสีแสง',
      'ลดความยาวคลื่น'
    ],
    answer: 'ให้แสงผ่านเฉพาะแนวสั่นที่ตรงกับแกนของมัน',
    explanation: 'Polarizer กรองแสง เหลือเฉพาะแสงที่สั่นในแนวตรงกับแกน ทำให้ความเข้มลดลง ~50% สำหรับแสงไม่โพลาไรซ์',
    ruleSummary: 'Polarizer กรองให้เหลือแสงสั่นแนวเดียว'
  },
  {
    id: 3112,
    topic: 'กฎ Malus',
    category: 'สีของแสง',
    difficulty: 'Medium',
    question: 'กฎ Malus: แสงโพลาไรซ์ผ่าน Analyzer ที่ทำมุม θ กับแกนโพลาไรซ์ ความเข้มที่ผ่านออกมาเป็นเท่าใด?',
    options: [
      'I = I₀sinθ',
      'I = I₀cos²θ',
      'I = I₀cosθ',
      'I = I₀/θ'
    ],
    answer: 'I = I₀cos²θ',
    explanation: 'กฎ Malus: I = I₀cos²θ θ=0° → I=I₀ (ผ่านหมด); θ=90° → I=0 (ไม่ผ่าน)',
    ruleSummary: 'Malus: I = I₀cos²θ'
  },
  {
    id: 3113,
    topic: 'Brewster Angle',
    category: 'สีของแสง',
    difficulty: 'Hard',
    question: 'มุม Brewster คือมุมที่แสงสะท้อนกลายเป็นโพลาไรซ์สมบูรณ์ สูตรหาคืออะไร?',
    options: [
      'tan θ_B = n₂/n₁',
      'sin θ_B = n₂/n₁',
      'cos θ_B = n₂/n₁',
      'θ_B = 45° เสมอ'
    ],
    answer: 'tan θ_B = n₂/n₁',
    explanation: 'tan θ_B = n₂/n₁ (Brewster\'s Law) เมื่อแสงตกกระทบในมุม θ_B แสงสะท้อนจะโพลาไรซ์สมบูรณ์ในแนวขนานกับผิว',
    ruleSummary: 'Brewster: tan θ_B = n₂/n₁'
  },
  {
    id: 3114,
    topic: 'แว่นกันแดด Polaroid',
    category: 'สีของแสง',
    difficulty: 'Easy',
    question: 'แว่นกันแดด Polaroid ลดแสงจ้าจากผิวน้ำได้อย่างไร?',
    options: [
      'ดูดซับแสงทุกสี',
      'กรองแสงโพลาไรซ์แนวนอนที่สะท้อนจากน้ำออก',
      'ลด UV',
      'ลดความสว่างโดยรวม'
    ],
    answer: 'กรองแสงโพลาไรซ์แนวนอนที่สะท้อนจากน้ำออก',
    explanation: 'แสงที่สะท้อนจากน้ำหรือถนนจะโพลาไรซ์แนวนอน (Brewster Angle) แว่น Polaroid มีแกนแนวตั้งกรองแสงนี้ออก ลดแสงจ้า',
    ruleSummary: 'Polaroid ลดแสงจ้าสะท้อน: กรอง H-polarized ออก'
  },
  {
    id: 3115,
    topic: 'โพลาไรซ์โดย Scattering',
    category: 'สีของแสง',
    difficulty: 'Medium',
    question: 'แสงจากท้องฟ้าด้านข้างดวงอาทิตย์ (90°) เป็นแสงโพลาไรซ์บางส่วน เพราะอะไร?',
    options: [
      'ท้องฟ้ามีฟิลเตอร์ธรรมชาติ',
      'Rayleigh Scattering ทำให้แสงกระเจิงออกมาเป็นโพลาไรซ์บางส่วน',
      'แสงอาทิตย์เป็นโพลาไรซ์อยู่แล้ว',
      'กระเจิงแนวตั้งมากกว่าแนวนอน'
    ],
    answer: 'Rayleigh Scattering ทำให้แสงกระเจิงออกมาเป็นโพลาไรซ์บางส่วน',
    explanation: 'แสงกระเจิง Rayleigh จากท้องฟ้าที่มุม 90° จากดวงอาทิตย์เป็นโพลาไรซ์เกือบสมบูรณ์ แมลงและนกบางชนิดใช้สิ่งนี้นำทิศ',
    ruleSummary: 'แสงกระเจิง Rayleigh มุม 90° = โพลาไรซ์สูงสุด'
  },
  {
    id: 3116,
    topic: 'อุณหภูมิสีของแสง',
    category: 'สีของแสง',
    difficulty: 'Medium',
    question: 'อุณหภูมิสี (Color Temperature) ของแสงหมายถึงอะไร?',
    options: [
      'อุณหภูมิของหลอดไฟที่ใช้',
      'ลักษณะสีของแสง เปรียบเทียบกับ Black Body Radiation ที่อุณหภูมิต่างๆ (หน่วย Kelvin)',
      'ความร้อนที่แสงปล่อยออกมา',
      'อุณหภูมิที่ดวงตาทนได้'
    ],
    answer: 'ลักษณะสีของแสง เปรียบเทียบกับ Black Body Radiation ที่อุณหภูมิต่างๆ (หน่วย Kelvin)',
    explanation: 'Color Temp K ต่ำ (~2700K) = แสงโทนอุ่น (แดง-ส้ม); สูง (~6500K) = แสงโทนเย็น (ขาว-น้ำเงิน)',
    ruleSummary: 'Color Temp: K ต่ำ=อุ่น(แดง); K สูง=เย็น(น้ำเงิน)'
  },
  {
    id: 3117,
    topic: 'สีของดวงดาว',
    category: 'สีของแสง',
    difficulty: 'Medium',
    question: 'ดาวสีน้ำเงินมีอุณหภูมิเปรียบเทียบกับดาวสีแดงอย่างไร?',
    options: [
      'เย็นกว่า',
      'ร้อนกว่า',
      'เท่ากัน',
      'ขึ้นอยู่กับขนาดดาว'
    ],
    answer: 'ร้อนกว่า',
    explanation: 'ดาวร้อน → Black Body Radiation ปล่อยแสงสูงสุดในช่วง λ สั้น → สีน้ำเงิน ดาวเย็น → สีแดง (Wien\'s Law)',
    ruleSummary: 'ดาวสีน้ำเงิน = ร้อนกว่าดาวแดง (Wien\'s Law)'
  },
  {
    id: 3118,
    topic: 'Fluorescence',
    category: 'สีของแสง',
    difficulty: 'Medium',
    question: 'Fluorescence คืออะไร?',
    options: [
      'การสะท้อนแสงสีเดียวกัน',
      'วัตถุดูดซับแสง UV แล้วปล่อยแสงที่มองเห็น (λ ยาวกว่า)',
      'การเรืองแสงต่อเนื่องนานในที่มืด',
      'การหักเหแสงสีต่างๆ'
    ],
    answer: 'วัตถุดูดซับแสง UV แล้วปล่อยแสงที่มองเห็น (λ ยาวกว่า)',
    explanation: 'Fluorescence: ดูดซับแสง λ สั้น (UV) แล้วปล่อยออกที่ λ ยาวกว่า (visible) ทันที ต่างจาก Phosphorescence ที่มีความล่าช้า',
    ruleSummary: 'Fluorescence: ดูดซับ UV → ปล่อย visible ทันที'
  },
  {
    id: 3119,
    topic: 'Laser: คุณสมบัติ',
    category: 'สีของแสง',
    difficulty: 'Medium',
    question: 'แสง Laser มีคุณสมบัติพิเศษอะไรที่ต่างจากแสงปกติ?',
    options: [
      'สว่างมากกว่า',
      'Monochromatic, Coherent, Collimated (ความยาวคลื่นเดียว เฟสเดียวกัน ลำขนาน)',
      'เร็วกว่าแสงปกติ',
      'ไม่หักเห'
    ],
    answer: 'Monochromatic, Coherent, Collimated (ความยาวคลื่นเดียว เฟสเดียวกัน ลำขนาน)',
    explanation: 'Laser: 1) Monochromatic (ความยาวคลื่นเดียว) 2) Coherent (เฟสตรงกัน) 3) Collimated (ลำแสงขนานไม่กระจาย) ใช้ใน CD/DVD, การแพทย์, การสื่อสาร fiber',
    ruleSummary: 'Laser: Monochromatic + Coherent + Collimated'
  },
  {
    id: 3120,
    topic: 'IR และ UV',
    category: 'สีของแสง',
    difficulty: 'Easy',
    question: 'แสงใต้แดง (Infrared, IR) และแสงเหนือม่วง (Ultraviolet, UV) ต่างจากแสงที่มองเห็นอย่างไร?',
    options: [
      'IR: λ ยาวกว่าแดง (>780nm); UV: λ สั้นกว่าม่วง (<380nm)',
      'IR: λ สั้นกว่าม่วง; UV: λ ยาวกว่าแดง',
      'ทั้งสองมี λ เท่ากันกับแสงที่มองเห็น แต่ความเข้มต่างกัน',
      'IR ตามองเห็น UV ตาไม่เห็น'
    ],
    answer: 'IR: λ ยาวกว่าแดง (>780nm); UV: λ สั้นกว่าม่วง (<380nm)',
    explanation: 'IR (λ > 780 nm): ให้ความร้อน ใช้ใน remote control, night vision; UV (λ < 380 nm): ทำลาย DNA, ฆ่าเชื้อโรค, ทำให้ผิวคล้ำ',
    ruleSummary: 'IR: λ > 780nm (ความร้อน); UV: λ < 380nm (ทำลาย DNA)'
  },
  // ================================================================
  // หัวข้อ 5: การแทรกสอด (Interference) ข้อ 121–140 IDs 3121–3140
  // ================================================================
  {
    id: 3121,
    topic: 'การแทรกสอด: หลักการ',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Easy',
    question: 'การแทรกสอด (Interference) ของแสงเกิดจากอะไร?',
    options: [
      'แสงสะท้อนจากผิวหลายชั้น',
      'คลื่นแสงสองคลื่นทับซ้อนกัน ทำให้แอมพลิจูดรวมมากหรือน้อยลง',
      'แสงเลี้ยวเบนรอบขอบวัตถุ',
      'แสงหักเหผ่านปริซึม'
    ],
    answer: 'คลื่นแสงสองคลื่นทับซ้อนกัน ทำให้แอมพลิจูดรวมมากหรือน้อยลง',
    explanation: 'Interference: คลื่นแสงสองคลื่นที่ coherent ทับซ้อนกัน เฟสตรงกัน → เสริมกัน (Constructive); เฟสตรงข้าม → หักล้างกัน (Destructive)',
    ruleSummary: 'Interference = คลื่น 2 เส้นทับซ้อน เสริมหรือหักล้าง'
  },
  {
    id: 3122,
    topic: 'เงื่อนไขการแทรกสอดเสริม',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'เงื่อนไขการแทรกสอดเสริม (Constructive Interference) คืออะไร?',
    options: [
      'ΔL = (m+½)λ, m = 0, ±1, ±2, ...',
      'ΔL = mλ, m = 0, ±1, ±2, ...',
      'ΔL = λ/2',
      'ΔL = nλ/2 (n คือดัชนีหักเห)'
    ],
    answer: 'ΔL = mλ, m = 0, ±1, ±2, ...',
    explanation: 'Constructive: ΔL = mλ (ต่างกัน 0, λ, 2λ...) เฟสตรงกัน → สว่าง Destructive: ΔL = (m+½)λ → มืด',
    ruleSummary: 'Constructive: ΔL = mλ; Destructive: ΔL = (m+½)λ'
  },
  {
    id: 3123,
    topic: 'การทดลอง Double-Slit ของ Young',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'ในการทดลอง Young\'s Double-Slit: แถบสว่าง (Bright Fringe) ที่ m=1 อยู่ที่ตำแหน่งใด?',
    options: [
      'y₁ = λL/d',
      'y₁ = λd/L',
      'y₁ = 2λL/d',
      'y₁ = λL/2d'
    ],
    answer: 'y₁ = λL/d',
    explanation: 'สูตรแถบสว่าง: y_m = mλL/d m=1: y₁ = λL/d โดย L=ระยะช่อง-ฉาก, d=ระยะห่างช่อง, λ=ความยาวคลื่น',
    ruleSummary: 'Young: แถบสว่าง y_m = mλL/d'
  },
  {
    id: 3124,
    topic: 'ระยะห่างแถบ Fringe Spacing',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'ในการทดลอง Young: d=0.2 mm, L=1 m, λ=500 nm ระยะห่างระหว่างแถบสว่างเท่าใด?',
    options: [
      '1.0 mm',
      '2.5 mm',
      '5.0 mm',
      '0.5 mm'
    ],
    answer: '2.5 mm',
    explanation: 'Δy = λL/d = (500×10⁻⁹)(1)/(0.2×10⁻³) = 500×10⁻⁶/0.2×10⁻³ = 2.5×10⁻³ m = 2.5 mm',
    ruleSummary: 'Fringe Spacing Δy = λL/d'
  },
  {
    id: 3125,
    topic: 'Thin Film Interference: ฟิล์มสบู่',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'ฟิล์มสบู่บางเห็นสีรุ้งเพราะอะไร?',
    options: [
      'Dispersion ในสบู่',
      'Thin Film Interference: แสงสะท้อนจากผิวบนและล่างของฟิล์มแทรกสอดกัน ขึ้นกับความหนาและ λ',
      'TIR ในฟิล์มสบู่',
      'Rayleigh Scattering ในฟิล์ม'
    ],
    answer: 'Thin Film Interference: แสงสะท้อนจากผิวบนและล่างของฟิล์มแทรกสอดกัน ขึ้นกับความหนาและ λ',
    explanation: 'Thin Film: แสงสะท้อนจากผิวด้านบน (เฟสเปลี่ยน π ถ้า n₂>n₁) และด้านล่าง มา แทรกสอดกัน สีที่เห็นขึ้นกับ t (ความหนา) และ λ',
    ruleSummary: 'Thin Film: สะท้อน 2 ผิวแทรกสอดกัน'
  },
  {
    id: 3126,
    topic: 'Thin Film: เงื่อนไขสว่าง/มืด',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'ฟิล์มบาง (n_film > n_อากาศ) อยู่ในอากาศ เงื่อนไขให้แสงสะท้อนเสริมกัน (Constructive) คือ',
    options: [
      '2t = mλ_film',
      '2t = (m+½)λ_film',
      '2t = mλ_อากาศ',
      '2t = (m+½)λ_อากาศ'
    ],
    answer: '2t = (m+½)λ_film',
    explanation: 'ฟิล์มในอากาศ: การสะท้อนที่ผิวบน (อากาศ→ฟิล์ม n สูง) เปลี่ยนเฟส π ผิวล่าง (ฟิล์ม→อากาศ n ต่ำ) ไม่เปลี่ยน ต่างเฟส π พื้นฐาน → Constructive เมื่อ 2t = (m+½)λ_film โดย λ_film = λ/n',
    ruleSummary: 'ฟิล์มในอากาศ: Constructive 2nt = (m+½)λ'
  },
  {
    id: 3127,
    topic: 'Newton\'s Rings',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'Newton\'s Rings เป็นปรากฏการณ์ใด?',
    options: [
      'การเลี้ยวเบนรอบลูกบอล',
      'วงแหวนสว่างมืดสลับที่เกิดจาก Thin Film Interference ระหว่างเลนส์กับแผ่นแก้วแบน',
      'สีรุ้งรอบดวงจันทร์',
      'การสะท้อนหลายชั้นในเลนส์'
    ],
    answer: 'วงแหวนสว่างมืดสลับที่เกิดจาก Thin Film Interference ระหว่างเลนส์กับแผ่นแก้วแบน',
    explanation: 'Newton\'s Rings: วางเลนส์นูนบนแผ่นแก้วแบน ช่องอากาศบางขึ้นเรื่อยๆ จากกลาง Thin Film Interference ทำให้เห็นวงแหวนสลับสว่าง-มืด',
    ruleSummary: 'Newton\'s Rings = Thin Film Interference ในช่องอากาศ'
  },
  {
    id: 3128,
    topic: 'Coherence ของแหล่งกำเนิดแสง',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'ทำไมแหล่งกำเนิดแสงสองดวงแยกกันถึงไม่แทรกสอดกัน?',
    options: [
      'ความเข้มต่างกัน',
      'ไม่ Coherent: เฟสสัมพัทธ์เปลี่ยนแปลงตลอดเวลา',
      'ความยาวคลื่นต่างกัน',
      'ทิศทางต่างกัน'
    ],
    answer: 'ไม่ Coherent: เฟสสัมพัทธ์เปลี่ยนแปลงตลอดเวลา',
    explanation: 'Incoherent sources มีเฟสสัมพัทธ์สุ่มเปลี่ยนตลอด แถบแทรกสอดเปลี่ยนเร็วมาก ตาเฉลี่ยไม่เห็นแถบ แหล่งแสง Coherent ต้องการ: เดียวกัน/แยกจาก single source เช่น Young\'s เปิด 2 ช่องจาก single source',
    ruleSummary: 'แทรกสอด = ต้องใช้แหล่ง Coherent (เฟสสัมพัทธ์คงที่)'
  },
  {
    id: 3129,
    topic: 'ผลต่อ Fringe เมื่อ λ เปลี่ยน',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'ในการทดลอง Young ถ้าเปลี่ยนจากแสงสีน้ำเงิน (λ=450 nm) เป็นแสงสีแดง (λ=700 nm) ระยะห่างแถบ Fringe จะ?',
    options: [
      'ลดลง',
      'เพิ่มขึ้น',
      'ไม่เปลี่ยน',
      'แถบหายไป'
    ],
    answer: 'เพิ่มขึ้น',
    explanation: 'Δy = λL/d → λ เพิ่ม → Δy เพิ่ม แสงแดง (λ ใหญ่) ให้แถบถี่น้อยกว่าน้ำเงิน',
    ruleSummary: 'Δy ∝ λ: λ ใหญ่ → แถบห่างขึ้น'
  },
  {
    id: 3130,
    topic: 'Michelson Interferometer',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'Michelson Interferometer ใช้ทำอะไร?',
    options: [
      'วัดความยาวคลื่นแสง และเคยใช้พิสูจน์ความไม่มี Aether',
      'ขยายภาพขนาดเล็ก',
      'กระจายแสงขาวเป็นสีรุ้ง',
      'วัดดัชนีหักเห'
    ],
    answer: 'วัดความยาวคลื่นแสง และเคยใช้พิสูจน์ความไม่มี Aether',
    explanation: 'Michelson Interferometer แยกแสงเป็น 2 เส้นทาง นำกลับมาแทรกสอด ใช้วัด λ อย่างแม่นยำ Michelson-Morley Experiment (1887) พิสูจน์ว่า aether ไม่มีอยู่',
    ruleSummary: 'Michelson Interferometer: วัด λ; พิสูจน์ว่าไม่มี aether'
  },
  // ================================================================
  // หัวข้อ 5 (ต่อ): ข้อ 131–150 IDs 3131–3150
  // ================================================================
  {
    id: 3131,
    topic: 'การเลี้ยวเบน: Single Slit',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'การเลี้ยวเบน Single-Slit เงื่อนไขมืด (Dark Fringe) คืออะไร?',
    options: [
      'a sinθ = mλ, m = ±1, ±2,...',
      'a sinθ = (m+½)λ',
      'a sinθ = mλ/2',
      'd sinθ = mλ'
    ],
    answer: 'a sinθ = mλ, m = ±1, ±2,...',
    explanation: 'Single-Slit: มืดเมื่อ a sinθ = mλ (m≠0) สว่างกลาง (Central Maximum) กว้างกว่าและสว่างกว่าแถบอื่น',
    ruleSummary: 'Single-Slit มืด: a sinθ = mλ (m = ±1, ±2,...)'
  },
  {
    id: 3132,
    topic: 'ความกว้างแถบสว่างกลาง Single-Slit',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'ช่อง Single-Slit กว้าง a=0.1 mm, L=1 m, λ=500 nm ความกว้างแถบสว่างกลาง (Central Maximum) บนฉากเท่าใด?',
    options: [
      '5 mm',
      '10 mm',
      '2.5 mm',
      '20 mm'
    ],
    answer: '10 mm',
    explanation: 'ความกว้าง Central Max = 2λL/a = 2(500×10⁻⁹)(1)/(0.1×10⁻³) = 10×10⁻³ m = 10 mm',
    ruleSummary: 'กว้าง Central Max = 2λL/a'
  },
  {
    id: 3133,
    topic: 'Diffraction Grating: สูตร',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'สูตรสำหรับ Diffraction Grating (เกรตติ้ง) คืออะไร?',
    options: [
      'd sinθ = mλ',
      'd cosθ = mλ',
      'nλ = d sinθ',
      'a sinθ = mλ'
    ],
    answer: 'd sinθ = mλ',
    explanation: 'd sinθ = mλ โดย d = ระยะห่างระหว่างร่อง (grating spacing), m = อันดับ, θ = มุมเบี่ยง',
    ruleSummary: 'Grating: d sinθ = mλ'
  },
  {
    id: 3134,
    topic: 'Diffraction Grating: คำนวณมุม',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'เกรตติ้ง 500 เส้น/mm (d = 2×10⁻³ mm) แสง λ=600 nm มุมเบี่ยงอันดับ 1 เท่าใด? (sin17.5°≈0.301)',
    options: [
      '10.0°',
      '17.5°',
      '30.0°',
      '45.0°'
    ],
    answer: '17.5°',
    explanation: 'sinθ = mλ/d = (1)(600×10⁻⁹)/(2×10⁻⁶) = 0.300 → θ ≈ 17.5°',
    ruleSummary: 'sinθ = λ/d (m=1)'
  },
  {
    id: 3135,
    topic: 'Grating: จำนวนอันดับสูงสุด',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'เกรตติ้ง d=1500 nm, λ=500 nm อันดับสูงสุดที่เกิดได้คืออันดับใด?',
    options: [
      'm = 1',
      'm = 2',
      'm = 3',
      'm = 4'
    ],
    answer: 'm = 3',
    explanation: 'sinθ ≤ 1: m ≤ d/λ = 1500/500 = 3.0 ดังนั้น m_max = 3 (m=4 ต้องการ sinθ > 1 ซึ่งเป็นไปไม่ได้)',
    ruleSummary: 'm_max = d/λ (ปัดลง)'
  },
  {
    id: 3136,
    topic: 'Grating: แยกสีได้ดีกว่า Double-Slit',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'Diffraction Grating แยกสีได้ดีกว่า Double-Slit เพราะอะไร?',
    options: [
      'มีร่องมากกว่า ทำให้แถบสว่างคมชัดกว่า',
      'ใหญ่กว่า',
      'ทำจากวัสดุหักเหสูงกว่า',
      'ใช้แสง Laser เสมอ'
    ],
    answer: 'มีร่องมากกว่า ทำให้แถบสว่างคมชัดกว่า',
    explanation: 'Grating มีร่องนับพัน แถบสว่างแคบและคมชัดมาก (N มาก → คมชัดมาก) แยกสีที่ λ ต่างกันเล็กน้อยได้ ใช้ใน Spectrometer',
    ruleSummary: 'Grating: N ร่องมาก → แถบแหลม คมชัด แยกสีได้ดี'
  },
  {
    id: 3137,
    topic: 'Resolving Power ของ Grating',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'Resolving Power (R) ของ Grating คืออะไร?',
    options: [
      'R = mN (อันดับ × จำนวนร่อง)',
      'R = d/λ',
      'R = N/d',
      'R = λ/Δλ_min'
    ],
    answer: 'R = mN (อันดับ × จำนวนร่อง)',
    explanation: 'R = mN = λ/Δλ_min: กำลังแยก R บอกว่า grating แยกสอง λ ที่ใกล้กันแค่ไหน N=จำนวนร่อง m=อันดับ',
    ruleSummary: 'Resolving Power R = mN = λ/Δλ_min'
  },
  {
    id: 3138,
    topic: 'การเลี้ยวเบนรอบสิ่งกีดขวาง',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Easy',
    question: 'ทำไมแสงถึงเลี้ยวเบนได้รอบขอบวัตถุ?',
    options: [
      'แสงสะท้อนจากขอบวัตถุ',
      'หลักการของ Huygens: ทุกจุดบนหน้าคลื่นเป็นแหล่งกำเนิดคลื่นใหม่',
      'วัตถุดูดซับแสงแล้วปล่อยออก',
      'แสงหักเหรอบขอบ'
    ],
    answer: 'หลักการของ Huygens: ทุกจุดบนหน้าคลื่นเป็นแหล่งกำเนิดคลื่นใหม่',
    explanation: 'Huygens\' Principle: ทุกจุดบน wavefront เป็น secondary source ส่งคลื่นกลมออกมา คลื่นรอบขอบช่องเบนเข้าไปในเงา ทำให้เกิด Diffraction',
    ruleSummary: 'Diffraction = Huygens: ทุกจุด wavefront เป็น secondary source'
  },
  {
    id: 3139,
    topic: 'Fraunhofer vs Fresnel Diffraction',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'Fraunhofer Diffraction ต่างจาก Fresnel Diffraction อย่างไร?',
    options: [
      'Fraunhofer: ฉากใกล้ช่อง; Fresnel: ฉากไกล',
      'Fraunhofer: แหล่งแสงและฉากอยู่ไกลมาก (ลำแสงขนาน); Fresnel: ระยะใกล้',
      'Fraunhofer ใช้เฉพาะ Grating; Fresnel ใช้เฉพาะ Single-Slit',
      'ไม่มีความต่าง'
    ],
    answer: 'Fraunhofer: แหล่งแสงและฉากอยู่ไกลมาก (ลำแสงขนาน); Fresnel: ระยะใกล้',
    explanation: 'Fraunhofer (Far-field): แหล่งแสงและฉากไกลมาก หรือใช้เลนส์ทำให้ขนาน; Fresnel (Near-field): ระยะจำกัด คำนวณซับซ้อนกว่า',
    ruleSummary: 'Fraunhofer = far-field (parallel); Fresnel = near-field'
  },
  {
    id: 3140,
    topic: 'X-ray Diffraction',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'กฎของ Bragg (Bragg\'s Law) สำหรับการเลี้ยวเบน X-ray ในผลึกคืออะไร?',
    options: [
      '2d sinθ = mλ',
      'd sinθ = mλ',
      'd cosθ = mλ',
      '2d cosθ = mλ'
    ],
    answer: '2d sinθ = mλ',
    explanation: 'Bragg\'s Law: 2d sinθ = mλ ใช้กับ X-ray ที่สะท้อนจากระนาบผลึก d=ระยะห่างระนาบ θ=มุม Bragg ใช้กำหนดโครงสร้างผลึก (X-ray Crystallography)',
    ruleSummary: "Bragg's Law: 2d sinθ = mλ (X-ray ในผลึก)"
  },
  {
    id: 3141,
    topic: 'แสงสีต่างๆ บน Grating',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'เกรตติ้งส่องด้วยแสงขาว แถบสีใดอยู่ไกลสุดจากศูนย์กลาง (m=1)?',
    options: [
      'ม่วง',
      'เหลือง',
      'แดง',
      'เขียว'
    ],
    answer: 'แดง',
    explanation: 'd sinθ = λ → sinθ = λ/d λ ใหญ่ → sinθ ใหญ่ → θ ใหญ่ → ห่างศูนย์กลางมากสุด แดง (λ ใหญ่สุด) อยู่นอกสุด ม่วงในสุด',
    ruleSummary: 'Grating: แดง θ มากสุด ม่วง θ น้อยสุด (m เดียวกัน)'
  },
  {
    id: 3142,
    topic: 'Laser: ใช้งาน',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Easy',
    question: 'ในห้องปฏิบัติการ Laser He-Ne มีความยาวคลื่นเท่าใด?',
    options: [
      '405 nm (ม่วง)',
      '532 nm (เขียว)',
      '633 nm (แดง)',
      '780 nm (IR)'
    ],
    answer: '633 nm (แดง)',
    explanation: 'Laser He-Ne มีความยาวคลื่นหลัก 632.8 nm (สีแดง) เป็น Laser ที่นิยมใช้ในการทดลองแสงในห้องปฏิบัติการ',
    ruleSummary: 'He-Ne Laser: λ = 633 nm (แดง)'
  },
  {
    id: 3143,
    topic: 'Hologram',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'Hologram บันทึกภาพสามมิติได้อย่างไร?',
    options: [
      'ถ่ายภาพสองมุมพร้อมกัน',
      'บันทึกรูปแบบ Interference ระหว่างแสง Laser อ้างอิงกับแสงสะท้อนจากวัตถุ',
      'ใช้เลนส์หลายชั้น',
      'ใช้กระจกโค้งพิเศษ'
    ],
    answer: 'บันทึกรูปแบบ Interference ระหว่างแสง Laser อ้างอิงกับแสงสะท้อนจากวัตถุ',
    explanation: 'Holography: Laser แยกเป็น 2 เส้นทาง Reference beam + Object beam แทรกสอดกันบนฟิล์มถ่ายรูปแบบ Interference pattern เมื่อส่องด้วย Laser ที่เหมาะสมเห็นภาพ 3D',
    ruleSummary: 'Hologram = บันทึก Interference pattern ของ Laser'
  },
  {
    id: 3144,
    topic: 'CD/DVD: อ่านข้อมูลด้วยแสง',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'CD ใช้หลักการใดอ่านข้อมูล?',
    options: [
      'การสะท้อนจากหลุม (pit) และพื้นผิวเรียบ (land) ด้วย Laser',
      'Diffraction Grating',
      'Thin Film Interference',
      'Rayleigh Scattering'
    ],
    answer: 'การสะท้อนจากหลุม (pit) และพื้นผิวเรียบ (land) ด้วย Laser',
    explanation: 'CD: Laser 780 nm ยิงลงผิว CD ที่มี pit (หลุม) สลับ land (พื้น) แสงสะท้อนต่างกัน → แปลงเป็น 0 และ 1 สีรุ้งบน CD เกิดจาก Diffraction ของร่องข้อมูล',
    ruleSummary: 'CD: Laser อ่าน pit/land; สีรุ้ง = Diffraction'
  },
  {
    id: 3145,
    topic: 'Fringe ในน้ำ',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'ทำการทดลอง Young ในน้ำ (n=1.33) แทนอากาศ ระยะห่างแถบจะเปลี่ยนอย่างไร?',
    options: [
      'ลดลงเหลือ 1/1.33 ของเดิม',
      'เพิ่มขึ้น 1.33 เท่า',
      'ไม่เปลี่ยน',
      'หายไปหมด'
    ],
    answer: 'ลดลงเหลือ 1/1.33 ของเดิม',
    explanation: 'λ_น้ำ = λ/n = λ/1.33 Fringe spacing Δy = λL/d → ในน้ำ Δy = λ_น้ำ L/d = λL/(nd) ลดลงเหลือ 1/n',
    ruleSummary: 'ในตัวกลาง n: Δy ลดเหลือ Δy_อากาศ/n (λ ลดลง)'
  },
  {
    id: 3146,
    topic: 'Interference vs Diffraction',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'ความแตกต่างหลักระหว่าง Interference และ Diffraction คืออะไร?',
    options: [
      'Interference ใช้สองช่อง; Diffraction ใช้หนึ่งช่อง',
      'Interference คือการทับซ้อนของคลื่น Discrete; Diffraction คือการทับซ้อนของ Continuous wavelet จากช่องหรือขอบ',
      'Interference เกิดกับแสงเท่านั้น; Diffraction เกิดกับคลื่นทุกชนิด',
      'ไม่มีความต่าง'
    ],
    answer: 'Interference คือการทับซ้อนของคลื่น Discrete; Diffraction คือการทับซ้อนของ Continuous wavelet จากช่องหรือขอบ',
    explanation: 'ทั้งสองอาศัยหลักการทับซ้อนเหมือนกัน Interference มักหมายถึงคลื่นจากแหล่ง discrete ที่แน่นอน; Diffraction เกิดจาก secondary wavelets จาก wavefront ที่ต่อเนื่อง ในทางปฏิบัติมักเกิดพร้อมกัน',
    ruleSummary: 'Interference: discrete sources; Diffraction: continuous wavefront'
  },
  {
    id: 3147,
    topic: 'Single Slit: Central Max vs Side Max',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'ใน Single-Slit diffraction แถบสว่างกลาง (Central Maximum) กว้างกว่าแถบสว่างข้างเท่าใด?',
    options: [
      'กว้างกว่า 1 เท่า (เท่ากัน)',
      'กว้างกว่า 2 เท่า',
      'กว้างกว่า 4 เท่า',
      'แคบกว่า'
    ],
    answer: 'กว้างกว่า 2 เท่า',
    explanation: 'Central Maximum: กว้าง = 2λL/a แถบข้าง (Side Max): กว้าง = λL/a ดังนั้น Central Max กว้างกว่า 2 เท่า',
    ruleSummary: 'Central Max กว้าง 2× ของ Side Max'
  },
  {
    id: 3148,
    topic: 'Diffraction Limit ของ Telescope',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'เส้นผ่านศูนย์กลางเลนส์ของกล้องโทรทรรศน์มีผลต่อความละเอียดอย่างไร?',
    options: [
      'ใหญ่ขึ้น → ความละเอียดแย่ลง',
      'ใหญ่ขึ้น → ความละเอียดดีขึ้น (Rayleigh Criterion: θ_min = 1.22λ/D)',
      'ขนาดเลนส์ไม่มีผล',
      'ใหญ่ขึ้น → ขยายได้มากขึ้นเท่านั้น'
    ],
    answer: 'ใหญ่ขึ้น → ความละเอียดดีขึ้น (Rayleigh Criterion: θ_min = 1.22λ/D)',
    explanation: 'Rayleigh Criterion: θ_min = 1.22λ/D D ใหญ่ขึ้น → θ_min เล็กลง → แยกวัตถุใกล้กันได้ดีขึ้น Diffraction เป็นขีดจำกัดของความละเอียด',
    ruleSummary: 'Rayleigh θ_min = 1.22λ/D; D ใหญ่ → คมชัดกว่า'
  },
  {
    id: 3149,
    topic: 'Double-Slit กับ Single-Slit Envelope',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'รูปแบบ Double-Slit จริงๆ (ช่องมีความกว้าง a ≠ 0) มีลักษณะอย่างไร?',
    options: [
      'แถบ Interference ที่มีความเข้มสม่ำเสมอ',
      'แถบ Interference ของ Double-Slit ถูก Envelope ของ Single-Slit ปรับความเข้ม',
      'เหมือน Single-Slit ล้วน',
      'แถบสม่ำเสมอไม่มีรูปแบบ'
    ],
    answer: 'แถบ Interference ของ Double-Slit ถูก Envelope ของ Single-Slit ปรับความเข้ม',
    explanation: 'Double-Slit จริง: ความเข้มเป็นผลคูณของรูปแบบ Double-Slit Interference (แถบถี่) กับ Single-Slit Diffraction Envelope (แถบหยาบๆ)',
    ruleSummary: 'Double-Slit จริง = Double-Slit × Single-Slit envelope'
  },
  {
    id: 3150,
    topic: 'สรุปหัวข้อ: ประยุกต์ใช้ Grating',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'Diffraction Grating ใช้ในอุปกรณ์ใดบ้างในชีวิตจริง?',
    options: [
      'Spectrometer วิเคราะห์สเปกตรัม, Monochromator คัดสีแสง, CD/DVD',
      'กล้องถ่ายรูปธรรมดา',
      'แว่นตาสายตา',
      'ไฟฉาย LED'
    ],
    answer: 'Spectrometer วิเคราะห์สเปกตรัม, Monochromator คัดสีแสง, CD/DVD',
    explanation: 'Grating ใช้ใน: 1) Spectrometer วิเคราะห์สเปกตรัม 2) Monochromator เลือกความยาวคลื่น 3) สีรุ้งบน CD/DVD เกิดจาก grating ที่ร่องข้อมูล',
    ruleSummary: 'Grating: Spectrometer, Monochromator, CD/DVD'
  },
];
