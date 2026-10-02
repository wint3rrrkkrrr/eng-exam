// _shared/devBridge.ts — สะพานสำหรับรันเกมในเครื่อง (npm run dev): ต่อ /api/ww/* เข้ากับ handlers เดียวกับที่ใช้บน Netlify
// ไม่มี SUPABASE_SERVICE_ROLE_KEY ในเครื่อง → ใช้ที่เก็บในหน่วยความจำ (ข้อมูลหายเมื่อปิดโปรแกรม) ทดลองหลายแท็บได้เลย
import { ROUTES, dispatch, getStore, usingMemoryStore } from './http';
import type { Route } from './http';

interface ReqLike { method: string; params: Record<string, string>; body: unknown; headers: Record<string, string | string[] | undefined> }
interface ResLike { status(code: number): ResLike; json(body: unknown): void; setHeader(k: string, v: string): void }

const one = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

export function wwDevHandler() {
  getStore();
  if (usingMemoryStore()) {
    console.log('[ww] รันแบบทดลองในเครื่อง: ใช้ที่เก็บในหน่วยความจำ (ไม่ต่อ Supabase) — ข้อมูลห้องหายเมื่อปิดโปรแกรม');
  }
  return async (req: ReqLike, res: ResLike) => {
    res.setHeader('cache-control', 'no-store');
    const route = req.params.route as Route;
    if (req.method !== 'POST' || !ROUTES.includes(route)) return void res.status(404).json({ errorTh: 'ไม่พบ API นี้' });
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? (req.body as Record<string, unknown>) : {};
    const r = await dispatch(route, {
      'x-ww-player-id': one(req.headers['x-ww-player-id']),
      'x-ww-token': one(req.headers['x-ww-token']),
      'x-ww-wallet-id': one(req.headers['x-ww-wallet-id']),
      'x-ww-wallet-token': one(req.headers['x-ww-wallet-token']),
      'x-ww-ip': one(req.headers['x-forwarded-for'])?.split(',')[0].trim(),
    }, body);
    res.status(r.status).json(r.body);
  };
}
