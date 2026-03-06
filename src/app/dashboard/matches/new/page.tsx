'use client';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  Spinner,
  Switch,
} from '@heroui/react';
import { TextInput } from '@/components/ui/text-input';
import {
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconClock,
  IconGolf,
  IconMapPin,
  IconSearch,
  IconTrophy,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchCourses, getCourseDetails } from '@/server/actions/courses';
import { createMatch } from '@/server/actions/matches';
import type { CourseSearchResult } from '@/server/actions/courses';
import type { CreateMatchInput } from '@/lib/validations/match';

const FORMAT_OPTIONS: { value: CreateMatchInput['format']; label: string }[] = [
  { value: 'stroke_play', label: 'Stroke Play' },
  { value: 'match_play', label: 'Match Play' },
  { value: 'stableford', label: 'Stableford' },
  { value: 'skins', label: 'Skins' },
];

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewMatchPage() {
  const router = useRouter();

  // Form fields
  const [name, setName] = useState('');
  const [matchDate, setMatchDate] = useState(todayDateString());
  const [teeTime, setTeeTime] = useState('');
  const [format, setFormat] = useState<CreateMatchInput['format']>('stroke_play');
  const [scoringType, setScoringType] = useState<'gross' | 'net'>('gross');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);

  // Course search
  const [selectedCourse, setSelectedCourse] = useState<CourseSearchResult | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CourseSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);

  // Submission
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selectedCourse) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void runSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedCourse]);

  async function runSearch(q: string) {
    setIsSearching(true);
    const result = await searchCourses(q.trim());
    setIsSearching(false);
    setHasSearched(true);
    if (result.success) {
      setSearchResults(result.data);
    }
  }

  async function handleSelectCourse(course: CourseSearchResult) {
    setIsLoadingCourse(true);
    const result = await getCourseDetails(course.id);
    setIsLoadingCourse(false);

    if (!result.success) {
      setError('Failed to load course details.');
      return;
    }

    setSelectedCourse(course);
    setQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setFieldErrors((prev) => ({ ...prev, courseId: '' }));
  }

  function handleClearCourse() {
    setSelectedCourse(null);
    setQuery('');
    setSearchResults([]);
    setHasSearched(false);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
    if (name.trim().length > 100) errors.name = 'Name must be 100 characters or less.';
    if (!selectedCourse) errors.courseId = 'Please select a course.';
    if (!matchDate) errors.matchDate = 'Please choose a date.';
    if (maxPlayers < 2 || maxPlayers > 20) errors.maxPlayers = 'Players must be between 2 and 20.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreate() {
    if (!validate() || !selectedCourse) return;

    setIsCreating(true);
    setError(null);

    const input: CreateMatchInput = {
      name: name.trim(),
      courseId: selectedCourse.id,
      matchDate,
      format,
      scoringType,
      maxPlayers,
      isPrivate,
    };

    if (teeTime) {
      input.teeTime = teeTime;
    }

    const result = await createMatch(input);

    setIsCreating(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/dashboard/matches/${result.data.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          as="a"
          href="/dashboard/matches"
          variant="light"
          size="sm"
          startContent={<IconArrowLeft className="h-4 w-4" aria-hidden="true" />}
          className="mb-4 text-default-500"
        >
          Back to matches
        </Button>
        <h1 className="text-3xl font-bold">Create Match</h1>
        <p className="mt-1 text-default-500">Set up a match and invite your friends.</p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
        >
          <IconX className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Match name & dates */}
      <Card className="mb-4">
        <CardHeader className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <IconTrophy className="h-4 w-4 text-golf-green" aria-hidden="true" />
            <h2 className="text-base font-semibold">Match Details</h2>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 px-6 pb-5">
          <TextInput
            label="Match name"
            placeholder="e.g. Sunday Stableford"
            value={name}
            onValueChange={(v) => {
              setName(v);
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
            }}
            isInvalid={!!fieldErrors.name}
            errorMessage={fieldErrors.name}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              type="date"
              label="Date"
              value={matchDate}
              onValueChange={(v) => {
                setMatchDate(v);
                if (fieldErrors.matchDate) setFieldErrors((prev) => ({ ...prev, matchDate: '' }));
              }}
              isInvalid={!!fieldErrors.matchDate}
              errorMessage={fieldErrors.matchDate}
              startContent={<IconCalendar className="h-4 w-4" aria-hidden="true" />}
            />
            <TextInput
              type="time"
              label="Tee time (optional)"
              value={teeTime}
              onValueChange={setTeeTime}
              startContent={<IconClock className="h-4 w-4" aria-hidden="true" />}
            />
          </div>
        </CardBody>
      </Card>

      {/* Course */}
      <Card className="mb-4">
        <CardHeader className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <IconGolf className="h-4 w-4 text-golf-green" aria-hidden="true" />
            <h2 className="text-base font-semibold">Course</h2>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-5">
          {fieldErrors.courseId && (
            <p className="mb-3 text-sm text-danger" role="alert">
              {fieldErrors.courseId}
            </p>
          )}

          {isLoadingCourse ? (
            <div className="flex items-center justify-center py-8">
              <Spinner color="success" size="md" aria-label="Loading course" />
            </div>
          ) : selectedCourse ? (
            <div className="flex items-start justify-between gap-4 rounded-xl bg-golf-green/5 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 flex-shrink-0 text-golf-green" aria-hidden="true" />
                  <p className="truncate font-semibold">{selectedCourse.name}</p>
                </div>
                {selectedCourse.clubName && selectedCourse.clubName !== selectedCourse.name && (
                  <p className="ml-6 mt-0.5 truncate text-sm text-default-500">
                    {selectedCourse.clubName}
                  </p>
                )}
                {(selectedCourse.city ?? selectedCourse.country) && (
                  <div className="ml-6 mt-1 flex items-center gap-1 text-xs text-default-400">
                    <IconMapPin className="h-3 w-3" aria-hidden="true" />
                    {[selectedCourse.city, selectedCourse.country].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
              <button
                onClick={handleClearCourse}
                aria-label="Change course"
                className="flex-shrink-0 text-default-400 hover:text-default-600"
              >
                <IconX className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div>
              <TextInput
                label="Search courses"
                placeholder="Course name, club, or city..."
                value={query}
                onValueChange={setQuery}
                startContent={<IconSearch className="h-4 w-4" aria-hidden="true" />}
                endContent={
                  query.length > 0 ? (
                    <button
                      onClick={() => setQuery('')}
                      aria-label="Clear search"
                      className="hover:text-white/60"
                    >
                      <IconX className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null
                }
                className="mb-3"
              />

              {isSearching && (
                <div className="flex items-center justify-center py-6">
                  <Spinner color="success" size="sm" aria-label="Searching" />
                </div>
              )}

              {!isSearching && hasSearched && searchResults.length === 0 && (
                <p className="py-4 text-center text-sm text-default-400">No courses found.</p>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {searchResults.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => void handleSelectCourse(course)}
                      className="flex items-center justify-between gap-4 rounded-xl border border-default-200 px-4 py-3 text-left transition-colors hover:border-golf-green/50 hover:bg-golf-green/5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{course.name}</p>
                        {(course.city ?? course.country) && (
                          <p className="mt-0.5 truncate text-xs text-default-400">
                            {[course.city, course.country].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="flex-shrink-0 text-xs text-default-400">
                        {course.holeCount ?? 18}H
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {!hasSearched && (
                <p className="py-4 text-center text-sm text-default-400">
                  Type at least 2 characters to search.
                </p>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Format & settings */}
      <Card className="mb-6">
        <CardHeader className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <IconUsers className="h-4 w-4 text-golf-green" aria-hidden="true" />
            <h2 className="text-base font-semibold">Format &amp; Settings</h2>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 px-6 pb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Format"
              selectedKeys={[format]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as CreateMatchInput['format'];
                if (value) setFormat(value);
              }}
            >
              {FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>

            <Select
              label="Scoring type"
              selectedKeys={[scoringType]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as 'gross' | 'net';
                if (value) setScoringType(value);
              }}
            >
              <SelectItem key="gross">Gross</SelectItem>
              <SelectItem key="net">Net</SelectItem>
            </Select>
          </div>

          <TextInput
            type="number"
            label="Max players"
            value={String(maxPlayers)}
            onValueChange={(v) => {
              const num = parseInt(v, 10);
              if (!isNaN(num)) setMaxPlayers(num);
              if (fieldErrors.maxPlayers) setFieldErrors((prev) => ({ ...prev, maxPlayers: '' }));
            }}
            min={2}
            max={20}
            isInvalid={!!fieldErrors.maxPlayers}
            errorMessage={fieldErrors.maxPlayers}
            startContent={<IconUsers className="h-4 w-4" aria-hidden="true" />}
          />

          <div className="flex items-center justify-between rounded-xl border border-default-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Private match</p>
              <p className="text-xs text-default-400">Only invited players can see this match</p>
            </div>
            <Switch
              isSelected={isPrivate}
              onValueChange={setIsPrivate}
              color="success"
              aria-label="Toggle private match"
            />
          </div>
        </CardBody>
      </Card>

      {/* Submit */}
      <Button
        color="success"
        size="lg"
        className="w-full font-semibold"
        onPress={() => void handleCreate()}
        isLoading={isCreating}
        isDisabled={isCreating}
        startContent={
          !isCreating ? <IconTrophy className="h-5 w-5" aria-hidden="true" /> : undefined
        }
      >
        {isCreating ? 'Creating...' : 'Create Match'}
      </Button>
    </div>
  );
}
