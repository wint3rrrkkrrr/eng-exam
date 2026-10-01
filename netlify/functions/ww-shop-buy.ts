// ww-shop-buy.ts — /api/ww/shop-buy (ตัวห่อบาง ๆ · ตรรกะทั้งหมดอยู่ _shared/handlers.ts)
import { handleRequest } from './_shared/http';

export default async (req: Request): Promise<Response> => handleRequest('shop-buy', req);
