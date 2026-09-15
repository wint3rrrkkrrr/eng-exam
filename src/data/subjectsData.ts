import { SubjectInfo } from '../types';

export const availableSubjects: SubjectInfo[] = [
  {
    id: 'english',
    name: 'ภาษาอังกฤษ (English Grammar)',
    nameEn: 'Modal Verbs & Future Forms',
    icon: 'Languages',
    color: 'amber',
    description: 'คลังข้อสอบใหญ่ 80 ข้อ ครอบคลุม Modal Verbs และ Future Forms ทุกมิติ — ระบบจะสุ่มโจทย์ตามจำนวนที่คุณเลือก และเมื่อกดทำต่อจะตัดโจทย์เดิมที่เคยทำแล้วออกให้อัตโนมัติ',
    totalQuestions: 80,
    isReady: true,
  },
  {
    id: 'thai',
    name: 'ภาษาไทย (Thai Language)',
    nameEn: 'หลักภาษาและการใช้ภาษา',
    icon: 'BookOpen',
    color: 'emerald',
    description: 'เตรียมพร้อมรับข้อสอบวิชาภาษาไทย — ส่งชุดข้อสอบเพิ่มเติมได้ทันที ระบบจะสร้างแบบฝึกหัดพร้อมเฉลยและโหมดสุ่มข้อสอบทันที',
    totalQuestions: 0,
    isReady: false,
  },
  {
    id: 'science',
    name: 'วิทยาศาสตร์ (Science)',
    nameEn: 'General Science & Concepts',
    icon: 'Atom',
    color: 'blue',
    description: 'เตรียมพร้อมรับข้อสอบวิชาวิทยาศาสตร์ (ฟิสิกส์, เคมี, ชีววิทยา, วิทยาศาสตร์ทั่วไป)',
    totalQuestions: 0,
    isReady: false,
  },
  {
    id: 'social',
    name: 'สังคมศึกษา (Social Studies)',
    nameEn: 'History, Civics & Geography',
    icon: 'Globe',
    color: 'purple',
    description: 'เตรียมพร้อมรับข้อสอบวิชาสังคมศึกษา ศาสนา และวัฒนธรรม',
    totalQuestions: 0,
    isReady: false,
  },
  {
    id: 'math',
    name: 'คณิตศาสตร์ (Mathematics)',
    nameEn: 'Formulas & Problem Solving',
    icon: 'Calculator',
    color: 'rose',
    description: 'เตรียมพร้อมรับข้อสอบวิชาคณิตศาสตร์และตรรกศาสตร์',
    totalQuestions: 0,
    isReady: false,
  },
];

export const subjectsList = availableSubjects;
