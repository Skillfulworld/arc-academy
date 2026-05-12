import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { QUIZZES, PASSING_SCORE, TOTAL_QUESTIONS } from "@/data/quizzes";
import { shuffleArray } from "@/lib/utils";
import { saveQuizResult } from "@/lib/db";

interface QuizPageProps {
  quizId: string;
  onNavigate: (page: string) => void;
}

type Phase = "question" | "result";

interface Question {
  q: string;
  options: string[];
  correct: string;
}

export function QuizPage({ quizId, onNavigate }: QuizPageProps) {
  const quiz = QUIZZES.find((q) => q.id === quizId);
  const { recordQuizResult, supabaseUserId } = useAppStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [phase, setPhase] = useState<Phase>("question");
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (quiz) {
      const shuffled = shuffleArray([...quiz.questions]);
      setQuestions(shuffled);
      setCurrentIndex(0);
      setScore(0);
      setFinalScore(0);
      setSelected(null);
      setAnswered(false);
      setPhase("question");
    }
  }, [quizId]);

  useEffect(() => {
    if (questions[currentIndex]) {
      setShuffledOptions(shuffleArray([...questions[currentIndex].options]));
      setSelected(null);
      setAnswered(false);
    }
  }, [currentIndex, questions]);

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <p className="text-white/40 font-orbitron text-sm">Quiz not found.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  function handleAnswer(option: string) {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === currentQ.correct) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    const isLastQuestion = currentIndex + 1 >= questions.length;

    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    const currentCorrect = selected === currentQ.correct ? 1 : 0;
    const total = score + currentCorrect;
    setFinalScore(total);

    const result = {
      quizId: quiz!.id,
      score: total,
      passed: total >= PASSING_SCORE,
      completedAt: new Date().toISOString(),
    };

    const { newPoints, newStreak } = recordQuizResult(result);

    if (supabaseUserId) {
      saveQuizResult(supabaseUserId, result, newPoints, newStreak).catch(() => {});
    }

    setPhase("result");
  }

  if (phase === "result") {
    const passed = finalScore >= PASSING_SCORE;
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md arc-glass border border-white/10 rounded-xl p-8 text-center animate-fade-in-up">
          <div className="text-5xl mb-4">{passed ? "🏆" : "❌"}</div>
          <h2 className="font-orbitron text-lg text-white mb-2">
            {passed ? "MODULE_COMPLETE" : "SEQUENCE_FAILED"}
          </h2>
          <p className="text-white/40 text-sm mb-1">{quiz.name}</p>
          <p className="font-orbitron text-arc-purple text-3xl font-bold my-4">
            {finalScore} / {TOTAL_QUESTIONS}
          </p>

          {passed ? (
            <div className="bg-arc-purple/10 border border-arc-purple/30 rounded-lg p-3 mb-6">
              <p className="text-arc-purple font-orbitron text-xs tracking-wider">
                +10 POINTS · NFT CERTIFICATE UNLOCKED
              </p>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
              <p className="text-red-400 font-orbitron text-xs tracking-wider">
                NEED {PASSING_SCORE}/{TOTAL_QUESTIONS} TO PASS · TRY AGAIN
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => onNavigate("dashboard")}
              className="flex-1 py-3 bg-white/10 border border-white/20 text-white font-orbitron text-xs rounded-lg hover:border-arc-purple hover:text-arc-purple transition-all active:scale-[0.97]"
            >
              DASHBOARD
            </button>
            {!passed && (
              <button
                onClick={() => {
                  const shuffled = shuffleArray([...quiz.questions]);
                  setQuestions(shuffled);
                  setCurrentIndex(0);
                  setScore(0);
                  setFinalScore(0);
                  setSelected(null);
                  setAnswered(false);
                  setPhase("question");
                }}
                className="flex-1 py-3 bg-white text-black font-orbitron text-xs rounded-lg hover:bg-arc-purple hover:text-white transition-all active:scale-[0.97]"
              >
                RETRY
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-lg arc-glass border border-white/10 rounded-xl p-6 md:p-8 animate-fade-in-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-orbitron text-arc-purple text-[10px] tracking-widest">{quiz.module}</p>
            <p className="text-white/40 text-xs mt-0.5">{quiz.name}</p>
          </div>
          <span className="font-orbitron text-white/40 text-xs tabular-nums">
            {currentIndex + 1} / {TOTAL_QUESTIONS}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-6">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < currentIndex
                  ? "bg-arc-purple"
                  : i === currentIndex
                  ? "bg-arc-purple/40"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Question */}
        <p className="text-white text-base md:text-lg leading-relaxed mb-6 min-h-[64px]">
          {currentQ.q}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2.5 mb-5">
          {shuffledOptions.map((option) => {
            let cls =
              "border-white/15 bg-white/[0.03] text-white hover:border-arc-purple/70 hover:bg-arc-purple/5";

            if (answered) {
              if (option === currentQ.correct) {
                cls = "border-green-500 bg-green-500/10 text-green-300";
              } else if (option === selected) {
                cls = "border-red-500 bg-red-500/10 text-red-300";
              } else {
                cls = "border-white/5 bg-transparent text-white/25";
              }
            } else if (option === selected) {
              cls = "border-arc-purple bg-arc-purple/10 text-white";
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={answered}
                className={`w-full text-left px-4 py-4 rounded-lg border text-sm leading-snug transition-all ${cls} disabled:cursor-default`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {answered && (
          <div
            className={`px-4 py-3 rounded-lg mb-4 font-orbitron text-[11px] tracking-wider ${
              selected === currentQ.correct
                ? "bg-green-500/10 border border-green-500/25 text-green-400"
                : "bg-red-500/10 border border-red-500/25 text-red-400"
            }`}
          >
            {selected === currentQ.correct
              ? "✅ CORRECT"
              : `❌ CORRECT: ${currentQ.correct}`}
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-arc-purple text-white font-orbitron text-xs tracking-widest rounded-lg hover:bg-arc-purple/80 active:scale-[0.98] transition-all"
          >
            {currentIndex + 1 < TOTAL_QUESTIONS ? "CONTINUE →" : "VIEW RESULTS"}
          </button>
        )}

        <button
          onClick={() => onNavigate("dashboard")}
          className="w-full mt-3 py-2 text-white/25 hover:text-white/50 font-orbitron text-[11px] transition-colors"
        >
          ← ABORT MISSION
        </button>
      </div>
    </div>
  );
}
