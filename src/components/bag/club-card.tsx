'use client';

import { Button, Card, CardBody } from '@heroui/react';
import {
  IconBallTennis,
  IconCircleDot,
  IconCircleHalf2,
  IconEdit,
  IconGripVertical,
  IconTarget,
  IconTriangleSquareCircle,
  IconTrash,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { clubs } from '@/lib/drizzle/schema';
import type { ClubType } from '@/types';
import { getClubTypeCategory, getClubTypeLabel } from '@/utils/club-helpers';

type Club = typeof clubs.$inferSelect;

interface ClubCardProps {
  club: Club;
  onEdit: (_club: Club) => void;
  onDelete: (_clubId: string) => void;
  isDeleting: boolean;
}

function ClubIcon({ clubType }: { clubType: string }) {
  const category = getClubTypeCategory(clubType as ClubType);

  const iconProps = { className: 'h-5 w-5', 'aria-hidden': true as const };

  switch (category) {
    case 'wood':
      return <IconBallTennis {...iconProps} />;
    case 'hybrid':
      return <IconTriangleSquareCircle {...iconProps} />;
    case 'iron':
      return <IconCircleHalf2 {...iconProps} />;
    case 'wedge':
      return <IconTarget {...iconProps} />;
    case 'putter':
      return <IconCircleDot {...iconProps} />;
    default:
      return <IconBallTennis {...iconProps} />;
  }
}

function categoryColor(clubType: string): string {
  const category = getClubTypeCategory(clubType as ClubType);
  switch (category) {
    case 'wood':
      return 'bg-golf-green/10 text-golf-green';
    case 'hybrid':
      return 'bg-golf-fairway/10 text-golf-fairway';
    case 'iron':
      return 'bg-golf-sky/20 text-golf-sky';
    case 'wedge':
      return 'bg-golf-sand/20 text-golf-sand';
    case 'putter':
      return 'bg-default-100 text-default-500';
    default:
      return 'bg-default-100 text-default-500';
  }
}

export function ClubCard({ club, onEdit, onDelete, isDeleting }: ClubCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: club.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label = getClubTypeLabel(club.clubType as ClubType);
  const hasDistance = club.carryDistance != null || club.totalDistance != null;
  const hasShaft = club.shaftType != null || club.shaftFlex != null;

  function shaftFlexLabel(flex: string | null): string {
    switch (flex) {
      case 'ladies':
        return 'L';
      case 'senior':
        return 'A';
      case 'regular':
        return 'R';
      case 'stiff':
        return 'S';
      case 'x_stiff':
        return 'X';
      default:
        return flex ?? '';
    }
  }

  function shaftTypeLabel(type: string | null): string {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: isDragging ? 1.02 : 1 }}
      transition={{ duration: 0.15 }}
      layout
    >
      <Card
        className={`border border-default-200 transition-shadow ${isDragging ? 'shadow-lg' : 'hover:shadow-sm'}`}
      >
        <CardBody className="flex flex-row items-center gap-3 px-4 py-3">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab touch-none rounded p-1 text-default-300 hover:text-default-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green active:cursor-grabbing"
            aria-label={`Drag to reorder ${label}`}
          >
            <IconGripVertical className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Club type icon */}
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${categoryColor(club.clubType)}`}
          >
            <ClubIcon clubType={club.clubType} />
          </div>

          {/* Club details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-default-400">
                {label}
              </span>
              {club.loft != null && (
                <span className="text-xs text-default-400">{club.loft}&deg;</span>
              )}
            </div>
            <p className="truncate font-semibold leading-tight">
              {club.brand} {club.model}
            </p>
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-default-400">
              {hasDistance && (
                <span>
                  {club.carryDistance != null && (
                    <>
                      <span className="font-medium text-default-600">{club.carryDistance}</span>
                      {' carry'}
                    </>
                  )}
                  {club.carryDistance != null && club.totalDistance != null && ' · '}
                  {club.totalDistance != null && (
                    <>
                      <span className="font-medium text-default-600">{club.totalDistance}</span>
                      {' total '}
                      <span>m</span>
                    </>
                  )}
                </span>
              )}
              {hasShaft && (
                <span>
                  {shaftTypeLabel(club.shaftType)}
                  {club.shaftType && club.shaftFlex ? ' · ' : ''}
                  {club.shaftFlex ? shaftFlexLabel(club.shaftFlex) : ''}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 items-center gap-1">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => onEdit(club)}
              aria-label={`Edit ${label} ${club.brand} ${club.model}`}
            >
              <IconEdit className="h-4 w-4 text-default-400" aria-hidden="true" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              color="danger"
              onPress={() => onDelete(club.id)}
              isLoading={isDeleting}
              aria-label={`Delete ${label} ${club.brand} ${club.model}`}
            >
              {!isDeleting && <IconTrash className="h-4 w-4 text-danger-400" aria-hidden="true" />}
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
