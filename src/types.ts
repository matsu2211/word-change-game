import { CardData } from './data';

export type GameMode = "normal" | "quiz" | "topic-only" | "onomatopoeia";
export type GamePhase = "idle" | "thinking" | "answering";

export interface GameState {
  mode: GameMode;
  currentTopic: CardData | null;
  currentStyle: CardData | null;
  usedTopics: string[];
  usedStyles: string[];
  timerDuration: number;
  isTimerEnabled: boolean;
  phase: GamePhase;
  historyEnabled: boolean;
  showFurigana: boolean;
}
