import { redis } from './redis';

const GOLF_API_BASE = 'https://www.golfcourseapi.com/api/v1';
const CACHE_TTL = 86400; // 24 hours

interface GolfCourse {
  id: string;
  club_name: string;
  course_name: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  holes: number;
  website: string;
  phone: string;
}

interface CourseSearchResult {
  courses: GolfCourse[];
  total: number;
}

async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl = CACHE_TTL,
): Promise<T> {
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const data = await fetcher();
  await redis.setex(cacheKey, ttl, JSON.stringify(data));
  return data;
}

export async function searchCourses(query: string): Promise<CourseSearchResult> {
  const apiKey = process.env.GOLF_API_KEY;
  if (!apiKey) {
    throw new Error('GOLF_API_KEY not configured');
  }

  const cacheKey = `course:search:${query.toLowerCase().trim()}`;

  return fetchWithCache(
    cacheKey,
    async () => {
      const response = await fetch(`${GOLF_API_BASE}/courses?search=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Key ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`GolfCourseAPI error: ${response.status}`);
      }

      return response.json() as Promise<CourseSearchResult>;
    },
    3600, // 1 hour cache for search results
  );
}

export async function getCourseById(courseId: string): Promise<GolfCourse | null> {
  const apiKey = process.env.GOLF_API_KEY;
  if (!apiKey) {
    throw new Error('GOLF_API_KEY not configured');
  }

  const cacheKey = `course:${courseId}`;

  return fetchWithCache(cacheKey, async () => {
    const response = await fetch(`${GOLF_API_BASE}/courses/${courseId}`, {
      headers: {
        Authorization: `Key ${apiKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`GolfCourseAPI error: ${response.status}`);
    }

    return response.json() as Promise<GolfCourse>;
  });
}
