'use client';

import { Button, Card, CardBody, CardHeader, Spinner } from '@heroui/react';
import { TextInput } from '@/components/ui/text-input';
import {
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconGolf,
  IconMapPin,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CountrySelect } from '@/components/profile/country-select';
import { searchCourses, getCourseDetails } from '@/server/actions/courses';
import { startRound } from '@/server/actions/rounds';
import type { CourseSearchResult, CourseWithDetails } from '@/server/actions/courses';

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewRoundPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCourseId = searchParams.get('courseId');
  const urlTeeId = searchParams.get('teeId');

  const [roundDate, setRoundDate] = useState(todayDateString());
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Course selection state
  const [selectedCourse, setSelectedCourse] = useState<CourseWithDetails | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string>(urlTeeId ?? '');
  const [isLoadingCourse, setIsLoadingCourse] = useState(!!urlCourseId);

  // Search state
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [searchResults, setSearchResults] = useState<CourseSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load course from URL params
  useEffect(() => {
    if (!urlCourseId) return;

    async function loadCourse() {
      setIsLoadingCourse(true);
      const result = await getCourseDetails(urlCourseId!);
      setIsLoadingCourse(false);

      if (result.success) {
        setSelectedCourse(result.data);
        if (urlTeeId && result.data.tees.some((t) => t.id === urlTeeId)) {
          setSelectedTeeId(urlTeeId);
        } else if (result.data.tees[0]) {
          setSelectedTeeId(result.data.tees[0].id);
        }
      }
    }

    void loadCourse();
  }, [urlCourseId, urlTeeId]);

  // Debounced search
  useEffect(() => {
    if (selectedCourse) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void runSearch(query, country);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, country, selectedCourse]);

  async function runSearch(q: string, c: string) {
    setIsSearching(true);
    const result = await searchCourses(q.trim(), c || undefined);
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

    setSelectedCourse(result.data);
    setSelectedTeeId(result.data.tees[0]?.id ?? '');
    setQuery('');
    setSearchResults([]);
    setHasSearched(false);
  }

  function handleClearCourse() {
    setSelectedCourse(null);
    setSelectedTeeId('');
    setError(null);
    router.replace('/dashboard/rounds/new');
  }

  async function handleStartRound() {
    if (!selectedCourse || !selectedTeeId) return;

    setIsStarting(true);
    setError(null);

    const result = await startRound({
      courseId: selectedCourse.id,
      teeId: selectedTeeId,
      roundDate,
    });

    setIsStarting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/dashboard/rounds/${result.data.id}`);
  }

  const selectedTee = selectedCourse?.tees.find((t) => t.id === selectedTeeId);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          as="a"
          href="/dashboard/rounds"
          variant="light"
          size="sm"
          startContent={<IconArrowLeft className="h-4 w-4" aria-hidden="true" />}
          className="mb-4 text-default-500"
        >
          Back to rounds
        </Button>
        <h1 className="text-3xl font-bold">New Round</h1>
        <p className="mt-1 text-default-500">Choose a course and tee to get started.</p>
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

      {/* Date picker */}
      <Card className="mb-4">
        <CardHeader className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-golf-green" aria-hidden="true" />
            <h2 className="text-base font-semibold">Round Date</h2>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-5">
          <TextInput
            type="date"
            label="Date"
            value={roundDate}
            onValueChange={setRoundDate}
            max={todayDateString()}
          />
        </CardBody>
      </Card>

      {/* Course selection */}
      <Card className="mb-6">
        <CardHeader className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <IconGolf className="h-4 w-4 text-golf-green" aria-hidden="true" />
            <h2 className="text-base font-semibold">Course</h2>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-5">
          {isLoadingCourse ? (
            <div className="flex items-center justify-center py-8">
              <Spinner color="success" size="md" aria-label="Loading course" />
            </div>
          ) : selectedCourse ? (
            <div>
              {/* Selected course info */}
              <div className="mb-4 flex items-start justify-between gap-4 rounded-xl bg-golf-green/5 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <IconCheck
                      className="h-4 w-4 flex-shrink-0 text-golf-green"
                      aria-hidden="true"
                    />
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

              {/* Tee selection */}
              {selectedCourse.tees.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Select tee:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.tees.map((tee) => (
                      <button
                        key={tee.id}
                        onClick={() => setSelectedTeeId(tee.id)}
                        aria-pressed={selectedTeeId === tee.id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          selectedTeeId === tee.id
                            ? 'border-golf-green bg-golf-green/10 text-golf-green'
                            : 'border-default-200 bg-default-50 text-default-600 hover:border-default-400'
                        }`}
                      >
                        <TeeColorDot color={tee.color} />
                        <span className="capitalize">{tee.teeName}</span>
                        <span className="text-xs text-default-400">(par {tee.par})</span>
                      </button>
                    ))}
                  </div>
                  {selectedTee && (
                    <p className="mt-2 text-xs text-default-400">
                      Rating {selectedTee.courseRating} / Slope {selectedTee.slopeRating}
                      {selectedTee.totalMeters ? ` · ${selectedTee.totalMeters} m` : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Course search */}
              <div className="mb-3 flex flex-col gap-3">
                <TextInput
                  label="Search courses"
                  placeholder="Course name, club, or city..."
                  value={query}
                  onValueChange={setQuery}
                  startContent={<IconSearch className="h-4 w-4 text-white/40" aria-hidden="true" />}
                  endContent={
                    query.length > 0 ? (
                      <button
                        onClick={() => setQuery('')}
                        aria-label="Clear search"
                        className="text-white/40"
                      >
                        <IconX className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null
                  }
                />
                <CountrySelect
                  value={country}
                  onChange={setCountry}
                  label="Country (optional)"
                  placeholder="Any country"
                />
              </div>

              {isSearching && (
                <div className="flex items-center justify-center py-8">
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

      {/* Start round button */}
      <Button
        color="success"
        size="lg"
        className="w-full font-semibold"
        onPress={() => void handleStartRound()}
        isLoading={isStarting}
        isDisabled={isStarting || !selectedCourse || !selectedTeeId}
        startContent={!isStarting ? <IconGolf className="h-5 w-5" aria-hidden="true" /> : undefined}
      >
        {isStarting ? 'Starting...' : 'Start Round'}
      </Button>
    </div>
  );
}

function TeeColorDot({ color }: { color: string | null }) {
  let cls = 'bg-default-400';
  if (color) {
    const lower = color.toLowerCase();
    if (lower.includes('white')) cls = 'bg-white border border-default-300';
    else if (lower.includes('yellow') || lower.includes('gold')) cls = 'bg-yellow-400';
    else if (lower.includes('blue')) cls = 'bg-blue-500';
    else if (lower.includes('red')) cls = 'bg-red-500';
    else if (lower.includes('black')) cls = 'bg-black';
    else if (lower.includes('green')) cls = 'bg-golf-green';
    else if (lower.includes('orange')) cls = 'bg-orange-400';
    else if (lower.includes('silver')) cls = 'bg-gray-300';
  }
  return <span className={`inline-block h-3 w-3 rounded-full ${cls}`} aria-hidden="true" />;
}
