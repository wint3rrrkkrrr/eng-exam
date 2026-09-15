import { SubjectInfo } from '../types';

export const availableSubjects: SubjectInfo[] = [
  {
    id: 'english',
    name: 'ภาษาอังกฤษ (English Grammar)',
    nameEn: 'Modal Verbs & Future Forms (80 ข้อ)',
    icon: 'Languages',
    color: 'amber',
    description: 'คลังข้อสอบ 80 ข้อ ครอบคลุม Modal Verbs & Future Forms ทุกมิติ สุ่มข้อสอบอัตโนมัติ ตัดข้อที่เคยทำแล้วออกเมื่อกดทำต่อ',
    totalQuestions: 80,
    isReady: true,
  },
  {
    id: 'biology',
    name: 'ชีววิทยา ม.5 (Biology)',
    nameEn: 'พืชและการสังเคราะห์ด้วยแสง (100 ข้อ)',
    icon: 'Atom',
    color: 'emerald',
    description: 'คลังข้อสอบ 100 ข้อ ครบ 7 ตอน: วัฏจักรชีวิตแบบสลับ, การปฏิสนธิ, โครงสร้างดอก, การลำเลียงน้ำ/อาหาร, การสังเคราะห์ด้วยแสง, พืช C3/C4/CAM และปัจจัยจำกัด',
    totalQuestions: 100,
    isReady: true,
  },
  {
    id: 'history',
    name: 'ประวัติศาสตร์ & อารยธรรม (Social Studies)',
    nameEn: 'กรีก โรมัน จีน อินเดีย (100 ข้อ)',
    icon: 'Globe',
    color: 'purple',
    description: 'คลังข้อสอบ 100 ข้อ ครบ 4 อารยธรรมโบราณ: กรีก (ประชาธิปไตย/ปรัชญา), โรมัน (กฎหมาย/วิศวกรรม), จีน (ราชวงศ์/สิ่งประดิษฐ์), และอินเดีย (ศาสนา/คณิตศาสตร์)',
    totalQuestions: 100,
    isReady: true,
  },
  {
    id: 'math',
    name: 'คณิตศาสตร์ ม.5 (Mathematics)',
    nameEn: 'ความน่าจะเป็น & การนับ (100 ข้อ)',
    icon: 'Calculator',
    color: 'blue',
    description: 'คลังข้อสอบ 100 ข้อ ครบ 10 ตอน: พื้นฐานความน่าจะเป็น, กฎการนับ, การเรียงสับเปลี่ยน, การจัดหมู่, ความน่าจะเป็นแบบมีเงื่อนไข, เหตุการณ์อิสระ และโจทย์ระดับท้าทาย',
    totalQuestions: 100,
    isReady: true,
  },
];

export const subjectsList = availableSubjects;
