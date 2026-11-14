import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { QUIZZES_CATALOG, useApp } from '../context/AppContext';
import type { Quiz, QuizAttempt } from '../types/lms';

interface QuizViewProps {
  initialQuizId?: string | null;
  onClearInitialQuiz: () => void;
}

type QuizScreenState =
  | { phase: 'list' }
  | { phase: 'active'; quiz: Quiz }
  | { phase: 'result'; quiz: Quiz; attempt: QuizAttempt };

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getFeedbackBanner(percentage: number): { title: string; detail: string } {
  if (percentage >= 90) {
    return {
      title: 'Outstanding Mastery',
      detail: 'You demonstrated strong conceptual precision across nearly every question.',
    };
  }
  if (percentage >= 75) {
    return {
      title: 'Strong Performance',
      detail: 'Solid command of core principles. Review any missed explanations below to lock in 100%.',
    };
  }
  if (percentage >= 50) {
    return {
      title: 'Good Foundation — Keep Reviewing',
      detail: 'You understand the basics. Revisit the related course lessons and retry to boost your score.',
    };
  }
  return {
    title: 'Needs Focused Review',
    detail: 'Read through the step-by-step answer explanations below and ask EduSpark AI Tutor to walk through tricky topics.',
  };
}

export const QuizView: React.FC<QuizViewProps> = ({ initialQuizId, onClearInitialQuiz }) => {
  const { quizAttempts, saveQuizAttempt } = useApp();

  const [screen, setScreen] = useState<QuizScreenState>({ phase: 'list' });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const startQuiz = (quiz: Quiz) => {
    setScreen({ phase: 'active', quiz });
    setCurrentIndex(0);
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    setSecondsRemaining(quiz.timeLimitSeconds);
    setShowConfirmModal(false);
    setSubmitError(null);
  };

  useEffect(() => {
    if (initialQuizId) {
      const target = QUIZZES_CATALOG.find((q) => q.id === initialQuizId);
      if (target) {
        startQuiz(target);
      }
      onClearInitialQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuizId]);

  const submitQuiz = async (quiz: Quiz, answersSnapshot: number[], remainingSecs: number) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      let score = 0;
      quiz.questions.forEach((q, idx) => {
        if (answersSnapshot[idx] === q.correctIndex) score += 1;
      });
      const totalQuestions = quiz.questions.length;
      const percentage = Math.round((score / totalQuestions) * 100);
      const durationSeconds = Math.max(1, quiz.timeLimitSeconds - remainingSecs);

      const savedAttempt = await saveQuizAttempt({
        quizId: quiz.id,
        quizTitle: quiz.title,
        score,
        totalQuestions,
        percentage,
        durationSeconds,
        answers: answersSnapshot,
      });

      setShowConfirmModal(false);
      setScreen({ phase: 'result', quiz, attempt: savedAttempt });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to save quiz result.');
    } finally {
      setSubmitting(false);
    }
  };

  // Countdown Timer
  useEffect(() => {
    if (screen.phase !== 'active') return;
    if (secondsRemaining <= 0) {
      submitQuiz(screen.quiz, selectedAnswers, 0);
      return;
    }
    const timer = window.setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen.phase, secondsRemaining]);

  if (screen.phase === 'list') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Interactive MCQ Quizzes
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Test your retention with timed multiple-choice assessments, automatic grading, and detailed explanations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {QUIZZES_CATALOG.map((quiz) => {
            const attemptsForQuiz = quizAttempts.filter((a) => a.quizId === quiz.id);
            const latest = attemptsForQuiz[0];
            const best =
              attemptsForQuiz.length > 0
                ? Math.max(...attemptsForQuiz.map((a) => a.percentage))
                : null;

            return (
              <article
                key={quiz.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-indigo-600 dark:text-violet-400">
                      {quiz.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{quiz.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{quiz.questions.length} questions</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{Math.round(quiz.timeLimitSeconds / 60)} min</span>
                  </div>
                  <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                    {quiz.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{quiz.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {best !== null ? (
                      <span>
                        Best score: <strong className="text-slate-900 dark:text-white">{best}%</strong> · Last: {latest.score}/{latest.totalQuestions}
                      </span>
                    ) : (
                      <span>Not attempted yet</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startQuiz(quiz)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 whitespace-nowrap shrink-0"
                  >
                    <span>{best !== null ? 'Retake Quiz' : 'Start Quiz'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Attempt History Table */}
        {quizAttempts.length > 0 && (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Saved Quiz Attempts
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-4 font-medium">Quiz</th>
                    <th className="py-2.5 px-4 font-medium">Score</th>
                    <th className="py-2.5 px-4 font-medium">Percentage</th>
                    <th className="py-2.5 px-4 font-medium">Duration</th>
                    <th className="py-2.5 pl-4 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {quizAttempts.map((a) => (
                    <tr key={a.id}>
                      <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                        {a.quizTitle}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                        {a.score} / {a.totalQuestions}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-semibold tabular-nums">
                        <span
                          className={
                            a.percentage >= 80
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : a.percentage >= 60
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {a.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {formatTimer(a.durationSeconds)}
                      </td>
                      <td className="py-3 pl-4 text-xs text-slate-500 dark:text-slate-400 text-right tabular-nums">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    );
  }

  if (screen.phase === 'active') {
    const { quiz } = screen;
    const question = quiz.questions[currentIndex];
    const answeredCount = selectedAnswers.filter((a) => a >= 0).length;
    const unansweredCount = quiz.questions.length - answeredCount;
    const progressPct = Math.round(((currentIndex + 1) / quiz.questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Quiz Header */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => setScreen({ phase: 'list' })}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Quiz</span>
            </button>
            <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {quiz.title}
            </h1>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border font-mono text-sm font-semibold tabular-nums ${
              secondsRemaining <= 60
                ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>
        </div>

        {/* Progress + Question Navigator */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="tabular-nums">
              Question {currentIndex + 1} of {quiz.questions.length}
            </span>
            <span className="tabular-nums">
              {answeredCount}/{quiz.questions.length} answered
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {quiz.questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = selectedAnswers[idx] >= 0;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-lg font-mono text-xs font-semibold transition-colors tabular-nums ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isAnswered
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 sm:p-8 space-y-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-snug">
            {question.prompt}
          </h2>

          <div className="space-y-3" role="radiogroup" aria-label="Answer options">
            {question.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx;
              const letter = String.fromCharCode(65 + optIdx);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setSelectedAnswers((prev) => {
                      const next = [...prev];
                      next[currentIndex] = optIdx;
                      return next;
                    })
                  }
                  className={`w-full text-left p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                    isSelected
                      ? 'border-indigo-600 dark:border-violet-500 bg-indigo-50/70 dark:bg-indigo-950/50 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm leading-relaxed pt-0.5">{opt}</span>
                </button>
              );
            })}
          </div>

          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2.5">
              {currentIndex < quiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => Math.min(quiz.questions.length - 1, i + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                >
                  <span>Submit Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 space-y-5 shadow-xl">
              <div className="space-y-2">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Submit your quiz?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  You have answered{' '}
                  <strong className="text-slate-900 dark:text-white tabular-nums">
                    {answeredCount} of {quiz.questions.length}
                  </strong>{' '}
                  questions.
                  {unansweredCount > 0
                    ? ` ${unansweredCount} question${unansweredCount === 1 ? ' is' : 's are'} still unanswered.`
                    : ' All questions have been answered.'}
                </p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Review Answers
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submitQuiz(quiz, selectedAnswers, secondsRemaining)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Submit</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Result Screen
  const { quiz, attempt } = screen;
  const feedback = getFeedbackBanner(attempt.percentage);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-indigo-600 dark:text-violet-400">
              Quiz Complete · {quiz.title}
            </p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {feedback.title}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{feedback.detail}</p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="font-display text-4xl font-bold text-indigo-600 dark:text-violet-400 tabular-nums">
              {attempt.percentage}%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {attempt.score} of {attempt.totalQuestions} correct · {formatTimer(attempt.durationSeconds)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => startQuiz(quiz)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Quiz</span>
          </button>
          <button
            type="button"
            onClick={() => setScreen({ phase: 'list' })}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Quizzes</span>
          </button>
        </div>
      </div>

      {/* Question-by-Question Review */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Answer Review
        </h2>
        {quiz.questions.map((q, idx) => {
          const userChoice = attempt.answers[idx];
          const isCorrect = userChoice === q.correctIndex;
          return (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  {idx + 1}. {q.prompt}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                    isCorrect
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                </span>
              </div>

              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isAnswer = oIdx === q.correctIndex;
                  const isUserPick = oIdx === userChoice;
                  return (
                    <div
                      key={opt}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        isAnswer
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium'
                          : isUserPick
                          ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                          : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{opt}</span>
                      {isAnswer && <span className="font-semibold shrink-0">Correct Answer</span>}
                      {!isAnswer && isUserPick && (
                        <span className="font-semibold shrink-0">Your Choice</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0B1120] p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">Explanation: </strong>
                {q.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
