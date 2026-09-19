import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Coins,
  Trophy,
  Volume2,
  VolumeX,
  Info,
  History,
  RotateCcw,
  Zap,
  Flame,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { GameItem, GameBetHistoryItem } from '../../types';
import { useAppState } from '../../services/stateStore';
import { audioEngine } from '../../services/audioEngine';
import confetti from 'canvas-confetti';

interface MiniGamePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameItem | null;
  onOpenCoinStore?: () => void;
}

export const MiniGamePlayerModal: React.FC<MiniGamePlayerModalProps> = ({
  isOpen,
  onClose,
  game,
  onOpenCoinStore,
}) => {
  const { currentUser, playGameBet, gameHistory, recentJackpotWinners } = useAppState();

  const [selectedBet, setSelectedBet] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'play' | 'rules' | 'history'>('play');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastResult, setLastResult] = useState<{
    isWin: boolean;
    payout: number;
    multiplier: number;
    outcomeText: string;
    isJackpot?: boolean;
  } | null>(null);

  // Lucky Wheel State
  const [wheelRotation, setWheelRotation] = useState(0);

  // Greedy Fruit Slot State
  const [selectedFruitId, setSelectedFruitId] = useState<string>('f1');
  const [fruitActiveIndex, setFruitActiveIndex] = useState<number>(0);

  // Dice Royale State
  const [diceChoice, setDiceChoice] = useState<'small' | 'big' | 'triple'>('big');
  const [diceValues, setDiceValues] = useState<[number, number, number]>([3, 4, 5]);

  // Dragon vs Tiger State
  const [cardChoice, setCardChoice] = useState<'dragon' | 'tiger' | 'tie'>('dragon');
  const [dragonCard, setDragonCard] = useState<{ val: string; suit: string }>({ val: 'K', suit: '♠' });
  const [tigerCard, setTigerCard] = useState<{ val: string; suit: string }>({ val: '7', suit: '♦' });

  // Rocket Crash State
  const [rocketMultiplier, setRocketMultiplier] = useState(1.0);
  const [isRocketFlying, setIsRocketFlying] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const rocketIntervalRef = useRef<any>(null);

  // 777 Slots State
  const [slotReels, setSlotReels] = useState<[string, string, string]>(['7️⃣', '7️⃣', '7️⃣']);

  useEffect(() => {
    if (game) {
      setSelectedBet(Math.max(game.minBet, 100));
      setLastResult(null);
      if (game.id === 'greedy_fruits' && game.multipliers.length > 0) {
        setSelectedFruitId(game.multipliers[0].id);
      }
    }
  }, [game]);

  if (!isOpen || !game) return null;

  const betChips = [50, 100, 500, 1000, 5000, 10000].filter((b) => b >= game.minBet && b <= game.maxBet);

  // 1. PLAY WHEEL
  const handleSpinWheel = async () => {
    if (isPlaying) return;
    if (currentUser.coins < selectedBet) {
      if (onOpenCoinStore) onOpenCoinStore();
      return;
    }

    setIsPlaying(true);
    setLastResult(null);
    if (soundEnabled) audioEngine.playSoundEffect('magic');

    // Call backend engine for authoritative outcome
    const res = await playGameBet(game.id, selectedBet);

    // Calculate rotation angle matching segment
    const segmentCount = game.multipliers.length;
    const segmentAngle = 360 / segmentCount;
    const targetIdx = game.multipliers.findIndex((m) => m.id === res.resultOutcome?.id);
    const resolvedIdx = targetIdx >= 0 ? targetIdx : 0;
    
    // Rotate multiple full turns + land on segment
    const extraTurns = 5 * 360;
    const targetAngle = extraTurns + (360 - (resolvedIdx * segmentAngle + segmentAngle / 2));

    setWheelRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setIsPlaying(false);
      setLastResult({
        isWin: res.isWin,
        payout: res.payoutAmount,
        multiplier: res.multiplier,
        outcomeText: res.resultOutcome?.label || `${res.multiplier}x`,
        isJackpot: res.isJackpot,
      });
    }, 3200);
  };

  // 2. PLAY GREEDY FRUITS
  const handlePlayFruitSlot = async () => {
    if (isPlaying) return;
    if (currentUser.coins < selectedBet) {
      if (onOpenCoinStore) onOpenCoinStore();
      return;
    }

    setIsPlaying(true);
    setLastResult(null);
    if (soundEnabled) audioEngine.playSoundEffect('chime');

    const res = await playGameBet(game.id, selectedBet, { selectedFruitId });

    // Animate neon light racing around fruit indexes
    const totalItems = game.multipliers.length;
    const targetIdx = game.multipliers.findIndex((m) => m.id === res.resultOutcome?.id);
    const resolvedIdx = targetIdx >= 0 ? targetIdx : 0;
    
    let currentStep = 0;
    const totalSteps = totalItems * 3 + resolvedIdx;
    let speed = 40;

    const stepInterval = () => {
      setFruitActiveIndex((prev) => (prev + 1) % totalItems);
      currentStep++;
      if (currentStep < totalSteps) {
        if (totalSteps - currentStep < 10) speed += 25;
        setTimeout(stepInterval, speed);
      } else {
        setIsPlaying(false);
        setFruitActiveIndex(resolvedIdx);
        setLastResult({
          isWin: res.isWin,
          payout: res.payoutAmount,
          multiplier: res.multiplier,
          outcomeText: res.resultOutcome?.label || '',
          isJackpot: res.isJackpot,
        });
      }
    };
    stepInterval();
  };

  // 3. PLAY DICE ROYALE
  const handleRollDice = async () => {
    if (isPlaying) return;
    if (currentUser.coins < selectedBet) {
      if (onOpenCoinStore) onOpenCoinStore();
      return;
    }

    setIsPlaying(true);
    setLastResult(null);
    if (soundEnabled) audioEngine.playSoundEffect('applause');

    const res = await playGameBet(game.id, selectedBet, { choice: diceChoice });

    // Dice shake animation simulation
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      rolls++;
      if (rolls > 12) {
        clearInterval(interval);
        setIsPlaying(false);
        setLastResult({
          isWin: res.isWin,
          payout: res.payoutAmount,
          multiplier: res.multiplier,
          outcomeText: res.message,
          isJackpot: res.isJackpot,
        });
      }
    }, 80);
  };

  // 4. PLAY DRAGON VS TIGER
  const handlePlayDragonTiger = async () => {
    if (isPlaying) return;
    if (currentUser.coins < selectedBet) {
      if (onOpenCoinStore) onOpenCoinStore();
      return;
    }

    setIsPlaying(true);
    setLastResult(null);
    if (soundEnabled) audioEngine.playSoundEffect('magic');

    const res = await playGameBet(game.id, selectedBet, { choice: cardChoice });

    const cardNames = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = ['♠', '♥', '♣', '♦'];

    setTimeout(() => {
      setDragonCard({
        val: cardNames[Math.floor(Math.random() * cardNames.length)],
        suit: suits[Math.floor(Math.random() * suits.length)],
      });
      setTigerCard({
        val: cardNames[Math.floor(Math.random() * cardNames.length)],
        suit: suits[Math.floor(Math.random() * suits.length)],
      });
      setIsPlaying(false);
      setLastResult({
        isWin: res.isWin,
        payout: res.payoutAmount,
        multiplier: res.multiplier,
        outcomeText: res.message,
        isJackpot: res.isJackpot,
      });
    }, 1200);
  };

  // 5. PLAY ROCKET CRASH
  const handleLaunchRocket = async () => {
    if (isRocketFlying) return;
    if (currentUser.coins < selectedBet) {
      if (onOpenCoinStore) onOpenCoinStore();
      return;
    }

    setIsRocketFlying(true);
    setHasCashedOut(false);
    setRocketMultiplier(1.0);
    setLastResult(null);
    if (soundEnabled) audioEngine.playSoundEffect('engine');

    // Pre-calculate crash point
    const crashAt = 1.1 + Math.pow(Math.random(), 2.2) * 15;
    let currentMult = 1.0;

    rocketIntervalRef.current = setInterval(() => {
      currentMult += 0.05 + currentMult * 0.02;
      setRocketMultiplier(Number(currentMult.toFixed(2)));

      if (currentMult >= crashAt) {
        clearInterval(rocketIntervalRef.current);
        setIsRocketFlying(false);
        if (soundEnabled) audioEngine.playSoundEffect('explosion');
        setLastResult({
          isWin: false,
          payout: 0,
          multiplier: 0,
          outcomeText: `Rocket Crashed at ${crashAt.toFixed(2)}x`,
        });
      }
    }, 80);
  };

  const handleCashoutRocket = async () => {
    if (!isRocketFlying || hasCashedOut) return;
    clearInterval(rocketIntervalRef.current);
    setHasCashedOut(true);
    setIsRocketFlying(false);

    const mult = Number(rocketMultiplier.toFixed(2));
    const res = await playGameBet(game.id, selectedBet, { cashoutMultiplier: mult });

    setLastResult({
      isWin: true,
      payout: res.payoutAmount,
      multiplier: mult,
      outcomeText: `Cashed out at ${mult}x!`,
      isJackpot: mult >= 25,
    });
  };

  // 6. PLAY 777 SLOTS
  const handleSpinSlots = async () => {
    if (isPlaying) return;
    if (currentUser.coins < selectedBet) {
      if (onOpenCoinStore) onOpenCoinStore();
      return;
    }

    setIsPlaying(true);
    setLastResult(null);
    if (soundEnabled) audioEngine.playSoundEffect('chime');

    const res = await playGameBet(game.id, selectedBet);
    const symbols = ['🍒', '🔔', '🍫', '💎', '7️⃣'];

    let spins = 0;
    const interval = setInterval(() => {
      setSlotReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
      spins++;
      if (spins > 16) {
        clearInterval(interval);
        setIsPlaying(false);
        if (res.isJackpot) {
          setSlotReels(['7️⃣', '7️⃣', '7️⃣']);
        } else if (res.isWin) {
          setSlotReels(['💎', '💎', '💎']);
        }
        setLastResult({
          isWin: res.isWin,
          payout: res.payoutAmount,
          multiplier: res.multiplier,
          outcomeText: res.message,
          isJackpot: res.isJackpot,
        });
      }
    }, 70);
  };

  const gameBetHistory = gameHistory.filter((h) => h.gameId === game.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-[400px] max-h-[92vh] bg-[#0E0E14] border-2 border-violet-500/40 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.3)] flex flex-col overflow-hidden text-slate-100"
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-[#14141E] border-b border-[#232332] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{game.icon}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white font-display">{game.name}</h3>
                  {game.badgeTag && (
                    <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-[9px] font-black text-white">
                      {game.badgeTag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="text-emerald-400 font-bold">RTP: {game.rtpPercent}%</span>
                  <span>•</span>
                  <span className="text-amber-300 font-bold">Pool: 🪙 {game.jackpotPool.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-[#1A1A24]"
                title="Sound Effects"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-violet-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-[#1A1A24]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-around bg-[#12121A] border-b border-[#232332] text-xs font-bold text-slate-400 shrink-0">
            <button
              onClick={() => setActiveTab('play')}
              className={`flex-1 py-2 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                activeTab === 'play' ? 'border-violet-500 text-violet-300' : 'border-transparent hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Arena</span>
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex-1 py-2 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                activeTab === 'rules' ? 'border-violet-500 text-violet-300' : 'border-transparent hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Rules & Multipliers</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                activeTab === 'history' ? 'border-violet-500 text-violet-300' : 'border-transparent hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Bet Ledger</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 overflow-y-auto flex-1 no-scrollbar space-y-4">
            {activeTab === 'play' && (
              <>
                {/* 1. WHEEL GAME STAGE */}
                {game.id === 'lucky_wheel' && (
                  <div className="flex flex-col items-center justify-center py-2">
                    <div className="relative w-56 h-56 flex items-center justify-center">
                      {/* Flapper Arrow Pointer */}
                      <div className="absolute top-0 z-20 -mt-2.5 text-amber-400 drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)] animate-bounce">
                        ▼
                      </div>

                      {/* Spinning Wheel Container */}
                      <div
                        className="w-52 h-52 rounded-full border-4 border-amber-400/80 shadow-[0_0_30px_rgba(234,179,8,0.4)] relative overflow-hidden transition-transform duration-[3000ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
                        style={{
                          transform: `rotate(${wheelRotation}deg)`,
                          background: 'conic-gradient(#8B5CF6 0deg 45deg, #EC4899 45deg 90deg, #3B82F6 90deg 135deg, #10B981 135deg 180deg, #F59E0B 180deg 225deg, #6366F1 225deg 270deg, #06B6D4 270deg 315deg, #EAB308 315deg 360deg)',
                        }}
                      >
                        {game.multipliers.map((m, idx) => {
                          const angle = idx * 45 + 22.5;
                          return (
                            <div
                              key={m.id}
                              className="absolute top-0 left-0 w-full h-full flex items-start justify-center pt-2 text-[10px] font-black text-white select-none drop-shadow-md"
                              style={{ transform: `rotate(${angle}deg)` }}
                            >
                              <span>{m.multiplier}x</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Center Hub */}
                      <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white flex items-center justify-center shadow-lg font-black text-slate-950 text-xs">
                        SPIN
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. GREEDY FRUIT SLOT STAGE */}
                {game.id === 'greedy_fruits' && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-center text-slate-300">Choose your fruit & tap Roll to hit the jackpot:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {game.multipliers.map((fruit, idx) => {
                        const isSelected = selectedFruitId === fruit.id;
                        const isLightActive = fruitActiveIndex === idx;

                        return (
                          <button
                            key={fruit.id}
                            onClick={() => !isPlaying && setSelectedFruitId(fruit.id)}
                            className={`p-2 rounded-2xl flex flex-col items-center justify-center relative transition-all ${
                              isLightActive
                                ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 scale-105 font-black shadow-lg shadow-amber-400/50'
                                : isSelected
                                ? 'bg-violet-600/40 border-2 border-violet-400 text-white shadow-xs'
                                : 'bg-[#181824] border border-[#232332] text-slate-300 hover:bg-[#202030]'
                            }`}
                          >
                            <span className="text-2xl">{fruit.icon}</span>
                            <span className="text-[10px] font-bold mt-1">{fruit.multiplier}x</span>
                            {isSelected && (
                              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-violet-400 text-slate-950 text-[8px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. DICE ROYALE STAGE */}
                {game.id === 'dice_royale' && (
                  <div className="space-y-4 py-2">
                    {/* Dice Display Area */}
                    <div className="p-4 rounded-3xl bg-[#14141E] border border-emerald-500/30 flex items-center justify-center gap-4 shadow-inner">
                      {diceValues.map((d, i) => (
                        <motion.div
                          key={i}
                          animate={isPlaying ? { rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] } : {}}
                          transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.2 }}
                          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 font-black text-2xl"
                        >
                          {d}
                        </motion.div>
                      ))}
                    </div>

                    {/* Prediction Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => !isPlaying && setDiceChoice('small')}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                          diceChoice === 'small'
                            ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                            : 'bg-[#181824] border-[#232332] text-slate-300'
                        }`}
                      >
                        Small (4-10) • 2x
                      </button>
                      <button
                        onClick={() => !isPlaying && setDiceChoice('big')}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                          diceChoice === 'big'
                            ? 'bg-rose-600 border-rose-400 text-white shadow-md'
                            : 'bg-[#181824] border-[#232332] text-slate-300'
                        }`}
                      >
                        Big (11-17) • 2x
                      </button>
                      <button
                        onClick={() => !isPlaying && setDiceChoice('triple')}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                          diceChoice === 'triple'
                            ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-md font-black'
                            : 'bg-[#181824] border-[#232332] text-slate-300'
                        }`}
                      >
                        Triple • 30x
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. DRAGON VS TIGER STAGE */}
                {game.id === 'dragon_tiger' && (
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Dragon Card */}
                      <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-col items-center">
                        <span className="text-xs font-extrabold text-rose-300 mb-1">🐉 DRAGON</span>
                        <div className="w-16 h-24 rounded-xl bg-white border-2 border-rose-500 flex flex-col items-center justify-center text-slate-950 font-black text-xl shadow-md">
                          <span>{dragonCard.val}</span>
                          <span className="text-rose-600 text-base">{dragonCard.suit}</span>
                        </div>
                      </div>

                      {/* Tiger Card */}
                      <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col items-center">
                        <span className="text-xs font-extrabold text-amber-300 mb-1">🐅 TIGER</span>
                        <div className="w-16 h-24 rounded-xl bg-white border-2 border-amber-500 flex flex-col items-center justify-center text-slate-950 font-black text-xl shadow-md">
                          <span>{tigerCard.val}</span>
                          <span className="text-amber-600 text-base">{tigerCard.suit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bet options */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => !isPlaying && setCardChoice('dragon')}
                        className={`py-2 rounded-xl text-xs font-bold border ${
                          cardChoice === 'dragon'
                            ? 'bg-rose-600 border-rose-400 text-white'
                            : 'bg-[#181824] border-[#232332] text-slate-300'
                        }`}
                      >
                        Dragon (2x)
                      </button>
                      <button
                        onClick={() => !isPlaying && setCardChoice('tie')}
                        className={`py-2 rounded-xl text-xs font-bold border ${
                          cardChoice === 'tie'
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : 'bg-[#181824] border-[#232332] text-slate-300'
                        }`}
                      >
                        Tie (8x)
                      </button>
                      <button
                        onClick={() => !isPlaying && setCardChoice('tiger')}
                        className={`py-2 rounded-xl text-xs font-bold border ${
                          cardChoice === 'tiger'
                            ? 'bg-amber-600 border-amber-400 text-white'
                            : 'bg-[#181824] border-[#232332] text-slate-300'
                        }`}
                      >
                        Tiger (2x)
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. ROCKET CRASH STAGE */}
                {game.id === 'rocket_crash' && (
                  <div className="space-y-4 py-2">
                    <div className="h-44 rounded-3xl bg-gradient-to-b from-slate-950 via-[#12121A] to-[#1A1A28] border border-amber-500/30 relative flex flex-col items-center justify-center overflow-hidden">
                      {isRocketFlying ? (
                        <div className="flex flex-col items-center animate-pulse">
                          <span className="text-4xl animate-bounce">🚀</span>
                          <span className="text-3xl font-black text-amber-400 font-display mt-2">
                            {rocketMultiplier.toFixed(2)}x
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">Rising... Cash out before crash!</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-4xl">🚀</span>
                          <span className="text-lg font-black text-white mt-1">Ready for Launch</span>
                          <span className="text-[10px] text-slate-400">Multiplier can climb up to 100x+</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. 777 SLOTS STAGE */}
                {game.id === 'golden_slots_777' && (
                  <div className="space-y-4 py-2">
                    <div className="p-4 rounded-3xl bg-gradient-to-b from-amber-950/30 to-[#14141E] border-2 border-amber-500/40 flex items-center justify-center gap-3 shadow-xl">
                      {slotReels.map((sym, i) => (
                        <div
                          key={i}
                          className="w-16 h-20 rounded-2xl bg-[#0B0B0F] border-2 border-amber-400 flex items-center justify-center text-3xl shadow-inner"
                        >
                          {sym}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Result Feedback Banner */}
                {lastResult && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold ${
                      lastResult.isWin
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                        : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                    }`}
                  >
                    {lastResult.isWin ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-extrabold text-amber-300">
                          🎉 {lastResult.isJackpot ? '🏆 GRAND JACKPOT WON!' : 'WINNER!'}
                        </span>
                        <span>
                          +{lastResult.payout.toLocaleString()} Coins ({lastResult.multiplier}x)
                        </span>
                        <span className="text-[10px] text-slate-300">{lastResult.outcomeText}</span>
                      </div>
                    ) : (
                      <div>
                        <span>{lastResult.outcomeText || 'Better luck next spin!'}</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Chip Bet Selector */}
                <div className="space-y-2 pt-2 border-t border-[#232332]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">Wager Coins:</span>
                    <div className="flex items-center gap-1 text-amber-300 font-extrabold">
                      <span>🪙 {selectedBet.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5">
                    {betChips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => !isPlaying && setSelectedBet(chip)}
                        className={`py-1.5 rounded-xl text-[11px] font-black border transition-all ${
                          selectedBet === chip
                            ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-md scale-105'
                            : 'bg-[#181824] border-[#232332] text-slate-300 hover:bg-[#202030]'
                        }`}
                      >
                        {chip >= 1000 ? `${chip / 1000}k` : chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button */}
                {game.id === 'rocket_crash' && isRocketFlying ? (
                  <button
                    onClick={handleCashoutRocket}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-98 transition-all"
                  >
                    <span>CASH OUT NOW (+{(selectedBet * rocketMultiplier).toFixed(0)} 🪙)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (game.id === 'lucky_wheel') handleSpinWheel();
                      else if (game.id === 'greedy_fruits') handlePlayFruitSlot();
                      else if (game.id === 'dice_royale') handleRollDice();
                      else if (game.id === 'dragon_tiger') handlePlayDragonTiger();
                      else if (game.id === 'rocket_crash') handleLaunchRocket();
                      else if (game.id === 'golden_slots_777') handleSpinSlots();
                    }}
                    disabled={isPlaying || game.status !== 'active'}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                      isPlaying
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white shadow-violet-500/30 hover:brightness-110 active:scale-98'
                    }`}
                  >
                    {isPlaying ? (
                      <span className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 animate-spin" /> In Orbit...
                      </span>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>
                          {game.id === 'lucky_wheel'
                            ? `SPIN WHEEL (${selectedBet.toLocaleString()} 🪙)`
                            : game.id === 'greedy_fruits'
                            ? `ROLL FRUIT (${selectedBet.toLocaleString()} 🪙)`
                            : game.id === 'rocket_crash'
                            ? `LAUNCH ROCKET (${selectedBet.toLocaleString()} 🪙)`
                            : `BET & PLAY (${selectedBet.toLocaleString()} 🪙)`}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {/* RULES TAB */}
            {activeTab === 'rules' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#14141E] border border-[#232332] space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Fair Play & Multiplier Payouts
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {game.rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-2 text-xs">Multiplier Probability Table:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {game.multipliers.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-[#14141E] border border-[#232332] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{m.icon || '🎯'}</span>
                          <span className="font-bold text-white text-[11px]">{m.label}</span>
                        </div>
                        <span className="font-black text-amber-400 text-xs">{m.multiplier}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-2">
                {gameBetHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No bets placed on this game yet.</p>
                ) : (
                  gameBetHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-[#14141E] border border-[#232332] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{item.resultOutcome}</p>
                        <p className="text-[10px] text-slate-400">{item.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-black ${
                            item.isWin ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {item.isWin ? `+${item.payoutAmount.toLocaleString()} 🪙` : `-${item.betAmount.toLocaleString()} 🪙`}
                        </p>
                        <span className="text-[9px] text-slate-500 font-bold">Wager: {item.betAmount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer User Balance Pill */}
          <div className="px-4 py-2.5 bg-[#14141E] border-t border-[#232332] flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Your Wallet:</span>
              <span className="font-black text-amber-300">🪙 {currentUser.coins.toLocaleString()}</span>
            </div>
            {onOpenCoinStore && (
              <button
                onClick={onOpenCoinStore}
                className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/30 transition-all"
              >
                + Top Up Coins
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
