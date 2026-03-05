/**
 * Golf score utilities — score names, colors, and formatting.
 */

export function getScoreName(strokes: number, par: number): string {
  const diff = strokes - par;
  if (diff <= -3) return 'Albatross';
  if (diff === -2) return 'Eagle';
  if (diff === -1) return 'Birdie';
  if (diff === 0) return 'Par';
  if (diff === 1) return 'Bogey';
  if (diff === 2) return 'Double Bogey';
  if (diff === 3) return 'Triple Bogey';
  return `+${diff}`;
}

export function getScoreColor(strokes: number, par: number): string {
  const diff = strokes - par;
  if (diff <= -2) return 'text-yellow-500';
  if (diff === -1) return 'text-golf-fairway';
  if (diff === 0) return 'text-default-700';
  if (diff === 1) return 'text-danger';
  if (diff === 2) return 'text-danger/80';
  return 'text-danger/60';
}

export function getScoreBgColor(strokes: number, par: number): string {
  const diff = strokes - par;
  if (diff <= -2) return 'bg-yellow-500/20 text-yellow-600';
  if (diff === -1) return 'bg-golf-fairway/15 text-golf-fairway';
  if (diff === 0) return 'bg-default-200 text-default-700';
  if (diff === 1) return 'bg-danger/15 text-danger';
  if (diff === 2) return 'bg-danger/20 text-danger';
  return 'bg-danger/25 text-danger';
}

export function formatScoreToPar(total: number, par: number): string {
  const diff = total - par;
  if (diff === 0) return 'E';
  if (diff > 0) return `+${diff}`;
  return String(diff);
}

export function calculateStableford(
  strokes: number,
  par: number,
  strokeIndex: number,
  handicap: number,
): number {
  const shots = Math.floor(handicap / 18) + (strokeIndex <= handicap % 18 ? 1 : 0);
  const netStrokes = strokes - shots;
  const points = par + 1 - netStrokes;
  return Math.max(0, points);
}
