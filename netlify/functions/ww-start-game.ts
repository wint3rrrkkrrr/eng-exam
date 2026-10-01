// ww-start-game.ts — /api/ww/start-game (ตัวห่อบาง ๆ · ตรรกะทั้งหมดอยู่ _shared/handlers.ts)
import { handleRequest } from './_shared/http';

export default async (req: Request): Promise<Response> => handleRequest('start-game', req);
