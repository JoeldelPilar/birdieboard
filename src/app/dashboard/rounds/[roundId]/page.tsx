'use client';

import { Button, Card, CardBody } from '@heroui/react';
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconGolf,
  IconMinus,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRound, saveHoleScore, completeRound, abandonRound } from '@/server/actions/rounds';
import { getCourseDetails } from '@/server/actions/courses';
import { getScoreName, getScoreBgColor, formatScoreToPar } from '@/utils/score-helpers';
import type { RoundWithScores } from '@/server/actions/rounds';
import type { CourseWithDetails } from '@/server/actions/courses';

interface PageProps {
  params: Promise<{ roundId: string }>;
}

interface HoleState {
  strokes: number;
  putts: number;
  fairwayHit: boolean | null;
  greenInReg: boolean | null;
  penaltyStrokes: number;
}

type TeeHole = CourseWithDetails['tees'][number]['holes'][number];

function defaultHoleState(): HoleState {
  return {
    strokes: 0,
    putts: 0,
    fairwayHit: null,
    greenInReg: null,
    penaltyStrokes: 0,
  };
}

function scoreToState(score: RoundWithScores['holeScores'][number]): HoleState {
  return {
    strokes: score.strokes,
    putts: score.putts ?? 0,
    fairwayHit: score.fairwayHit,
    greenInReg: score.greenInReg,
    penaltyStrokes: score.penaltyStrokes,
  };
}

export default function RoundScoringPage({ params }: PageProps) {
  const router = useRouter();

  const [roundId, setRoundId] = useState<string | null>(null);
  const [round, setRound] = useState<RoundWithScores | null>(null);
  const [teeHoles, setTeeHoles] = useState<TeeHole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHole, setCurrentHole] = useState(1);
  const [holeStates, setHoleStates] = useState<Record<number, HoleState>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  useEffect(() => {
    params.then(({ roundId: id }) => {
      setRoundId(id);
      void loadRound(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRound(id: string) {
    setIsLoading(true);
    const result = await getRound(id);

    if (!result.success) {
      setIsLoading(false);
      showToast('error', result.error);
      return;
    }

    const data = result.data;

    // Fetch course details to get hole info (par, strokeIndex, distance)
    const courseResult = await getCourseDetails(data.courseId);
    setIsLoading(false);

    if (!courseResult.success) {
      showToast('error', courseResult.error);
      setRound(data);
      return;
    }

    const matchingTee = courseResult.data.tees.find((t) => t.id === data.teeId);
    const holes = matchingTee?.holes ?? [];
    setTeeHoles(holes);
    setRound(data);

    // Build initial holeStates from existing scores
    const initial: Record<number, HoleState> = {};
    for (const score of data.holeScores) {
      initial[score.holeNumber] = scoreToState(score);
    }
    setHoleStates(initial);

    // Navigate to the first unscored hole
    const firstUnscored = holes.find((h) => !initial[h.holeNumber]);
    if (firstUnscored) {
      setCurrentHole(firstUnscored.holeNumber);
    } else {
      setCurrentHole(1);
    }
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  function getHoleState(holeNumber: number): HoleState {
    return holeStates[holeNumber] ?? defaultHoleState();
  }

  function updateHoleState(holeNumber: number, patch: Partial<HoleState>) {
    setHoleStates((prev) => ({
      ...prev,
      [holeNumber]: { ...(prev[holeNumber] ?? defaultHoleState()), ...patch },
    }));
  }

  function getCurrentHoleInfo(): TeeHole | null {
    return teeHoles.find((h) => h.holeNumber === currentHole) ?? null;
  }

  const state = getHoleState(currentHole);
  const holeInfo = getCurrentHoleInfo();
  const totalHoles = teeHoles.length > 0 ? teeHoles.length : 18;

  function computeRunningScore(): { strokes: number; par: number } {
    if (!round) return { strokes: 0, par: 0 };
    let strokes = 0;
    let par = 0;
    for (const hole of teeHoles) {
      const s = holeStates[hole.holeNumber];
      if (s && s.strokes > 0) {
        strokes += s.strokes;
        par += hole.par;
      }
    }
    return { strokes, par };
  }

  async function handleSaveAndNavigate(direction: 'next' | 'prev') {
    if (!roundId || !holeInfo) return;

    // Only save if a score was entered for the current hole
    if (state.strokes > 0) {
      setIsSaving(true);
      const result = await saveHoleScore(roundId, {
        holeNumber: currentHole,
        strokes: state.strokes,
        putts: state.putts > 0 ? state.putts : undefined,
        fairwayHit: state.fairwayHit ?? undefined,
        greenInReg: state.greenInReg ?? undefined,
        penaltyStrokes: state.penaltyStrokes > 0 ? state.penaltyStrokes : undefined,
      });
      setIsSaving(false);

      if (!result.success) {
        showToast('error', result.error);
        return;
      }
    }

    if (direction === 'next' && currentHole < totalHoles) {
      setCurrentHole((h) => h + 1);
    } else if (direction === 'prev' && currentHole > 1) {
      setCurrentHole((h) => h - 1);
    }
  }

  async function handleSaveCurrentHole() {
    if (!roundId || !holeInfo || state.strokes === 0) return;

    setIsSaving(true);
    const result = await saveHoleScore(roundId, {
      holeNumber: currentHole,
      strokes: state.strokes,
      putts: state.putts > 0 ? state.putts : undefined,
      fairwayHit: state.fairwayHit ?? undefined,
      greenInReg: state.greenInReg ?? undefined,
      penaltyStrokes: state.penaltyStrokes > 0 ? state.penaltyStrokes : undefined,
    });
    setIsSaving(false);

    if (!result.success) {
      showToast('error', result.error);
    } else {
      showToast('success', `Hole ${currentHole} saved`);
    }
  }

  async function handleCompleteRound() {
    if (!roundId) return;

    // Save current hole first
    if (state.strokes > 0) {
      await handleSaveCurrentHole();
    }

    setIsCompleting(true);
    const result = await completeRound(roundId);
    setIsCompleting(false);

    if (!result.success) {
      showToast('error', result.error);
      return;
    }

    router.push(`/dashboard/rounds/${roundId}/summary`);
  }

  async function handleAbandonment() {
    if (!roundId) return;
    setIsAbandoning(true);
    const result = await abandonRound(roundId);
    setIsAbandoning(false);

    if (!result.success) {
      showToast('error', result.error);
      return;
    }

    router.push('/dashboard/rounds');
  }

  const allHolesScored =
    round !== null &&
    teeHoles.length > 0 &&
    teeHoles.every((h) => {
      const s = holeStates[h.holeNumber];
      return s && s.strokes > 0;
    });

  const { strokes: runningStrokes, par: runningPar } = computeRunningScore();
  const scoredHolesCount =
    teeHoles.filter((h) => {
      const s = holeStates[h.holeNumber];
      return s && s.strokes > 0;
    }).length ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconGolf className="h-8 w-8 animate-pulse text-golf-green" aria-label="Loading" />
      </div>
    );
  }

  if (!round) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-semibold">Round not found.</p>
        <Button as={Link} href="/dashboard/rounds" color="success" variant="flat">
          Back to Rounds
        </Button>
      </div>
    );
  }

  if (round.status !== 'in_progress') {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-semibold">This round is {round.status}.</p>
        {round.status === 'completed' && (
          <Button
            as={Link}
            href={`/dashboard/rounds/${round.id}/summary`}
            color="success"
            variant="flat"
          >
            View Summary
          </Button>
        )}
        <Button as={Link} href="/dashboard/rounds" variant="light" size="sm">
          Back to Rounds
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{round.course.name}</p>
          <p className="text-xs text-default-400">
            {round.tee.teeName} tee &middot; Par {round.tee.par}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Running score */}
          {scoredHolesCount > 0 && (
            <div className="text-right">
              <p className="text-xs text-default-400">Score</p>
              <p className="font-bold">
                <span
                  className={
                    runningStrokes - runningPar < 0
                      ? 'text-golf-fairway'
                      : runningStrokes - runningPar > 0
                        ? 'text-danger'
                        : 'text-default-700'
                  }
                >
                  {formatScoreToPar(runningStrokes, runningPar)}
                </span>
                <span className="ml-1 text-xs font-normal text-default-400">
                  ({runningStrokes})
                </span>
              </p>
            </div>
          )}
          <button
            onClick={() => setShowAbandonConfirm(true)}
            aria-label="Abandon round"
            className="rounded-lg p-1.5 text-default-400 hover:bg-danger/10 hover:text-danger"
          >
            <IconX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
            className={`mb-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
              toast.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}
          >
            {toast.type === 'success' ? (
              <IconCheck className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            ) : (
              <IconX className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hole navigation pills */}
      <div
        className="mb-4 flex gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Hole navigation"
      >
        {teeHoles.map((hole) => {
          const scored = holeStates[hole.holeNumber]?.strokes > 0;
          const active = hole.holeNumber === currentHole;
          return (
            <button
              key={hole.holeNumber}
              role="tab"
              aria-selected={active}
              aria-label={`Hole ${hole.holeNumber}${scored ? ', scored' : ''}`}
              onClick={() => setCurrentHole(hole.holeNumber)}
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                active
                  ? 'bg-golf-green text-white shadow-md'
                  : scored
                    ? 'bg-golf-green/20 text-golf-green'
                    : 'bg-default-100 text-default-500 hover:bg-default-200'
              }`}
            >
              {hole.holeNumber}
            </button>
          );
        })}
      </div>

      {/* Main scoring card */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHole}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            <Card className="mb-4">
              <CardBody className="px-6 py-5">
                {/* Hole header */}
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-default-400">
                      Hole
                    </span>
                    <p className="text-5xl font-extrabold leading-none text-golf-green">
                      {currentHole}
                    </p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div>
                      <p className="text-xs text-default-400 uppercase">Par</p>
                      <p className="text-3xl font-bold">{holeInfo?.par ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-default-400 uppercase">SI</p>
                      <p className="text-3xl font-bold text-default-500">
                        {holeInfo?.strokeIndex ?? '—'}
                      </p>
                    </div>
                    {holeInfo?.distanceMeters && (
                      <div>
                        <p className="text-xs text-default-400 uppercase">Dist</p>
                        <p className="text-lg font-semibold text-default-500">
                          {holeInfo.distanceMeters}
                          <span className="text-xs font-normal"> m</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score label */}
                {state.strokes > 0 && holeInfo && (
                  <div className="mb-4 text-center">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${state.strokes}-${holeInfo.par}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`inline-block rounded-full px-4 py-1.5 text-sm font-bold ${getScoreBgColor(state.strokes, holeInfo.par)}`}
                      >
                        {getScoreName(state.strokes, holeInfo.par)}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}

                {/* Strokes counter */}
                <div className="mb-5">
                  <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-default-400">
                    Strokes
                  </p>
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() =>
                        updateHoleState(currentHole, {
                          strokes: Math.max(0, state.strokes - 1),
                        })
                      }
                      disabled={state.strokes === 0}
                      aria-label="Decrease strokes"
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-default-200 text-2xl font-bold text-default-600 transition-colors hover:bg-default-300 disabled:opacity-30 active:scale-95"
                    >
                      <IconMinus className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={state.strokes}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className={`min-w-[3rem] text-center text-7xl font-extrabold leading-none tabular-nums ${
                          state.strokes === 0
                            ? 'text-default-200'
                            : holeInfo
                              ? state.strokes - holeInfo.par < 0
                                ? 'text-golf-fairway'
                                : state.strokes - holeInfo.par === 0
                                  ? 'text-default-700'
                                  : 'text-danger'
                              : 'text-default-700'
                        }`}
                        aria-live="polite"
                        aria-label={`${state.strokes} strokes`}
                      >
                        {state.strokes === 0 ? '—' : state.strokes}
                      </motion.span>
                    </AnimatePresence>
                    <button
                      onClick={() =>
                        updateHoleState(currentHole, {
                          strokes: Math.min(20, state.strokes + 1),
                        })
                      }
                      disabled={state.strokes >= 20}
                      aria-label="Increase strokes"
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-golf-green text-white transition-colors hover:bg-golf-fairway disabled:opacity-30 active:scale-95"
                    >
                      <IconPlus className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Secondary stats */}
                <div className="flex flex-col gap-3 border-t border-default-200 pt-4">
                  {/* Putts */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Putts</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateHoleState(currentHole, { putts: Math.max(0, state.putts - 1) })
                        }
                        disabled={state.putts === 0}
                        aria-label="Decrease putts"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-default-100 text-default-600 transition-colors hover:bg-default-200 disabled:opacity-30"
                      >
                        <IconMinus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span
                        className="w-8 text-center text-lg font-bold tabular-nums"
                        aria-live="polite"
                        aria-label={`${state.putts} putts`}
                      >
                        {state.putts}
                      </span>
                      <button
                        onClick={() =>
                          updateHoleState(currentHole, {
                            putts: Math.min(10, state.putts + 1),
                          })
                        }
                        disabled={state.putts >= 10}
                        aria-label="Increase putts"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-default-100 text-default-600 transition-colors hover:bg-default-200 disabled:opacity-30"
                      >
                        <IconPlus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Fairway hit — only for par 4 and par 5 */}
                  {holeInfo && holeInfo.par >= 4 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fairway Hit</span>
                      <ToggleButtons
                        value={state.fairwayHit}
                        onChange={(v) => updateHoleState(currentHole, { fairwayHit: v })}
                      />
                    </div>
                  )}

                  {/* GIR */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Green in Regulation</span>
                    <ToggleButtons
                      value={state.greenInReg}
                      onChange={(v) => updateHoleState(currentHole, { greenInReg: v })}
                    />
                  </div>

                  {/* Penalties */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Penalty Strokes</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateHoleState(currentHole, {
                            penaltyStrokes: Math.max(0, state.penaltyStrokes - 1),
                          })
                        }
                        disabled={state.penaltyStrokes === 0}
                        aria-label="Decrease penalty strokes"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-default-100 text-default-600 transition-colors hover:bg-default-200 disabled:opacity-30"
                      >
                        <IconMinus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span
                        className={`w-8 text-center text-lg font-bold tabular-nums ${state.penaltyStrokes > 0 ? 'text-danger' : ''}`}
                        aria-live="polite"
                        aria-label={`${state.penaltyStrokes} penalty strokes`}
                      >
                        {state.penaltyStrokes}
                      </span>
                      <button
                        onClick={() =>
                          updateHoleState(currentHole, {
                            penaltyStrokes: Math.min(10, state.penaltyStrokes + 1),
                          })
                        }
                        disabled={state.penaltyStrokes >= 10}
                        aria-label="Increase penalty strokes"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-default-100 text-default-600 transition-colors hover:bg-default-200 disabled:opacity-30"
                      >
                        <IconPlus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Complete round button */}
      {allHolesScored && (
        <div className="mb-3">
          <Button
            color="success"
            size="lg"
            className="w-full font-semibold"
            onPress={() => void handleCompleteRound()}
            isLoading={isCompleting}
            isDisabled={isCompleting}
            startContent={
              !isCompleting ? <IconCheck className="h-5 w-5" aria-hidden="true" /> : undefined
            }
          >
            {isCompleting ? 'Finishing...' : 'Complete Round'}
          </Button>
        </div>
      )}

      {/* Bottom nav */}
      <div className="sticky bottom-0 flex gap-3 border-t border-default-200 bg-background pb-safe pt-3">
        <Button
          variant="flat"
          size="lg"
          className="flex-1"
          onPress={() => void handleSaveAndNavigate('prev')}
          isDisabled={currentHole === 1 || isSaving}
          startContent={<IconChevronLeft className="h-5 w-5" aria-hidden="true" />}
          aria-label="Previous hole"
        >
          Prev
        </Button>

        <Button
          variant="flat"
          color="success"
          size="lg"
          className="w-12 flex-shrink-0"
          onPress={() => void handleSaveCurrentHole()}
          isLoading={isSaving}
          isDisabled={isSaving || state.strokes === 0}
          aria-label="Save current hole"
        >
          {!isSaving && <IconCheck className="h-5 w-5" aria-hidden="true" />}
        </Button>

        <Button
          color="success"
          size="lg"
          className="flex-1"
          onPress={() => void handleSaveAndNavigate('next')}
          isDisabled={currentHole === totalHoles || isSaving}
          endContent={<IconChevronRight className="h-5 w-5" aria-hidden="true" />}
          aria-label="Next hole"
        >
          Next
        </Button>
      </div>

      {/* Abandon confirmation dialog */}
      {showAbandonConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Abandon round confirmation"
        >
          <Card className="w-full max-w-sm">
            <CardBody className="px-6 py-6">
              <h3 className="mb-2 text-lg font-bold">Abandon Round?</h3>
              <p className="mb-6 text-sm text-default-500">
                Your scores so far will not be saved. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="flat"
                  className="flex-1"
                  onPress={() => setShowAbandonConfirm(false)}
                >
                  Keep Playing
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  className="flex-1"
                  onPress={() => void handleAbandonment()}
                  isLoading={isAbandoning}
                >
                  Abandon
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

// Three-state toggle: null (not set), true (yes), false (no)
function ToggleButtons({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (_v: boolean | null) => void;
}) {
  return (
    <div className="flex rounded-lg border border-default-200 p-0.5" role="group">
      <button
        onClick={() => onChange(value === true ? null : true)}
        aria-pressed={value === true}
        className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
          value === true ? 'bg-success text-white' : 'text-default-500 hover:bg-default-100'
        }`}
      >
        Yes
      </button>
      <button
        onClick={() => onChange(value === false ? null : false)}
        aria-pressed={value === false}
        className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
          value === false ? 'bg-danger text-white' : 'text-default-500 hover:bg-default-100'
        }`}
      >
        No
      </button>
    </div>
  );
}
