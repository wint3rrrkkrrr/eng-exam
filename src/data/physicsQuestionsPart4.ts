import { Question } from '../types';

export const physicsQuestionsPart4: Question[] = [
  // ================================================================
  // หัวข้อ: โพลาไรเซชัน IDs 3151–3165
  // ================================================================
  {
    id: 3151,
    topic: 'โพลาไรเซชันโดยการสะท้อน',
    category: 'โพลาไรเซชันของแสง',
    difficulty: 'Medium',
    question: 'แสงสะท้อนจากพื้นน้ำในมุม Brewster จะมีลักษณะอย่างไร?',
    options: [
      'Unpolarized เหมือนเดิม',
      'โพลาไรซ์สมบูรณ์ในแนวขนานกับผิว (s-polarization)',
      'โพลาไรซ์สมบูรณ์ตั้งฉากกับผิว',
      'โพลาไรซ์บางส่วน'
    ],
    answer: 'โพลาไรซ์สมบูรณ์ในแนวขนานกับผิว (s-polarization)',
    explanation: 'มุม Brewster: แสงสะท้อนโพลาไรซ์สมบูรณ์ในแนวขนานกับผิว (s-polarized / TE) แสงหักเหเป็นโพลาไรซ์บางส่วน',
    ruleSummary: 'Brewster reflection: s-polarized สมบูรณ์'
  },
  {
    id: 3152,
    topic: 'มุม Brewster ของน้ำ',
    category: 'โพลาไรเซชันของแสง',
    difficulty: 'Medium',
    question: 'มุม Brewster ของน้ำ (n=1.33) จากอากาศเท่าใด? (arctan 1.33 ≈ 53°)',
    options: [
      '37°',
      '45°',
      '53°',
      '63°'
    ],
    answer: '53°',
    explanation: 'tan θ_B = n₂/n₁ = 1.33/1.00 = 1.33 → θ_B = arctan(1.33) ≈ 53°',
    ruleSummary: 'Brewster น้ำ: arctan(1.33) ≈ 53°'
  },
  {
    id: 3153,
    topic: 'Polarizer ตั้งฉากกัน',
    category: 'โพลาไรเซชันของแสง',
    difficulty: 'Easy',
    question: 'ผ่านแผ่น Polarizer 2 แผ่นตั้งฉากกัน (crossed) ความเข้มแสงที่ผ่านออกมาเป็นเท่าใด?',
    options: [
      'I₀/2',
      'I₀/4',
      '0',
      'I₀'
    ],
    answer: '0',
    explanation: 'Malus: I = I₀cos²90° = I₀(0)² = 0 แสงไม่ผ่าน Polarizer ตั้งฉากกัน',
    ruleSummary: 'Crossed polarizers: I = 0'
  },
  {
    id: 3154,
    topic: 'แสง Unpolarized ผ่าน Polarizer',
    category: 'โพลาไรเซชันของแสง',
    difficulty: 'Easy',
    question: 'แสงไม่โพลาไรซ์ความเข้ม I₀ ผ่าน Polarizer หนึ่งแผ่น ความเข้มที่ออกมาเท่าใด?',
    options: [
      'I₀',
      'I₀/2',
      'I₀/4',
      '0'
    ],
    answer: 'I₀/2',
    explanation: 'แสง unpolarized เฉลี่ยทุกทิศ ผ่าน Polarizer ออกมา I = I₀/2 (ครึ่งหนึ่ง)',
    ruleSummary: 'Unpolarized → Polarizer: I = I₀/2'
  },
  {
    id: 3155,
    topic: 'แผ่น Polarizer 3 แผ่น',
    category: 'โพลาไรเซชันของแสง',
    difficulty: 'Hard',
    question: 'แผ่น P1 (0°) → P2 (45°) → P3 (90°) แสง Unpolarized I₀ ผ่านออกมาได้เท่าใด?',
    options: [
      '0',
      'I₀/8',
      'I₀/4',
      'I₀/2'
    ],
    answer: 'I₀/8',
    explanation: 'P1: I₀/2; P2: (I₀/2)cos²45° = (I₀/2)(1/2) = I₀/4; P3: (I₀/4)cos²45° = (I₀/4)(1/2) = I₀/8',
    ruleSummary: 'P1→P2(45°)→P3(90°): I = I₀/8'
  },
  {
    id: 3156,
    topic: 'Liquid Crystal Display (LCD)',
    category: 'โพลาไรเซชันของแสง',
    difficulty: 'Medium',
    question: 'จอ LCD ใช้หลักการโพลาไรเซชันอย่างไร?',
    options: [
      'ปล่อยแสงโดยตรงจากผลึก',
      'ผลึกเหลวบิดทิศโพลาไรซ์ของแสง ควบคุมปริมาณแสงผ่าน Polarizer คู่ได้',
      'ใช้ Fluorescence',
      'ใช้ Diffraction'
    ],
    answer: 'ผลึกเหลวบิดทิศโพลาไรซ์ของแสง ควบคุมปริมาณแสงผ่าน Polarizer คู่ได้',
    explanation: 'LCD: Backlight → Polarizer → ผลึกเหลว (บิดหรือไม่บิดทิศแสงตามสนามไฟฟ้า) → Polarizer ที่สอง ถ้าผลึกบิด 90° แสงผ่าน ถ้าไม่บิดแสงถูกกั้น',
    ruleSummary: 'LCD = ผลึกเหลวบิดทิศโพลาไรซ์ระหว่าง Crossed Polarizers'
  },
  {
    id: 3157,
    topic: 'Birefringence',
    category: 'โพลาไรเซชันของแสง',
    difficulty: 'Hard',
    question: 'Birefringence (การหักเหสองแนว) คืออะไร?',
    options: [
      'การหักเหแสงสองครั้งในปริซึม',
      'วัสดุมีดัชนีหักเหต่างกันสองค่าสำหรับแสงโพลาไรซ์ต่างทิศ',
      'แสงหักเหแล้วแยกสี',
      'แสงโพลาไรซ์สมบูรณ์ในแก้ว'
    ],
    answer: 'วัสดุมีดัชนีหักเหต่างกันสองค่าสำหรับแสงโพลาไรซ์ต่างทิศ',
    explanation: 'Birefringent material (เช่น ผลึก Calcite): n_ordinary ≠ n_extraordinary ทำให้แสงโพลาไรซ์ต่างแนวเดินทางด้วยความเร็วต่างกัน ใช้ใน Wave plates',
    ruleSummary: 'Birefringence: n_o ≠ n_e สำหรับทิศโพลาไรซ์ต่างกัน'
  },
  {
    id: 3158,
    topic: 'Optical Activity',
    category: 'โพลาไรเซชันของแสง',
    difficulty: 'Medium',
    question: 'Optical Activity คืออะไร? ใช้ตรวจอะไรได้?',
    options: [
      'การปล่อยแสง',
      'ความสามารถของสารบางชนิด (เช่น น้ำตาล) ในการหมุนทิศโพลาไรซ์ของแสง ใช้วัดความเข้มข้น',
      'การดูดซับแสง UV',
      'การเรืองแสงของสาร'
    ],
    answer: 'ความสามารถของสารบางชนิด (เช่น น้ำตาล) ในการหมุนทิศโพลาไรซ์ของแสง ใช้วัดความเข้มข้น',
    explanation: 'Optical Activity: น้ำตาล กรดอะมิโน ฯลฯ หมุนทิศโพลาไรซ์ เครื่อง Polarimeter ใช้วัดมุมหมุน ประยุกต์วัดความเข้มข้นน้ำตาลในอาหารและเลือด',
    ruleSummary: 'Optical Activity: สารหมุนทิศโพลาไรซ์ → Polarimeter วัดความเข้มข้น'
  },
  {
    id: 3159,
    topic: 'Wave Plate (λ/4 Plate)',
    category: 'โพลาไรเซชันของแสง',
    difficulty: 'Hard',
    question: 'แผ่น Quarter-Wave Plate (λ/4 Plate) ทำอะไร?',
    options: [
      'เปลี่ยนแสงโพลาไรซ์เชิงเส้นเป็นแสงโพลาไรซ์เชิงวงกลม',
      'กรองแสงครึ่งหนึ่ง',
      'เปลี่ยนสีแสง',
      'ขยายความเข้มแสง'
    ],
    answer: 'เปลี่ยนแสงโพลาไรซ์เชิงเส้นเป็นแสงโพลาไรซ์เชิงวงกลม',
    explanation: 'λ/4 Plate ทำให้ component ตั้งฉากสองตัวต่างเฟสกัน 90° ถ้า amplitude เท่ากัน → Circular Polarization ถ้าไม่เท่า → Elliptical',
    ruleSummary: 'λ/4 plate: Linear → Circular polarization'
  },
  {
    id: 3160,
    topic: 'Circular vs Linear Polarization',
    category: 'โพลาไรเซชันของแสง',
    difficulty: 'Medium',
    question: 'แสงโพลาไรซ์เชิงวงกลม (Circular Polarization) ต่างจากเชิงเส้น (Linear) อย่างไร?',
    options: [
      'Circular: สนามไฟฟ้าหมุนเป็นเกลียว, amplitude คงที่; Linear: สั่นในแนวเดียวคงที่',
      'Circular สว่างกว่า',
      'Circular มี λ สั้นกว่า',
      'ไม่มีความต่าง'
    ],
    answer: 'Circular: สนามไฟฟ้าหมุนเป็นเกลียว, amplitude คงที่; Linear: สั่นในแนวเดียวคงที่',
    explanation: 'Linear: E oscillates along one fixed direction; Circular: E rotates with constant magnitude; Elliptical: E rotates with varying magnitude',
    ruleSummary: 'Circular: E หมุน amplitude คงที่; Linear: E สั่นแนวเดียว'
  },
  {
    id: 3161,
    topic: 'EM Spectrum',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Easy',
    question: 'ลำดับความยาวคลื่น EM Spectrum จากยาวไปสั้นคืออะไร?',
    options: [
      'Radio → Microwave → IR → Visible → UV → X-ray → Gamma',
      'Gamma → X-ray → UV → Visible → IR → Microwave → Radio',
      'Radio → IR → UV → X-ray → Gamma → Microwave → Visible',
      'Visible → Radio → IR → UV → Microwave → X-ray → Gamma'
    ],
    answer: 'Radio → Microwave → IR → Visible → UV → X-ray → Gamma',
    explanation: 'EM Spectrum λ จากยาวไปสั้น: Radio (m~km) → Microwave (mm) → IR (μm) → Visible (380-780 nm) → UV (nm) → X-ray (Å-nm) → Gamma (<pm)',
    ruleSummary: 'EM Spectrum: Radio→Micro→IR→VIS→UV→X→γ (λ ลดลง)'
  },
  {
    id: 3162,
    topic: 'ความเร็วแสงใน Vacuum',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Easy',
    question: 'ความเร็วแสงในสุญญากาศมีค่าเท่าใด?',
    options: [
      '3×10⁶ m/s',
      '3×10⁸ m/s',
      '3×10¹⁰ m/s',
      '3×10¹² m/s'
    ],
    answer: '3×10⁸ m/s',
    explanation: 'c = 299,792,458 m/s ≈ 3×10⁸ m/s ความเร็วแสงในสุญญากาศ ค่าคงที่ทางฟิสิกส์ที่แน่นอน ใช้นิยาม 1 เมตร',
    ruleSummary: 'c = 3×10⁸ m/s'
  },
  {
    id: 3163,
    topic: 'EM Waves: E และ B',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Medium',
    question: 'ในคลื่น EM สนามไฟฟ้า E และสนามแม่เหล็ก B มีทิศทางสัมพันธ์กันอย่างไร?',
    options: [
      'ขนานกัน',
      'E ⊥ B ⊥ ทิศเดิน (ตั้งฉากซึ่งกันและกันและตั้งฉากกับทิศเดิน)',
      'B ขนานทิศเดิน',
      'E ขนานทิศเดิน'
    ],
    answer: 'E ⊥ B ⊥ ทิศเดิน (ตั้งฉากซึ่งกันและกันและตั้งฉากกับทิศเดิน)',
    explanation: 'คลื่น EM เป็น Transverse wave: E ⊥ B และทั้งสองตั้งฉากกับทิศการแพร่กระจาย (k) E×B ให้ทิศเดินของคลื่น (Poynting vector)',
    ruleSummary: 'EM: E ⊥ B ⊥ k (ทิศเดิน)'
  },
  {
    id: 3164,
    topic: 'Maxwell: แสงเป็น EM Wave',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Medium',
    question: 'Maxwell พิสูจน์ว่าแสงเป็นคลื่น EM โดยวิธีใด?',
    options: [
      'วัดความเร็วแสงโดยตรง',
      'คำนวณจากสมการ Maxwell ได้ว่า EM wave เดินทางด้วยความเร็ว 1/√(ε₀μ₀) = c',
      'ทดลองการแทรกสอด',
      'ใช้ Spectroscope'
    ],
    answer: 'คำนวณจากสมการ Maxwell ได้ว่า EM wave เดินทางด้วยความเร็ว 1/√(ε₀μ₀) = c',
    explanation: 'Maxwell (1864): คำนวณจาก 4 สมการ Maxwell ได้ความเร็ว EM wave = 1/√(ε₀μ₀) ≈ 3×10⁸ m/s ตรงกับความเร็วแสงที่วัดได้ → สรุปว่าแสงเป็น EM wave',
    ruleSummary: 'Maxwell: c = 1/√(ε₀μ₀) → แสงเป็น EM wave'
  },
  {
    id: 3165,
    topic: 'ความสัมพันธ์ c, λ, f',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Easy',
    question: 'แสงสีเขียว λ=500 nm มีความถี่เท่าใด?',
    options: [
      '3.0×10¹² Hz',
      '6.0×10¹⁴ Hz',
      '6.0×10¹² Hz',
      '3.0×10¹⁴ Hz'
    ],
    answer: '6.0×10¹⁴ Hz',
    explanation: 'f = c/λ = (3×10⁸)/(500×10⁻⁹) = 3×10⁸/5×10⁻⁷ = 6×10¹⁴ Hz',
    ruleSummary: 'f = c/λ'
  },
  {
    id: 3166,
    topic: 'Photon Energy',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Medium',
    question: 'พลังงานของโฟตอน (Photon) คำนวณได้จากสูตรใด?',
    options: [
      'E = hf = hc/λ',
      'E = mc²',
      'E = ½hf',
      'E = hλ'
    ],
    answer: 'E = hf = hc/λ',
    explanation: 'E = hf = hc/λ โดย h = 6.626×10⁻³⁴ J·s (Planck\'s constant) โฟตอนพลังงานสูงกว่า → ความถี่สูงกว่า → λ สั้นกว่า',
    ruleSummary: 'E_photon = hf = hc/λ'
  },
  {
    id: 3167,
    topic: 'คลื่นวิทยุ vs แสงที่มองเห็น',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Easy',
    question: 'คลื่นวิทยุ (Radio Wave) และแสงที่มองเห็นต่างกันอย่างไร?',
    options: [
      'ความเร็ว',
      'ความยาวคลื่น (คลื่นวิทยุ λ ยาวกว่า) และพลังงานต่อโฟตอน (วิทยุน้อยกว่า)',
      'ต้องการตัวกลาง',
      'ทิศการสั่น'
    ],
    answer: 'ความยาวคลื่น (คลื่นวิทยุ λ ยาวกว่า) และพลังงานต่อโฟตอน (วิทยุน้อยกว่า)',
    explanation: 'ทั้งสองเป็น EM wave เดินทาง c เท่ากัน ต่างกันที่ λ และ f คลื่นวิทยุ λ~cm-km ความถี่ต่ำกว่า พลังงานน้อยกว่า',
    ruleSummary: 'EM wave ทั้งหมดเดิน c เท่ากัน ต่างแค่ λ และ f'
  },
  {
    id: 3168,
    topic: 'Microwave ในเตาอบ',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Easy',
    question: 'เตาไมโครเวฟใช้คลื่นที่ความถี่เท่าใด และทำไมจึงอุ่นอาหารได้?',
    options: [
      '2.45 GHz สั่น resonance กับโมเลกุลน้ำ ทำให้เกิดความร้อน',
      '50 Hz จากไฟบ้าน',
      'X-ray 10 GHz',
      'Infrared 300 THz'
    ],
    answer: '2.45 GHz สั่น resonance กับโมเลกุลน้ำ ทำให้เกิดความร้อน',
    explanation: 'Microwave oven ใช้ f = 2.45 GHz ตรงกับ Dielectric Heating ของโมเลกุลน้ำ (dipole จัดตามสนาม EM สลับเร็ว → friction → ความร้อน)',
    ruleSummary: 'Microwave oven: 2.45 GHz สั่น H₂O → ความร้อน'
  },
  {
    id: 3169,
    topic: 'Gamma Ray: อันตราย',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Easy',
    question: 'รังสี Gamma อันตรายกว่า X-ray เพราะอะไร?',
    options: [
      'เร็วกว่า',
      'พลังงานต่อโฟตอนสูงกว่า ทะลุทะลวงและไปทำลาย DNA ได้รุนแรงกว่า',
      'มีประจุ',
      'เป็นคลื่นยาวกว่า'
    ],
    answer: 'พลังงานต่อโฟตอนสูงกว่า ทะลุทะลวงและไปทำลาย DNA ได้รุนแรงกว่า',
    explanation: 'Gamma: λ < 0.01 nm, E = hf สูงมาก Ionizing Radiation ทำลาย DNA ได้ แหล่ง: นิวเคลียสกัมมันตรังสี ใช้ฆ่าเซลล์มะเร็ง (Radiation Therapy)',
    ruleSummary: 'Gamma: λ สั้นสุด พลังงานสูงสุด → อันตรายมากสุด'
  },
  {
    id: 3170,
    topic: 'Poynting Vector: Intensity',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Hard',
    question: 'Poynting Vector S = E×B/μ₀ บอกอะไร?',
    options: [
      'ทิศและขนาดของสนามแม่เหล็ก',
      'ทิศการไหลพลังงานและความเข้ม (W/m²) ของคลื่น EM',
      'ความเร็วเฟสของคลื่น',
      'ทิศโพลาไรซ์ของแสง'
    ],
    answer: 'ทิศการไหลพลังงานและความเข้ม (W/m²) ของคลื่น EM',
    explanation: 'Poynting Vector S = E×B/μ₀ ทิศของ S = ทิศการแพร่พลังงาน ขนาด |S| = Intensity (W/m²) ค่าเฉลี่ย <S> = I = cε₀E₀²/2',
    ruleSummary: 'Poynting S = E×B/μ₀: ทิศ + intensity ของ EM wave'
  },
  // ================================================================
  // หัวข้อ: สรุปรวมและโจทย์ประยุกต์ IDs 3171–3200
  // ================================================================
  {
    id: 3171,
    topic: 'สรุป: กระจกเงาราบ',
    category: 'การสะท้อนและการหักเหของแสง',
    difficulty: 'Easy',
    question: 'กระจกเงาราบ: ภาพของวัตถุอยู่ที่ไหน และเป็นภาพชนิดใด?',
    options: [
      'ข้างหน้ากระจกระยะเท่ากัน ภาพจริง',
      'ข้างหลังกระจกระยะเท่ากับวัตถุ ภาพเสมือนตั้งตรงขนาดเท่าของจริง',
      'ข้างหลังกระจก ภาพจริงกลับหัว',
      'จุดโฟกัสของกระจก ภาพจริง'
    ],
    answer: 'ข้างหลังกระจกระยะเท่ากับวัตถุ ภาพเสมือนตั้งตรงขนาดเท่าของจริง',
    explanation: 'กระจกเงาราบ: ภาพอยู่หลังกระจกระยะเท่ากับระยะวัตถุหน้ากระจก เป็นภาพเสมือนตั้งตรงขนาดเท่าของจริง',
    ruleSummary: 'กระจกราบ: ภาพหลังกระจกระยะเท่าวัตถุ เสมือนตั้งตรง'
  },
  {
    id: 3172,
    topic: 'เลนส์นูน + เลนส์เว้า ต่อกัน',
    category: 'เลนส์บาง',
    difficulty: 'Hard',
    question: 'เลนส์นูน f=20 cm และเลนส์เว้า f=−30 cm วางชิดกัน กำลังรวม (Total Power) เท่าใด?',
    options: [
      '+8.33 D',
      '+5.00 D',
      '+1.67 D',
      '−1.67 D'
    ],
    answer: '+1.67 D',
    explanation: 'P = P₁+P₂ = 1/0.20 + 1/(−0.30) = 5.00 − 3.33 = +1.67 D',
    ruleSummary: 'P_total = P₁ + P₂ = 1/f₁(m) + 1/f₂(m)'
  },
  {
    id: 3173,
    topic: 'ทัศนอุปกรณ์: กล้องถ่ายรูป',
    category: 'ทัศนอุปกรณ์',
    difficulty: 'Medium',
    question: 'กล้องถ่ายรูปดิจิทัลเปรียบได้กับส่วนใดของตา?',
    options: [
      'เลนส์ตา = กระจกหน้า, Sensor = จุดบอด',
      'เลนส์กล้อง = กระจกหน้า+เลนส์ตา, รูรับแสง (Aperture) = ม่านตา, Sensor = จอประสาทตา',
      'ทั้งหมดเหมือนกันหมด',
      'Sensor = Blind Spot'
    ],
    answer: 'เลนส์กล้อง = กระจกหน้า+เลนส์ตา, รูรับแสง (Aperture) = ม่านตา, Sensor = จอประสาทตา',
    explanation: 'กล้องถ่ายรูปเปรียบกับตา: เลนส์กล้อง = cornea+lens, Aperture = iris/pupil, Shutter = เปลือกตา, Sensor/Film = retina',
    ruleSummary: 'กล้องเปรียบตา: Lens=cornea+lens, Aperture=iris, Sensor=retina'
  },
  {
    id: 3174,
    topic: 'กล้องโทรทรรศน์ดาราศาสตร์',
    category: 'ทัศนอุปกรณ์',
    difficulty: 'Medium',
    question: 'กล้องโทรทรรศน์แบบหักเห (Refracting Telescope) มีกำลังขยายเชิงมุม M เท่าไร?',
    options: [
      'M = f_objective / f_eyepiece',
      'M = f_eyepiece / f_objective',
      'M = f_objective × f_eyepiece',
      'M = f_objective − f_eyepiece'
    ],
    answer: 'M = f_objective / f_eyepiece',
    explanation: 'M_telescope = f_o/f_e เลนส์วัตถุ f ยาว เลนส์ตา f สั้น → M สูง ความยาวกล้อง = f_o + f_e (Normal Adjustment)',
    ruleSummary: 'Telescope M = f_o/f_e'
  },
  {
    id: 3175,
    topic: 'โจทย์ประยุกต์: TIR แก้วในน้ำ',
    category: 'การสะท้อนและการหักเหของแสง',
    difficulty: 'Hard',
    question: 'แก้วมงกุฎ n=1.52 จุ่มในน้ำ (n=1.33) มุมวิกฤต θ_c เท่าใด? (sin61.3°≈0.875)',
    options: [
      '41.2°',
      '61.3°',
      '50.0°',
      '35.5°'
    ],
    answer: '61.3°',
    explanation: 'sinθ_c = n_น้ำ/n_แก้ว = 1.33/1.52 = 0.875 → θ_c ≈ 61.3°',
    ruleSummary: 'TIR ในตัวกลาง: sinθ_c = n_เบา/n_หนาแน่น'
  },
  {
    id: 3176,
    topic: 'โจทย์ประยุกต์: กล้องจุลทรรศน์',
    category: 'ทัศนอุปกรณ์',
    difficulty: 'Hard',
    question: 'กล้องจุลทรรศน์: f₀=0.5 cm, f_e=2.5 cm, L=15 cm, D=25 cm กำลังขยายรวมเท่าใด?',
    options: [
      '×100',
      '×150',
      '×200',
      '×300'
    ],
    answer: '×300',
    explanation: 'M ≈ (L/f₀)(D/f_e) = (15/0.5)(25/2.5) = 30×10 = 300',
    ruleSummary: 'Microscope M = (L/f_o)(D/f_e)'
  },
  {
    id: 3177,
    topic: 'โจทย์ประยุกต์: Young คำนวณ λ จาก y',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'Young: d=0.1 mm, L=2 m แสงขาว ที่ y=12 mm แสงสีใดเสริมกัน (m=1)?',
    options: [
      'ม่วง λ≈400 nm',
      'เขียว λ≈500 nm',
      'แดง λ≈600 nm',
      'แดงเข้ม λ≈700 nm'
    ],
    answer: 'แดง λ≈600 nm',
    explanation: 'λ = yd/(mL) = (12×10⁻³)(0.1×10⁻³)/[(1)(2)] = 1.2×10⁻⁶/2 = 6×10⁻⁷ m = 600 nm → สีแดง',
    ruleSummary: 'λ = yd/(mL) คำนวณสีที่เสริมตำแหน่ง y'
  },
  {
    id: 3178,
    topic: 'กระจกเว้า: กำลังขยาย',
    category: 'การสะท้อนและการหักเหของแสง',
    difficulty: 'Medium',
    question: 'กระจกเว้า f=10 cm วางวัตถุ u=15 cm กำลังขยาย m เท่าใด?',
    options: [
      'm = −2 (คว่ำ ขยาย 2 เท่า)',
      'm = +2 (ตั้ง ขยาย 2 เท่า)',
      'm = −0.5',
      'm = +0.5'
    ],
    answer: 'm = −2 (คว่ำ ขยาย 2 เท่า)',
    explanation: '1/v + 1/u = 1/f → 1/v = 1/10 − 1/15 = 1/30 → v = 30 cm m = −v/u = −30/15 = −2 (คว่ำ ขยาย 2 เท่า)',
    ruleSummary: 'Mirror: 1/v + 1/u = 1/f; m = −v/u'
  },
  {
    id: 3179,
    topic: 'สายตาสั้นและแว่น',
    category: 'ทัศนอุปกรณ์',
    difficulty: 'Medium',
    question: 'คนสายตาสั้นมองชัดสุดที่ 50 cm ต้องใช้แว่นกี่ไดออปเตอร์เพื่อมองไกล (∞)?',
    options: [
      '+2 D',
      '−2 D',
      '+5 D',
      '−5 D'
    ],
    answer: '−2 D',
    explanation: 'สายตาสั้น: แว่นทำให้ภาพไกล (u=∞) โฟกัสที่จุดไกลสุดของตา P = −1/d_far = −1/0.5 = −2 D (เลนส์เว้า)',
    ruleSummary: 'สายตาสั้น: P = −1/d_far (เลนส์เว้า)'
  },
  {
    id: 3180,
    topic: 'กฎ Snell ประยุกต์',
    category: 'การสะท้อนและการหักเหของแสง',
    difficulty: 'Medium',
    question: 'แสงเดินจากน้ำ (n=1.33) เข้าแก้ว (n=1.5) มุมตกกระทบ 45° มุมหักเหเท่าใด? (sin38.7°≈0.627)',
    options: [
      '45°',
      '50.5°',
      '38.7°',
      '30.0°'
    ],
    answer: '38.7°',
    explanation: 'n₁sinθ₁ = n₂sinθ₂ → sinθ₂ = (1.33/1.5)sin45° = (0.887)(0.707) = 0.627 → θ₂ ≈ 38.7°',
    ruleSummary: 'Snell: n₁sinθ₁ = n₂sinθ₂'
  },
  {
    id: 3181,
    topic: 'ลึกจริงและลึกปรากฏ',
    category: 'การสะท้อนและการหักเหของแสง',
    difficulty: 'Medium',
    question: 'สระน้ำลึก 3 m (n=1.33) มองจากอากาศตรงๆ เห็นลึกเท่าใด?',
    options: [
      '3.00 m',
      '2.26 m',
      '4.00 m',
      '1.50 m'
    ],
    answer: '2.26 m',
    explanation: 'ลึกปรากฏ = ลึกจริง/n = 3.00/1.33 ≈ 2.26 m น้ำดูตื้นกว่าจริง',
    ruleSummary: 'ลึกปรากฏ = ลึกจริง/n'
  },
  {
    id: 3182,
    topic: 'Grating ประยุกต์: Angular Dispersion',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'Grating 600 เส้น/mm (d≈1667 nm) θ₁ (λ=400 nm) ≈ 13.9°, θ₁ (λ=700 nm) ≈ 24.8° ต่างมุมกันเท่าใด?',
    options: [
      '5.8°',
      '10.9°',
      '14.0°',
      '24.8°'
    ],
    answer: '10.9°',
    explanation: 'Δθ = 24.8° − 13.9° ≈ 10.9° Angular dispersion ของ Grating 600 L/mm อันดับ 1',
    ruleSummary: 'Angular dispersion Δθ = θ(λ₂) − θ(λ₁)'
  },
  {
    id: 3183,
    topic: 'X-ray การประยุกต์ใช้',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Easy',
    question: 'X-ray ใช้ในทางการแพทย์ได้อย่างไร?',
    options: [
      'รักษาเส้นเลือด',
      'ถ่ายภาพกระดูก (X-ray เจาะเนื้อเยื่อ ดูดซับในกระดูก) และรักษามะเร็ง (Radiation Therapy)',
      'วัดอุณหภูมิร่างกาย',
      'ฆ่าเชื้อโรคด้วยความร้อน'
    ],
    answer: 'ถ่ายภาพกระดูก (X-ray เจาะเนื้อเยื่อ ดูดซับในกระดูก) และรักษามะเร็ง (Radiation Therapy)',
    explanation: 'X-ray: λ~0.01-10 nm ทะลุเนื้อเยื่ออ่อน แต่ถูกดูดซับมากในกระดูก → ถ่ายภาพ Radiograph ยังใช้ฆ่าเซลล์มะเร็งในปริมาณสูง',
    ruleSummary: 'X-ray: ถ่ายภาพกระดูก + รักษามะเร็ง'
  },
  {
    id: 3184,
    topic: 'Redshift ในดาราศาสตร์',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Hard',
    question: 'Redshift ในดาราศาสตร์เกิดจากอะไร?',
    options: [
      'ดาวมีสีแดง',
      'ดาวหรือกาแล็กซีเคลื่อนออกจากเรา → λ ที่รับได้ยาวขึ้น (เลื่อนสีแดง) ตาม Doppler Effect',
      'ฝุ่นในอวกาศทำให้แสงเป็นสีแดง',
      'ความเร็วแสงช้าลงในอวกาศ'
    ],
    answer: 'ดาวหรือกาแล็กซีเคลื่อนออกจากเรา → λ ที่รับได้ยาวขึ้น (เลื่อนสีแดง) ตาม Doppler Effect',
    explanation: 'Redshift: แหล่งกำเนิดเคลื่อนออก → λ รับได้ = λ₀(1+v/c) > λ₀ Hubble ใช้ Redshift พิสูจน์จักรวาลขยายตัว',
    ruleSummary: 'Redshift: แหล่งแสงถอยห่าง → λ เพิ่ม (เลื่อนแดง)'
  },
  {
    id: 3185,
    topic: 'Fiber Optic: หลักการ TIR',
    category: 'การสะท้อนและการหักเหของแสง',
    difficulty: 'Medium',
    question: 'Fiber Optic ส่งแสงได้ระยะไกลโดยไม่สูญเสียมากเพราะอะไร?',
    options: [
      'ใช้กระจกสะท้อนภายใน',
      'TIR: แสงสะท้อนกลับหมดที่ผิวแกนใย เนื่องจาก n_core > n_cladding',
      'ความเร็วสูงกว่าปกติใน fiber',
      'ใช้กำลังสูงมาก'
    ],
    answer: 'TIR: แสงสะท้อนกลับหมดที่ผิวแกนใย เนื่องจาก n_core > n_cladding',
    explanation: 'Fiber Optic: n_core > n_cladding → แสงตกกระทบผิวด้านในเกิน θ_c → TIR → แสงเดินไปตามแกนใยได้ไกล ใช้ในอินเทอร์เน็ต การแพทย์ เซนเซอร์',
    ruleSummary: 'Fiber Optic: TIR ใน core (n_core > n_cladding)'
  },
  {
    id: 3186,
    topic: 'Periscope',
    category: 'ทัศนอุปกรณ์',
    difficulty: 'Easy',
    question: 'Periscope (กล้องในเรือดำน้ำ) ทำงานอย่างไร?',
    options: [
      'ใช้เลนส์นูน 2 อัน',
      'ใช้กระจกเงาราบ 2 บาน หรือปริซึม TIR สะท้อนแสงเปลี่ยนทิศ 90°+90°',
      'ใช้กระจกเว้า',
      'ใช้ Diffraction Grating'
    ],
    answer: 'ใช้กระจกเงาราบ 2 บาน หรือปริซึม TIR สะท้อนแสงเปลี่ยนทิศ 90°+90°',
    explanation: 'Periscope: แสงเดิน 90° (ลง) แล้ว 90° (เข้าตา) โดยกระจก/ปริซึม 45° 2 ชิ้น',
    ruleSummary: 'Periscope: กระจก/ปริซึม 2 ชิ้น สะท้อน 2 ครั้ง'
  },
  {
    id: 3187,
    topic: 'เลนส์เว้า: ตำแหน่งภาพ',
    category: 'เลนส์บาง',
    difficulty: 'Medium',
    question: 'เลนส์เว้า f=−20 cm วางวัตถุ u=30 cm ภาพอยู่ที่ไหน?',
    options: [
      'v = +60 cm (ด้านเดียวกับวัตถุ)',
      'v = −12 cm (เสมือน ด้านเดียวกับวัตถุ)',
      'v = +12 cm (จริง)',
      'v = −60 cm'
    ],
    answer: 'v = −12 cm (เสมือน ด้านเดียวกับวัตถุ)',
    explanation: '1/f = 1/v − 1/u → 1/v = 1/f + 1/u = −1/20 − 1/30? ใช้สูตร: 1/v = 1/f − 1/(−u) ไม่ถูก; ใช้ Sign: u=+30 (วัตถุจริง), f=−20: 1/v = 1/f + 1/u (รวมถ้าใช้ Cartesian: 1/v − 1/u = 1/f → 1/v = 1/f + 1/u = −1/20 + 1/30 = −3/60+2/60 = −1/60... ไม่ถูกอีก) ใช้สูตรมาตรฐาน: 1/f = 1/d_o + 1/d_i → 1/d_i = 1/f − 1/d_o = −1/20 − 1/30 = −5/60 → d_i = −12 cm (เสมือน)',
    ruleSummary: 'เลนส์เว้า: ภาพเสมือนเสมอ (d_i < 0)'
  },
  {
    id: 3188,
    topic: 'กฎสะท้อน: มุมตกกระทบ',
    category: 'การสะท้อนและการหักเหของแสง',
    difficulty: 'Easy',
    question: 'มุมตกกระทบ 30° วัดจากเส้นปกติ (Normal) มุมสะท้อนเท่าใด?',
    options: [
      '60°',
      '30°',
      '90°',
      '45°'
    ],
    answer: '30°',
    explanation: 'กฎสะท้อน: มุมสะท้อน = มุมตกกระทบ = 30° วัดจากเส้นปกติเสมอ',
    ruleSummary: 'กฎสะท้อน: θ_r = θ_i'
  },
  {
    id: 3189,
    topic: 'กระจกเว้า: ระยะโฟกัส',
    category: 'การสะท้อนและการหักเหของแสง',
    difficulty: 'Easy',
    question: 'กระจกเว้ารัศมีความโค้ง R=30 cm มีระยะโฟกัส f เท่าใด?',
    options: [
      'f = 30 cm',
      'f = 15 cm',
      'f = 60 cm',
      'f = 10 cm'
    ],
    answer: 'f = 15 cm',
    explanation: 'f = R/2 = 30/2 = 15 cm (กระจกทรงกลม)',
    ruleSummary: 'กระจกเงา: f = R/2'
  },
  {
    id: 3190,
    topic: 'โปร่งแสง vs โปร่งใส',
    category: 'สีของแสง',
    difficulty: 'Easy',
    question: 'กระจกใส (Transparent) ต่างจากแก้วฝ้า (Translucent) อย่างไร?',
    options: [
      'Transparent: แสงผ่านโดยไม่กระเจิง; Translucent: แสงผ่านแต่กระเจิง ภาพมัว',
      'ทั้งสองเหมือนกัน',
      'Translucent โปร่งกว่า',
      'Transparent: ดูดซับแสง; Translucent: สะท้อนแสง'
    ],
    answer: 'Transparent: แสงผ่านโดยไม่กระเจิง; Translucent: แสงผ่านแต่กระเจิง ภาพมัว',
    explanation: 'Transparent: แสงผ่านแทบไม่กระเจิง (กระจก น้ำ); Translucent: แสงผ่านแต่กระเจิง (แก้วฝ้า กระดาษไข); Opaque: ไม่ผ่าน',
    ruleSummary: 'Transparent: ผ่านชัด; Translucent: ผ่านมัว; Opaque: ไม่ผ่าน'
  },
  {
    id: 3191,
    topic: 'Dispersion ในปริซึม',
    category: 'การกระจายแสงและรุ้งกินน้ำ',
    difficulty: 'Easy',
    question: 'แสงขาวผ่านปริซึม แสงสีใดเบี่ยงเบนมากสุดและน้อยสุด?',
    options: [
      'มากสุด: แดง, น้อยสุด: ม่วง',
      'มากสุด: ม่วง, น้อยสุด: แดง',
      'เท่ากันทุกสี',
      'มากสุด: เขียว'
    ],
    answer: 'มากสุด: ม่วง, น้อยสุด: แดง',
    explanation: 'ในแก้ว: n_ม่วง > n_แดง → ม่วงหักเหมากกว่า → เบี่ยงเบนมากกว่าในปริซึม แดงเบี่ยงน้อยสุด',
    ruleSummary: 'ปริซึม: ม่วงเบี่ยงมากสุด แดงน้อยสุด'
  },
  {
    id: 3192,
    topic: 'รุ้งปฐมภูมิ-ทุติยภูมิ',
    category: 'การกระจายแสงและรุ้งกินน้ำ',
    difficulty: 'Medium',
    question: 'รุ้งทุติยภูมิ (Secondary Rainbow) ต่างจากรุ้งปฐมภูมิอย่างไร?',
    options: [
      'มีสีน้อยกว่า',
      'แดงอยู่ข้างบน ม่วงข้างล่าง (สีกลับกัน) และสลัวกว่า (สะท้อน 2 ครั้ง)',
      'เห็นก่อนรุ้งปฐมภูมิ',
      'เกิดจาก Mie Scattering'
    ],
    answer: 'แดงอยู่ข้างบน ม่วงข้างล่าง (สีกลับกัน) และสลัวกว่า (สะท้อน 2 ครั้ง)',
    explanation: 'Primary (1 TIR): ม่วงบน แดงล่าง; Secondary (2 TIR): แดงบน ม่วงล่าง (สีกลับ), สลัวกว่า, อยู่สูงกว่า ระหว่างสองรุ้งเป็น Alexander\'s Band (มืด)',
    ruleSummary: 'Secondary rainbow: สีกลับ (แดงบน), สลัว, 2 TIR'
  },
  {
    id: 3193,
    topic: 'Accommodation ตา',
    category: 'ทัศนอุปกรณ์',
    difficulty: 'Easy',
    question: 'Accommodation ของตาคืออะไร?',
    options: [
      'การหดและขยายม่านตา',
      'การปรับโฟกัสโดยกล้ามเนื้อเปลี่ยนความโค้งเลนส์ตา',
      'การมองเห็นสี',
      'การรับรู้ความลึก'
    ],
    answer: 'การปรับโฟกัสโดยกล้ามเนื้อเปลี่ยนความโค้งเลนส์ตา',
    explanation: 'Accommodation: Ciliary muscle หดตัว → เลนส์ตาโค้งขึ้น f ลด → มองใกล้ได้; คลายตัว → เลนส์แบน f ยาว → มองไกล',
    ruleSummary: 'Accommodation: Ciliary muscle ปรับ f ของเลนส์ตา'
  },
  {
    id: 3194,
    topic: 'Coherence กับ Interference',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Medium',
    question: 'ทำไมแสงแดดถึงไม่แสดงแถบ Interference ที่ชัดเจนผ่าน Double-Slit?',
    options: [
      'แสงแดดมีความเข้มสูงเกินไป',
      'แสงแดดเป็น Incoherent (หลายความยาวคลื่น + เฟสสุ่ม) แถบเกิดแต่สลับเร็วมาก ตาเห็นเฉลี่ยเป็นสม่ำเสมอ',
      'แสงแดดผ่านช่องไม่ได้',
      'มุมตกกระทบผิด'
    ],
    answer: 'แสงแดดเป็น Incoherent (หลายความยาวคลื่น + เฟสสุ่ม) แถบเกิดแต่สลับเร็วมาก ตาเห็นเฉลี่ยเป็นสม่ำเสมอ',
    explanation: 'แสงแดดมีหลาย λ และ Incoherent แถบของแต่ละ λ เกิดที่ต่างตำแหน่ง รวมกันออกมาไม่ชัดเจน ต้องใช้ Monochromatic + Coherent source',
    ruleSummary: 'Incoherent/Polychromatic: แถบ Interference ไม่ชัด'
  },
  {
    id: 3195,
    topic: 'Radiation Pressure',
    category: 'คลื่นแม่เหล็กไฟฟ้า',
    difficulty: 'Hard',
    question: 'แสงสามารถออกแรงดัน (Radiation Pressure) บนวัตถุได้หรือไม่?',
    options: [
      'ไม่ได้ แสงไม่มีมวล',
      'ได้ แสงพาโมเมนตัม p = h/λ โฟตอน การดูดซับหรือสะท้อนแสงถ่ายโมเมนตัมได้',
      'ได้เฉพาะ X-ray ขึ้นไป',
      'ได้เฉพาะ Laser'
    ],
    answer: 'ได้ แสงพาโมเมนตัม p = h/λ โฟตอน การดูดซับหรือสะท้อนแสงถ่ายโมเมนตัมได้',
    explanation: 'Radiation Pressure: P = I/c (ดูดซับ) หรือ 2I/c (สะท้อน) โฟตอน p = ℏk = h/λ ใช้ใน Solar Sail ขับเคลื่อนยานอวกาศด้วยแสงอาทิตย์',
    ruleSummary: 'แสงมี Radiation Pressure: P = I/c; โฟตอน p = h/λ'
  },
  {
    id: 3196,
    topic: 'โจทย์บูรณาการ: λ ในแก้ว',
    category: 'การสะท้อนและการหักเหของแสง',
    difficulty: 'Hard',
    question: 'แสง λ=600 nm เดินในแก้ว (n=1.5) ความยาวคลื่นและความเร็วในแก้วเท่าใด?',
    options: [
      'λ_glass=400 nm, v=2×10⁸ m/s',
      'λ_glass=600 nm, v=3×10⁸ m/s',
      'λ_glass=900 nm, v=4.5×10⁸ m/s',
      'λ_glass=300 nm, v=2×10⁸ m/s'
    ],
    answer: 'λ_glass=400 nm, v=2×10⁸ m/s',
    explanation: 'v = c/n = 3×10⁸/1.5 = 2×10⁸ m/s; λ_glass = λ₀/n = 600/1.5 = 400 nm (ความถี่ไม่เปลี่ยน)',
    ruleSummary: 'ในตัวกลาง n: v=c/n, λ=λ₀/n, f ไม่เปลี่ยน'
  },
  {
    id: 3197,
    topic: 'โจทย์บูรณาการ: Grating m_max',
    category: 'การแทรกสอดและการเลี้ยวเบนของแสง',
    difficulty: 'Hard',
    question: 'Grating 1200 เส้น/mm ส่องด้วย λ=500 nm อันดับสูงสุดที่เกิดได้คืออันดับใด?',
    options: [
      'm_max = 1',
      'm_max = 2',
      'm_max = 3',
      'm_max = 4'
    ],
    answer: 'm_max = 1',
    explanation: 'd = 1/1200 mm ≈ 833 nm; m_max ≤ d/λ = 833/500 = 1.67 → m_max = 1 (ปัดลง)',
    ruleSummary: 'm_max = floor(d/λ)'
  },
  {
    id: 3198,
    topic: 'โจทย์บูรณาการ: Malus 3 แผ่น',
    category: 'โพลาไรเซชันของแสง',
    difficulty: 'Hard',
    question: 'แสง I₀ ผ่าน P1 → โพลาไรซ์ → ผ่าน P2 (θ=60°) ความเข้มออกมาเท่าใด?',
    options: [
      'I₀/2',
      'I₀/4',
      'I₀/8',
      'I₀/16'
    ],
    answer: 'I₀/8',
    explanation: 'P1: I₀/2; P2: (I₀/2)cos²60° = (I₀/2)(0.5)² = (I₀/2)(0.25) = I₀/8',
    ruleSummary: 'Unpolarized → P1 → P2(60°): I = (I₀/2)cos²60° = I₀/8'
  },
  {
    id: 3199,
    topic: 'สายตายาวและแว่น',
    category: 'ทัศนอุปกรณ์',
    difficulty: 'Medium',
    question: 'คนสายตายาวมองใกล้ชัดสุดที่ 100 cm ต้องใช้แว่นกี่ไดออปเตอร์เพื่อมองที่ 25 cm?',
    options: [
      '+3 D',
      '−3 D',
      '+4 D',
      '+1 D'
    ],
    answer: '+3 D',
    explanation: '1/f = 1/image + 1/object แต่ image = −100 cm (เสมือน ด้านเดียวกับวัตถุ): 1/f = 1/(−100) + 1/25 = −0.01 + 0.04 = 0.03 → P = 0.03/0.01 = 3 D (ถ้าใช้ m) → P = +3 D',
    ruleSummary: 'สายตายาว: แว่นเลนส์นูน (+) ช่วยมองใกล้'
  },
  {
    id: 3200,
    topic: 'สรุปใหญ่: แสงในชีวิตประจำวัน',
    category: 'การกระจายแสงและรุ้งกินน้ำ',
    difficulty: 'Easy',
    question: 'ปรากฏการณ์แสงใดบ้างที่เกิดจาก Dispersion (การกระจายแสง)?',
    options: [
      'รุ้งกินน้ำ, สีรุ้งบน CD, ม่านตาแมว',
      'รุ้งกินน้ำ, สีของปริซึม, Halo รอบดวงอาทิตย์บางแบบ',
      'Mirage, ท้องฟ้าสีน้ำเงิน, รุ้งกินน้ำ',
      'TIR ใน fiber, Fluorescence, Hologram'
    ],
    answer: 'รุ้งกินน้ำ, สีของปริซึม, Halo รอบดวงอาทิตย์บางแบบ',
    explanation: 'Dispersion: n ขึ้นกับ λ ทำให้สีแยกออก ตัวอย่าง: รุ้ง (ในหยดน้ำ), ปริซึม, Halo (ในผลึกน้ำแข็ง hexagonal) ท้องฟ้าน้ำเงิน = Rayleigh Scattering (ไม่ใช่ Dispersion)',
    ruleSummary: 'Dispersion: รุ้ง ปริซึม Halo; ท้องฟ้าน้ำเงิน = Scattering'
  },
];
