// ww-auth-logout.ts — /api/ww/auth-logout (ตัวห่อบาง ๆ · ตรรกะทั้งหมดอยู่ _shared/handlers.ts)
import { handleRequest } from './_shared/http';

export default async (req: Request): Promise<Response> => handleRequest('auth-logout', req);
