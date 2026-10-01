// จำลองเกมครบวงจรด้วยบอทล้วนในเทอร์มินัล:  npm run sim   (ค่าเริ่มต้น 500 เกม ทุกขนาดพรีเซ็ต)
//   npm run sim -- 100        ← ระบุจำนวนเกมต่อขนาด
import { PRESET_SIZES, runSimulation } from './sim';

const perSize = Number(process.argv[2] ?? Math.ceil(500 / PRESET_SIZES.length));
const t0 = Date.now();
const sum = runSimulation(PRESET_SIZES, perSize);

console.log(`จำลองแล้ว ${sum.games} เกม (ขนาด ${PRESET_SIZES.join('/')} คน × ${perSize}) ใช้เวลา ${Date.now() - t0} ms`);
console.log(`จบเกมสำเร็จ: ${sum.finished}/${sum.games}`);
console.log(`ผู้ชนะ → ชาวบ้าน ${sum.village} · หมาป่า ${sum.wolf} · คู่รัก ${sum.lovers} · ฝ่ายอิสระ ${sum.solo} · เสมอ ${sum.draws}`);
console.log(`เกมที่ยาวที่สุด: ${sum.maxDays} วัน`);
if (sum.problems.length > 0) {
  console.error(`\n❌ พบปัญหา ${sum.problems.length} รายการ (แสดง 10 อันแรก):`);
  for (const p of sum.problems.slice(0, 10)) console.error(' - ' + p);
  process.exit(1);
}
console.log('✅ ไม่มีเกมค้าง ไม่มี crash ไม่มีแอคชันถูกปฏิเสธ และมีผู้ชนะทุกเกม');
