/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Settings, 
  RotateCcw, 
  Timer as TimerIcon, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Home,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Copy,
  Check,
  Layout,
  Music,
  X
} from 'lucide-react';
import { TOPICS, STYLES, ONOMATOPOEIA_TOPICS, ONOMATOPOEIA_CREATIVE_TOPICS, CardData } from './data';
import { GameMode, GamePhase, GameState } from './types';

// --- Components ---

interface CardProps {
  title: string;
  card: CardData | null;
  color: 'blue' | 'orange';
  isHidden?: boolean;
  onToggleHide?: () => void;
  showFurigana: boolean;
  styleSelectionEnabled?: boolean;
  onSelectStyle?: () => void;
  key?: string | number;
}

const Card = ({ 
  title, 
  card, 
  color, 
  isHidden = false, 
  onToggleHide, 
  showFurigana,
  styleSelectionEnabled,
  onSelectStyle 
}: CardProps) => {
  const bgColor = color === 'blue' ? 'bg-blue-500' : 'bg-orange-500';
  const textColor = color === 'blue' ? 'text-blue-50' : 'text-orange-50';
  const borderColor = color === 'blue' ? 'border-blue-600' : 'border-orange-600';

  const renderContent = () => {
    if (!card) return "カードを引こう！";
    if (!showFurigana) return card.text;

    // Parse bracketed format: 漢字{かんじ}
    // This regex matches parts like "漢字{かんじ}" or plain text
    const parts = card.ruby.split(/(\{.*?\})/g);
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('{') && part.endsWith('}')) {
        // This is the ruby part for the previous text part
        // We need to handle the case where the previous part was the Kanji
        // Actually, a better way is to match Kanji{Ruby} together
      }
    }

    // Improved parsing logic
    const regex = /([^{}]+)\{([^{}]+)\}|([^{}]+)/g;
    let match;
    let key = 0;
    while ((match = regex.exec(card.ruby)) !== null) {
      const [full, kanji, ruby, plain] = match;
        if (kanji && ruby) {
        elements.push(
          <span key={key++} className="ruby-group">
            <span className="ruby-base">{kanji}</span>
            <span className="ruby-text">{ruby}</span>
          </span>
        );
      } else if (plain) {
        elements.push(<span key={key++} className="plain-text">{plain}</span>);
      }
    }

    return elements;
  };

  return (
    <motion.div 
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative w-full max-w-sm aspect-[3/4] rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center text-center card-shadow border-b-8 ${bgColor} ${borderColor} select-none`}
    >
      <div className={`absolute top-6 left-8 text-sm font-bold uppercase tracking-widest ${textColor} opacity-80`}>
        {title}
      </div>
      
      {styleSelectionEnabled && !isHidden && (
        <button 
          onClick={onSelectStyle}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors flex items-center gap-1 text-xs font-bold"
          title="言い方を選択"
        >
          <Settings size={14} />
          変更
        </button>
      )}
      
      <div className="flex-1 flex items-center justify-center w-full px-2">
        {isHidden ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-6xl font-black text-white/20">？？？</span>
            {onToggleHide && (
              <button 
                onClick={onToggleHide}
                className="mt-4 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-bold flex items-center gap-2 transition-colors"
              >
                <Eye size={20} />
                答えオープン
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className={`font-extrabold text-white text-center w-full leading-[1.8] ${
              card?.text && card.text.length > 25 ? 'text-xl md:text-2xl' :
              card?.text && card.text.length > 15 ? 'text-2xl md:text-3xl' : 
              card?.text && card.text.length > 10 ? 'text-3xl md:text-4xl' : 
              'text-4xl md:text-5xl'
            }`}>
              {renderContent()}
            </div>
            {onToggleHide && (
              <button 
                onClick={onToggleHide}
                className="px-4 py-2 bg-black/10 hover:bg-black/20 rounded-full text-white/80 text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <EyeOff size={16} />
                隠す
              </button>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-6 right-8">
        <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center">
          <span className="text-white/20 font-black text-xl">蛙</span>
        </div>
      </div>
    </motion.div>
  );
};

const Timer = ({ duration, isActive, onComplete, resetKey }: { 
  duration: number; 
  isActive: boolean; 
  onComplete: () => void;
  resetKey: number;
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, resetKey]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, resetKey]);

  const isCritical = timeLeft <= 10 && timeLeft > 0;

  return (
    <div className={`flex flex-col items-center transition-all duration-300 ${isCritical ? 'scale-110' : ''}`}>
      <div className={`text-5xl font-black tabular-nums ${isCritical ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
        {timeLeft}
      </div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Seconds</div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'home' | 'mode-select' | 'game' | 'settings'>('home');
  const [state, setState] = useState<GameState>({
    mode: 'normal',
    currentTopic: null,
    currentStyle: null,
    usedTopics: [],
    usedStyles: [],
    timerDuration: 60,
    isTimerEnabled: true,
    phase: 'idle',
    historyEnabled: true,
    showFurigana: true
  });
  const [isTopicHidden, setIsTopicHidden] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [allCopied, setAllCopied] = useState(false);
  const [showOnomatopoeiaHelp, setShowOnomatopoeiaHelp] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);

  // --- Logic ---

  const handleCopyAll = () => {
    if (!state.currentTopic) return;
    
    const topicText = state.currentTopic.text;
    let textToCopy = `お題：${topicText}`;
    
    if (state.mode === 'onomatopoeia') {
      // Only copy the topic for onomatopoeia mode as requested
    } else if (state.mode !== 'topic-only' && state.currentStyle) {
      textToCopy += `\n言い方：${state.currentStyle.text}`;
    }
    
    navigator.clipboard.writeText(textToCopy);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  const drawCards = useCallback(() => {
    const isOnomatopoeia = state.mode === 'onomatopoeia';
    const currentTopics = isOnomatopoeia 
      ? [...ONOMATOPOEIA_TOPICS, ...ONOMATOPOEIA_CREATIVE_TOPICS] 
      : TOPICS;
    
    let availableTopics = currentTopics.filter(t => !state.usedTopics.includes(t.text));
    if (availableTopics.length === 0) {
      availableTopics = currentTopics;
      setState(prev => ({ ...prev, usedTopics: [] }));
    }

    let availableStyles = STYLES.filter(s => !state.usedStyles.includes(s.text));
    if (availableStyles.length === 0) {
      availableStyles = STYLES;
      setState(prev => ({ ...prev, usedStyles: [] }));
    }

    const newTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
    let newStyle = null;

    if (state.mode !== 'topic-only' && state.mode !== 'onomatopoeia') {
      newStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)];
    }

    setState(prev => ({
      ...prev,
      currentTopic: newTopic,
      currentStyle: newStyle,
      usedTopics: prev.historyEnabled ? [...prev.usedTopics, newTopic.text] : [],
      usedStyles: (prev.historyEnabled && newStyle) ? [...prev.usedStyles, newStyle.text] : prev.usedStyles,
      phase: 'thinking'
    }));

    setIsTopicHidden(state.mode === 'quiz');
    setIsTimerActive(state.isTimerEnabled);
    setTimerResetKey(prev => prev + 1);
  }, [state.usedTopics, state.usedStyles, state.historyEnabled, state.mode, state.isTimerEnabled]);

  const selectStyle = (style: CardData) => {
    setState(prev => ({
      ...prev,
      currentStyle: style,
      usedStyles: prev.historyEnabled ? [...prev.usedStyles, style.text] : prev.usedStyles
    }));
    setShowStylePicker(false);
  };

  const resetGame = () => {
    setState(prev => ({
      ...prev,
      currentTopic: null,
      currentStyle: null,
      usedTopics: [],
      usedStyles: [],
      phase: 'idle'
    }));
    setIsTimerActive(false);
    setView('home');
  };

  const nextPhase = () => {
    drawCards();
  };

  // --- Views ---

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
    >
      <div className="mb-8">
        <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 card-shadow border-b-8 border-emerald-600">
          <span className="text-white text-6xl font-black">蛙</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-2 tracking-tight">言いカエル</h1>
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">〜 言葉の発想力 〜</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={() => setView('mode-select')}
          className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 card-shadow border-b-4 border-emerald-700"
        >
          <Play fill="currentColor" size={24} />
          ゲーム開始
        </button>
        <button 
          onClick={() => setView('settings')}
          className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all border-2 border-slate-200"
        >
          <Settings size={20} />
          設定
        </button>
      </div>
    </motion.div>
  );

  const renderModeSelect = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-6"
    >
      <button 
        onClick={() => setView('home')}
        className="absolute top-8 left-8 p-3 bg-white rounded-full text-slate-500 hover:text-slate-800 transition-colors border-2 border-slate-100"
      >
        <ArrowLeft size={24} />
      </button>

      <h2 className="text-3xl font-black text-slate-800 mb-12">モードを選んでね</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <button 
          onClick={() => {
            setState(prev => ({ ...prev, mode: 'normal' }));
            setView('game');
          }}
          className="group p-8 bg-white hover:bg-blue-50 rounded-3xl border-4 border-slate-100 hover:border-blue-400 transition-all text-left flex flex-col gap-4 card-shadow"
        >
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">通常プレイ</h3>
            <p className="text-slate-500 font-medium mt-1">お題を「言い方カード」に合わせた言葉で表してみよう</p>
          </div>
        </button>

        <button 
          onClick={() => {
            setState(prev => ({ ...prev, mode: 'quiz' }));
            setView('game');
          }}
          className="group p-8 bg-white hover:bg-orange-50 rounded-3xl border-4 border-slate-100 hover:border-orange-400 transition-all text-left flex flex-col gap-4 card-shadow"
        >
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <HelpCircle size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">当てクイズ</h3>
            <p className="text-slate-500 font-medium mt-1">出題者だけがお題を見て、回答者が当てるよ！</p>
          </div>
        </button>

        <button 
          onClick={() => {
            setState(prev => ({ ...prev, mode: 'topic-only' }));
            setView('game');
          }}
          className="group p-8 bg-white hover:bg-emerald-50 rounded-3xl border-4 border-slate-100 hover:border-emerald-400 transition-all text-left flex flex-col gap-4 card-shadow"
        >
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layout size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">お題のみ</h3>
            <p className="text-slate-500 font-medium mt-1">言い方は自由！お題だけをランダムに引くよ！</p>
          </div>
        </button>

        <button 
          onClick={() => {
            setState(prev => ({ ...prev, mode: 'onomatopoeia' }));
            setView('game');
          }}
          className="group p-8 bg-white hover:bg-purple-50 rounded-3xl border-4 border-slate-100 hover:border-purple-400 transition-all text-left flex flex-col gap-4 card-shadow"
        >
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Music size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">オノマトペ</h3>
            <p className="text-slate-500 font-medium mt-1">お題をオノマトペだけで表現して伝えよう！</p>
          </div>
        </button>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-6"
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-8 card-shadow border-2 border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-800">設定</h2>
          <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">タイマー機能</p>
              <p className="text-sm text-slate-500">回答時間を計測します</p>
            </div>
            <button 
              onClick={() => setState(prev => ({ ...prev, isTimerEnabled: !prev.isTimerEnabled }))}
              className={`w-14 h-8 rounded-full transition-colors relative ${state.isTimerEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${state.isTimerEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {state.isTimerEnabled && (
            <div>
              <div className="flex justify-between mb-2">
                <p className="font-bold text-slate-800">タイマー秒数</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="1" 
                    max="999"
                    value={state.timerDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setState(prev => ({ ...prev, timerDuration: Math.min(999, Math.max(0, val)) }));
                    }}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center font-black text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-400">秒</span>
                </div>
              </div>
              <input 
                type="range" 
                min="10" 
                max="300" 
                step="5"
                value={state.timerDuration}
                onChange={(e) => setState(prev => ({ ...prev, timerDuration: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                <span>10s</span>
                <span>300s</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">漢字のルビ（ふりがな）</p>
              <p className="text-sm text-slate-500">カードの漢字に読み方を表示します</p>
            </div>
            <button 
              onClick={() => setState(prev => ({ ...prev, showFurigana: !prev.showFurigana }))}
              className={`w-14 h-8 rounded-full transition-colors relative ${state.showFurigana ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${state.showFurigana ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">履歴管理</p>
              <p className="text-sm text-slate-500">同じお題が連続して出ないようにします</p>
            </div>
            <button 
              onClick={() => setState(prev => ({ ...prev, historyEnabled: !prev.historyEnabled }))}
              className={`w-14 h-8 rounded-full transition-colors relative ${state.historyEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${state.historyEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <button 
          onClick={() => setView('home')}
          className="w-full mt-10 py-4 bg-slate-800 text-white rounded-2xl font-bold transition-all hover:bg-slate-900"
        >
          保存して戻る
        </button>
      </div>
    </motion.div>
  );

  const renderGame = () => (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-6 flex items-center justify-between bg-white border-b border-slate-200">
        <button onClick={resetGame} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Home size={24} />
        </button>
        
        <div className="flex flex-col items-center">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1 ${
            state.mode === 'normal' ? 'bg-blue-100 text-blue-600' : 
            state.mode === 'quiz' ? 'bg-orange-100 text-orange-600' : 
            state.mode === 'onomatopoeia' ? 'bg-purple-100 text-purple-600' :
            'bg-emerald-100 text-emerald-600'
          }`}>
            {state.mode === 'normal' ? '通常プレイ' : state.mode === 'quiz' ? '当てクイズ' : state.mode === 'onomatopoeia' ? 'オノマトペ' : 'お題のみ'}
          </span>
          <div className="font-bold text-slate-800 flex items-center gap-2">
            {state.phase === 'idle' ? '準備中' : 'プレイ中'}
          </div>
        </div>

        <button onClick={() => setView('settings')} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Settings size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8 overflow-y-auto">
        {state.phase === 'idle' ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <RotateCcw size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">準備はいいかな？</h3>
            <p className="text-slate-500 font-medium mb-8">「カードを引く」ボタンを押してスタート！</p>
            <button 
              onClick={drawCards}
              className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xl card-shadow border-b-4 border-emerald-700 hover:bg-emerald-600 transition-all active:scale-95"
            >
              カードを引く
            </button>
          </div>
        ) : (
          <>
            {state.isTimerEnabled && (
              <Timer 
                duration={state.timerDuration} 
                isActive={isTimerActive} 
                onComplete={() => setIsTimerActive(false)} 
                resetKey={timerResetKey}
              />
            )}

            {state.mode === 'onomatopoeia' && state.phase !== 'idle' && (
              <div className="flex flex-col items-center gap-3">
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-600 font-black text-xl md:text-2xl bg-emerald-50 px-6 py-2 rounded-full border-2 border-emerald-100 flex items-center gap-3"
                >
                  オノマトペ（擬音語・擬態語）にすると？
                  <button 
                    onClick={() => setShowOnomatopoeiaHelp(true)}
                    className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center hover:bg-emerald-300 transition-colors"
                    title="オノマトペとは？"
                  >
                    <HelpCircle size={18} />
                  </button>
                </motion.div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl items-center justify-center">
              <AnimatePresence mode="wait">
                <Card 
                  key={`topic-${state.currentTopic?.text}`}
                  title="お題" 
                  card={state.currentTopic} 
                  color="blue" 
                  isHidden={isTopicHidden}
                  onToggleHide={state.mode === 'quiz' ? () => setIsTopicHidden(!isTopicHidden) : undefined}
                  showFurigana={state.showFurigana}
                />
                {state.mode !== 'topic-only' && state.mode !== 'onomatopoeia' && (
                  <Card 
                    key={`style-${state.currentStyle?.text}`}
                    title="言い方"
                    card={state.currentStyle} 
                    color="orange"
                    showFurigana={state.showFurigana}
                    styleSelectionEnabled={state.mode === 'normal' || state.mode === 'quiz'}
                    onSelectStyle={() => setShowStylePicker(true)}
                  />
                )}
              </AnimatePresence>
            </div>

            {state.currentTopic && (
              <button 
                onClick={handleCopyAll}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all card-shadow border-b-2 ${
                  allCopied 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {allCopied ? <Check size={18} /> : <Copy size={18} />}
                {allCopied 
                  ? (state.mode === 'topic-only' || state.mode === 'onomatopoeia' ? 'お題をコピーしました' : '両方の内容をコピーしました') 
                  : (
                    <div className="flex flex-col items-center">
                      <span>{state.mode === 'topic-only' || state.mode === 'onomatopoeia' ? 'お題をコピー' : 'お題と言い方をまとめてコピー'}</span>
                      {state.mode === 'quiz' && <span className="text-[10px] opacity-70 font-medium">出題者にこっそり教えてね</span>}
                    </div>
                  )
                }
              </button>
            )}
          </>
        )}
      </main>

      {/* Footer Controls */}
      {state.phase !== 'idle' && (
        <footer className="p-8 bg-white border-t border-slate-200 flex flex-col items-center gap-4">
            <div className="flex gap-4 w-full max-w-md">
              <button 
                onClick={drawCards}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw size={20} />
                再抽選
              </button>
              
              <button 
                onClick={nextPhase}
                className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all card-shadow border-b-4 border-emerald-700"
              >
                次ラウンド
                <ChevronRight size={24} />
              </button>
            </div>
          
          {state.isTimerEnabled && state.phase === 'thinking' && (
            <button 
              onClick={() => setIsTimerActive(!isTimerActive)}
              className={`flex items-center gap-2 font-bold px-6 py-2 rounded-full transition-all ${isTimerActive ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
            >
              {isTimerActive ? (
                <>
                  <div className="w-2 h-4 flex gap-1">
                    <div className="w-1 h-full bg-current" />
                    <div className="w-1 h-full bg-current" />
                  </div>
                  タイマーを一時停止
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  タイマーを再開
                </>
              )}
            </button>
          )}
        </footer>
      )}
    </div>
  );

  return (
    <div className="min-h-screen font-sans">
      <AnimatePresence mode="wait">
        {view === 'home' && renderHome()}
        {view === 'mode-select' && renderModeSelect()}
        {view === 'settings' && renderSettings()}
        {view === 'game' && renderGame()}
      </AnimatePresence>
      {/* Onomatopoeia Help Modal */}
      <AnimatePresence>
        {showOnomatopoeiaHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOnomatopoeiaHelp(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 card-shadow overflow-y-auto max-h-[80vh]"
            >
              <button 
                onClick={() => setShowOnomatopoeiaHelp(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                  <HelpCircle size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-800">オノマトペとは？</h3>
              </div>

              <div className="space-y-6 text-slate-600 leading-relaxed">
                <section>
                  <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                    擬音語（ぎおんご）
                  </h4>
                  <p className="font-medium">物が出す音や、動物の鳴き声を文字にしたものです。</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-bold">ワンワン</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-bold">ガチャン</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-bold">ドカーン</span>
                  </div>
                </section>

                <section>
                  <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                    擬態語（ぎたいご）
                  </h4>
                  <p className="font-medium">状態や動き、感情などの「音が出ないもの」を音のように表現したものです。</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-bold">キラキラ</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-bold">ワクワク</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-bold">のんびり</span>
                  </div>
                </section>

                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <p className="text-sm font-bold text-purple-700 mb-1">遊び方のヒント</p>
                  <p className="text-sm text-purple-600 font-medium">
                    お題の文章が持つ「雰囲気」や「勢い」を、直感的な音で表現してみよう！
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowOnomatopoeiaHelp(false)}
                className="w-full mt-8 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-colors"
              >
                わかった！
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Style Selection Modal */}
      <AnimatePresence>
        {showStylePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStylePicker(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-8 card-shadow flex flex-col max-h-[85vh]"
            >
              <button 
                onClick={() => setShowStylePicker(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="閉じる"
              >
                <X size={24} className="text-slate-400" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                  <Music size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">言い方カードを選択</h3>
                  <p className="text-slate-500 font-bold text-sm">好きな「言い方」を選んでね</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                {STYLES.map((style) => (
                  <button
                    key={style.text}
                    onClick={() => selectStyle(style)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${
                      state.currentStyle?.text === style.text
                        ? 'bg-orange-50 border-orange-400'
                        : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-bold text-orange-600/60 flex h-4 leading-none items-end">
                      {style.ruby.split(/\{([^{}]+)\}/).map((p, i) => i % 2 === 1 ? p : '').join('')}
                    </span>
                    <span className="text-lg font-black text-slate-800 leading-tight">
                      {style.text}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 italic text-slate-400 text-center text-sm font-medium">
                カードを選ぶとゲーム画面に反映されます
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
