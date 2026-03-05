import type { ClubType } from '@/types';

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const CLUB_TYPE_LABELS: Record<ClubType, string> = {
  driver: 'Driver',
  '3_wood': '3 Wood',
  '5_wood': '5 Wood',
  '7_wood': '7 Wood',
  '2_hybrid': '2 Hybrid',
  '3_hybrid': '3 Hybrid',
  '4_hybrid': '4 Hybrid',
  '5_hybrid': '5 Hybrid',
  '2_iron': '2 Iron',
  '3_iron': '3 Iron',
  '4_iron': '4 Iron',
  '5_iron': '5 Iron',
  '6_iron': '6 Iron',
  '7_iron': '7 Iron',
  '8_iron': '8 Iron',
  '9_iron': '9 Iron',
  pitching_wedge: 'PW',
  gap_wedge: 'GW',
  sand_wedge: 'SW',
  lob_wedge: 'LW',
  putter: 'Putter',
};

export function getClubTypeLabel(type: ClubType): string {
  return CLUB_TYPE_LABELS[type];
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export type ClubCategory = 'wood' | 'hybrid' | 'iron' | 'wedge' | 'putter';

const CLUB_TYPE_CATEGORIES: Record<ClubType, ClubCategory> = {
  driver: 'wood',
  '3_wood': 'wood',
  '5_wood': 'wood',
  '7_wood': 'wood',
  '2_hybrid': 'hybrid',
  '3_hybrid': 'hybrid',
  '4_hybrid': 'hybrid',
  '5_hybrid': 'hybrid',
  '2_iron': 'iron',
  '3_iron': 'iron',
  '4_iron': 'iron',
  '5_iron': 'iron',
  '6_iron': 'iron',
  '7_iron': 'iron',
  '8_iron': 'iron',
  '9_iron': 'iron',
  pitching_wedge: 'wedge',
  gap_wedge: 'wedge',
  sand_wedge: 'wedge',
  lob_wedge: 'wedge',
  putter: 'putter',
};

export function getClubTypeCategory(type: ClubType): ClubCategory {
  return CLUB_TYPE_CATEGORIES[type];
}

// ---------------------------------------------------------------------------
// Icon names
// Each key maps to an @tabler/icons-react component name string.
// The bag/club-card component imports and renders the actual component.
// ---------------------------------------------------------------------------

export type ClubIconName =
  | 'IconBallTennis'
  | 'IconTriangleSquareCircle'
  | 'IconCircleHalf'
  | 'IconTarget'
  | 'IconCircleDot';

const CLUB_TYPE_ICONS: Record<ClubCategory, ClubIconName> = {
  wood: 'IconBallTennis',
  hybrid: 'IconTriangleSquareCircle',
  iron: 'IconCircleHalf',
  wedge: 'IconTarget',
  putter: 'IconCircleDot',
};

export function getClubTypeIconName(type: ClubType): ClubIconName {
  return CLUB_TYPE_ICONS[getClubTypeCategory(type)];
}

// ---------------------------------------------------------------------------
// Grouped options for form selects
// ---------------------------------------------------------------------------

export interface ClubTypeOption {
  value: ClubType;
  label: string;
  category: ClubCategory;
}

export interface ClubTypeGroup {
  label: string;
  options: ClubTypeOption[];
}

export const CLUB_TYPE_GROUPS: ClubTypeGroup[] = [
  {
    label: 'Woods',
    options: (['driver', '3_wood', '5_wood', '7_wood'] as ClubType[]).map((t) => ({
      value: t,
      label: getClubTypeLabel(t),
      category: getClubTypeCategory(t),
    })),
  },
  {
    label: 'Hybrids',
    options: (['2_hybrid', '3_hybrid', '4_hybrid', '5_hybrid'] as ClubType[]).map((t) => ({
      value: t,
      label: getClubTypeLabel(t),
      category: getClubTypeCategory(t),
    })),
  },
  {
    label: 'Irons',
    options: (
      ['2_iron', '3_iron', '4_iron', '5_iron', '6_iron', '7_iron', '8_iron', '9_iron'] as ClubType[]
    ).map((t) => ({
      value: t,
      label: getClubTypeLabel(t),
      category: getClubTypeCategory(t),
    })),
  },
  {
    label: 'Wedges',
    options: (['pitching_wedge', 'gap_wedge', 'sand_wedge', 'lob_wedge'] as ClubType[]).map(
      (t) => ({
        value: t,
        label: getClubTypeLabel(t),
        category: getClubTypeCategory(t),
      }),
    ),
  },
  {
    label: 'Putter',
    options: [
      {
        value: 'putter' as ClubType,
        label: getClubTypeLabel('putter'),
        category: getClubTypeCategory('putter'),
      },
    ],
  },
];
