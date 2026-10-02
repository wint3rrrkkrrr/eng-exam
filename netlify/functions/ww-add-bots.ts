// ww-add-bots.ts — /api/ww/add-bots (ตัวห่อบาง ๆ · ตรรกะทั้งหมดอยู่ _shared/handlers.ts)
import { handleRequest } from './_shared/http';

export default async (req: Request): Promise<Response> => handleRequest('add-bots', req);
