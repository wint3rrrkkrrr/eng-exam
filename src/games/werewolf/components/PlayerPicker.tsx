import React from 'react';
import type { LobbyPlayer } from '../shared/api';
import { PlayerCard, PlayerGrid } from './PlayerCard';

interface Props {
  players: LobbyPlayer[];
  options: string[]; // playerId ที่เลือกได้
  selected: string[];
  max?: number; // เลือกได้สูงสุดกี่คน (ค่าเริ่มต้น 1)
  onChange: (next: string[]) => void;
  disabled?: boolean;
  meId?: string;
  chips?: Record<string, { text: string; tone: string }>;
}

// แตะการ์ดผู้เล่นเพื่อเลือก (ตารางอวตาร 4 คอลัมน์) — เรียงตามที่นั่งเหมือนกันทุกเครื่อง
export const PlayerPicker: React.FC<Props> = ({ players, options, selected, max = 1, onChange, disabled, meId, chips }) => {
  const toggle = (id: string) => {
    if (disabled) return;
    if (selected.includes(id)) return onChange(selected.filter((x) => x !== id));
    if (max === 1) return onChange([id]);
    if (selected.length >= max) return onChange([...selected.slice(1), id]);
    onChange([...selected, id]);
  };

  return (
    <PlayerGrid>
      {players.filter((p) => options.includes(p.playerId)).map((p) => (
        <PlayerCard
          key={p.playerId}
          player={p}
          isMe={p.playerId === meId}
          selectable
          selected={selected.includes(p.playerId)}
          disabled={disabled}
          onClick={() => toggle(p.playerId)}
          chip={chips?.[p.playerId] ?? null}
        />
      ))}
    </PlayerGrid>
  );
};
