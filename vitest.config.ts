import { defineConfig } from 'vitest/config';

// ตั้งค่าเทสต์ของเกมแววูฟ (แยกจาก vite.config.ts เพื่อไม่ดึงปลั๊กอินเว็บมาปน)
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/games/werewolf/**/*.test.ts', 'netlify/functions/**/*.test.ts'],
  },
});
