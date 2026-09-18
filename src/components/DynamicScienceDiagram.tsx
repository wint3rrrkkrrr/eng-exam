import React, { useMemo } from 'react';
import { Question } from '../types';

interface DynamicScienceDiagramProps {
  question: Question;
  isDark: boolean;
}

export const DynamicScienceDiagram: React.FC<DynamicScienceDiagramProps> = ({ question, isDark }) => {
  const { id, topic, category, question: qText } = question;

  // Identify the category and question parameters to draw the perfect contextual diagram
  const diagram = useMemo(() => {
    const textLower = qText.toLowerCase();
    const topicLower = topic.toLowerCase();
    const catLower = category.toLowerCase();

    // =========================================================================
    // PHYSICS: REFLECTION & MIRRORS (การสะท้อนของแสงและกระจกเงา)
    // =========================================================================
    if (catLower.includes('สะท้อน') || topicLower.includes('กระจก') || textLower.includes('กระจก')) {
      const isConcave = textLower.includes('เว้า') || topicLower.includes('เว้า');
      const isConvex = textLower.includes('นูน') || topicLower.includes('นูน');
      const isPlane = !isConcave && !isConvex;

      if (isPlane) {
        // Plane Mirror Reflection Diagram
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#090a0f' : '#f8fafc'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Boundary / Mirror surface */}
              <line x1="80" y1="160" x2="320" y2="160" stroke={isDark ? '#64748b' : '#475569'} strokeWidth="4" />
              {/* Mirror backing dashes */}
              {Array.from({ length: 13 }).map((_, i) => (
                <line key={i} x1={90 + i * 18} y1="160" x2={100 + i * 18} y2="172" stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="2" />
              ))}
              
              {/* Normal Line */}
              <line x1="200" y1="30" x2="200" y2="160" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,5" />
              
              {/* Incident Ray */}
              <line x1="100" y1="50" x2="200" y2="160" stroke="#ef4444" strokeWidth="2.5" />
              <path d="M 145 100 L 155 110 L 150 95 Z" fill="#ef4444" /> {/* Incident Arrow */}
              
              {/* Reflected Ray */}
              <line x1="200" y1="160" x2="300" y2="50" stroke="#10b981" strokeWidth="2.5" />
              <path d="M 250 105 L 255 90 L 245 100 Z" fill="#10b981" /> {/* Reflected Arrow */}

              {/* Angles indicators */}
              <path d="M 175 160 A 25 25 0 0 1 179 137" fill="none" stroke="#ef4444" strokeWidth="1.5" />
              <path d="M 225 160 A 25 25 0 0 0 221 137" fill="none" stroke="#10b981" strokeWidth="1.5" />

              {/* Labels */}
              <text x="200" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill={isDark ? '#e2e8f0' : '#0f172a'}>เส้นแนวฉาก (Normal Line)</text>
              <text x="75" y="45" fontSize="11" fontWeight="bold" fill="#ef4444">รังสีตกกระทบ (Incident Ray)</text>
              <text x="325" y="45" textAnchor="end" fontSize="11" fontWeight="bold" fill="#10b981">รังสีสะท้อน (Reflected Ray)</text>
              <text x="165" y="130" fontSize="10" fill="#ef4444" fontWeight="bold">θi</text>
              <text x="225" y="130" fontSize="10" fill="#10b981" fontWeight="bold">θr</text>
              <text x="200" y="195" textAnchor="middle" fontSize="11" fill={isDark ? '#94a3b8' : '#475569'} fontWeight="bold">กระจกเงาราบ (Plane Mirror) : θi = θr</text>
            </g>
          </svg>
        );
      }

      // Curved Mirror (Concave / Convex)
      const isVeaw = isConcave; // เว้า
      return (
        <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
          <rect width="400" height="220" rx="12" fill={isDark ? '#090a0f' : '#f8fafc'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
          <g transform="translate(0, 10)">
            {/* Principal Axis */}
            <line x1="30" y1="110" x2="370" y2="110" stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1.5" strokeDasharray="4,4" />
            
            {/* Mirror arc */}
            {isVeaw ? (
              // Concave Mirror (เว้า)
              <>
                <path d="M 310 40 A 130 130 0 0 0 310 180" fill="none" stroke={isDark ? '#64748b' : '#334155'} strokeWidth="5" />
                {/* Mirror dashes on the back (right side) */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const y = 50 + i * 16;
                  return <line key={i} x1="311" y1={y} x2="321" y2={y - 5} stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="2.5" />;
                })}
                {/* Focal and Center of curvature */}
                <circle cx="210" cy="110" r="4" fill="#3b82f6" />
                <text x="210" y="128" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="bold">F (Focus)</text>
                
                <circle cx="110" cy="110" r="4" fill="#8b5cf6" />
                <text x="110" y="128" textAnchor="middle" fontSize="11" fill="#8b5cf6" fontWeight="bold">C (2f)</text>

                {/* Object (Arrow) placed at s > f */}
                <line x1="80" y1="110" x2="80" y2="50" stroke="#f59e0b" strokeWidth="3" />
                <path d="M 80 43 L 84 53 L 76 53 Z" fill="#f59e0b" />
                <text x="80" y="35" textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="bold">วัตถุ (Object)</text>

                {/* Rays showing image formation */}
                {/* Parallel ray to F */}
                <path d="M 80 50 L 308 50 L 210 110 L 140 153" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="none" />
                {/* Center ray through C */}
                <path d="M 80 50 L 110 110 L 140 170" fill="none" stroke="#10b981" strokeWidth="1.5" />

                {/* Mirror label */}
                <text x="200" y="195" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">กระจกเว้า (Concave Mirror): รวมแสง</text>
              </>
            ) : (
              // Convex Mirror (นูน)
              <>
                <path d="M 190 40 A 130 130 0 0 1 190 180" fill="none" stroke={isDark ? '#64748b' : '#334155'} strokeWidth="5" />
                {/* Mirror dashes on the back (left side) */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const y = 50 + i * 16;
                  return <line key={i} x1="189" y1={y} x2="179" y2={y - 5} stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="2.5" />;
                })}
                {/* Focal and Center of curvature (inside, right side) */}
                <circle cx="270" cy="110" r="4" fill="#3b82f6" />
                <text x="270" y="128" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="bold">F (โฟกัส)</text>
                
                <circle cx="340" cy="110" r="4" fill="#8b5cf6" />
                <text x="340" y="128" textAnchor="middle" fontSize="11" fill="#8b5cf6" fontWeight="bold">C (จุดศูนย์กลาง)</text>

                {/* Object (Arrow) placed on the left */}
                <line x1="110" y1="110" x2="110" y2="60" stroke="#f59e0b" strokeWidth="3" />
                <path d="M 110 53 L 114 63 L 106 63 Z" fill="#f59e0b" />
                <text x="110" y="45" textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="bold">วัตถุ (Object)</text>

                {/* Ray 1: Parallel to axis, reflects back as if from F */}
                <line x1="110" y1="60" x2="187" y2="60" stroke="#ef4444" strokeWidth="2" />
                <line x1="187" y1="60" x2="130" y2="20" stroke="#ef4444" strokeWidth="2" /> {/* Reflected ray */}
                <line x1="187" y1="60" x2="270" y2="110" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" /> {/* Virtual extension */}

                {/* Image (Virtual, upright, smaller) inside the mirror */}
                <line x1="165" y1="110" x2="165" y2="85" stroke="#06b6d4" strokeWidth="2.5" />
                <path d="M 165 80 L 168 88 L 162 88 Z" fill="#06b6d4" />
                <text x="165" y="73" textAnchor="middle" fontSize="9" fill="#06b6d4" fontWeight="bold">ภาพเสมือน</text>

                {/* Mirror label */}
                <text x="200" y="195" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">กระจกนูน (Convex Mirror): กระจายแสง (ได้เฉพาะภาพเสมือน)</text>
              </>
            )}
          </g>
        </svg>
      );
    }

    // =========================================================================
    // PHYSICS: REFRACTION & SNELL'S LAW (การหักเหของแสงและเลนส์บาง)
    // =========================================================================
    if (catLower.includes('หักเห') || topicLower.includes('หักเห') || textLower.includes('หักเห') || textLower.includes('สเนลล์') || textLower.includes('รุ้ง')) {
      if (textLower.includes('รุ้ง') || topicLower.includes('รุ้ง')) {
        // Rainbow Refraction & Reflection Diagram
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#090a0f' : '#f8fafc'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Raindrop Outline */}
              <circle cx="200" cy="100" r="70" fill={isDark ? 'rgba(56, 189, 248, 0.05)' : 'rgba(14, 165, 233, 0.05)'} stroke="#38bdf8" strokeWidth="2" />
              <text x="200" y="105" textAnchor="middle" fontSize="10" fill="#38bdf8" fontWeight="bold">หยดน้ำ (Raindrop)</text>

              {/* White light beam entering */}
              <line x1="50" y1="60" x2="148" y2="50" stroke={isDark ? '#f8fafc' : '#475569'} strokeWidth="3" />
              <text x="45" y="52" fontSize="10" fontWeight="bold" fill={isDark ? '#cbd5e1' : '#334155'}>แสงอาทิตย์ (White Light)</text>

              {/* Refraction & Dispersion at first surface */}
              {/* Red Ray */}
              <path d="M 148 50 L 263 128 L 175 168 L 100 200" fill="none" stroke="#ef4444" strokeWidth="2" />
              {/* Violet Ray */}
              <path d="M 148 50 L 268 120 L 185 164 L 115 200" fill="none" stroke="#8b5cf6" strokeWidth="2" />

              {/* Total Internal Reflection annotations */}
              <circle cx="265" cy="124" r="5" fill="none" stroke="#f59e0b" strokeWidth="1" />
              <text x="325" y="130" textAnchor="middle" fontSize="9" fill="#f59e0b" fontWeight="bold">1. สะท้อนกลับหมด</text>

              <text x="200" y="195" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">รุ้งปฐมภูมิ: หักเห ──&gt; สะท้อนกลับหมด 1 ครั้ง ──&gt; หักเหออก</text>
            </g>
          </svg>
        );
      }

      // Standard Snell's Law Refraction
      const isCritical = textLower.includes('วิกฤต') || textLower.includes('สะท้อนกลับหมด');
      return (
        <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
          <rect width="400" height="220" rx="12" fill={isDark ? '#090a0f' : '#f8fafc'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
          <g transform="translate(0, 10)">
            {/* Split boundary */}
            <rect x="30" y="100" width="340" height="80" fill={isDark ? 'rgba(6, 182, 212, 0.08)' : 'rgba(6, 182, 212, 0.05)'} stroke={isDark ? '#0891b2' : '#06b6d4'} strokeWidth="1.5" />
            <text x="340" y="85" textAnchor="end" fontSize="10" fill={isDark ? '#94a3b8' : '#475569'} fontWeight="bold">ตัวกลาง 1 (อากาศ n1=1.0)</text>
            <text x="340" y="125" textAnchor="end" fontSize="10" fill="#0891b2" fontWeight="bold">ตัวกลาง 2 (น้ำ/แก้ว n2 &gt; n1)</text>

            {/* Normal Line */}
            <line x1="200" y1="20" x2="200" y2="180" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />

            {isCritical ? (
              // Critical Angle / Total Internal Reflection
              <>
                {/* Ray from dense (bottom) to light (top) */}
                <line x1="120" y1="160" x2="200" y2="100" stroke="#ef4444" strokeWidth="2.5" />
                {/* Critical angle ray refracted at 90 deg */}
                <line x1="200" y1="100" x2="320" y2="100" stroke="#10b981" strokeWidth="3" />
                
                {/* Arrow head on refracted ray */}
                <path d="M 280 100 L 270 96 L 270 104 Z" fill="#10b981" />

                <text x="145" y="140" fontSize="10" fill="#ef4444" fontWeight="bold">θc (มุมวิกฤต)</text>
                <text x="250" y="80" fontSize="10" fill="#10b981" fontWeight="bold">มุมหักเห = 90°</text>
                <text x="200" y="195" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">มุมวิกฤต (Critical Angle) : sin(θc) = n_ต่ำ / n_สูง</text>
              </>
            ) : (
              // Standard refraction
              <>
                {/* Incident Ray */}
                <line x1="110" y1="30" x2="200" y2="100" stroke="#ef4444" strokeWidth="2.5" />
                <path d="M 150 61 L 160 70 L 155 56 Z" fill="#ef4444" /> {/* Incident Arrow */}

                {/* Refracted Ray (bends toward normal since n2 > n1) */}
                <line x1="200" y1="100" x2="250" y2="170" stroke="#10b981" strokeWidth="2.5" />
                <path d="M 222 131 L 227 138 L 221 125 Z" fill="#10b981" /> {/* Refracted Arrow */}

                {/* Angles */}
                <path d="M 185 100 A 15 15 0 0 1 187 83" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                <path d="M 215 100 A 15 15 0 0 1 209 113" fill="none" stroke="#10b981" strokeWidth="1.5" />

                <text x="175" y="75" fontSize="10" fill="#ef4444" fontWeight="bold">θ1</text>
                <text x="215" y="125" fontSize="10" fill="#10b981" fontWeight="bold">θ2</text>
                <text x="200" y="195" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">กฎของสเนลล์ : n1 sin(θ1) = n2 sin(θ2)</text>
              </>
            )}
          </g>
        </svg>
      );
    }

    // =========================================================================
    // PHYSICS: LENSES (เลนส์บาง)
    // =========================================================================
    if (topicLower.includes('เลนส์') || textLower.includes('เลนส์')) {
      const isConvexLens = textLower.includes('นูน') || topicLower.includes('นูน');
      return (
        <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
          <rect width="400" height="220" rx="12" fill={isDark ? '#090a0f' : '#f8fafc'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
          <g transform="translate(0, 10)">
            {/* Optical Axis */}
            <line x1="30" y1="110" x2="370" y2="110" stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1.5" strokeDasharray="4,4" />

            {/* Lens Representation */}
            {isConvexLens ? (
              // Convex Lens (เลนส์นูน - รวมแสง)
              <>
                <path d="M 200 40 Q 215 110 200 180" fill="none" stroke="#38bdf8" strokeWidth="4" />
                <path d="M 200 40 Q 185 110 200 180" fill="none" stroke="#38bdf8" strokeWidth="4" />
                <line x1="200" y1="30" x2="200" y2="190" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
                {/* Lens tips arrow styles */}
                <path d="M 194 48 L 200 38 L 206 48" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <path d="M 194 172 L 200 182 L 206 172" fill="none" stroke="#38bdf8" strokeWidth="2" />

                {/* Focal Points F and 2F */}
                <circle cx="140" cy="110" r="3" fill="#3b82f6" />
                <text x="140" y="125" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="bold">F</text>
                <circle cx="260" cy="110" r="3" fill="#3b82f6" />
                <text x="260" y="125" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="bold">F</text>

                {/* Object Arrow */}
                <line x1="80" y1="110" x2="80" y2="55" stroke="#f59e0b" strokeWidth="3" />
                <path d="M 80 48 L 84 58 L 76 58 Z" fill="#f59e0b" />
                <text x="80" y="40" textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="bold">วัตถุ (s)</text>

                {/* Light Rays */}
                <path d="M 80 55 L 200 55 L 260 110 L 320 165" fill="none" stroke="#ef4444" strokeWidth="2" />
                <path d="M 80 55 L 200 110 L 320 165" fill="none" stroke="#10b981" strokeWidth="2" />

                {/* Image formed (Real, Inverted) */}
                <line x1="320" y1="110" x2="320" y2="165" stroke="#a855f7" strokeWidth="2.5" />
                <path d="M 320 172 L 316 162 L 324 162 Z" fill="#a855f7" />
                <text x="320" y="185" textAnchor="middle" fontSize="11" fill="#a855f7" fontWeight="bold">ภาพจริง (s')</text>

                <text x="200" y="195" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">เลนส์นูน (Convex Lens) : รวมแสง (1/f = 1/s + 1/s')</text>
              </>
            ) : (
              // Concave Lens (เลนส์เว้า - กระจายแสง)
              <>
                <path d="M 190 40 Q 200 110 190 180" fill="none" stroke="#0891b2" strokeWidth="4" />
                <path d="M 210 40 Q 200 110 210 180" fill="none" stroke="#0891b2" strokeWidth="4" />
                {/* Lens tips (inverted arrows) */}
                <path d="M 194 38 L 200 48 L 206 38" fill="none" stroke="#0891b2" strokeWidth="2" />
                <path d="M 194 182 L 200 172 L 206 182" fill="none" stroke="#0891b2" strokeWidth="2" />

                {/* Focus */}
                <circle cx="150" cy="110" r="3" fill="#3b82f6" />
                <text x="150" y="125" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="bold">F (เสมือน)</text>

                {/* Object */}
                <line x1="90" y1="110" x2="90" y2="50" stroke="#f59e0b" strokeWidth="3" />
                <path d="M 90 43 L 94 53 L 86 53 Z" fill="#f59e0b" />
                <text x="90" y="35" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="bold">วัตถุ</text>

                {/* Diverging Ray */}
                <path d="M 90 50 L 200 50 L 270 10" fill="none" stroke="#ef4444" strokeWidth="2" />
                <line x1="200" y1="50" x2="150" y2="110" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* Center Ray */}
                <path d="M 90 50 L 200 110 L 260 143" fill="none" stroke="#10b981" strokeWidth="1.5" />

                {/* Image (Virtual, smaller, upright) */}
                <line x1="165" y1="110" x2="165" y2="90" stroke="#06b6d4" strokeWidth="2.5" />
                <path d="M 165 85 L 168 93 L 162 93 Z" fill="#06b6d4" />
                <text x="165" y="78" textAnchor="middle" fontSize="9" fill="#06b6d4" fontWeight="bold">ภาพเสมือน</text>

                <text x="200" y="195" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">เลนส์เว้า (Concave Lens) : กระจายแสง (f เป็นลบเสมอ)</text>
              </>
            )}
          </g>
        </svg>
      );
    }

    // =========================================================================
    // PHYSICS: WAVE OPTICS / SLITS (การแทรกสอดและการเลี้ยวเบนของแสง)
    // =========================================================================
    if (catLower.includes('แทรกสอด') || catLower.includes('เลี้ยวเบน') || topicLower.includes('สลิต') || topicLower.includes('เกรตติง') || textLower.includes('สลิต')) {
      const isDoubleSlit = textLower.includes('คู่') || topicLower.includes('คู่');
      return (
        <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
          <rect width="400" height="220" rx="12" fill={isDark ? '#090a0f' : '#f8fafc'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
          <g transform="translate(0, 10)">
            {/* Incoming laser plane waves */}
            {Array.from({ length: 4 }).map((_, i) => (
              <line key={i} x1={40 + i * 15} y1="30" x2={40 + i * 15} y2="170" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="3" />
            ))}
            <text x="60" y="25" textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="bold">คลื่นระนาบ</text>

            {/* Slit Barrier */}
            <line x1="120" y1="20" x2="120" y2="180" stroke={isDark ? '#475569' : '#1e293b'} strokeWidth="6" />

            {/* Clear out Slit holes */}
            {isDoubleSlit ? (
              // Double Slit
              <>
                <line x1="120" y1="75" x2="120" y2="85" stroke={isDark ? '#090a0f' : '#f8fafc'} strokeWidth="8" />
                <line x1="120" y1="115" x2="120" y2="125" stroke={isDark ? '#090a0f' : '#f8fafc'} strokeWidth="8" />
                
                {/* Diffraction waves */}
                <path d="M 120 80 Q 150 50 200 80 Q 250 110 300 80" fill="none" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="1.5" strokeDasharray="3,3" />
                <path d="M 120 120 Q 150 90 200 120 Q 250 150 300 120" fill="none" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* Parameters labels */}
                <line x1="114" y1="80" x2="114" y2="120" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="105" y="105" textAnchor="end" fontSize="10" fill="#f59e0b" fontWeight="bold">d</text>
              </>
            ) : (
              // Single Slit
              <>
                <line x1="120" y1="85" x2="120" y2="115" stroke={isDark ? '#090a0f' : '#f8fafc'} strokeWidth="8" />
                
                {/* Single broad diffraction wave */}
                <path d="M 120 100 Q 180 60 250 100 T 320 100" fill="none" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="1.5" />

                <line x1="114" y1="85" x2="114" y2="115" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="105" y="105" textAnchor="end" fontSize="10" fill="#f59e0b" fontWeight="bold">a</text>
              </>
            )}

            {/* Screen on right */}
            <line x1="320" y1="20" x2="320" y2="180" stroke={isDark ? '#64748b' : '#334155'} strokeWidth="4" />
            <text x="325" y="25" fontSize="9" fill={isDark ? '#94a3b8' : '#475569'} fontWeight="bold">ฉากรับ (Screen)</text>

            {/* Distance L */}
            <line x1="120" y1="190" x2="320" y2="190" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="2,2" />
            <path d="M 120 190 L 130 186 M 120 190 L 130 194" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
            <path d="M 320 190 L 310 186 M 320 190 L 310 194" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
            <text x="220" y="185" textAnchor="middle" fontSize="10" fill="#3b82f6" fontWeight="bold">L (ระยะฉาก)</text>

            {/* Fringe intensity curves */}
            <path d="M 320 30 Q 355 40 320 55 Q 365 70 320 85 Q 395 100 320 115 Q 365 130 320 145 Q 355 160 320 170" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" />
            <text x="375" y="104" fontSize="10" fill="#ef4444" fontWeight="bold">A0 (สว่างกลาง)</text>

            <text x="200" y="205" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">
              {isDoubleSlit ? 'สลิตคู่ : d sin(θ) = nλ (สว่าง)' : 'สลิตเดี่ยว : a sin(θ) = nλ (มืด)'}
            </text>
          </g>
        </svg>
      );
    }

    // =========================================================================
    // BIOLOGY: PLANT & CELL TOPICS (ชีววิทยา)
    // =========================================================================
    if (catLower.includes('ชีววิทยา') || catLower.includes('biology') || textLower.includes('พืช') || textLower.includes('เซลล์')) {
      return (
        <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
          <rect width="400" height="220" rx="12" fill={isDark ? '#090a0f' : '#f8fafc'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
          <g transform="translate(0, 10)">
            {/* Plant cell outer wall */}
            <polygon points="120,40 280,40 320,100 280,160 120,160 80,100" fill={isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)'} stroke="#10b981" strokeWidth="3" />
            <polygon points="123,43 277,43 315,100 277,157 123,157 85,100" fill="none" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1" />

            {/* Large Central Vacuole */}
            <path d="M 150 70 Q 200 60 250 80 Q 260 110 230 140 Q 180 150 140 120 Z" fill={isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(14, 165, 233, 0.1)'} stroke="#38bdf8" strokeWidth="1.5" />
            <text x="195" y="105" textAnchor="middle" fontSize="9" fill="#0284c7" fontWeight="bold">แวคิวโอล (Vacuole)</text>

            {/* Nucleus */}
            <circle cx="130" cy="120" r="18" fill={isDark ? '#8b5cf6' : '#c084fc'} opacity="0.8" />
            <circle cx="126" cy="116" r="6" fill="#4c1d95" />
            <text x="130" y="148" textAnchor="middle" fontSize="9" fill={isDark ? '#c084fc' : '#6b21a8'} fontWeight="bold">นิวเคลียส</text>

            {/* Chloroplasts */}
            <g transform="translate(260, 60)">
              <ellipse cx="0" cy="0" rx="14" ry="8" fill="#047857" />
              {/* Thylakoid stacks */}
              <line x1="-8" y1="-2" x2="8" y2="-2" stroke="#10b981" strokeWidth="1.5" />
              <line x1="-8" y1="2" x2="8" y2="2" stroke="#10b981" strokeWidth="1.5" />
            </g>
            <text x="270" y="82" textAnchor="middle" fontSize="9" fill="#047857" fontWeight="bold">คลอโรพลาสต์</text>

            {/* Cell Wall Label */}
            <line x1="300" y1="130" x2="340" y2="130" stroke={isDark ? '#94a3b8' : '#475569'} strokeWidth="1" />
            <circle cx="300" cy="130" r="3" fill="#10b981" />
            <text x="345" y="133" fontSize="9" fill={isDark ? '#94a3b8' : '#334155'} fontWeight="bold">ผนังเซลล์ (Cell Wall)</text>

            <text x="200" y="195" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">เซลล์พืช (Plant Cell) : มีผนังเซลล์หนาและคลอโรพลาสต์สังเคราะห์แสง</text>
          </g>
        </svg>
      );
    }

    // =========================================================================
    // MATHEMATICS: PROBABILITY & VENN (คณิตศาสตร์)
    // =========================================================================
    if (catLower.includes('คณิต') || catLower.includes('math') || textLower.includes('ความน่าจะเป็น') || textLower.includes('เซต')) {
      return (
        <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
          <rect width="400" height="220" rx="12" fill={isDark ? '#090a0f' : '#f8fafc'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
          <g transform="translate(0, 10)">
            {/* Universal Set Rectangle */}
            <rect x="50" y="30" width="300" height="140" fill="none" stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="1.5" />
            <text x="60" y="45" fontSize="11" fill={isDark ? '#94a3b8' : '#475569'} fontWeight="bold">U (เอกภพสัมพัทธ์)</text>

            {/* Venn Circle A */}
            <circle cx="165" cy="100" r="50" fill={isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'} stroke="#3b82f6" strokeWidth="2" />
            <text x="135" y="104" fontSize="12" fill="#2563eb" fontWeight="bold">A</text>

            {/* Venn Circle B */}
            <circle cx="235" cy="100" r="50" fill={isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.08)'} stroke="#a855f7" strokeWidth="2" opacity="0.9" />
            <text x="265" y="104" fontSize="12" fill="#7c3aed" fontWeight="bold">B</text>

            {/* Intersection Highlight */}
            <path d="M 200 59 A 50 50 0 0 1 200 141 A 50 50 0 0 1 200 59 Z" fill={isDark ? 'rgba(236, 72, 153, 0.25)' : 'rgba(236, 72, 153, 0.15)'} stroke="#ec4899" strokeWidth="1" />
            <text x="200" y="104" textAnchor="middle" fontSize="10" fill="#db2777" fontWeight="bold">A ∩ B</text>

            <text x="200" y="195" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">แผนภาพเวนน์-ออยเลอร์ (Venn-Euler Diagram)</text>
          </g>
        </svg>
      );
    }

    // =========================================================================
    // C PROGRAMMING: FLOWCHARTS, CONTROL STRUCTURES & MEMORY (ภาษาซี)
    // =========================================================================
    const isCProg = catLower.includes('c-programming') || catLower.includes('ซี') || topicLower.includes('ภาษาซี') || topicLower.includes('โฟลวชาร์ต') || textLower.includes('printf') || textLower.includes('scanf') || textLower.includes('ตัวแปร') || textLower.includes('นิพจน์') || textLower.includes('คำสั่ง');
    if (isCProg) {
      const isFlowchart = textLower.includes('ผังงาน') || textLower.includes('สัญลักษณ์') || topicLower.includes('โฟลวชาร์ต') || textLower.includes('สัญลักษณ์');
      const isLoopOrBranch = textLower.includes('for') || textLower.includes('while') || textLower.includes('switch') || textLower.includes('if') || textLower.includes('วนซ้ำ') || textLower.includes('เลือกทำ');

      if (isFlowchart) {
        // C Flowchart Symbols Diagram
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#090a0f' : '#f8fafc'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Start Terminal */}
              <rect x="150" y="10" width="100" height="28" rx="14" fill="#f57c00" stroke="#ffb74d" strokeWidth="1.5" />
              <text x="200" y="28" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">Start (เริ่มต้น)</text>
              
              {/* Arrow */}
              <line x1="200" y1="38" x2="200" y2="52" stroke={isDark ? '#94a3b8' : '#475569'} strokeWidth="1.5" />
              <path d="M 200 52 L 196 46 L 204 46 Z" fill={isDark ? '#94a3b8' : '#475569'} />

              {/* Input: slanted parallelogram */}
              <polygon points="145,52 265,52 245,80 125,80" fill="#1976d2" stroke="#64b5f6" strokeWidth="1.5" />
              <text x="195" y="70" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">Input / Keyboard (รับค่า)</text>

              {/* Arrow */}
              <line x1="195" y1="80" x2="195" y2="94" stroke={isDark ? '#94a3b8' : '#475569'} strokeWidth="1.5" />
              <path d="M 195 94 L 191 88 L 199 88 Z" fill={isDark ? '#94a3b8' : '#475569'} />

              {/* Decision: Diamond */}
              <polygon points="195,94 245,114 195,134 145,114" fill="#7b1fa2" stroke="#ba68c8" strokeWidth="1.5" />
              <text x="195" y="118" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">Decision (เงื่อนไข)</text>

              {/* Yes Arrow to Process */}
              <line x1="245" y1="114" x2="280" y2="114" stroke={isDark ? '#94a3b8' : '#475569'} strokeWidth="1.5" />
              <path d="M 280 114 L 274 110 L 274 118 Z" fill={isDark ? '#94a3b8' : '#475569'} />
              <text x="260" y="108" fontSize="9" fill={isDark ? '#94a3b8' : '#475569'} fontWeight="bold">Yes</text>

              {/* Process box */}
              <rect x="280" y="99" width="90" height="30" rx="4" fill="#388e3c" stroke="#81c784" strokeWidth="1.5" />
              <text x="325" y="117" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">Process (คำนวณ)</text>

              {/* No Arrow down to End */}
              <line x1="195" y1="134" x2="195" y2="162" stroke={isDark ? '#94a3b8' : '#475569'} strokeWidth="1.5" />
              <path d="M 195 162 L 191 156 L 199 156 Z" fill={isDark ? '#94a3b8' : '#475569'} />
              <text x="202" y="148" fontSize="9" fill={isDark ? '#94a3b8' : '#475569'} fontWeight="bold">No</text>

              {/* Connection Node */}
              <circle cx="195" cy="166" r="6" fill="#f57c00" />
              <text x="195" y="169" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff">C</text>
              <text x="215" y="170" fontSize="8" fill={isDark ? '#94a3b8' : '#475569'} fontWeight="bold">จุดเชื่อมต่อในหน้าเดียวกัน</text>

              <text x="200" y="200" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">สัญลักษณ์ผังงานมาตรฐาน (Flowchart): จุดเริ่ม, รับค่า, เงื่อนไข, ประมวลผล</text>
            </g>
          </svg>
        );
      }

      if (isLoopOrBranch) {
        // For / Loop execution layout
        const isFor = textLower.includes('for');
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#090a0f' : '#f8fafc'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Box 1: Expr 1 */}
              <rect x="25" y="45" width="100" height="32" rx="6" fill="#1565c0" stroke="#42a5f5" strokeWidth="1.5" />
              <text x="75" y="60" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">Expression 1</text>
              <text x="75" y="72" textAnchor="middle" fontSize="9" fill="#e3f2fd">กำหนดค่าเริ่มต้น</text>

              {/* Arrow */}
              <line x1="125" y1="61" x2="150" y2="61" stroke={isDark ? '#94a3b8' : '#475569'} strokeWidth="1.5" />
              <path d="M 150 61 L 144 57 L 144 65 Z" fill={isDark ? '#94a3b8' : '#475569'} />

              {/* Box 2: Expr 2 / Decision */}
              <polygon points="200,30 250,61 200,92 150,61" fill="#7b1fa2" stroke="#ba68c8" strokeWidth="1.5" />
              <text x="200" y="57" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">Expression 2</text>
              <text x="200" y="70" textAnchor="middle" fontSize="9" fill="#f3e5f5">ตรวจสอบเงื่อนไข</text>

              {/* Yes Branch (True) */}
              <line x1="200" y1="92" x2="200" y2="120" stroke={isDark ? '#94a3b8' : '#475569'} strokeWidth="1.5" />
              <path d="M 200 120 L 196 114 L 204 114 Z" fill={isDark ? '#94a3b8' : '#475569'} />
              <text x="206" y="106" fontSize="10" fill="#10b981" fontWeight="bold">True (จริง)</text>

              {/* Box 4: Loop Body */}
              <rect x="150" y="120" width="100" height="30" rx="4" fill="#2e7d32" stroke="#66bb6a" strokeWidth="1.5" />
              <text x="200" y="138" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">คำสั่งในลูป (Body)</text>

              {/* Arrow from Loop Body to Expr 3 */}
              <line x1="250" y1="135" x2="295" y2="135" stroke={isDark ? '#94a3b8' : '#475569'} strokeWidth="1.5" />
              <path d="M 295 135 L 289 131 L 289 139 Z" fill={isDark ? '#94a3b8' : '#475569'} />

              {/* Box 3: Expr 3 */}
              <rect x="295" y="119" width="90" height="32" rx="6" fill="#e65100" stroke="#ffb74d" strokeWidth="1.5" />
              <text x="340" y="134" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">Expression 3</text>
              <text x="340" y="146" textAnchor="middle" fontSize="9" fill="#fff3e0">อัปเดตตัวควบคุม (a++)</text>

              {/* Loop back Arrow from Expr 3 to Expr 2 */}
              <path d="M 340 119 L 340 15 L 200 15 L 200 30" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
              <path d="M 200 30 L 196 24 L 204 24 Z" fill="#f59e0b" />

              {/* False Exit Branch */}
              <line x1="250" y1="61" x2="300" y2="61" stroke={isDark ? '#e2e8f0' : '#475569'} strokeWidth="1.5" />
              <path d="M 300 61 L 294 57 L 294 65 Z" fill={isDark ? '#e2e8f0' : '#475569'} />
              <text x="265" y="53" fontSize="10" fill="#ef4444" fontWeight="bold">False (เท็จ)</text>

              {/* Exit Block */}
              <rect x="300" y="47" width="80" height="28" rx="14" fill="#37474f" stroke="#90a4ae" strokeWidth="1.5" />
              <text x="340" y="65" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">ออกนอกลูป</text>

              <text x="200" y="195" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">
                {isFor ? 'ลูป for(expr1; expr2; expr3) : ทำงานสอดคล้องเรียงตามลำดับความสำคัญ' : 'โครงสร้างควบคุมการวนซ้ำ (Loop Control Structure)'}
              </text>
            </g>
          </svg>
        );
      }

      // Memory and Variable allocation Diagram
      return (
        <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
          <rect width="400" height="220" rx="12" fill={isDark ? '#090a0f' : '#f8fafc'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
          <g transform="translate(0, 10)">
            {/* RAM Stack Boxes */}
            <text x="50" y="25" fontSize="11" fontWeight="bold" fill={isDark ? '#94a3b8' : '#475569'}>หน่วยความจำหลัก (RAM Stack Allocation)</text>

            {/* Variable Cell A */}
            <rect x="50" y="35" width="300" height="40" fill={isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'} stroke="#3b82f6" strokeWidth="1.5" />
            <text x="60" y="58" fontSize="10" fill="#3b82f6" fontWeight="bold">Address: 0x7FFE04</text>
            <text x="170" y="58" fontSize="10" fontWeight="bold" fill={isDark ? '#cbd5e1' : '#334155'}>int a</text>
            <rect x="260" y="43" width="70" height="24" rx="4" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
            <text x="295" y="59" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">10</text>

            {/* Variable Cell B */}
            <rect x="50" y="80" width="300" height="40" fill={isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'} stroke="#10b981" strokeWidth="1.5" />
            <text x="60" y="103" fontSize="10" fill="#10b981" fontWeight="bold">Address: 0x7FFE08</text>
            <text x="170" y="103" fontSize="10" fontWeight="bold" fill={isDark ? '#cbd5e1' : '#334155'}>int *p = &amp;a</text>
            <rect x="260" y="88" width="70" height="24" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
            <text x="295" y="104" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">0x7FFE04</text>

            {/* Pointer Arrow */}
            <path d="M 295 88 Q 360 65 315 50" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
            <path d="M 315 50 L 323 52 L 319 46 Z" fill="#f59e0b" />
            <text x="350" y="80" textAnchor="middle" fontSize="9" fill="#f59e0b" fontWeight="bold">พอยน์เตอร์ชี้ไปที่แรม</text>

            {/* Prefix vs Postfix visual */}
            <g transform="translate(50, 132)">
              <rect width="300" height="45" rx="6" fill={isDark ? '#1e293b' : '#f1f5f9'} stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1" />
              <text x="15" y="18" fontSize="9" fontWeight="bold" fill="#059669">Postfix (a++): นำค่า 10 ไปใช้งานพิมพ์ออกก่อน ──&gt; แล้วบวกเพิ่มในแรมทีหลัง</text>
              <text x="15" y="34" fontSize="9" fontWeight="bold" fill="#d97706">Prefix (++a): บวกค่าในแรมจาก 10 เป็น 11 ก่อน ──&gt; แล้วจึงส่งไปใช้งาน</text>
            </g>

            <text x="200" y="200" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">พฤติกรรมของตัวแปร พอยน์เตอร์ (&amp;) และตัวดำเนินการลำดับความสำคัญ</text>
          </g>
        </svg>
      );
    }

    // =========================================================================
    // ENGLISH: READING & SPEAKING (ENVIRONMENT & DIALOGUES)
    // =========================================================================
    if (catLower.includes('speaking') || topicLower.includes('pollution') || textLower.includes('plastics') || textLower.includes('warming') || textLower.includes('deforestation') || textLower.includes('shortage') || textLower.includes('prefer') || textLower.includes('difference') || textLower.includes('similarity') || textLower.includes('compost') || textLower.includes('scarcity')) {
      
      // 1. Deforestation Diagram
      if (textLower.includes('deforestation') || topicLower.includes('deforestation')) {
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#05070d' : '#f0fdf4'} stroke={isDark ? '#065f46' : '#bbf7d0'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Healthy forest side (Left) */}
              <text x="100" y="25" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#059669">Intact Forest (ซับคาร์บอน)</text>
              <path d="M 70 140 L 100 70 L 130 140 Z" fill="#10b981" />
              <path d="M 85 150 L 100 100 L 115 150 Z" fill="#047857" />
              <rect x="95" y="140" width="10" height="25" fill="#78350f" />
              
              {/* Deforestation side (Right) */}
              <text x="300" y="25" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#dc2626">Deforestation (หน้าดินถูกชะล้าง)</text>
              {/* Cut stumps */}
              <rect x="250" y="150" width="12" height="15" fill="#a16207" />
              <ellipse cx="256" cy="150" rx="6" ry="2.5" fill="#fef08a" stroke="#a16207" strokeWidth="1" />
              <rect x="310" y="155" width="12" height="10" fill="#a16207" />
              <ellipse cx="316" cy="155" rx="6" ry="1.8" fill="#fef08a" stroke="#a16207" strokeWidth="1" />
              
              {/* Axe or Fallen Log */}
              <rect x="230" y="158" width="40" height="7" rx="2" fill="#78350f" transform="rotate(-15 230 158)" />
              <path d="M 340 135 L 360 145 L 350 150 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" /> {/* Axe blade */}
              <line x1="320" y1="165" x2="350" y2="148" stroke="#78350f" strokeWidth="3" /> {/* Axe handle */}

              {/* Erosion soil cracks */}
              <path d="M 220 165 C 250 175, 280 160, 310 170" fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="3,3" />
              <path d="M 280 170 C 290 185, 330 175, 350 180" fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Ground separator */}
              <line x1="40" y1="165" x2="360" y2="165" stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="2" />
              <text x="200" y="200" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Soil Erosion & Habitat Loss</text>
            </g>
          </svg>
        );
      }

      // 2. Global Warming & Climate Change
      if (textLower.includes('warming') || textLower.includes('climate') || textLower.includes('greenhouse')) {
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#0b0c10' : '#fff7ed'} stroke={isDark ? '#9a3412' : '#ffedd5'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Sun (Left) */}
              <circle cx="60" cy="60" r="22" fill="#f97316" />
              <circle cx="60" cy="60" r="17" fill="#fbbf24" />
              
              {/* Incoming Ray */}
              <line x1="82" y1="72" x2="180" y2="130" stroke="#ea580c" strokeWidth="2" strokeDasharray="4,2" />
              <path d="M 125 100 L 132 94 L 134 105 Z" fill="#ea580c" />

              {/* Atmosphere Layer */}
              <path d="M 150 160 C 200 110, 300 110, 350 160" fill="none" stroke="#d97706" strokeWidth="6" opacity="0.4" />
              <text x="250" y="95" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#d97706">CO2, Methane (Greenhouse Layer)</text>

              {/* Trapped Heat bouncing back */}
              <path d="M 195 138 Q 230 115 250 145" fill="none" stroke="#dc2626" strokeWidth="2" />
              <path d="M 250 145 Q 270 120 290 148" fill="none" stroke="#dc2626" strokeWidth="2" />
              <path d="M 283 138 L 290 148 L 280 147 Z" fill="#dc2626" /> {/* bounce arrow */}

              {/* Earth Curve below */}
              <path d="M 100 200 C 180 135, 280 135, 360 200" fill={isDark ? '#1e293b' : '#bfdbfe'} stroke="#3b82f6" strokeWidth="2.5" />
              <rect x="210" y="160" width="30" height="25" fill="#f87171" opacity="0.7" rx="3" />
              <text x="225" y="175" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fff">Heat</text>

              {/* Melting Glacier on Earth */}
              <path d="M 130 178 Q 140 160 160 165 Q 170 175 180 185 Z" fill="#e2e8f0" stroke="#94a3b8" />
              <circle cx="165" cy="184" r="2.5" fill="#60a5fa" />
              <circle cx="173" cy="189" r="2" fill="#60a5fa" />

              <text x="200" y="200" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Greenhouse Effect: Trapped Heat & Melting Glaciers</text>
            </g>
          </svg>
        );
      }

      // 3. Plastics Waste & Ocean/Water Pollution
      if (textLower.includes('plastics') || textLower.includes('ocean') || textLower.includes('water pollution')) {
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#020617' : '#f0f9ff'} stroke={isDark ? '#1d4ed8' : '#bae6fd'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Waves */}
              <path d="M 40 60 Q 120 40 200 60 Q 280 80 360 60" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5,3" />
              <path d="M 40 90 Q 120 70 200 90 Q 280 110 360 90" fill="none" stroke="#0284c7" strokeWidth="1.5" />

              {/* Floating Plastic Bottle */}
              <g transform="translate(240, 65) rotate(25)">
                <rect width="14" height="30" rx="3" fill="rgba(186, 230, 253, 0.6)" stroke="#0284c7" strokeWidth="1.5" />
                <rect x="3" y="-5" width="8" height="6" fill="#0284c7" />
                <line x1="0" y1="12" x2="14" y2="12" stroke="#ef4444" strokeWidth="1.5" /> {/* label */}
              </g>

              {/* Fish swimming */}
              <g transform="translate(80, 100)">
                <path d="M 10 10 Q 30 -5 50 10 Q 30 25 10 10" fill="#f97316" />
                <path d="M 10 10 L -2 2 L -2 18 Z" fill="#f97316" />
                <circle cx="42" cy="7" r="1.5" fill="#fff" />
              </g>

              {/* Sea Turtle swimming */}
              <g transform="translate(150, 110)">
                <ellipse cx="30" cy="20" rx="18" ry="14" fill="#047857" />
                <circle cx="51" cy="20" r="6" fill="#059669" /> {/* head */}
                <path d="M 18 10 Q 10 -5 18 -2" fill="none" stroke="#059669" strokeWidth="3" /> {/* flipper */}
                <path d="M 38 10 Q 45 -5 40 -2" fill="none" stroke="#059669" strokeWidth="3" /> {/* flipper */}
                <path d="M 18 30 Q 10 45 18 42" fill="none" stroke="#059669" strokeWidth="3" />
                <path d="M 38 30 Q 45 45 40 42" fill="none" stroke="#059669" strokeWidth="3" />
              </g>

              {/* Microplastics dots */}
              <circle cx="100" cy="140" r="2" fill="#ef4444" />
              <circle cx="120" cy="148" r="1.5" fill="#f59e0b" />
              <circle cx="210" cy="130" r="2.5" fill="#dc2626" />
              <circle cx="280" cy="120" r="1.5" fill="#ef4444" />
              <text x="180" y="165" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#dc2626">Microplastics Ingestion (สัตว์ทะเลเผลอกลืน)</text>

              <text x="200" y="200" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Ocean Plastics: Marine Threats & Microplastics</text>
            </g>
          </svg>
        );
      }

      // 4. Air Pollution & Smog
      if (textLower.includes('air pollution') || textLower.includes('smog') || textLower.includes('emissions')) {
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#0f172a' : '#f1f5f9'} stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Factory Structure */}
              <rect x="50" y="110" width="80" height="50" fill={isDark ? '#334155' : '#64748b'} />
              <rect x="65" y="60" width="16" height="50" fill={isDark ? '#1e293b' : '#475569'} />
              <rect x="100" y="70" width="12" height="40" fill={isDark ? '#1e293b' : '#475569'} />
              
              {/* Smoke Clouds */}
              <circle cx="73" cy="45" r="15" fill="rgba(100, 116, 139, 0.8)" />
              <circle cx="90" cy="35" r="22" fill="rgba(148, 163, 184, 0.7)" />
              <circle cx="110" cy="48" r="12" fill="rgba(100, 116, 139, 0.8)" />
              <text x="110" y="30" fontSize="8.5" fontWeight="bold" fill="#ef4444">CO2, SO2 (Toxic Gas)</text>

              {/* Car emitting exhaust */}
              <g transform="translate(240, 120)">
                {/* Car Chassis */}
                <rect x="10" y="20" width="75" height="20" rx="4" fill="#3b82f6" />
                <path d="M 20 20 L 30 5 L 65 5 L 75 20 Z" fill="#2563eb" />
                {/* Wheels */}
                <circle cx="28" cy="40" r="8" fill="#1e293b" stroke="#fff" strokeWidth="1" />
                <circle cx="68" cy="40" r="8" fill="#1e293b" stroke="#fff" strokeWidth="1" />
                {/* Exhaust Fumes */}
                <ellipse cx="100" cy="35" rx="12" ry="6" fill="rgba(156, 163, 175, 0.8)" />
                <ellipse cx="118" cy="32" rx="8" ry="4" fill="rgba(209, 213, 219, 0.6)" />
              </g>

              {/* Road / Ground */}
              <line x1="30" y1="160" x2="370" y2="160" stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="2.5" />
              <text x="200" y="200" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Industrial & Vehicle Emissions (มลพิษทางอากาศ)</text>
            </g>
          </svg>
        );
      }

      // 5. Water Shortage & Scarcity
      if (textLower.includes('shortage') || textLower.includes('drought') || textLower.includes('scarcity')) {
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#0c0a09' : '#fffaf8'} stroke={isDark ? '#7c2d12' : '#ffedd5'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Cracked soil lines */}
              <path d="M 40 160 L 90 140 L 130 160 L 150 135 L 200 160 L 250 145 L 300 160 L 360 140" fill="none" stroke="#a16207" strokeWidth="1.5" />
              <path d="M 90 140 L 100 165" stroke="#a16207" strokeWidth="1.5" />
              <path d="M 150 135 L 170 168" stroke="#a16207" strokeWidth="1.5" />
              <path d="M 250 145 L 260 165" stroke="#a16207" strokeWidth="1.5" />

              {/* Dry tap (Left/Center) */}
              <g transform="translate(180, 40)">
                {/* Wall pipe */}
                <rect x="-40" y="30" width="40" height="10" fill="#94a3b8" />
                {/* Tap joint */}
                <rect x="0" y="20" width="18" height="30" fill="#64748b" />
                {/* Faucet body */}
                <path d="M 0 35 L 30 35 Q 40 35 40 45 L 40 55" fill="none" stroke="#64748b" strokeWidth="8" />
                {/* Valve handle */}
                <rect x="-4" y="14" width="26" height="6" fill="#ef4444" rx="2" />
                <rect x="7" y="20" width="4" height="6" fill="#475569" />
                
                {/* Single Droplet */}
                <path d="M 40 68 Q 40 76 36 76 Q 32 76 32 68 Q 32 64 36 60 Q 40 64 40 68 Z" fill="#3b82f6" />
                <text x="52" y="70" fontSize="8" fontWeight="bold" fill="#3b82f6">Dry (ขาดแคลน)</text>
              </g>

              {/* Ground line */}
              <line x1="30" y1="160" x2="370" y2="160" stroke="#78350f" strokeWidth="2.5" />
              <text x="200" y="200" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Freshwater Scarcity & Prolonged Droughts</text>
            </g>
          </svg>
        );
      }

      // 6. Food Waste & Leftovers
      if (textLower.includes('food waste') || textLower.includes('leftovers') || textLower.includes('compost')) {
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#080a10' : '#fbfbfb'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Left side: Landfill Bin with food waste */}
              <g transform="translate(80, 60)">
                <rect width="70" height="90" fill="#ef4444" rx="4" opacity="0.8" />
                <text x="35" y="25" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">LANDFILL</text>
                <text x="35" y="42" textAnchor="middle" fontSize="8" fill="#fff">เศษอาหารเน่าเสีย</text>
                
                {/* Rotten apple core inside */}
                <path d="M 25 55 Q 35 60 45 55 L 45 75 Q 35 70 25 75 Z" fill="#fef08a" opacity="0.9" />
                <line x1="35" y1="52" x2="35" y2="78" stroke="#78350f" strokeWidth="1.5" />
                <circle cx="35" cy="65" r="1.5" fill="#000" />
                
                {/* Methane bubbles rising */}
                <circle cx="35" cy="-15" r="4" fill="none" stroke="#ca8a04" strokeWidth="1" strokeDasharray="2,2" />
                <text x="45" y="-12" fontSize="8" fill="#ca8a04" fontWeight="bold">CH4 (มีเทน)</text>
              </g>

              {/* Right side: Composting Bin */}
              <g transform="translate(240, 60)">
                <rect width="70" height="90" fill="#10b981" rx="4" opacity="0.8" />
                <text x="35" y="25" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">COMPOST</text>
                <text x="35" y="42" textAnchor="middle" fontSize="8" fill="#fff">ทำปุ๋ยหมักดิน</text>
                
                {/* Worm and Leaf */}
                <path d="M 25 65 Q 35 60 45 68" fill="none" stroke="#f43f5e" strokeWidth="2.5" /> {/* worm */}
                <path d="M 30 72 C 35 80, 48 70, 50 76" fill="none" stroke="#047857" strokeWidth="2.5" /> {/* leaf */}
                
                {/* Nutrient leaf icon rising */}
                <path d="M 35 -15 L 42 -22 L 35 -29 L 28 -22 Z" fill="#10b981" opacity="0.7" />
                <text x="48" y="-12" fontSize="8" fill="#10b981" fontWeight="bold">Soil Nutrient</text>
              </g>

              <text x="200" y="200" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Food Waste: Landfill Methane vs Organic Composting</text>
            </g>
          </svg>
        );
      }

      // 7. General Comparison / Similarity & Difference Venn Diagram
      if (textLower.includes('difference') || textLower.includes('similarity') || textLower.includes('prefer') || textLower.includes('would rather')) {
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#090d16' : '#fafafa'} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Venn diagram circles */}
              <circle cx="160" cy="90" r="55" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="240" cy="90" r="55" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2" />
              
              {/* Labels */}
              <text x="130" y="94" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#3b82f6">Option A</text>
              <text x="270" y="94" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#f59e0b">Option B</text>
              <text x="200" y="94" textAnchor="middle" fontSize="10" fontWeight="bold" fill={isDark ? '#10b981' : '#047857'}>Similar</text>

              {/* Arrows pointing out definitions */}
              <path d="M 200 40 L 200 60" stroke="#10b981" strokeWidth="1" strokeDasharray="3,1" />
              <text x="200" y="32" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#10b981">Similarity (ความเหมือนร่วมกัน)</text>

              <path d="M 110 148 L 135 125" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,1" />
              <text x="110" y="160" textAnchor="middle" fontSize="9" fill="#3b82f6">Unique Point A</text>

              <path d="M 290 148 L 265 125" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,1" />
              <text x="290" y="160" textAnchor="middle" fontSize="9" fill="#f59e0b">Unique Point B</text>

              <text x="200" y="200" textAnchor="middle" fontSize="11" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Analyzing Similarities, Differences, & Preferences</text>
            </g>
          </svg>
        );
      }
    }

    // =========================================================================
    // MUSIC: CRITICISM, THEORY, EVOLUTION & COMPOSERS
    // =========================================================================
    if (catLower.includes('music') || catLower.includes('ดนตรี') || topicLower.includes('ดนตรี') || topicLower.includes('คีตกวี') || topicLower.includes('เครื่องหมาย') || textLower.includes('คีตกวี') || textLower.includes('เครื่องหมาย')) {
      
      const isTexture = textLower.includes('เส้นเสียง') || textLower.includes('texture') || textLower.includes('monophony') || textLower.includes('organum') || textLower.includes('polyphony') || textLower.includes('polytonality');
      const isComposer = textLower.includes('คีตกวี') || textLower.includes('composer') || textLower.includes('บาค') || textLower.includes('bach') || textLower.includes('วิวัลดี') || textLower.includes('vivaldi') || textLower.includes('ฮันเดล') || textLower.includes('handel') || textLower.includes('ไฮเดิน') || textLower.includes('haydn') || textLower.includes('โมซาร์ท') || textLower.includes('mozart') || textLower.includes('เบโทเฟน') || textLower.includes('beethoven') || textLower.includes('โชแปง') || textLower.includes('chopin') || textLower.includes('ไชคอฟสกี') || textLower.includes('tchaikovsky');
      const isSymbol = textLower.includes('sharp') || textLower.includes('flat') || textLower.includes('natural') || textLower.includes('staccato') || textLower.includes('accent') || textLower.includes('tenuto') || textLower.includes('fermata') || textLower.includes('crescendo') || textLower.includes('decrescendo') || textLower.includes('rit.') || textLower.includes('#') || textLower.includes('ตัวเลข') || textLower.includes('ความเข้ม') || textLower.includes('ความเร็ว') || textLower.includes('tempo');

      // 1. Music Texture Waveforms (Greek -> Medieval -> Renaissance -> Contemporary)
      if (isTexture) {
        const isMono = textLower.includes('monophony') || textLower.includes('เดียว');
        const isOrg = textLower.includes('organum') || textLower.includes('คู่ขนาน');
        const isPoly = textLower.includes('polyphony') || textLower.includes('สอดประสาน') || textLower.includes('หลายแนว');
        const isPolytonal = textLower.includes('polytonality') || textLower.includes('หลายบันไดเสียง');

        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#05050a' : '#faf5ff'} stroke={isDark ? '#581c87' : '#e9d5ff'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Backing staff lines */}
              <line x1="40" y1="60" x2="360" y2="60" stroke={isDark ? '#1e1b4b' : '#f3e8ff'} strokeWidth="1" />
              <line x1="40" y1="80" x2="360" y2="80" stroke={isDark ? '#1e1b4b' : '#f3e8ff'} strokeWidth="1" />
              <line x1="40" y1="100" x2="360" y2="100" stroke={isDark ? '#1e1b4b' : '#f3e8ff'} strokeWidth="1" />
              <line x1="40" y1="120" x2="360" y2="120" stroke={isDark ? '#1e1b4b' : '#f3e8ff'} strokeWidth="1" />
              <line x1="40" y1="140" x2="360" y2="140" stroke={isDark ? '#1e1b4b' : '#f3e8ff'} strokeWidth="1" />

              {isMono && (
                <g>
                  <path d="M 50 100 Q 125 50 200 100 T 350 100" fill="none" stroke="#e9d5ff" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
                  <path d="M 50 100 Q 125 50 200 100 T 350 100" fill="none" stroke="#d8b4fe" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="125" cy="75" r="5" fill="#a855f7" />
                  <circle cx="275" cy="125" r="5" fill="#a855f7" />
                  <text x="200" y="180" textAnchor="middle" fontSize="12" fill={isDark ? '#e9d5ff' : '#6b21a8'} fontWeight="bold">Monophony: เส้นเสียงเดียว (Single Texture)</text>
                </g>
              )}

              {isOrg && (
                <g>
                  {/* Two parallel waves */}
                  <path d="M 50 90 Q 125 50 200 90 T 350 90" fill="none" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 50 120 Q 125 80 200 120 T 350 120" fill="none" stroke="#e9d5ff" strokeWidth="3" strokeLinecap="round" />
                  <line x1="125" y1="65" x2="125" y2="95" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="2,2" />
                  <line x1="275" y1="115" x2="275" y2="145" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="2,2" />
                  <text x="200" y="180" textAnchor="middle" fontSize="12" fill={isDark ? '#e9d5ff' : '#6b21a8'} fontWeight="bold">Organum: สองแนวขนาน (Parallel Texture)</text>
                </g>
              )}

              {isPoly && (
                <g>
                  {/* Three interwoven colorful waves */}
                  <path d="M 50 100 Q 100 50 170 120 T 290 80 T 350 100" fill="none" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 50 80 Q 110 130 190 70 T 310 130 T 350 100" fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                  <path d="M 50 120 Q 130 60 210 140 T 330 80 T 350 100" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <text x="200" y="180" textAnchor="middle" fontSize="12" fill={isDark ? '#e9d5ff' : '#6b21a8'} fontWeight="bold">Polyphony: หลายแนวสอดประสานทอเกี่ยวกัน</text>
                </g>
              )}

              {isPolytonal && (
                <g>
                  {/* Chaotic, contrasting neon color lines crossing */}
                  <path d="M 50 70 L 150 130 L 250 50 L 350 110" fill="none" stroke="#ef4444" strokeWidth="3.5" />
                  <path d="M 50 130 L 130 60 L 240 140 L 350 70" fill="none" stroke="#3b82f6" strokeWidth="3" />
                  <path d="M 50 100 L 350 100" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="4,2" />
                  <circle cx="150" cy="130" r="6" fill="#ef4444" />
                  <circle cx="130" cy="60" r="6" fill="#3b82f6" />
                  <circle cx="240" cy="140" r="6" fill="#3b82f6" />
                  <circle cx="250" cy="50" r="6" fill="#ef4444" />
                  <text x="200" y="180" textAnchor="middle" fontSize="12" fill={isDark ? '#e9d5ff' : '#6b21a8'} fontWeight="bold">Polytonality: หลายบันไดเสียงขัดแย้งอิสระ</text>
                </g>
              )}
            </g>
          </svg>
        );
      }

      // 2. Classical Composers & Instruments (Bach, Vivaldi, Mozart, Chopin, Piano, Violin)
      if (isComposer) {
        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#030206' : '#fdfaf2'} stroke={isDark ? '#854d0e' : '#fef08a'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Keyboard visual (8 keys) */}
              <g transform="translate(70, 40)">
                <rect x="0" y="0" width="30" height="100" fill={isDark ? '#1e293b' : '#ffffff'} stroke="#cbd5e1" strokeWidth="1" rx="2" />
                <rect x="30" y="0" width="30" height="100" fill={isDark ? '#1e293b' : '#ffffff'} stroke="#cbd5e1" strokeWidth="1" rx="2" />
                <rect x="60" y="0" width="30" height="100" fill={isDark ? '#1e293b' : '#ffffff'} stroke="#cbd5e1" strokeWidth="1" rx="2" />
                <rect x="90" y="0" width="30" height="100" fill={isDark ? '#1e293b' : '#ffffff'} stroke="#cbd5e1" strokeWidth="1" rx="2" />
                <rect x="120" y="0" width="30" height="100" fill={isDark ? '#1e293b' : '#ffffff'} stroke="#cbd5e1" strokeWidth="1" rx="2" />
                <rect x="150" y="0" width="30" height="100" fill={isDark ? '#1e293b' : '#ffffff'} stroke="#cbd5e1" strokeWidth="1" rx="2" />
                <rect x="180" y="0" width="30" height="100" fill={isDark ? '#1e293b' : '#ffffff'} stroke="#cbd5e1" strokeWidth="1" rx="2" />
                <rect x="210" y="0" width="30" height="100" fill={isDark ? '#1e293b' : '#ffffff'} stroke="#cbd5e1" strokeWidth="1" rx="2" />

                {/* Glowing Active Key */}
                <rect x="90" y="0" width="30" height="100" fill="#fef08a" stroke="#fbbf24" strokeWidth="1.5" rx="2" opacity="0.4" />

                {/* Black keys */}
                <rect x="20" y="0" width="18" height="60" fill="#000000" rx="1" />
                <rect x="50" y="0" width="18" height="60" fill="#000000" rx="1" />
                <rect x="110" y="0" width="18" height="60" fill="#000000" rx="1" />
                <rect x="140" y="0" width="18" height="60" fill="#000000" rx="1" />
                <rect x="170" y="0" width="18" height="60" fill="#000000" rx="1" />
              </g>

              {/* Flying golden musical notes */}
              <path d="M 270 40 Q 290 20 310 40" fill="none" stroke="#eab308" strokeWidth="2.5" />
              <circle cx="270" cy="40" r="4" fill="#eab308" />
              <circle cx="310" cy="40" r="4" fill="#eab308" />
              <line x1="274" y1="40" x2="274" y2="25" stroke="#eab308" strokeWidth="2" />
              <line x1="314" y1="40" x2="314" y2="25" stroke="#eab308" strokeWidth="2" />
              <line x1="274" y1="25" x2="314" y2="25" stroke="#eab308" strokeWidth="2.5" />

              <text x="200" y="175" textAnchor="middle" fontSize="12" fill={isDark ? '#fbbf24' : '#854d0e'} fontWeight="bold">Classical Composers: ยอดคีตกวีสากลและเครื่องดนตรี</text>
              <text x="200" y="195" textAnchor="middle" fontSize="10.5" fill={isDark ? '#9ca3af' : '#78350f'}>
                {topic.includes('Bach') || textLower.includes('บาค') ? 'บาค (J.S. Bach) - บิดาแห่งคีตกวีบาโรค' :
                 topic.includes('Vivaldi') || textLower.includes('วิวัลดี') ? 'วิวัลดี (Vivaldi) - เดอะโฟร์ซีซันส์ เลียนเสียงธรรมชาติ' :
                 topic.includes('Mozart') || textLower.includes('โมซาร์ท') ? 'โมซาร์ท (Mozart) - อัจฉริยภาพและความสมบูรณ์แบบระดับโลก' :
                 topic.includes('Beethoven') || textLower.includes('เบโทเฟน') ? 'เบโทเฟน (Beethoven) - กบฏทลายกฎเกณฑ์ปลดปล่อยแรงใจ' :
                 topic.includes('Chopin') || textLower.includes('โชแปง') ? 'โชแปง (Chopin) - บทกวีเปียโน แฟนตาซีอิมพรอมตู' :
                 topic.includes('Tchaikovsky') || textLower.includes('ไชคอฟสกี') ? 'ไชคอฟสกี (Tchaikovsky) - บัลเล่ต์ Swan Lake อันยิ่งใหญ่' :
                 'วิวัฒนาการทายาทคีตกวีดนตรีคลาสสิกตะวันตก'}
              </text>
            </g>
          </svg>
        );
      }

      // 3. Musical Symbols & Dynamics (Sharp, Flat, Natural, Accents, Crescendo)
      if (isSymbol) {
        const isSharp = textLower.includes('sharp') || textLower.includes('#') || textLower.includes('ชาร์ป');
        const isFlat = textLower.includes('flat') || textLower.includes('b') || textLower.includes('แฟลต');
        const isNatural = textLower.includes('natural') || textLower.includes('เนเชอรัล');
        const isStaccato = textLower.includes('staccato') || textLower.includes('สแตคคาโต');
        const isAccent = textLower.includes('accent') || textLower.includes('เน้นเสียง') || textLower.includes('หัวลูกศร');
        const isTenuto = textLower.includes('tenuto') || textLower.includes('ขีดนอน');
        const isFermata = textLower.includes('fermata') || textLower.includes('ตาไก่');
        const isCres = textLower.includes('crescendo') || textLower.includes('เบาไปดัง');
        const isDecres = textLower.includes('decrescendo') || textLower.includes('ดังไปเบา');

        return (
          <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto drop-shadow-sm">
            <rect width="400" height="220" rx="12" fill={isDark ? '#060a0f' : '#f0fdfa'} stroke={isDark ? '#0d9488' : '#99f6e4'} strokeWidth="1.5" />
            <g transform="translate(0, 10)">
              {/* Traditional Staff background lines */}
              <line x1="40" y1="60" x2="360" y2="60" stroke={isDark ? '#115e59' : '#ccfbf1'} strokeWidth="1.5" />
              <line x1="40" y1="80" x2="360" y2="80" stroke={isDark ? '#115e59' : '#ccfbf1'} strokeWidth="1.5" />
              <line x1="40" y1="100" x2="360" y2="100" stroke={isDark ? '#115e59' : '#ccfbf1'} strokeWidth="1.5" />
              <line x1="40" y1="120" x2="360" y2="120" stroke={isDark ? '#115e59' : '#ccfbf1'} strokeWidth="1.5" />
              <line x1="40" y1="140" x2="360" y2="140" stroke={isDark ? '#115e59' : '#ccfbf1'} strokeWidth="1.5" />

              {/* Clef Drawing (Stylized G Clef) */}
              <path d="M 70 150 Q 82 120 72 90 T 82 50 T 80 155 Q 75 165 70 160" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
              <circle cx="70" cy="160" r="3" fill="#0d9488" />

              {/* Sharp (#) Drawing */}
              {isSharp && (
                <g transform="translate(180, 70)">
                  <line x1="10" y1="0" x2="10" y2="60" stroke="#0d9488" strokeWidth="4.5" />
                  <line x1="25" y1="-10" x2="25" y2="50" stroke="#0d9488" strokeWidth="4.5" />
                  <line x1="-5" y1="18" x2="40" y2="8" stroke="#0d9488" strokeWidth="5.5" />
                  <line x1="-5" y1="38" x2="40" y2="28" stroke="#0d9488" strokeWidth="5.5" />
                  <text x="20" y="85" textAnchor="middle" fontSize="12" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Sharp (#): เสียงสูงขึ้นครึ่งเสียง</text>
                </g>
              )}

              {/* Flat (b) Drawing */}
              {isFlat && (
                <g transform="translate(180, 60)">
                  <path d="M 10 0 L 10 60 Q 30 50 25 35 Q 20 20 10 30" fill="none" stroke="#0d9488" strokeWidth="5.5" strokeLinecap="round" />
                  <text x="20" y="95" textAnchor="middle" fontSize="12" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Flat (♭): เสียงต่ำลงครึ่งเสียง</text>
                </g>
              )}

              {/* Natural (♮) Drawing */}
              {isNatural && (
                <g transform="translate(180, 65)">
                  <path d="M 10 0 L 10 40 L 25 30 L 25 -10" fill="none" stroke="#0d9488" strokeWidth="4.5" />
                  <line x1="10" y1="20" x2="25" y2="10" stroke="#0d9488" strokeWidth="4.5" />
                  <line x1="10" y1="40" x2="25" y2="30" stroke="#0d9488" strokeWidth="4.5" />
                  <text x="20" y="90" textAnchor="middle" fontSize="12" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Natural (♮): กลับคืนสู่ระดับเสียงปกติ</text>
                </g>
              )}

              {/* Staccato dot Drawing */}
              {isStaccato && (
                <g transform="translate(180, 80)">
                  {/* Stem & Notehead */}
                  <ellipse cx="20" cy="20" rx="9" ry="6" fill="#0d9488" transform="rotate(-25 20 20)" />
                  <line x1="28" y1="20" x2="28" y2="-30" stroke="#0d9488" strokeWidth="3" />
                  {/* Distinct dot under note */}
                  <circle cx="20" cy="38" r="4.5" fill="#ef4444" />
                  <text x="20" y="75" textAnchor="middle" fontSize="12" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Staccato (.): เล่นเสียงให้สั้นและกระชับ</text>
                </g>
              )}

              {/* Accent (>) Drawing */}
              {isAccent && (
                <g transform="translate(180, 80)">
                  <ellipse cx="20" cy="20" rx="9" ry="6" fill="#0d9488" transform="rotate(-25 20 20)" />
                  <line x1="28" y1="20" x2="28" y2="-30" stroke="#0d9488" strokeWidth="3" />
                  {/* Accent wedge above note */}
                  <path d="M 10 -45 L 30 -40 L 10 -35" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                  <text x="20" y="75" textAnchor="middle" fontSize="12" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Accent (&gt;): เน้นจังหวะหรือเน้นความดัง</text>
                </g>
              )}

              {/* Tenuto (-) Drawing */}
              {isTenuto && (
                <g transform="translate(180, 80)">
                  <ellipse cx="20" cy="20" rx="9" ry="6" fill="#0d9488" transform="rotate(-25 20 20)" />
                  <line x1="28" y1="20" x2="28" y2="-30" stroke="#0d9488" strokeWidth="3" />
                  {/* Tenuto horizontal bar */}
                  <line x1="10" y1="-40" x2="30" y2="-40" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
                  <text x="20" y="75" textAnchor="middle" fontSize="12" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Tenuto (-): ลากเสียงให้ยาวครบจังหวะ</text>
                </g>
              )}

              {/* Fermata Drawing */}
              {isFermata && (
                <g transform="translate(180, 80)">
                  <ellipse cx="20" cy="20" rx="9" ry="6" fill="#0d9488" transform="rotate(-25 20 20)" />
                  <line x1="28" y1="20" x2="28" y2="-30" stroke="#0d9488" strokeWidth="3" />
                  {/* Eye arc and dot */}
                  <path d="M 5 -42 Q 20 -62 35 -42" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="20" cy="-45" r="4" fill="#ef4444" />
                  <text x="20" y="75" textAnchor="middle" fontSize="12" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Fermata (ตาไก่): ลากโน้ตยาวพิเศษ</text>
                </g>
              )}

              {/* Crescendo (<) Drawing */}
              {isCres && (
                <g transform="translate(140, 80)">
                  <path d="M 120 -15 L 30 -5 L 120 5" fill="none" stroke="#0d9488" strokeWidth="4" strokeLinecap="round" />
                  <text x="75" y="55" textAnchor="middle" fontSize="12" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Crescendo: เสียงค่อยๆ เบาไปดังขึ้น (&lt;)</text>
                </g>
              )}

              {/* Decrescendo (>) Drawing */}
              {isDecres && (
                <g transform="translate(140, 80)">
                  <path d="M 30 -15 L 120 -5 L 30 5" fill="none" stroke="#0d9488" strokeWidth="4" strokeLinecap="round" />
                  <text x="75" y="55" textAnchor="middle" fontSize="12" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Decrescendo: เสียงค่อยๆ ดังไปเบาลง (&gt;)</text>
                </g>
              )}

              {/* Default symbol stave (metronome / note count) */}
              {!isSharp && !isFlat && !isNatural && !isStaccato && !isAccent && !isTenuto && !isFermata && !isCres && !isDecres && (
                <g transform="translate(180, 80)">
                  <ellipse cx="20" cy="20" rx="9" ry="6" fill="#0d9488" transform="rotate(-25 20 20)" />
                  <line x1="28" y1="20" x2="28" y2="-30" stroke="#0d9488" strokeWidth="3" />
                  <text x="20" y="75" textAnchor="middle" fontSize="12" fill={isDark ? '#e2e8f0' : '#0f172a'} fontWeight="bold">Tempo & Dynamics: อัตราความเร็วและความเข้มเสียง</text>
                </g>
              )}
            </g>
          </svg>
        );
      }
    }

    // Default Fallback: do not render any picture if not specifically required
    return null;
  }, [id, topic, category, qText, isDark]);

  if (!diagram) {
    return null;
  }

  return (
    <div className="w-full flex justify-center items-center py-2 animate-fade-in">
      {diagram}
    </div>
  );
};
