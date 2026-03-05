'use client';

import { Card, CardBody, Input, Spinner } from '@heroui/react';
import { IconGolf, IconMapPin, IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CountrySelect } from '@/components/profile/country-select';
import { searchCourses } from '@/server/actions/courses';
import type { CourseSearchResult } from '@/server/actions/courses';

export default function CoursesPage() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [results, setResults] = useState<CourseSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2 && !country) {
      setResults([]);
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
  }, [query, country]);

  async function runSearch(q: string, c: string) {
    setIsSearching(true);
    setError(null);

    const result = await searchCourses(q.trim() || '', c || undefined);

    setIsSearching(false);
    setHasSearched(true);

    if (!result.success) {
      setError(result.error);
      setResults([]);
      return;
    }

    setResults(result.data);
  }

  function handleClearQuery() {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  }

  function handleCountryChange(value: string) {
    setCountry(value);
  }

  function handleCourseClick(id: string) {
    router.push(`/dashboard/courses/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="mt-1 text-default-500">
          Search for a course to view details or start a round.
        </p>
      </div>

      {/* Search controls */}
      <div className="mb-6 flex flex-col gap-3">
        <Input
          label="Search courses"
          placeholder="Course name, club, or city..."
          value={query}
          onValueChange={setQuery}
          startContent={<IconSearch className="h-4 w-4 text-default-400" aria-hidden="true" />}
          endContent={
            query.length > 0 ? (
              <button
                onClick={handleClearQuery}
                aria-label="Clear search"
                className="text-default-400 hover:text-default-600"
              >
                <IconX className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null
          }
          isClearable={false}
        />
        <CountrySelect
          value={country}
          onChange={handleCountryChange}
          label="Filter by country (optional)"
          placeholder="Any country"
        />
      </div>

      {/* Results area */}
      {isSearching && (
        <div className="flex items-center justify-center py-16" aria-live="polite" role="status">
          <Spinner color="success" size="lg" aria-label="Searching courses" />
        </div>
      )}

      {!isSearching && error && (
        <div
          role="alert"
          className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
        >
          {error}
        </div>
      )}

      {!isSearching && !error && !hasSearched && (
        <Card>
          <CardBody className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-golf-green/10">
              <IconSearch className="h-8 w-8 text-golf-green opacity-60" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">Search for a course to get started</p>
              <p className="mt-1 text-sm text-default-500">
                Type a course name, club name, or city to find courses.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {!isSearching && !error && hasSearched && results.length === 0 && (
        <Card>
          <CardBody className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-default-200">
              <IconGolf className="h-8 w-8 text-default-400" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">No courses found</p>
              <p className="mt-1 text-sm text-default-500">
                Try a different search term or remove the country filter.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {!isSearching && results.length > 0 && (
        <section aria-label="Course search results">
          <p className="mb-3 text-sm text-default-400">
            {results.length} {results.length === 1 ? 'course' : 'courses'} found
          </p>
          <div className="flex flex-col gap-2">
            {results.map((course) => (
              <Card
                key={course.id}
                isPressable
                onPress={() => handleCourseClick(course.id)}
                className="border border-default-200 transition-all hover:border-golf-green/50 hover:shadow-md"
              >
                <CardBody className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{course.name}</p>
                      {course.clubName && course.clubName !== course.name && (
                        <p className="mt-0.5 truncate text-sm text-default-500">
                          {course.clubName}
                        </p>
                      )}
                      {(course.city ?? course.country) && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-default-400">
                          <IconMapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                          <span>{[course.city, course.country].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="rounded-full bg-golf-green/10 px-2.5 py-1 text-xs font-medium text-golf-green">
                        {course.holeCount ?? 18} holes
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
