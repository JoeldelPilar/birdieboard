/**
 * Match utility helpers — labels, icons, and colors for match formats and statuses.
 */

export function getFormatLabel(format: string): string {
  switch (format) {
    case 'stroke_play':
      return 'Stroke Play';
    case 'match_play':
      return 'Match Play';
    case 'stableford':
      return 'Stableford';
    case 'best_ball':
      return 'Best Ball';
    case 'scramble':
      return 'Scramble';
    default:
      return format;
  }
}

export function getFormatIconName(format: string): string {
  switch (format) {
    case 'stroke_play':
      return 'IconGolf';
    case 'match_play':
      return 'IconSwords';
    case 'stableford':
      return 'IconStars';
    case 'best_ball':
      return 'IconUsers';
    case 'scramble':
      return 'IconRefresh';
    default:
      return 'IconGolf';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-default-200 text-default-600';
    case 'open':
      return 'bg-golf-sky/20 text-blue-600';
    case 'in_progress':
      return 'bg-warning/20 text-warning-600';
    case 'completed':
      return 'bg-success/20 text-success-600';
    case 'cancelled':
      return 'bg-danger/20 text-danger-600';
    default:
      return 'bg-default-200 text-default-600';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

export function getStatusChipColor(
  status: string,
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'draft':
      return 'default';
    case 'open':
      return 'primary';
    case 'in_progress':
      return 'warning';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'default';
  }
}

export function formatMatchDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
