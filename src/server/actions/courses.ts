'use server';

import { db } from '@/lib/db';
import { courses, courseTees, courseHoles } from '@/lib/drizzle/schema';
import { searchCourses as apiSearchCourses, getCourseById } from '@/lib/golf-api';
import { eq, and } from 'drizzle-orm';
import type { ActionResponse } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CourseSearchResult = {
  id: string;
  name: string;
  clubName: string | null;
  city: string | null;
  country: string | null;
  holeCount: number;
};

export type CourseWithDetails = typeof courses.$inferSelect & {
  tees: (typeof courseTees.$inferSelect & {
    holes: (typeof courseHoles.$inferSelect)[];
  })[];
};

// ---------------------------------------------------------------------------
// searchCourses — search GolfCourseAPI and return mapped results
// ---------------------------------------------------------------------------

export async function searchCourses(
  query: string,
  country?: string,
  limit?: number,
): Promise<ActionResponse<CourseSearchResult[]>> {
  if (!query || query.trim().length < 2) {
    return { success: false, error: 'Query must be at least 2 characters' };
  }

  try {
    const result = await apiSearchCourses(query.trim());

    let filtered = result.courses;

    if (country) {
      filtered = filtered.filter(
        (c) => c.location?.country?.toLowerCase() === country.toLowerCase(),
      );
    }

    const maxResults = limit ?? 20;
    const mapped: CourseSearchResult[] = filtered.slice(0, maxResults).map((c) => ({
      id: c.id,
      name: c.course_name,
      clubName: c.club_name || null,
      city: c.location?.city || null,
      country: c.location?.country || null,
      holeCount: c.holes ?? 18,
    }));

    return { success: true, data: mapped };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search courses';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getCourseDetails — fetch from local DB or GolfCourseAPI, cache in DB
// ---------------------------------------------------------------------------

export async function getCourseDetails(
  courseId: string,
): Promise<ActionResponse<CourseWithDetails>> {
  try {
    // 1. Check local DB by internal UUID
    const localById = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);

    let course = localById[0];

    // 2. If not found by internal ID, check by externalId
    if (!course) {
      const localByExternal = await db
        .select()
        .from(courses)
        .where(and(eq(courses.externalId, courseId), eq(courses.externalSource, 'golfcourseapi')))
        .limit(1);

      course = localByExternal[0];
    }

    // 3. If not in local DB, fetch from API and cache
    if (!course) {
      const apiCourse = await getCourseById(courseId);
      if (!apiCourse) {
        return { success: false, error: 'Course not found' };
      }

      const [inserted] = await db
        .insert(courses)
        .values({
          externalId: apiCourse.id,
          externalSource: 'golfcourseapi',
          name: apiCourse.course_name,
          clubName: apiCourse.club_name || null,
          city: apiCourse.location?.city || null,
          country: apiCourse.location?.country || null,
          latitude: apiCourse.location?.latitude ? String(apiCourse.location.latitude) : null,
          longitude: apiCourse.location?.longitude ? String(apiCourse.location.longitude) : null,
          holeCount: apiCourse.holes ?? 18,
          website: apiCourse.website || null,
          phone: apiCourse.phone || null,
          cachedAt: new Date(),
        })
        .returning();

      if (!inserted) {
        return { success: false, error: 'Failed to cache course' };
      }

      course = inserted;
    }

    // 4. Load tees
    const teeRows = await db.select().from(courseTees).where(eq(courseTees.courseId, course.id));

    // 5. Load holes for all tees
    const holeRows = await db.select().from(courseHoles).where(eq(courseHoles.courseId, course.id));

    const courseWithDetails: CourseWithDetails = {
      ...course,
      tees: teeRows.map((tee) => ({
        ...tee,
        holes: holeRows
          .filter((h) => h.teeId === tee.id)
          .sort((a, b) => a.holeNumber - b.holeNumber),
      })),
    };

    return { success: true, data: courseWithDetails };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get course details';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getCachedCourse — get course from local DB only (for round context)
// ---------------------------------------------------------------------------

export async function getCachedCourse(
  courseId: string,
): Promise<ActionResponse<typeof courses.$inferSelect>> {
  try {
    const result = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);

    const course = result[0];
    if (!course) {
      return { success: false, error: 'Course not found in local database' };
    }

    return { success: true, data: course };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get course';
    return { success: false, error: message };
  }
}
