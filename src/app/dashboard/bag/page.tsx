'use client';

import { Button, Card, CardBody, Tab, Tabs } from '@heroui/react';
import { IconBackpack, IconCheck, IconGolf, IconPlus, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { ClubCard } from '@/components/bag/club-card';
import { ClubFormModal } from '@/components/bag/club-form-modal';
import type { golfBags, clubs } from '@/lib/drizzle/schema';
import type { ActionResponse } from '@/types';
import type { CreateClubInput, UpdateClubInput } from '@/lib/validations/bag';
import {
  getActiveBag,
  getBags,
  addClub,
  updateClub,
  deleteClub,
  reorderClubs,
  setActiveBag,
} from '@/server/actions/bag';

type Bag = typeof golfBags.$inferSelect;
type Club = typeof clubs.$inferSelect;
type BagWithClubs = Bag & { clubs: Club[] };

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function BagPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bags, setBags] = useState<Bag[]>([]);
  const [activeBag, setActiveBagState] = useState<BagWithClubs | null>(null);
  const [clubList, setClubList] = useState<Club[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingClubId, setDeletingClubId] = useState<string | null>(null);
  const [isSwitchingBag, setIsSwitchingBag] = useState(false);

  const [toast, setToast] = useState<Toast | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function showToast(type: Toast['type'], message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    async function loadData() {
      const [bagsResult, bagResult] = await Promise.all([getBags(), getActiveBag()]);

      if (bagsResult.success) {
        setBags(bagsResult.data);
      }
      if (bagResult.success) {
        setActiveBagState(bagResult.data);
        setClubList(
          [...bagResult.data.clubs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        );
      }
      setIsLoading(false);
    }
    void loadData();
  }, []);

  async function handleSelectBag(bagId: string) {
    if (bagId === activeBag?.id || isSwitchingBag) return;
    setIsSwitchingBag(true);

    const result = await setActiveBag(bagId);
    if (!result.success) {
      showToast('error', result.error);
      setIsSwitchingBag(false);
      return;
    }

    const bagResult = await getActiveBag();
    if (bagResult.success) {
      setActiveBagState(bagResult.data);
      setClubList(
        [...bagResult.data.clubs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      );
    }
    setIsSwitchingBag(false);
  }

  function handleOpenAddModal() {
    setEditingClub(null);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(club: Club) {
    setEditingClub(club);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingClub(null);
  }

  async function handleSaveClub(data: CreateClubInput | UpdateClubInput) {
    if (!activeBag) return;
    setIsSaving(true);

    let result: ActionResponse<Club>;

    if (editingClub) {
      result = await updateClub(editingClub.id, data as UpdateClubInput);
    } else {
      result = await addClub(activeBag.id, data as CreateClubInput);
    }

    setIsSaving(false);

    if (!result.success) {
      showToast('error', result.error);
      return;
    }

    if (editingClub) {
      setClubList((prev) => prev.map((c) => (c.id === editingClub.id ? result.data : c)));
      showToast('success', 'Club updated.');
    } else {
      setClubList((prev) => [...prev, result.data]);
      showToast('success', 'Club added to bag.');
    }

    handleCloseModal();
  }

  async function handleDeleteClub(clubId: string) {
    setDeletingClubId(clubId);

    const result = await deleteClub(clubId);
    setDeletingClubId(null);

    if (!result.success) {
      showToast('error', result.error);
      return;
    }

    setClubList((prev) => prev.filter((c) => c.id !== clubId));
    showToast('success', 'Club removed from bag.');
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = clubList.findIndex((c) => c.id === active.id);
    const newIndex = clubList.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(clubList, oldIndex, newIndex);
    setClubList(reordered);

    const reorderData = reordered.map((c, index) => ({ clubId: c.id, sortOrder: index }));
    const result = await reorderClubs(reorderData);

    if (!result.success) {
      // Revert on failure
      setClubList(clubList);
      showToast('error', result.error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconGolf className="h-8 w-8 animate-pulse text-golf-green" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Golf Bag</h1>
          {activeBag && <p className="mt-1 text-default-500">{activeBag.name}</p>}
        </div>
        <Button
          color="success"
          onPress={handleOpenAddModal}
          isDisabled={!activeBag}
          startContent={<IconPlus className="h-4 w-4" aria-hidden="true" />}
          aria-label="Add a new club"
        >
          Add Club
        </Button>
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
            className={`mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
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

      {/* Bag selector — only show if user has multiple bags */}
      {bags.length > 1 && (
        <div className="mb-6">
          <Tabs
            aria-label="Select golf bag"
            selectedKey={activeBag?.id ?? ''}
            onSelectionChange={(key) => void handleSelectBag(String(key))}
            color="success"
            variant="underlined"
            isDisabled={isSwitchingBag}
          >
            {bags.map((bag) => (
              <Tab
                key={bag.id}
                title={
                  <div className="flex items-center gap-2">
                    <IconBackpack className="h-4 w-4" aria-hidden="true" />
                    {bag.name}
                  </div>
                }
              />
            ))}
          </Tabs>
        </div>
      )}

      {/* No bag state */}
      {!activeBag ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-golf-sky/20">
              <IconBackpack className="h-8 w-8 text-golf-sky opacity-70" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">No bag found</p>
              <p className="mt-1 text-sm text-default-500">
                Complete your profile setup to create your first golf bag.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : clubList.length === 0 ? (
        /* Empty bag state */
        <Card>
          <CardBody className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-golf-green/10">
              <IconBackpack className="h-8 w-8 text-golf-green opacity-60" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">Your bag is empty</p>
              <p className="mt-1 text-sm text-default-500">
                Add your clubs to track distances and manage your equipment.
              </p>
            </div>
            <Button
              color="success"
              variant="flat"
              onPress={handleOpenAddModal}
              startContent={<IconPlus className="h-4 w-4" aria-hidden="true" />}
            >
              Add Your First Club
            </Button>
          </CardBody>
        </Card>
      ) : (
        /* Club list with drag-and-drop */
        <section aria-label="Club list">
          <p className="mb-3 text-sm text-default-400">
            {clubList.length} {clubList.length === 1 ? 'club' : 'clubs'} &mdash; drag to reorder
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={clubList.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {clubList.map((club) => (
                  <ClubCard
                    key={club.id}
                    club={club}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteClub}
                    isDeleting={deletingClubId === club.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      )}

      {/* Add / Edit modal */}
      {activeBag && (
        <ClubFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          bag={activeBag}
          club={editingClub}
          onSave={handleSaveClub}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
