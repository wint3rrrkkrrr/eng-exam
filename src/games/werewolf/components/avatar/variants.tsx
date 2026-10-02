// components/avatar/variants.tsx — "โทนสี" ของของแต่งตัว: ครอบชั้นเดิมด้วยฟิลเตอร์สี SVG (หมุนเฉดสี/อิ่มสี/สว่าง/เซเปีย)
// → ของเดิมทุกชิ้นกลายเป็น 12 เวอร์ชันโดยไม่ต้องวาดใหม่
import React from 'react';
import { VARIANTS, splitVariantId } from '../../shared/avatarExtra';
import type { VariantDef } from '../../shared/avatarExtra';

const SEPIA = '0.393 0.769 0.189 0 0  0.349 0.686 0.168 0 0  0.272 0.534 0.131 0 0  0 0 0 1 0';

const filterId = (uid: string, key: string) => `${uid}v${key}`;

/** ประกาศฟิลเตอร์เฉพาะโทนที่ใช้อยู่ในอวตารตัวนี้ */
export const VariantDefs: React.FC<{ uid: string; ids: string[] }> = ({ uid, ids }) => {
  const used = new Set<string>();
  for (const id of ids) {
    const { variant } = splitVariantId(id);
    if (variant) used.add(variant.key);
  }
  if (used.size === 0) return null;
  return (
    <defs>
      {VARIANTS.filter((v) => used.has(v.key)).map((v) => (
        <filter key={v.key} id={filterId(uid, v.key)} colorInterpolationFilters="sRGB" x="-10%" y="-10%" width="120%" height="120%">
          {v.sepia && <feColorMatrix type="matrix" values={SEPIA} />}
          {v.hue !== undefined && <feColorMatrix type="hueRotate" values={String(v.hue)} />}
          {v.sat !== undefined && <feColorMatrix type="saturate" values={String(v.sat)} />}
          {v.bright !== undefined && (
            <feComponentTransfer>
              <feFuncR type="linear" slope={v.bright} /><feFuncG type="linear" slope={v.bright} /><feFuncB type="linear" slope={v.bright} />
            </feComponentTransfer>
          )}
        </filter>
      ))}
    </defs>
  );
};

/** ครอบชั้นด้วยโทนสี (ไม่มีโทน = คืนลูกตรงๆ) */
export const Tone: React.FC<{ variant: VariantDef | null; uid: string; children: React.ReactNode }> = ({ variant, uid, children }) =>
  variant ? <g filter={`url(#${filterId(uid, variant.key)})`}>{children}</g> : <>{children}</>;

export { splitVariantId };
