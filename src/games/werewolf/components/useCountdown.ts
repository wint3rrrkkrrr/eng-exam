import { useEffect, useState } from 'react';

/** วินาทีที่เหลือจนถึง endsAt — คำนวณจากเวลาเซิร์ฟเวอร์ (ไม่พึ่งนาฬิกาเครื่องผู้เล่น) */
export function useCountdown(endsAt: string | null, serverNow: () => number): number | null {
  const calc = () => (endsAt ? Math.max(0, Math.ceil((Date.parse(endsAt) - serverNow()) / 1000)) : null);
  const [left, setLeft] = useState<number | null>(calc);
  useEffect(() => {
    setLeft(calc());
    if (!endsAt) return;
    const id = setInterval(() => setLeft(calc()), 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);
  return left;
}
