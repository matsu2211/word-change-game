import { CardData } from './data';

export type GameMode = "normal" | "quiz" | "topic-only" | "onomatopoeia" | "genre-only";
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
  quizGenre?: string; // Selected quiz genre ID or 'all'
}
