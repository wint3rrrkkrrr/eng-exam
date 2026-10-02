// ww-auth-admin-reset.ts — /api/ww/auth-admin-reset (ตัวห่อบาง ๆ · ตรรกะทั้งหมดอยู่ _shared/handlers.ts)
import { handleRequest } from './_shared/http';

export default async (req: Request): Promise<Response> => handleRequest('auth-admin-reset', req);
