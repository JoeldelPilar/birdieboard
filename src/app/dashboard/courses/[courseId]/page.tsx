import { Button, Card, CardBody } from '@heroui/react';
import { IconArrowLeft, IconGolf, IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourseDetails } from '@/server/actions/courses';
import { TeeScorecard } from './_components/tee-scorecard';

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;
  const result = await getCourseDetails(courseId);

  if (!result.success) {
    notFound();
  }

  const course = result.data;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back navigation */}
      <div className="mb-6">
        <Button
          as={Link}
          href="/dashboard/courses"
          variant="light"
          size="sm"
          startContent={<IconArrowLeft className="h-4 w-4" aria-hidden="true" />}
          className="text-default-500"
        >
          Back to search
        </Button>
      </div>

      {/* Course header */}
      <Card className="mb-6">
        <CardBody className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-golf-green/10">
              <IconGolf className="h-6 w-6 text-golf-green" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold leading-tight">{course.name}</h1>
              {course.clubName && course.clubName !== course.name && (
                <p className="mt-0.5 text-default-500">{course.clubName}</p>
              )}
              {(course.city ?? course.country) && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-default-400">
                  <IconMapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>{[course.city, course.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className="rounded-full bg-golf-green/10 px-3 py-1.5 text-sm font-medium text-golf-green">
                {course.holeCount ?? 18} holes
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tees and scorecards */}
      {course.tees.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div>
              <p className="font-semibold">No tee data available</p>
              <p className="mt-1 text-sm text-default-500">
                Tee and hole information has not been entered for this course yet.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <TeeScorecard courseId={courseId} tees={course.tees} />
      )}
    </div>
  );
}
