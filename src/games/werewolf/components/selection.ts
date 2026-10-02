// components/selection.ts — การเลือกผู้เล่นบน "ตารางการ์ดหลัก" (แตะการ์ดเพื่อเลือก) ใช้ร่วมกันทุกเฟส
import { playGameSound } from '../shared/sound';
export interface Selection {
  selected: string[];
  setSelected: (next: string[]) => void;
  selectable: string[]; // playerId ที่แตะเลือกได้ตอนนี้ (ว่าง = ไม่มีการเลือก)
  max: number; // เลือกได้สูงสุดกี่คน
}

export function toggleSelection(sel: Selection, id: string): void {
  if (!sel.selectable.includes(id)) return;
  playGameSound('tap');
  if (sel.selected.includes(id)) return sel.setSelected(sel.selected.filter((x) => x !== id));
  if (sel.max === 1) return sel.setSelected([id]);
  if (sel.selected.length >= sel.max) return sel.setSelected([...sel.selected.slice(1), id]);
  sel.setSelected([...sel.selected, id]);
}
