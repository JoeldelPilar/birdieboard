'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  SelectSection,
} from '@heroui/react';
import { TextInput } from '@/components/ui/text-input';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import type { CreateClubInput, UpdateClubInput } from '@/lib/validations/bag';
import type { ClubType, ShaftFlex, ShaftType } from '@/types';
import { CLUB_TYPE_GROUPS, getClubTypeLabel } from '@/utils/club-helpers';
import type { golfBags, clubs } from '@/lib/drizzle/schema';

type Club = typeof clubs.$inferSelect;
type Bag = typeof golfBags.$inferSelect;

interface ClubFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bag: Bag;
  club?: Club | null;
  onSave: (_data: CreateClubInput | UpdateClubInput) => Promise<void>;
  isSaving: boolean;
}

interface FormState {
  clubType: ClubType | '';
  brand: string;
  model: string;
  loft: string;
  carryDistance: string;
  totalDistance: string;
  shaftType: ShaftType | '';
  shaftFlex: ShaftFlex | '';
}

const EMPTY_FORM: FormState = {
  clubType: '',
  brand: '',
  model: '',
  loft: '',
  carryDistance: '',
  totalDistance: '',
  shaftType: '',
  shaftFlex: '',
};

const SHAFT_TYPE_OPTIONS: { value: ShaftType; label: string }[] = [
  { value: 'steel', label: 'Steel' },
  { value: 'graphite', label: 'Graphite' },
];

const SHAFT_FLEX_OPTIONS: { value: ShaftFlex; label: string }[] = [
  { value: 'ladies', label: 'L — Ladies' },
  { value: 'senior', label: 'A — Senior' },
  { value: 'regular', label: 'R — Regular' },
  { value: 'stiff', label: 'S — Stiff' },
  { value: 'x_stiff', label: 'X — Extra Stiff' },
];

export function ClubFormModal({
  isOpen,
  onClose,
  bag,
  club,
  onSave,
  isSaving,
}: ClubFormModalProps) {
  const isEditing = !!club;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Populate form when editing an existing club
  useEffect(() => {
    if (club) {
      setForm({
        clubType: (club.clubType as ClubType) || '',
        brand: club.brand ?? '',
        model: club.model ?? '',
        loft: club.loft != null ? String(club.loft) : '',
        carryDistance: club.carryDistance != null ? String(club.carryDistance) : '',
        totalDistance: club.totalDistance != null ? String(club.totalDistance) : '',
        shaftType: (club.shaftType as ShaftType) || '',
        shaftFlex: (club.shaftFlex as ShaftFlex) || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [club, isOpen]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.clubType) {
      newErrors.clubType = 'Please select a club type.';
    }
    if (!form.brand.trim()) {
      newErrors.brand = 'Brand is required.';
    }
    if (!form.model.trim()) {
      newErrors.model = 'Model is required.';
    }

    const loftNum = form.loft.trim() !== '' ? parseFloat(form.loft) : undefined;
    if (loftNum !== undefined && (isNaN(loftNum) || loftNum < 0 || loftNum > 80)) {
      newErrors.loft = 'Loft must be between 0 and 80 degrees.';
    }

    const carryNum =
      form.carryDistance.trim() !== '' ? parseInt(form.carryDistance, 10) : undefined;
    if (carryNum !== undefined && (isNaN(carryNum) || carryNum < 0 || carryNum > 400)) {
      newErrors.carryDistance = 'Carry distance must be between 0 and 400 m.';
    }

    const totalNum =
      form.totalDistance.trim() !== '' ? parseInt(form.totalDistance, 10) : undefined;
    if (totalNum !== undefined && (isNaN(totalNum) || totalNum < 0 || totalNum > 500)) {
      newErrors.totalDistance = 'Total distance must be between 0 and 500 m.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const loftNum = form.loft.trim() !== '' ? parseFloat(form.loft) : undefined;
    const carryNum =
      form.carryDistance.trim() !== '' ? parseInt(form.carryDistance, 10) : undefined;
    const totalNum =
      form.totalDistance.trim() !== '' ? parseInt(form.totalDistance, 10) : undefined;

    const data: CreateClubInput | UpdateClubInput = {
      clubType: form.clubType as ClubType,
      brand: form.brand.trim(),
      model: form.model.trim(),
      ...(loftNum !== undefined && { loft: loftNum }),
      ...(carryNum !== undefined && { carryDistance: carryNum }),
      ...(totalNum !== undefined && { totalDistance: totalNum }),
      ...(form.shaftType && { shaftType: form.shaftType }),
      ...(form.shaftFlex && { shaftFlex: form.shaftFlex }),
    };

    await onSave(data);
  }

  function handleClose() {
    if (!isSaving) {
      setForm(EMPTY_FORM);
      setErrors({});
      onClose();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      aria-labelledby="club-form-modal-title"
    >
      <ModalContent>
        <ModalHeader id="club-form-modal-title">
          {isEditing
            ? `Edit ${getClubTypeLabel(club.clubType as ClubType)}`
            : `Add Club to ${bag.name}`}
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4 pb-2">
          {/* Club type */}
          <Select
            label="Club Type"
            placeholder="Select a club type"
            selectedKeys={form.clubType ? new Set([form.clubType]) : new Set()}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as ClubType;
              updateField('clubType', value ?? '');
            }}
            isInvalid={!!errors.clubType}
            errorMessage={errors.clubType}
            isRequired
            aria-label="Club type"
          >
            {CLUB_TYPE_GROUPS.map((group) => (
              <SelectSection key={group.label} title={group.label} showDivider>
                {group.options.map((opt) => (
                  <SelectItem key={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectSection>
            ))}
          </Select>

          {/* Brand + Model */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Brand"
              placeholder="e.g. Titleist"
              value={form.brand}
              onValueChange={(v) => updateField('brand', v)}
              isRequired
              isInvalid={!!errors.brand}
              errorMessage={errors.brand}
            />
            <TextInput
              label="Model"
              placeholder="e.g. TSR3"
              value={form.model}
              onValueChange={(v) => updateField('model', v)}
              isRequired
              isInvalid={!!errors.model}
              errorMessage={errors.model}
            />
          </div>

          {/* Loft */}
          <TextInput
            label="Loft"
            placeholder="e.g. 10.5"
            type="number"
            min={0}
            max={80}
            step={0.5}
            value={form.loft}
            onValueChange={(v) => updateField('loft', v)}
            isInvalid={!!errors.loft}
            errorMessage={errors.loft}
            description="Optional. Degrees."
            endContent={<span className="text-sm">&deg;</span>}
          />

          {/* Distances */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Carry Distance"
              placeholder="e.g. 240"
              type="number"
              min={0}
              max={400}
              value={form.carryDistance}
              onValueChange={(v) => updateField('carryDistance', v)}
              isInvalid={!!errors.carryDistance}
              errorMessage={errors.carryDistance}
              description="Optional."
              endContent={<span className="text-sm">m</span>}
            />
            <TextInput
              label="Total Distance"
              placeholder="e.g. 265"
              type="number"
              min={0}
              max={500}
              value={form.totalDistance}
              onValueChange={(v) => updateField('totalDistance', v)}
              isInvalid={!!errors.totalDistance}
              errorMessage={errors.totalDistance}
              description="Optional."
              endContent={<span className="text-sm">m</span>}
            />
          </div>

          {/* Shaft */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Shaft Type"
              placeholder="Select shaft material"
              selectedKeys={form.shaftType ? new Set([form.shaftType]) : new Set()}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as ShaftType | undefined;
                updateField('shaftType', value ?? '');
              }}
              aria-label="Shaft type"
            >
              {SHAFT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="Shaft Flex"
              placeholder="Select shaft flex"
              selectedKeys={form.shaftFlex ? new Set([form.shaftFlex]) : new Set()}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as ShaftFlex | undefined;
                updateField('shaftFlex', value ?? '');
              }}
              aria-label="Shaft flex"
            >
              {SHAFT_FLEX_OPTIONS.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="flat"
            onPress={handleClose}
            isDisabled={isSaving}
            startContent={<IconX className="h-4 w-4" aria-hidden="true" />}
          >
            Cancel
          </Button>
          <Button
            color="success"
            onPress={handleSave}
            isLoading={isSaving}
            isDisabled={isSaving}
            startContent={
              !isSaving ? <IconCheck className="h-4 w-4" aria-hidden="true" /> : undefined
            }
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Club'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
