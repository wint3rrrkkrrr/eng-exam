import { CheeseRoom, CheesePlayer } from '../../../utils/cheeseGameClient';

export interface CheesePhaseProps {
  room: CheeseRoom;
  players: CheesePlayer[];
  username: string;
  avatar: string;
  isDark: boolean;
  isHost: boolean;
  roomCode: string;
  refresh: () => void | Promise<void>;
  onExitRoom: () => void;
  onBackToHome: () => void;
}
