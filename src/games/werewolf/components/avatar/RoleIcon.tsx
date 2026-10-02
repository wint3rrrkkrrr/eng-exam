// components/avatar/RoleIcon.tsx — ไอคอนประจำบท วาดด้วย SVG ล้วน (ทุกบทมีของตัวเอง ไม่ใช้อีโมจิ)
// กรอบวาด 32x32 · ใช้ได้ทั้งแบบ <RoleIcon/> เดี่ยวๆ และ <RoleGlyph/> ซ้อนในภาพ SVG อื่น (เช่น หลุมศพ)
import React from 'react';

const INK = '#2a1d22';

/** เนื้อภาพของไอคอนบท (พิกัด 0..32) */
export const RoleGlyph: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case 'villager': // หมวกฟางชาวบ้าน
      return (
        <g>
          <ellipse cx="16" cy="21" rx="14" ry="4.6" fill="#e8c15a" stroke="#a9791a" strokeWidth="1.2" />
          <path d="M8 21 C8 8 24 8 24 21 Z" fill="#f2d273" stroke="#a9791a" strokeWidth="1.2" />
          <path d="M8.4 18 H23.6" stroke="#c0392b" strokeWidth="2.6" />
        </g>
      );
    case 'werewolf': // หัวหมาป่า ตาแดง เขี้ยว
      return (
        <g>
          <path d="M5 4 L13 9 H19 L27 4 L26 16 C26 24 20 28 16 28 C12 28 6 24 6 16 Z" fill="#7b8190" stroke="#3d414d" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M7.5 7 L12 10 L8 14 Z M24.5 7 L20 10 L24 14 Z" fill="#e7a3b4" />
          <path d="M10 22 C10 17 22 17 22 22 C22 26 19 28 16 28 C13 28 10 26 10 22 Z" fill="#d5d9e2" />
          <ellipse cx="16" cy="19.6" rx="2.4" ry="1.7" fill={INK} />
          <path d="M9.5 14 L14 15.4 M22.5 14 L18 15.4" stroke="#ff2d2d" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M13 24 L14 27 L15.4 24.6 M18.6 24.6 L20 27 L21 24" fill="#fff" stroke="#fff" strokeWidth=".8" strokeLinejoin="round" />
        </g>
      );
    case 'veil_wolf': // หมาป่าผู้บดบัง — หัวหมาป่าห่มหมอก
      return (
        <g>
          <path d="M5 4 L13 9 H19 L27 4 L26 16 C26 24 20 28 16 28 C12 28 6 24 6 16 Z" fill="#6c5f8f" stroke="#2e2650" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M9.5 14 L14 15.4 M22.5 14 L18 15.4" stroke="#ff4d6d" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="16" cy="19.6" rx="2.2" ry="1.6" fill={INK} />
          <path d="M1 17 C6 13 9 21 14 17 S23 13 31 17" stroke="#e9e4fa" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity=".92" />
          <path d="M2 23 C7 19 10 27 16 23 S25 19 30 23" stroke="#cfc7ee" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".85" />
        </g>
      );
    case 'seer': // ลูกแก้ววิเศษ
      return (
        <g>
          <path d="M8 29 L10 24 H22 L24 29 Z" fill="#c9951f" stroke="#7a5510" strokeWidth="1.1" strokeLinejoin="round" />
          <circle cx="16" cy="14" r="11" fill="#8d6cf0" stroke="#4b2fb0" strokeWidth="1.3" />
          <path d="M16 6 L17.6 11.2 L23 11.6 L18.8 15 L20.2 20.4 L16 17.4 L11.8 20.4 L13.2 15 L9 11.6 L14.4 11.2 Z" fill="#fff3a8" />
          <path d="M9 9 Q11 5.6 15 5" stroke="rgba(255,255,255,.7)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'doctor': // กากบาทการแพทย์
      return (
        <g>
          <rect x="3" y="3" width="26" height="26" rx="7" fill="#fff" stroke="#16a34a" strokeWidth="2" />
          <path d="M12.5 7 H19.5 V12.5 H25 V19.5 H19.5 V25 H12.5 V19.5 H7 V12.5 H12.5 Z" fill="#e53935" />
        </g>
      );
    case 'bodyguard': // โล่
      return (
        <g>
          <path d="M16 2.5 L28 7 V15 C28 22 22 27.5 16 29.5 C10 27.5 4 22 4 15 V7 Z" fill="#3b82f6" stroke="#1e40af" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M16 2.5 L28 7 V15 C28 22 22 27.5 16 29.5 Z" fill="#2563eb" />
          <path d="M16 8 L18 13 L23.4 13.4 L19.2 16.8 L20.6 22 L16 19 L11.4 22 L12.8 16.8 L8.6 13.4 L14 13 Z" fill="#fde68a" stroke="#b7791f" strokeWidth=".8" strokeLinejoin="round" />
        </g>
      );
    case 'witch': // ขวดยาเดือด
      return (
        <g>
          <path d="M12.5 3 H19.5 V5.4 H18 V11 L26 25 C27.4 27.6 25.8 29.5 23 29.5 H9 C6.2 29.5 4.6 27.6 6 25 L14 11 V5.4 H12.5 Z" fill="#e9f7ee" stroke="#4b5563" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M9.4 21 H22.6 L25.2 25.4 C26 27 25 28.2 23 28.2 H9 C7 28.2 6 27 6.8 25.4 Z" fill="#7c3aed" />
          <circle cx="13" cy="24.5" r="1.6" fill="#c4b5fd" /><circle cx="18.5" cy="23" r="1.2" fill="#c4b5fd" /><circle cx="20" cy="26.4" r="1" fill="#c4b5fd" />
          <rect x="11.5" y="1.6" width="9" height="3" rx="1.2" fill="#b0763a" />
        </g>
      );
    case 'hunter': // ธนูกับลูกธนู
      return (
        <g>
          <path d="M9 3 C25 8 25 24 9 29" stroke="#8a5a2b" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M9 3 L9 29" stroke="#f3e9d2" strokeWidth="1" />
          <path d="M4 16 H27" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M27 16 L21.6 12.8 V19.2 Z" fill="#6b7280" stroke="#374151" strokeWidth=".6" strokeLinejoin="round" />
          <path d="M4 16 L7.4 13.4 M4 16 L7.4 18.6 M7 16 L10 13.8 M7 16 L10 18.2" stroke="#e5484d" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    case 'cupid': // หัวใจเสียบลูกศร
      return (
        <g>
          <path d="M16 28 C2 18 5 6 12 6 C14.4 6 15.6 7.4 16 8.6 C16.4 7.4 17.6 6 20 6 C27 6 30 18 16 28 Z" fill="#f43f6e" stroke="#9f1239" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M8 9 Q9.6 7.4 12 7.4" stroke="rgba(255,255,255,.7)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M3 27 L27 5" stroke="#8a5a2b" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M27 5 L21.4 6.4 L25.6 10.6 Z" fill="#facc15" stroke="#a16207" strokeWidth=".7" strokeLinejoin="round" />
          <path d="M3 27 L3.4 21.6 M3 27 L8.4 26.6 M5.4 24.6 L6 20.4 M5.4 24.6 L9.6 24" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    case 'mason': // กำแพงอิฐ + เกรียง
      return (
        <g>
          <rect x="3" y="6" width="26" height="20" rx="1.5" fill="#d97b43" stroke="#7c3a14" strokeWidth="1.2" />
          <path d="M3 12.6 H29 M3 19.2 H29 M11 6 V12.6 M21 6 V12.6 M16 12.6 V19.2 M7 19.2 V26 M25 19.2 V26" stroke="#f3dcc6" strokeWidth="1.4" />
          <path d="M20 29 L28 17 L30 18.4 L22.4 30 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" strokeLinejoin="round" />
        </g>
      );
    case 'tanner': // หมวกตัวตลก
      return (
        <g>
          <path d="M5 24 C3 12 6 6 10 3 C10 9 13 12 16 13 C19 12 22 9 22 3 C26 6 29 12 27 24 Z" fill="#e5484d" stroke="#7f1d1d" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M16 13 C13 16 13 21 16 24 C19 21 19 16 16 13 Z" fill="#facc15" />
          <circle cx="10" cy="3" r="2.6" fill="#facc15" stroke="#a16207" strokeWidth=".8" /><circle cx="22" cy="3" r="2.6" fill="#facc15" stroke="#a16207" strokeWidth=".8" />
          <rect x="4" y="23" width="24" height="5" rx="2.4" fill="#7c3aed" stroke="#4c1d95" strokeWidth="1" />
          <circle cx="9" cy="25.5" r="1" fill="#fde68a" /><circle cx="16" cy="25.5" r="1" fill="#fde68a" /><circle cx="23" cy="25.5" r="1" fill="#fde68a" />
        </g>
      );
    case 'mayor': // สายสะพาย + เหรียญตรา
      return (
        <g>
          <path d="M7 3 L13 3 L27 22 L21 26 Z" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M9.4 3 L11.4 3 L24 21 L22.6 22.2 Z" fill="#93c5fd" opacity=".8" />
          <circle cx="16" cy="22" r="7" fill="#facc15" stroke="#a16207" strokeWidth="1.3" />
          <path d="M16 17 L17.4 20.4 L21 20.7 L18.3 23 L19.1 26.5 L16 24.7 L12.9 26.5 L13.7 23 L11 20.7 L14.6 20.4 Z" fill="#fff7cc" stroke="#a16207" strokeWidth=".7" strokeLinejoin="round" />
        </g>
      );
    case 'pacifist': // นกพิราบ + กิ่งมะกอก
      return (
        <g>
          <path d="M4 14 C8 8 14 7 18 10 C20 6 25 5 28 7 C26 10 24 11 22 11.4 C24 15 22 21 16 23 C12 24.4 7 22 5 18 C6 17.6 7 17 7.6 16.2 C6 16 5 15.2 4 14 Z" fill="#fff" stroke="#64748b" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M11 13 C14 9.6 19 9.6 21 12 C18 12 14 13.4 12 17 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth=".8" />
          <circle cx="23.2" cy="9" r="1" fill={INK} />
          <path d="M28 7 L31 8.4 L28 9.4 Z" fill="#f59e0b" />
          <path d="M6 28 C12 26 18 24 24 21" stroke="#4d7c0f" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M11 26 Q10 22.6 13 22 Q14 25 11 26 M16.4 24.2 Q16 20.6 19 20.2 Q19.8 23.2 16.4 24.2 M21 22.4 Q22 19 25 19.2 Q24.4 22.4 21 22.4" fill="#65a30d" stroke="#3f6212" strokeWidth=".6" />
        </g>
      );
    case 'village_idiot': // หน้าเวียนหัว ตาก้นหอย ลิ้นห้อย
      return (
        <g>
          <circle cx="16" cy="16" r="13" fill="#fde047" stroke="#a16207" strokeWidth="1.3" />
          <path d="M9 13 m-0.8 0 a0.8 0.8 0 1 1 1.6 0 a1.8 1.8 0 1 1 -3.6 0 a2.8 2.8 0 1 1 5.6 0 a3.8 3.8 0 1 1 -7.6 0" stroke={INK} strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <path d="M23 13 m-0.8 0 a0.8 0.8 0 1 1 1.6 0 a1.8 1.8 0 1 1 -3.6 0 a2.8 2.8 0 1 1 5.6 0 a3.8 3.8 0 1 1 -7.6 0" stroke={INK} strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <path d="M9 21 Q16 27 23 21" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M14 23.6 Q16 31 19 23.8 Z" fill="#f472b6" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
        </g>
      );
    case 'roleblocker': // มือหยุด + โซ่
      return (
        <g>
          <circle cx="16" cy="16" r="13" fill="#fee2e2" stroke="#b91c1c" strokeWidth="2.4" />
          <path d="M11.2 8.4 Q11.2 6.6 13 6.6 Q14.4 6.6 14.4 8.4 V14 M14.4 7 Q14.4 5.2 16.2 5.2 Q18 5.2 18 7 V14 M18 7.6 Q18 6 19.6 6 Q21.2 6 21.2 7.8 V14.4 M21.2 11 Q21.2 9.6 22.6 9.6 Q24 9.6 24 11.2 V17 C24 22 20.4 25.6 16.4 25.6 C12.4 25.6 10 23.4 8.4 20 L6.4 15.6 Q5.8 14 7.4 13.4 Q8.8 13 9.6 14.6 L11.2 17 Z" fill="#fff" stroke="#7f1d1d" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M5 27 L27 5" stroke="#b91c1c" strokeWidth="2.6" strokeLinecap="round" opacity=".85" />
        </g>
      );
    case 'old_hag': // หญิงชราผมเกล้า สายตายาว นิ้วจุ๊ปาก
      return (
        <g>
          <circle cx="16" cy="14" r="9" fill="#f6d9bd" stroke="#8a5a2b" strokeWidth="1.2" />
          <circle cx="16" cy="4.6" r="3.6" fill="#d1d5db" stroke="#6b7280" strokeWidth="1" />
          <path d="M7 12 C7 5.6 25 5.6 25 12 C21.6 9 10.4 9 7 12 Z" fill="#d1d5db" stroke="#6b7280" strokeWidth="1" />
          <circle cx="12.4" cy="14" r="2.8" fill="rgba(200,230,255,.6)" stroke="#475569" strokeWidth="1" /><circle cx="19.6" cy="14" r="2.8" fill="rgba(200,230,255,.6)" stroke="#475569" strokeWidth="1" />
          <path d="M15.2 14 H16.8" stroke="#475569" strokeWidth="1" /><circle cx="12.4" cy="14" r=".9" fill="#2a1d22" /><circle cx="19.6" cy="14" r=".9" fill="#2a1d22" />
          <path d="M15.4 15.4 Q14.6 18 16.4 18" stroke="#8a5a2b" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M16 19.4 V25" stroke="#7a4c22" strokeWidth="2.6" strokeLinecap="round" /><path d="M13.6 20.6 H18.4" stroke="#c0392b" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M5 28 C6 22 11 20 16 22 C21 20 26 22 27 28 Z" fill="#7c3aed" stroke="#4c1d95" strokeWidth="1" strokeLinejoin="round" />
        </g>
      );
    case 'wolf_blocker': // หัวหมาป่า + มือหยุด
      return (
        <g>
          <path d="M5 4 L13 9 H19 L27 4 L26 16 C26 24 20 28 16 28 C12 28 6 24 6 16 Z" fill="#7b8190" stroke="#3d414d" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M7.5 7 L12 10 L8 14 Z M24.5 7 L20 10 L24 14 Z" fill="#e7a3b4" />
          <path d="M10 22 C10 17 22 17 22 22 C22 26 19 28 16 28 C13 28 10 26 10 22 Z" fill="#d5d9e2" />
          <ellipse cx="16" cy="19.6" rx="2.4" ry="1.7" fill={INK} />
          <path d="M9.5 14 L14 15.4 M22.5 14 L18 15.4" stroke="#ff2d2d" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M4 26 L10 22 M6 29 L12 25" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".9" />
        </g>
      );
    case 'swapper': // ลูกศรสลับสองทาง
      return (
        <g>
          <circle cx="16" cy="16" r="13" fill="#e0f2ff" stroke="#1c7ed6" strokeWidth="1.4" />
          <path d="M9 12 H21 M21 12 L17 8 M21 12 L17 16" stroke="#1c7ed6" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23 20 H11 M11 20 L15 24 M11 20 L15 16" stroke="#f08a1c" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case 'priest': // ไม้กางเขน + รัศมี
      return (
        <g>
          <circle cx="16" cy="16" r="13" fill="#fff8e1" stroke="#b08900" strokeWidth="1.2" />
          <path d="M13 6 H19 V12 H25 V18 H19 V27 H13 V18 H7 V12 H13 Z" fill="#f3f4f6" stroke="#6b7280" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M16 6 V27" stroke="#d1d5db" strokeWidth="1" />
          <circle cx="16" cy="15" r="2.2" fill="#facc15" stroke="#a16207" strokeWidth=".7" />
        </g>
      );
    case 'aura_seer': // คนเรืองรัศมี
      return (
        <g>
          <circle cx="16" cy="16" r="13" fill="#0f172a" />
          <circle cx="16" cy="16" r="10" fill="none" stroke="#7dd3fc" strokeWidth="1.4" opacity=".55" />
          <circle cx="16" cy="16" r="7" fill="none" stroke="#a78bfa" strokeWidth="1.6" opacity=".8" />
          <circle cx="16" cy="12.6" r="3.2" fill="#fde68a" />
          <path d="M10.6 24 C10.6 18.6 21.4 18.6 21.4 24 Z" fill="#fde68a" />
        </g>
      );
    case 'mystic_seer': // ตาในฝ่ามือ/คริสตัล
      return (
        <g>
          <path d="M16 3 L27 10 V22 L16 29 L5 22 V10 Z" fill="#4c1d95" stroke="#2e1065" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M16 3 L27 10 L16 16 L5 10 Z" fill="#6d28d9" />
          <path d="M8 17 C11 13 21 13 24 17 C21 21 11 21 8 17 Z" fill="#ede9fe" stroke="#312e81" strokeWidth="1" />
          <circle cx="16" cy="17" r="2.8" fill="#312e81" /><circle cx="15" cy="16" r="1" fill="#fff" />
        </g>
      );
    case 'detective': // แว่นขยาย + รอยเท้า
      return (
        <g>
          <circle cx="13.5" cy="13" r="8" fill="rgba(186,230,253,.55)" stroke="#1e3a8a" strokeWidth="2.2" />
          <path d="M19.5 19 L27 27" stroke="#92400e" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M10 12 Q13.5 8.5 17 12" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <circle cx="11" cy="15.4" r="1.4" fill="#1e3a8a" /><circle cx="16" cy="15.4" r="1.4" fill="#1e3a8a" />
        </g>
      );
    case 'investigator': // แฟ้มคดี + ลายนิ้วมือ
      return (
        <g>
          <path d="M4 8 H13 L15.4 11 H28 V26 H4 Z" fill="#d97706" stroke="#7c2d12" strokeWidth="1.2" strokeLinejoin="round" />
          <rect x="7" y="13" width="18" height="12" rx="1.4" fill="#fef3c7" stroke="#92400e" strokeWidth="1" />
          <path d="M16 15.4 C12.6 15.4 11 17.6 11 20 M16 17.6 C14.2 17.6 13.4 18.8 13.4 20.4 M16 19.8 V22.6 M16 15.4 C19.4 15.4 21 17.6 21 20.6" stroke="#92400e" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'gravekeeper': // พลั่ว + หลุมศพเล็ก
      return (
        <g>
          <path d="M6 24 V14 C6 9 14 9 14 14 V24 Z" fill="#9ca3af" stroke="#4b5563" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M8 16 H12 M9 19.4 H11" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M22 4 L26 8 L20 26 L17 23 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M22 4 L26 8 L28 6 L24 2 Z" fill="#d1d5db" stroke="#6b7280" strokeWidth="1" strokeLinejoin="round" />
          <ellipse cx="16" cy="27" rx="12" ry="2.6" fill="#4b5563" opacity=".5" />
        </g>
      );
    case 'apprentice_seer': // ลูกแก้วเล็กกับดาวเรียนรู้
      return (
        <g>
          <path d="M9 29 L10.6 25 H21.4 L23 29 Z" fill="#c9951f" stroke="#7a5510" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="9" fill="#b9a7f0" stroke="#5b3dd8" strokeWidth="1.3" opacity=".85" />
          <path d="M16 10.5 L17.2 14.2 L21 14.4 L18 16.8 L19 20.6 L16 18.4 L13 20.6 L14 16.8 L11 14.4 L14.8 14.2 Z" fill="#fff8d0" opacity=".9" />
          <path d="M24 7 L25.2 9.8 L28 11 L25.2 12.2 L24 15 L22.8 12.2 L20 11 L22.8 9.8 Z" fill="#fde68a" stroke="#a16207" strokeWidth=".6" strokeLinejoin="round" />
        </g>
      );
    case 'lycan': // หน้าคนที่มีเงาหมาป่า
      return (
        <g>
          <circle cx="16" cy="16" r="13" fill="#fde7c7" stroke="#a16207" strokeWidth="1.2" />
          <path d="M16 3 A13 13 0 0 1 16 29 Z" fill="#6b7280" opacity=".55" />
          <path d="M8 11 L10.6 13 L8.4 15 Z" fill="#7b8190" />
          <circle cx="12.4" cy="15" r="1.6" fill={INK} />
          <path d="M19 13.4 L22.6 15 L19 16.6 Z" fill="#fff" stroke="#4b5563" strokeWidth=".7" strokeLinejoin="round" />
          <circle cx="20.6" cy="15" r="1.6" fill="#ff2d2d" />
          <path d="M11 21 Q16 24.6 21 21" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'cursed_villager': // หมวกฟาง + รอยคำสาปสีม่วง
      return (
        <g>
          <ellipse cx="16" cy="20" rx="13" ry="4.4" fill="#e8c15a" stroke="#a9791a" strokeWidth="1.2" />
          <path d="M8.5 20 C8.5 8 23.5 8 23.5 20 Z" fill="#f2d273" stroke="#a9791a" strokeWidth="1.2" />
          <path d="M9 17.4 H23" stroke="#7c3aed" strokeWidth="2.4" />
          <path d="M24 4 L21 11 H25.4 L20.6 19" stroke="#a855f7" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="25.6" r="2.2" fill="#7c3aed" opacity=".6" />
        </g>
      );
    case 'tough_guy': // แขนกล้าม + ผ้าพันแผล
      return (
        <g>
          <path d="M5 21 C5 14 11 11 16 11 C21 11 27 14 27 21 C27 26 21 28 16 28 C11 28 5 26 5 21 Z" fill="#e8a05c" stroke="#8a5a2b" strokeWidth="1.3" />
          <path d="M9 16 C12 13 20 13 23 16" stroke="#8a5a2b" strokeWidth="1.2" fill="none" />
          <rect x="4" y="17.4" width="24" height="5" rx="1.6" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" transform="rotate(-8 16 20)" />
          <path d="M6 19 L26 16.4" stroke="#d1d5db" strokeWidth="1" transform="rotate(-8 16 20)" />
          <path d="M16 3 L18 8 L23 8.6 L19.4 12 L20.4 17 L16 14.4 L11.6 17 L12.6 12 L9 8.6 L14 8 Z" fill="#ef4444" opacity=".25" />
        </g>
      );
    case 'vigilante': // ปืนพกกับกระสุนนัดเดียว
      return (
        <g>
          <path d="M4 12 H24 V18 H19 L17 23 H12 L13 18 H10 V15 H4 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="1.2" strokeLinejoin="round" />
          <rect x="5" y="13.4" width="6" height="2" rx="1" fill="#9ca3af" />
          <circle cx="27" cy="8" r="3.4" fill="#facc15" stroke="#a16207" strokeWidth="1" />
          <path d="M27 5.6 L27 10.4" stroke="#a16207" strokeWidth=".8" />
        </g>
      );
    case 'minion': // หน้ากากสมุน + อุ้งเท้าเล็ก
      return (
        <g>
          <path d="M6 7 L16 4 L26 7 L25 17 C25 24 20 28 16 29 C12 28 7 24 7 17 Z" fill="#374151" stroke="#111827" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M10.4 14 L15 15.4 L10.4 17.4 Z" fill="#ff6b6b" />
          <path d="M21.6 14 L17 15.4 L21.6 17.4 Z" fill="#ff6b6b" />
          <g fill="#9ca3af"><ellipse cx="16" cy="23.4" rx="3.2" ry="2.4" /><circle cx="12.6" cy="20.6" r="1.2" /><circle cx="15" cy="19.2" r="1.2" /><circle cx="17.6" cy="19.2" r="1.2" /><circle cx="19.6" cy="20.6" r="1.2" /></g>
        </g>
      );
    case 'lone_wolf': // หัวหมาป่าเดี่ยวใต้แสงจันทร์
      return (
        <g>
          <circle cx="24" cy="7" r="4.4" fill="#f4eecb" />
          <path d="M6 10 L13 14 H19 L26 10 L25 20 C25 26 19 29 16 29 C13 29 7 26 7 20 Z" fill="#5b6270" stroke="#2d313a" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M8 12 L12 15 L9 18 Z M24 12 L20 15 L23 18 Z" fill="#e7a3b4" />
          <ellipse cx="16" cy="22" rx="6" ry="4.4" fill="#c7ccd6" />
          <circle cx="16" cy="21" r="2" fill={INK} />
          <path d="M9 16 L13.6 17.2 M23 16 L18.4 17.2" stroke="#ff2d2d" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'sorcerer': // ลูกแก้วดำของฝูง
      return (
        <g>
          <path d="M9 29 L10.6 25 H21.4 L23 29 Z" fill="#3a2e22" stroke="#1a140e" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="10" fill="#241428" stroke="#5b0f16" strokeWidth="1.3" />
          <path d="M16 8 L17.4 12 L21.6 12.4 L18.4 15 L19.4 19.2 L16 16.8 L12.6 19.2 L13.6 15 L10.4 12.4 L14.6 12 Z" fill="#ff4d5a" opacity=".85" />
        </g>
      );
    case 'wolf_seer': // หัวหมาป่าถือลูกแก้ว
      return (
        <g>
          <path d="M4 5 L11 9 H15 L22 5 L21 15 C21 21 16 24 13 24 C10 24 5 21 5 15 Z" fill="#7b8190" stroke="#3d414d" strokeWidth="1.1" strokeLinejoin="round" />
          <ellipse cx="13" cy="16.6" rx="1.8" ry="1.4" fill={INK} />
          <path d="M7 11 L10.4 12.2 L8 14 Z" stroke="#ff2d2d" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="23" cy="22" r="7" fill="#8d6cf0" stroke="#4b2fb0" strokeWidth="1.2" />
          <path d="M23 17.6 L24 20.4 L27 20.6 L24.6 22.2 L25.4 25 L23 23.4 L20.6 25 L21.4 22.2 L19 20.6 L22 20.4 Z" fill="#fff3a8" />
        </g>
      );
    case 'alpha_wolf': // หัวหมาป่าสวมมงกุฎ
      return (
        <g>
          <path d="M5 9 L13 13 H19 L27 9 L26 20 C26 26 20 29 16 29 C12 29 6 26 6 20 Z" fill="#5c4330" stroke="#2e2015" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M8 12 L12 15 L9 18 Z M24 12 L20 15 L23 18 Z" fill="#e7a3b4" />
          <ellipse cx="16" cy="22" rx="6.2" ry="4.4" fill="#d9c7b0" />
          <circle cx="16" cy="21" r="2" fill={INK} />
          <path d="M9 16 L13.6 17.4 M23 16 L18.4 17.4" stroke="#ff2d2d" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 6 L10 1 L12.6 5 L16 0 L19.4 5 L22 1 L24 6 Z" fill="#ffd43b" stroke="#a16207" strokeWidth="1" strokeLinejoin="round" />
        </g>
      );
    case 'infectious_wolf': // หัวหมาป่า + หยดพิษเขียว
      return (
        <g>
          <path d="M5 4 L13 9 H19 L27 4 L26 16 C26 24 20 28 16 28 C12 28 6 24 6 16 Z" fill="#6f8257" stroke="#3a4a2a" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M7.5 7 L12 10 L8 14 Z M24.5 7 L20 10 L24 14 Z" fill="#e7a3b4" />
          <ellipse cx="16" cy="19.6" rx="2.4" ry="1.7" fill={INK} />
          <path d="M9.5 14 L14 15.4 M22.5 14 L18 15.4" stroke="#ff2d2d" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 20 C13 24 13 28 16 31 C19 28 19 24 16 20 Z" fill="#7bdc5a" stroke="#2f7a1a" strokeWidth=".8" />
        </g>
      );
    case 'wolf_cub': // ลูกหมาป่าตัวเล็ก
      return (
        <g>
          <path d="M8 12 L13 15 H19 L24 12 L23 21 C23 26 19 28 16 28 C13 28 9 26 9 21 Z" fill="#9b7a5a" stroke="#5a3f28" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M9 14 L12 16 L9.6 18.4 Z M23 14 L20 16 L22.4 18.4 Z" fill="#e7b3a3" />
          <ellipse cx="16" cy="21" rx="4.4" ry="3.2" fill="#d9c3a8" />
          <circle cx="16" cy="20.2" r="1.4" fill={INK} />
          <circle cx="11.6" cy="17.4" r="1.6" fill="#fff" /><circle cx="11.6" cy="17.4" r=".8" fill={INK} />
          <circle cx="20.4" cy="17.4" r="1.6" fill="#fff" /><circle cx="20.4" cy="17.4" r=".8" fill={INK} />
        </g>
      );
    case 'gunner': // ปืนพกคู่
      return (
        <g>
          <path d="M3 16 H17 V21 H13 L11 26 H7 L9 21 H3 Z" fill="#78716c" stroke="#44403c" strokeWidth="1.1" strokeLinejoin="round" />
          <rect x="4" y="17.4" width="5" height="1.8" rx=".8" fill="#d6d3d1" />
          <path d="M15 6 H29 V11 H25 L23 16 H19 L21 11 H15 Z" fill="#78716c" stroke="#44403c" strokeWidth="1.1" strokeLinejoin="round" />
          <rect x="16" y="7.4" width="5" height="1.8" rx=".8" fill="#d6d3d1" />
        </g>
      );
    case 'jester': // หมวกตัวตลกยิ้มร่า
      return (
        <g>
          <path d="M5 24 C3 12 6 6 10 3 C10 9 13 12 16 13 C19 12 22 9 22 3 C26 6 29 12 27 24 Z" fill="#e5484d" stroke="#7f1d1d" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M16 13 C13 16 13 21 16 24 C19 21 19 16 16 13 Z" fill="#facc15" />
          <circle cx="10" cy="3" r="2.6" fill="#facc15" stroke="#a16207" strokeWidth=".8" /><circle cx="22" cy="3" r="2.6" fill="#facc15" stroke="#a16207" strokeWidth=".8" />
          <path d="M10 20 Q16 26 22 20" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'fool': // หมวกกลับด้าน หน้าแอบเนียน
      return (
        <g>
          <circle cx="16" cy="18" r="11" fill="#fde68a" stroke="#a16207" strokeWidth="1.2" />
          <path d="M8 17 L12 15 M24 17 L20 15" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M11 23 Q16 20 21 23" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M6 10 C4 4 10 1 16 4 C22 1 28 4 26 10 C22 7 10 7 6 10 Z" fill="#8b5cf6" stroke="#5b21b6" strokeWidth="1" strokeLinejoin="round" />
        </g>
      );
    case 'nostradamus': // ดวงตาเหนือดวงดาว
      return (
        <g>
          <path d="M4 16 C9 9 23 9 28 16 C23 23 9 23 4 16 Z" fill="#f6f7fb" stroke="#312e81" strokeWidth="1.2" />
          <circle cx="16" cy="16" r="5.4" fill="#4c1d95" /><circle cx="16" cy="16" r="2.2" fill={INK} />
          <path d="M16 2 L17.6 6.4 L22 7 L18.6 10 L19.6 14.4 L16 11.8 L12.4 14.4 L13.4 10 L10 7 L14.4 6.4 Z" fill="#facc15" stroke="#a16207" strokeWidth=".6" strokeLinejoin="round" transform="translate(0 -3) scale(.6)" />
        </g>
      );
    case 'copycat': // หน้ากากสองใบซ้อนกัน (ลอกเลียน)
      return (
        <g>
          <path d="M5 8 H19 V18 C19 23 15.6 26 12 26 C8.4 26 5 23 5 18 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1.4" />
          <circle cx="9" cy="14" r="1.5" fill={INK} /><circle cx="15" cy="14" r="1.5" fill={INK} />
          <path d="M9 20 Q12 22 15 20" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M15 6 H28 V15 C28 19.5 25 22.5 21.5 22.5 C18 22.5 15 19.5 15 15 Z" fill="#fde68a" stroke="#a16207" strokeWidth="1.4" opacity=".92" />
          <circle cx="19" cy="12" r="1.3" fill={INK} /><circle cx="24" cy="12" r="1.3" fill={INK} />
          <path d="M19 17 Q21.5 19 24 17" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'time_lord': // นาฬิกาทราย
      return (
        <g>
          <path d="M8 4 H24 M8 28 H24" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M10 4 C10 12 16 13 16 16 C16 19 10 20 10 28 H22 C22 20 16 19 16 16 C16 13 22 12 22 4 Z" fill="#fde68a" stroke="#a16207" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M12.6 24.5 H19.4 L16 20.5 Z" fill="#f59e0b" />
          <path d="M16 13.2 V20" stroke="#f59e0b" strokeWidth="1" />
        </g>
      );
    case 'mirror': // กระจกวงรี
      return (
        <g>
          <ellipse cx="16" cy="13" rx="9" ry="11" fill="#cdeaf7" stroke="#334155" strokeWidth="1.6" />
          <path d="M9 7 Q13 4 17 6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".8" />
          <path d="M16 24 V29 M11 29 H21" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'vampire': // เขี้ยวแวมไพร์ + ผ้าคลุมสีแดงเลือด
      return (
        <g>
          <circle cx="16" cy="13" r="10" fill="#e8dfd6" stroke="#2a1d22" strokeWidth="1.2" />
          <path d="M3 6 C8 10 10 16 6 24 C14 20 14 12 10 5 Z M29 6 C24 10 22 16 26 24 C18 20 18 12 22 5 Z" fill="#7a1228" stroke="#3a0a14" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="12" cy="13" r="1.6" fill="#c92a2a" /><circle cx="20" cy="13" r="1.6" fill="#c92a2a" />
          <path d="M13 18 L14 22 L15 18 M17 18 L18 22 L19 18" fill="#fff" stroke="#2a1d22" strokeWidth=".5" />
        </g>
      );
    case 'cult_leader': // หน้ากากพิธีกรรม + สัญลักษณ์
      return (
        <g>
          <path d="M16 2 L29 9 V17 C29 24 23 29 16 30 C9 29 3 24 3 17 V9 Z" fill="#2e1065" stroke="#1a0a3d" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="8.5" fill="#4c1d95" />
          <path d="M16 9 L18 14.6 L24 14.9 L19.4 18.4 L21 24 L16 20.6 L11 24 L12.6 18.4 L8 14.9 L14 14.6 Z" fill="#facc15" stroke="#a16207" strokeWidth=".6" strokeLinejoin="round" />
        </g>
      );
    case 'cult_member': // หน้ากากสีเขียวเรียบง่าย
      return (
        <g>
          <path d="M16 3 L28 10 V18 C28 24 22 28 16 29 C10 28 4 24 4 18 V10 Z" fill="#166534" stroke="#052e16" strokeWidth="1.2" strokeLinejoin="round" />
          <ellipse cx="11.6" cy="15" rx="2.4" ry="3" fill="#052e16" /><ellipse cx="20.4" cy="15" rx="2.4" ry="3" fill="#052e16" />
          <path d="M11 21 Q16 24.6 21 21" stroke="#052e16" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'doppelganger': // สองหน้ากากซ้อนกัน
      return (
        <g>
          <path d="M6 6 C9 3 15 3 18 6 C19 12 17 18 12 20 C7 18 5 12 6 6 Z" fill="#9ca3af" stroke="#374151" strokeWidth="1.2" strokeLinejoin="round" opacity=".85" />
          <circle cx="10.2" cy="9.4" r="1.2" fill="#374151" /><circle cx="14.4" cy="9.4" r="1.2" fill="#374151" />
          <path d="M14 13 C18 10 24 10 27 13 C28 19 26 25 21 27 C16 25 14 19 14 13 Z" fill="#4c1d95" stroke="#1e0a4a" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="18.6" cy="16.6" r="1.3" fill="#fff" /><circle cx="23.2" cy="16.6" r="1.3" fill="#fff" />
          <path d="M18 22 Q21 24.6 24 22" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'wild_child': // เด็กป่าสวมใบไม้
      return (
        <g>
          <circle cx="16" cy="17" r="11" fill="#d9a066" stroke="#7a4a24" strokeWidth="1.2" />
          <path d="M6 13 C8 7 14 4 20 6 C26 4 28 10 26 14 C22 10 10 10 6 13 Z" fill="#3f6212" stroke="#1a2e0a" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="12" cy="17" r="1.6" fill={INK} /><circle cx="20" cy="17" r="1.6" fill={INK} />
          <path d="M12 23 Q16 20 20 23" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M6 10 L4 5 L8 8 Z M26 10 L28 5 L24 8 Z" fill="#65a30d" />
        </g>
      );
    case 'sasquatch': // หน้าขนดกมนุษย์ป่า
      return (
        <g>
          <path d="M16 2 C24 2 28 10 27 18 C26 25 21 29 16 29 C11 29 6 25 5 18 C4 10 8 2 16 2 Z" fill="#6b4a2f" stroke="#3a2714" strokeWidth="1.2" />
          <path d="M6 12 C8 8 10 8 11 11 M26 12 C24 8 22 8 21 11" stroke="#3a2714" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <ellipse cx="11.6" cy="16" rx="2.2" ry="2.6" fill="#1a120a" /><ellipse cx="20.4" cy="16" rx="2.2" ry="2.6" fill="#1a120a" />
          <path d="M10 23 Q16 27 22 23" stroke="#1a120a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M13.4 20 L12.4 23 L13.8 20.4 M18.6 20 L19.6 23 L18.2 20.4" fill="#fff" />
        </g>
      );
    case 'serial_killer': // มีดโกนเปื้อนเลือด
      return (
        <g>
          <path d="M6 24 L20 10 L24 14 L10 28 Z" fill="#9ca3af" stroke="#1f2937" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M18 8 L24 14 L26 10 L20 4 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="1" strokeLinejoin="round" />
          <path d="M10 28 L7 26 L6 29 Z" fill="#78350f" />
          <circle cx="23" cy="20" r="2.4" fill="#dc2626" /><circle cx="26" cy="24" r="1.6" fill="#dc2626" />
        </g>
      );
    case 'arsonist': // กระป๋องน้ำมัน + เปลวไฟ
      return (
        <g>
          <rect x="7" y="14" width="14" height="14" rx="1.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.2" />
          <rect x="10" y="10" width="8" height="5" rx="1" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
          <rect x="12" y="6" width="4" height="5" fill="#9ca3af" />
          <path d="M9 17 H19" stroke="#fff" strokeWidth="1" opacity=".7" />
          <path d="M23 16 C22 20 26 20 25 24 C28 22 30 26 26 29 C27 24 23 25 24 21 C21 23 20 19 23 16 Z" fill="#f59e0b" stroke="#c2410c" strokeWidth=".8" />
        </g>
      );
    case 'lone_wolf_hunter': // ธนูเล็งหัวหมาป่า
      return (
        <g>
          <path d="M6 4 C22 8 22 24 6 28" stroke="#6b4a2f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M6 4 L6 28" stroke="#d9c9a8" strokeWidth=".8" />
          <path d="M4 16 H26" stroke="#4b5563" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M26 16 L21 13.2 V18.8 Z" fill="#4b5563" />
          <path d="M19.5 10 C21.5 10 22.5 11.5 22 13 C24 12.6 25 14 24 15.4 C22.6 15 21.2 15.8 21.4 17.2" stroke="#1f2937" strokeWidth="1" fill="none" />
          <circle cx="20" cy="12" r="1.6" fill="#1f2937" />
        </g>
      );
    case 'chupacabra': // สัตว์ประหลาดตาแดง
      return (
        <g>
          <path d="M16 3 C23 3 27 9 26 16 C25 23 21 28 16 28 C11 28 7 23 6 16 C5 9 9 3 16 3 Z" fill="#4d7c0f" stroke="#1a2e05" strokeWidth="1.2" />
          <path d="M7 10 L4 4 L9 8 Z M25 10 L28 4 L23 8 Z" fill="#365314" />
          <circle cx="11.6" cy="15" r="2.4" fill="#ff2d2d" /><circle cx="20.4" cy="15" r="2.4" fill="#ff2d2d" />
          <path d="M12 23 L14 20 L16 23 L18 20 L20 23" stroke="#1a2e05" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case 'prince': // มงกุฎ
      return (
        <g>
          <path d="M4 25 L3 9 L10 16 L16 5 L22 16 L29 9 L28 25 Z" fill="#facc15" stroke="#a16207" strokeWidth="1.4" strokeLinejoin="round" />
          <rect x="4" y="23" width="24" height="5" rx="1.6" fill="#eab308" stroke="#a16207" strokeWidth="1.1" />
          <circle cx="16" cy="17" r="2.2" fill="#ef4444" /><circle cx="9" cy="20.4" r="1.6" fill="#3b82f6" /><circle cx="23" cy="20.4" r="1.6" fill="#22c55e" />
          <circle cx="3" cy="8" r="1.6" fill="#fde68a" /><circle cx="16" cy="4.4" r="1.6" fill="#fde68a" /><circle cx="29" cy="8" r="1.6" fill="#fde68a" />
        </g>
      );
    default: // ไม่รู้จักบท
      return (
        <g>
          <circle cx="16" cy="16" r="13" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.3" />
          <path d="M11.5 12.5 C11.5 7.5 20.5 7.5 20.5 12.5 C20.5 16 16 15.6 16 19.4" stroke="#475569" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <circle cx="16" cy="24" r="1.6" fill="#475569" />
        </g>
      );
  }
};

/** ไอคอนบทแบบเดี่ยว (วาดเต็มกรอบ) — ใช้ในวงกลมสีขาวมุมการ์ด/หน้าข้อมูลบท */
export const RoleIcon: React.FC<{ id: string | null | undefined; className?: string; title?: string }> = ({ id, className, title }) => (
  <svg viewBox="0 0 32 32" className={className} role="img" aria-label={title ?? 'ไอคอนบท'}>
    <RoleGlyph id={id ?? ''} />
  </svg>
);
