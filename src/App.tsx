/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Star, 
  Smile, 
  Frown, 
  Zap, 
  Sun, 
  Moon, 
  Trophy, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  XCircle,
  Wind,
  ShieldCheck,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';

// --- Types ---
type GameState = 'START' | 'MAP' | 'LEVEL' | 'SUMMARY';
type EmotionWorld = 'HAPPINESS' | 'FEAR' | 'ANGER' | 'HOPE';

interface LevelData {
  id: EmotionWorld;
  title: string;
  color: string;
  icon: React.ReactNode;
  description: string;
  unlocked: boolean;
  completed: boolean;
}

interface Challenge {
  question: string;
  options: { text: string; isCorrect: boolean; feedback: string }[];
}

// --- Constants ---
const WORLDS: Record<EmotionWorld, LevelData> = {
  HAPPINESS: {
    id: 'HAPPINESS',
    title: 'عالم السعادة',
    color: 'bg-yellow-400',
    icon: <Smile className="w-12 h-12 text-yellow-700" />,
    description: 'تعرف على الأشياء التي تجعلك سعيداً وشارك الفرح مع الآخرين.',
    unlocked: true,
    completed: false,
  },
  FEAR: {
    id: 'FEAR',
    title: 'عالم الخوف',
    color: 'bg-indigo-400',
    icon: <Moon className="w-12 h-12 text-indigo-900" />,
    description: 'واجه مخاوفك وتعلم كيف تهدئ نفسك عندما تشعر بالقلق.',
    unlocked: false,
    completed: false,
  },
  ANGER: {
    id: 'ANGER',
    title: 'عالم الغضب',
    color: 'bg-red-400',
    icon: <Zap className="w-12 h-12 text-red-900" />,
    description: 'تحكم في غضبك وحول طاقتك إلى شيء إيجابي.',
    unlocked: false,
    completed: false,
  },
  HOPE: {
    id: 'HOPE',
    title: 'عالم الأمل',
    color: 'bg-green-400',
    icon: <Sun className="w-12 h-12 text-green-900" />,
    description: 'انظر إلى المستقبل بتفاؤل وتعلم كيف تحقق أحلامك.',
    unlocked: false,
    completed: false,
  },
};

const CHALLENGES: Record<EmotionWorld, Challenge[]> = {
  HAPPINESS: [
    {
      question: 'أي من هذه المواقف يجعلك تشعر بالسعادة الحقيقية؟',
      options: [
        { text: 'مساعدة صديق محتاج', isCorrect: true, feedback: 'أحسنت! العطاء يجلب السعادة.' },
        { text: 'السخرية من الآخرين', isCorrect: false, feedback: 'لا، السخرية تؤذي الآخرين ولا تجلب سعادة حقيقية.' },
        { text: 'البقاء وحيداً دائماً', isCorrect: false, feedback: 'التواصل مع الآخرين غالباً ما يزيد من سعادتنا.' },
      ],
    },
    {
      question: 'كيف يمكنك التعبير عن امتنانك لشخص ساعدك؟',
      options: [
        { text: 'تجاهله تماماً', isCorrect: false, feedback: 'التجاهل ليس طريقة جيدة للتعبير عن الامتنان.' },
        { text: 'قول "شكراً" بابتسامة', isCorrect: true, feedback: 'رائع! الكلمة الطيبة لها أثر كبير.' },
        { text: 'الغضب منه', isCorrect: false, feedback: 'الغضب لا يتناسب مع الامتنان.' },
      ],
    },
  ],
  FEAR: [
    {
      question: 'عندما تشعر بالخوف من امتحان قادم، ماذا تفعل؟',
      options: [
        { text: 'التنفس بعمق والتركيز على الدراسة', isCorrect: true, feedback: 'ممتاز! التنفس يساعد على تهدئة الأعصاب.' },
        { text: 'البكاء والهروب من الامتحان', isCorrect: false, feedback: 'الهروب لا يحل المشكلة، المواجهة هي الحل.' },
        { text: 'إلقاء اللوم على المعلم', isCorrect: false, feedback: 'تحمل المسؤولية يساعدنا على تجاوز الخوف.' },
      ],
    },
    {
      question: 'ما هي "جملة القوة" التي يمكنك قولها لنفسك عندما تخاف؟',
      options: [
        { text: '"أنا ضعيف ولن أنجح"', isCorrect: false, feedback: 'هذا كلام سلبي يزيد من خوفك.' },
        { text: '"أنا شجاع وأستطيع المحاولة"', isCorrect: true, feedback: 'بطل! التشجيع الذاتي يقوي العزيمة.' },
        { text: '"الجميع يكرهني"', isCorrect: false, feedback: 'هذا لا علاقة له بالشجاعة.' },
      ],
    },
  ],
  ANGER: [
    {
      question: 'إذا أخذ شخص ما لعبتك المفضلة دون استئذان، كيف تتصرف؟',
      options: [
        { text: 'الصراخ وضربه فوراً', isCorrect: false, feedback: 'العنف ليس حلاً، بل يزيد المشكلة سوءاً.' },
        { text: 'العد إلى عشرة ثم التحدث معه بهدوء', isCorrect: true, feedback: 'حكيم! الهدوء يمنحك فرصة للتفكير.' },
        { text: 'كسر اللعبة لكي لا يأخذها', isCorrect: false, feedback: 'هذا تصرف يضرك أنت أيضاً.' },
      ],
    },
    {
      question: 'ما هي أفضل طريقة لتفريغ طاقة الغضب بشكل صحي؟',
      options: [
        { text: 'الرياضة أو الرسم', isCorrect: true, feedback: 'إبداع! تحويل الغضب إلى فن أو حركة مفيد جداً.' },
        { text: 'كتمان الغضب في الداخل', isCorrect: false, feedback: 'الكتمان قد يؤدي إلى انفجار لاحقاً.' },
        { text: 'تكسير أثاث المنزل', isCorrect: false, feedback: 'هذا تصرف تخريبي وغير مقبول.' },
      ],
    },
  ],
  HOPE: [
    {
      question: 'عندما تفشل في مهمة ما، كيف تنظر للأمر بأمل؟',
      options: [
        { text: '"هذه فرصة لأتعلم وأحاول مرة أخرى"', isCorrect: true, feedback: 'رؤية رائعة! الفشل هو أول خطوة للنجاح.' },
        { text: '"أنا فاشل ولن أحاول أبداً"', isCorrect: false, feedback: 'اليأس يمنعك من التقدم.' },
        { text: '"الحظ دائماً ضدي"', isCorrect: false, feedback: 'الأمل يعتمد على العمل وليس فقط الحظ.' },
      ],
    },
    {
      question: 'كيف يمكنك مساعدة صديق يشعر باليأس؟',
      options: [
        { text: 'تذكيره بنقاط قوته ونجاحاته السابقة', isCorrect: true, feedback: 'صديق وفي! الدعم المعنوي يبني الأمل.' },
        { text: 'إخباره أن مشاكله تافهة', isCorrect: false, feedback: 'التقليل من مشاعر الآخرين لا يساعدهم.' },
        { text: 'تركه وحيداً في حزنه', isCorrect: false, feedback: 'التواجد بجانب الأصدقاء يقوي الأمل لديهم.' },
      ],
    },
  ],
};

// --- Components ---

const SoundEffect = ({ type }: { type: 'success' | 'error' | 'click' }) => {
  // In a real app, we'd play audio files. Here we'll just simulate visual feedback.
  return null;
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentWorld, setCurrentWorld] = useState<EmotionWorld | null>(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [unlockedWorlds, setUnlockedWorlds] = useState<EmotionWorld[]>(['HAPPINESS']);
  const [completedWorlds, setCompletedWorlds] = useState<EmotionWorld[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const handleStart = () => setGameState('MAP');

  const handleSelectWorld = (worldId: EmotionWorld) => {
    if (unlockedWorlds.includes(worldId)) {
      setCurrentWorld(worldId);
      setCurrentChallengeIndex(0);
      setGameState('LEVEL');
      setFeedback(null);
    }
  };

  const handleAnswer = (isCorrect: boolean, feedbackText: string) => {
    setFeedback({ text: feedbackText, isCorrect });
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f87171', '#818cf8', '#34d399']
      });
    } else {
      // Penalty for wrong answer
      setScore(prev => Math.max(0, prev - 1));
    }

    setTimeout(() => {
      setFeedback(null);
      if (isCorrect) {
        if (currentWorld && currentChallengeIndex < CHALLENGES[currentWorld].length - 1) {
          setCurrentChallengeIndex(prev => prev + 1);
        } else {
          // World Completed
          if (currentWorld) {
            setCompletedWorlds(prev => [...new Set([...prev, currentWorld])]);
            
            // Unlock next world
            const worldIds: EmotionWorld[] = ['HAPPINESS', 'FEAR', 'ANGER', 'HOPE'];
            const currentIndex = worldIds.indexOf(currentWorld);
            if (currentIndex < worldIds.length - 1) {
              const nextWorld = worldIds[currentIndex + 1];
              setUnlockedWorlds(prev => [...new Set([...prev, nextWorld])]);
              setGameState('MAP');
            } else {
              setGameState('SUMMARY');
            }
          }
        }
      }
      // If NOT correct, we don't advance, allowing the student to try again.
    }, 2500);
  };

  const resetGame = () => {
    setGameState('START');
    setScore(0);
    setUnlockedWorlds(['HAPPINESS']);
    setCompletedWorlds([]);
    setCurrentWorld(null);
  };

  return (
    <div className="min-h-screen bg-sky-50 font-sans text-right" dir="rtl">
      <AnimatePresence mode="wait">
        {gameState === 'START' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="mb-8"
            >
              <div className="relative">
                <Heart className="w-32 h-32 text-rose-500 fill-rose-500" />
                <Star className="absolute top-0 right-0 w-12 h-12 text-yellow-400 fill-yellow-400 animate-pulse" />
              </div>
            </motion.div>
            
            <h1 className="text-6xl font-black text-sky-900 mb-4 tracking-tight">رحلة المشاعر</h1>
            <p className="text-2xl text-sky-700 mb-8 max-w-md leading-relaxed">
              انضم إلينا في رحلة استكشافية ممتعة لنتعرف على مشاعرنا وكيف نتعامل معها بذكاء وشجاعة!
            </p>

            <div className="mb-8 w-full max-w-sm">
              <label className="block text-right text-sky-800 font-bold mb-2 mr-2">اسم الطالب:</label>
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="اكتب اسمك هنا..."
                className="w-full p-4 rounded-2xl border-4 border-sky-200 focus:border-sky-500 outline-none text-xl text-right font-bold"
              />
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl mb-12 border-2 border-sky-200">
              <p className="text-lg font-bold text-sky-800">إعداد المعلمة:</p>
              <p className="text-2xl font-black text-rose-600">اشيرة قرابصة</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="bg-sky-600 hover:bg-sky-700 text-white text-3xl font-bold py-6 px-12 rounded-full shadow-2xl flex items-center gap-4 transition-colors"
            >
              ابدأ الرحلة <Play className="w-8 h-8 fill-current" />
            </motion.button>
          </motion.div>
        )}

        {gameState === 'MAP' && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 max-w-4xl mx-auto min-h-screen"
          >
            <header className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-black text-sky-900">خريطة المشاعر</h2>
                <p className="text-sky-600 font-medium">اختر العالم الذي تريد استكشافه</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-yellow-400 flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                <span className="text-3xl font-black text-sky-900">{score}</span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(Object.values(WORLDS) as LevelData[]).map((world, index) => {
                const isUnlocked = unlockedWorlds.includes(world.id);
                const isCompleted = completedWorlds.includes(world.id);
                
                return (
                  <motion.div
                    key={world.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={isUnlocked ? { scale: 1.05, rotate: 1 } : {}}
                    onClick={() => handleSelectWorld(world.id)}
                    className={cn(
                      "relative p-8 rounded-3xl shadow-2xl cursor-pointer overflow-hidden border-4 transition-all",
                      world.color,
                      isUnlocked ? "border-white" : "border-gray-300 grayscale opacity-70",
                      isCompleted && "ring-8 ring-green-400 ring-offset-4"
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-white/40 p-4 rounded-2xl backdrop-blur-sm">
                        {world.icon}
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="w-10 h-10 text-white fill-green-500" />
                      )}
                      {!isUnlocked && (
                        <ShieldCheck className="w-10 h-10 text-gray-500" />
                      )}
                    </div>
                    
                    <h3 className="text-3xl font-black text-sky-900 mb-2">{world.title}</h3>
                    <p className="text-sky-800 font-medium leading-relaxed">
                      {isUnlocked ? world.description : "أكمل العوالم السابقة لفتح هذا العالم!"}
                    </p>

                    {isUnlocked && !isCompleted && (
                      <div className="mt-6 flex items-center gap-2 text-sky-900 font-bold">
                        <span>ادخل الآن</span>
                        <ArrowLeft className="w-5 h-5" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {gameState === 'LEVEL' && currentWorld && (
          <motion.div
            key="level"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="min-h-screen p-6 flex flex-col"
          >
            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
              <header className="flex justify-between items-center mb-8">
                <button 
                  onClick={() => setGameState('MAP')}
                  className="bg-white p-3 rounded-full shadow-md hover:bg-sky-100 transition-colors"
                >
                  <ArrowRight className="w-6 h-6 text-sky-900" />
                </button>
                <div className="flex-1 mx-8 h-4 bg-sky-200 rounded-full overflow-hidden border-2 border-white shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentChallengeIndex + 1) / CHALLENGES[currentWorld].length) * 100}%` }}
                    className={cn("h-full transition-all duration-500", WORLDS[currentWorld].color)}
                  />
                </div>
                <div className="text-2xl font-black text-sky-900">{score}</div>
              </header>

              <div className="bg-white rounded-[3rem] shadow-2xl p-10 flex-1 flex flex-col border-4 border-sky-100 relative overflow-hidden">
                <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-10 -mr-10 -mt-10", WORLDS[currentWorld].color)} style={{ borderRadius: '50%' }} />
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={cn("p-4 rounded-2xl", WORLDS[currentWorld].color)}>
                      {WORLDS[currentWorld].icon}
                    </div>
                    <h2 className="text-4xl font-black text-sky-900">{WORLDS[currentWorld].title}</h2>
                  </div>

                  <h4 className="text-3xl font-bold text-sky-800 mb-12 leading-tight">
                    {CHALLENGES[currentWorld][currentChallengeIndex].question}
                  </h4>

                  <div className="grid gap-6">
                    {CHALLENGES[currentWorld][currentChallengeIndex].options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02, x: -10 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!!feedback}
                        onClick={() => handleAnswer(option.isCorrect, option.feedback)}
                        className={cn(
                          "p-6 rounded-2xl text-2xl font-bold text-right transition-all border-4",
                          "bg-sky-50 border-sky-100 text-sky-900 hover:bg-sky-100 hover:border-sky-300",
                          feedback && feedback.isCorrect && option.isCorrect && "bg-green-100 border-green-500 text-green-900",
                          feedback && !feedback.isCorrect && feedback.text === option.feedback && "bg-red-100 border-red-500 text-red-900"
                        )}
                      >
                        {option.text}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className={cn(
                      "fixed bottom-12 left-1/2 -translate-x-1/2 p-8 rounded-3xl shadow-2xl border-4 flex items-center gap-6 z-50 min-w-[400px]",
                      feedback.isCorrect ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"
                    )}
                  >
                    {feedback.isCorrect ? (
                      <CheckCircle2 className="w-16 h-16 text-green-500" />
                    ) : (
                      <XCircle className="w-16 h-16 text-red-500" />
                    )}
                    <div className="text-right">
                      <p className={cn("text-3xl font-black mb-1", feedback.isCorrect ? "text-green-900" : "text-red-900")}>
                        {feedback.isCorrect ? "أحسنت!" : "حاول مرة أخرى"}
                      </p>
                      <p className="text-xl font-medium text-sky-800">{feedback.text}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {gameState === 'SUMMARY' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-sky-100"
          >
            {/* Certificate Design */}
            <div className="bg-white rounded-none shadow-2xl p-16 max-w-4xl w-full border-[16px] border-double border-yellow-600 relative print:shadow-none print:border-yellow-600">
              {/* Decorative Corners */}
              <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-yellow-600" />
              <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-yellow-600" />
              <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-yellow-600" />
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-yellow-600" />

              <div className="flex justify-center mb-8">
                <Trophy className="w-32 h-32 text-yellow-500 fill-yellow-400 drop-shadow-lg" />
              </div>

              <h2 className="text-5xl font-black text-sky-900 mb-4 serif">شهادة إنجاز</h2>
              <p className="text-2xl text-sky-700 mb-8">تُمنح هذه الشهادة بكل فخر لـ:</p>
              
              <div className="border-b-4 border-sky-900 inline-block px-12 mb-8">
                <h3 className="text-5xl font-black text-rose-600 py-2">{studentName || 'بطل المشاعر'}</h3>
              </div>

              <p className="text-2xl text-sky-800 mb-12 max-w-2xl mx-auto leading-relaxed">
                لاجتيازه بنجاح جميع مستويات لعبة <b>"رحلة المشاعر"</b> التعليمية، وإظهار وعي متميز في فهم المشاعر والتعامل معها.
              </p>

              <div className="grid grid-cols-2 gap-12 mb-12 border-t-2 border-sky-100 pt-8">
                <div className="text-center">
                  <p className="text-sky-600 font-bold mb-2">عدد النجوم المجمعة</p>
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-10 h-10 text-yellow-500 fill-yellow-500" />
                    <span className="text-5xl font-black text-yellow-600">{score}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sky-600 font-bold mb-2">التاريخ</p>
                  <p className="text-3xl font-black text-sky-900">{new Date().toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              <div className="flex justify-between items-end mt-16">
                <div className="text-right">
                  <p className="text-sky-600 font-bold">توقيع المعلمة:</p>
                  <p className="text-2xl font-black text-sky-900 mt-2">اشيرة قرابصة</p>
                </div>
                <div className="bg-sky-900 text-white p-4 rounded-lg transform -rotate-12 font-black text-xl">
                  متميز
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-6 no-print">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.print()}
                className="bg-green-600 text-white text-2xl font-black py-4 px-10 rounded-full shadow-xl flex items-center gap-3"
              >
                طباعة الشهادة <Star className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="bg-sky-600 text-white text-2xl font-black py-4 px-10 rounded-full shadow-xl"
              >
                العب مرة أخرى
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
