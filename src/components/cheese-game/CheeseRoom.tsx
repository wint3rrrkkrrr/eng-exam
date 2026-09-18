import React, { useEffect, useState, useCallback, useRef } from 'react';
import { cheeseGame, CheeseRoom as CheeseRoomType, CheesePlayer } from '../../utils/cheeseGameClient';
import { CheeseLobbyPhase } from './phases/CheeseLobbyPhase';
import { CheeseNightPhase } from './phases/CheeseNightPhase';
import { CheeseDayPhase } from './phases/CheeseDayPhase';
import { CheeseVotingPhase } from './phases/CheeseVotingPhase';
import { CheeseEndedPhase } from './phases/CheeseEndedPhase';
import { Loader2 } from 'lucide-react';

interface CheeseRoomProps {
  roomCode: string;
  username: string;
  avatar: string;
  isDark: boolean;
  onExitRoom: () => void;
  onBackToHome: () => void;
}

export const CheeseRoom: React.FC<CheeseRoomProps> = ({ roomCode, username, avatar, isDark, onExitRoom, onBackToHome }) => {
  const [room, setRoom] = useState<CheeseRoomType | null>(null);
  const [players, setPlayers] = useState<CheesePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const [r, p] = await Promise.all([cheeseGame.getRoom(roomCode), cheeseGame.getPlayers(roomCode)]);
    if (!r) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setRoom(r);
    setPlayers(p);
    setLoading(false);
  }, [roomCode]);

  useEffect(() => {
    refresh();
    const unsubscribe = cheeseGame.subscribeToRoom(roomCode, refresh);
    // Backup poll in case a realtime event is missed
    pollRef.current = setInterval(refresh, 4000);
    return () => {
      unsubscribe();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [roomCode, refresh]);

  const me = players.find(p => p.username.toLowerCase() === username.toLowerCase());
  const isHost = me?.is_host || room?.host_username?.toLowerCase() === username.toLowerCase();

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-3 ${isDark ? 'bg-[#0b0c16] text-zinc-300' : 'bg-indigo-50 text-stone-700'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-sm font-bold">กำลังเข้าห้อง {roomCode}...</p>
      </div>
    );
  }

  if (notFound || !room) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center ${isDark ? 'bg-[#0b0c16] text-zinc-300' : 'bg-indigo-50 text-stone-700'}`}>
        <div className="text-5xl">🐭❓</div>
        <p className="text-sm font-bold">ไม่พบห้อง {roomCode} (อาจถูกลบหรือหมดอายุ)</p>
        <button
          onClick={onExitRoom}
          className="px-5 py-2.5 rounded-xl font-black text-sm bg-amber-400 text-zinc-950 active:scale-95 transition"
        >
          กลับไปสร้าง/เข้าห้องใหม่
        </button>
      </div>
    );
  }

  const commonProps = { room, players, username, avatar, isDark, isHost, roomCode, refresh, onExitRoom, onBackToHome };

  switch (room.phase) {
    case 'lobby':
      return <CheeseLobbyPhase {...commonProps} />;
    case 'night':
      return <CheeseNightPhase {...commonProps} />;
    case 'day':
      return <CheeseDayPhase {...commonProps} />;
    case 'voting':
      return <CheeseVotingPhase {...commonProps} />;
    case 'ended':
      return <CheeseEndedPhase {...commonProps} />;
    default:
      return null;
  }
};
