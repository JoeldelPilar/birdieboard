'use client';

import { Button, Card, CardBody, CardHeader, Tab, Tabs } from '@heroui/react';
import { IconGolf } from '@tabler/icons-react';
import { useState } from 'react';
import Link from 'next/link';
import type { CourseWithDetails } from '@/server/actions/courses';

type Tee = CourseWithDetails['tees'][number];

interface TeeScorecardProps {
  courseId: string;
  tees: Tee[];
}

function getTeeColorClass(color: string | null): string {
  if (!color) return 'bg-default-300';
  const lower = color.toLowerCase();
  if (lower.includes('white')) return 'bg-white border border-default-300';
  if (lower.includes('yellow') || lower.includes('gold')) return 'bg-yellow-400';
  if (lower.includes('blue')) return 'bg-blue-500';
  if (lower.includes('red')) return 'bg-red-500';
  if (lower.includes('black')) return 'bg-black';
  if (lower.includes('green')) return 'bg-golf-green';
  if (lower.includes('orange')) return 'bg-orange-400';
  if (lower.includes('silver')) return 'bg-gray-300';
  return 'bg-default-400';
}

export function TeeScorecard({ courseId, tees }: TeeScorecardProps) {
  const [selectedTeeId, setSelectedTeeId] = useState(tees[0]?.id ?? '');

  const selectedTee = tees.find((t) => t.id === selectedTeeId) ?? tees[0];

  if (!selectedTee) return null;

  const front9 = selectedTee.holes.filter((h) => h.holeNumber <= 9);
  const back9 = selectedTee.holes.filter((h) => h.holeNumber >= 10);
  const front9Par = front9.reduce((sum, h) => sum + h.par, 0);
  const back9Par = back9.reduce((sum, h) => sum + h.par, 0);
  const totalPar = front9Par + back9Par;
  const front9Yds = front9.reduce((sum, h) => sum + (h.distanceMeters ?? 0), 0);
  const back9Yds = back9.reduce((sum, h) => sum + (h.distanceMeters ?? 0), 0);
  const totalYds = front9Yds + back9Yds;

  return (
    <div className="flex flex-col gap-4">
      {/* Tee selector */}
      <Card>
        <CardHeader className="px-6 pt-5 pb-3">
          <h2 className="text-base font-semibold">Select Tee</h2>
        </CardHeader>
        <CardBody className="px-6 pb-5">
          <Tabs
            aria-label="Select tee"
            selectedKey={selectedTeeId}
            onSelectionChange={(key) => setSelectedTeeId(String(key))}
            color="success"
            variant="underlined"
            className="mb-4"
          >
            {tees.map((tee) => (
              <Tab
                key={tee.id}
                title={
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${getTeeColorClass(tee.color)}`}
                      aria-hidden="true"
                    />
                    <span className="capitalize">{tee.teeName}</span>
                  </div>
                }
              />
            ))}
          </Tabs>

          {/* Tee stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-default-400">Par:</span>{' '}
              <span className="font-semibold">{selectedTee.par}</span>
            </div>
            <div>
              <span className="text-default-400">Rating:</span>{' '}
              <span className="font-semibold">{selectedTee.courseRating}</span>
            </div>
            <div>
              <span className="text-default-400">Slope:</span>{' '}
              <span className="font-semibold">{selectedTee.slopeRating}</span>
            </div>
            {selectedTee.totalMeters && (
              <div>
                <span className="text-default-400">Distance:</span>{' '}
                <span className="font-semibold">{selectedTee.totalMeters} m</span>
              </div>
            )}
            {selectedTee.gender && selectedTee.gender !== 'unisex' && (
              <div>
                <span className="text-default-400">Gender:</span>{' '}
                <span className="font-semibold capitalize">{selectedTee.gender}</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Scorecard */}
      {selectedTee.holes.length > 0 && (
        <Card>
          <CardHeader className="px-6 pt-5 pb-3">
            <h2 className="text-base font-semibold">Scorecard</h2>
          </CardHeader>
          <CardBody className="overflow-x-auto px-6 pb-5">
            <table className="w-full text-sm" aria-label="Scorecard">
              <thead>
                <tr className="border-b border-default-200 text-xs font-semibold uppercase text-default-400">
                  <th className="pb-2 text-left">Hole</th>
                  <th className="pb-2 text-center">Par</th>
                  <th className="pb-2 text-center">SI</th>
                  <th className="pb-2 text-right">Dist (m)</th>
                </tr>
              </thead>
              <tbody>
                {/* Front 9 */}
                {front9.map((hole) => (
                  <tr
                    key={hole.holeNumber}
                    className="border-b border-default-100 hover:bg-default-50"
                  >
                    <td className="py-2 font-medium">{hole.holeNumber}</td>
                    <td className="py-2 text-center">{hole.par}</td>
                    <td className="py-2 text-center text-default-400">{hole.strokeIndex}</td>
                    <td className="py-2 text-right text-default-400">
                      {hole.distanceMeters ?? '—'}
                    </td>
                  </tr>
                ))}

                {/* Front 9 subtotal */}
                {front9.length > 0 && (
                  <tr className="border-b-2 border-default-300 bg-golf-green/5 font-semibold">
                    <td className="py-2 text-golf-green">Out</td>
                    <td className="py-2 text-center text-golf-green">{front9Par}</td>
                    <td className="py-2 text-center text-default-400">—</td>
                    <td className="py-2 text-right text-default-400">
                      {front9Yds > 0 ? front9Yds : '—'}
                    </td>
                  </tr>
                )}

                {/* Back 9 */}
                {back9.map((hole) => (
                  <tr
                    key={hole.holeNumber}
                    className="border-b border-default-100 hover:bg-default-50"
                  >
                    <td className="py-2 font-medium">{hole.holeNumber}</td>
                    <td className="py-2 text-center">{hole.par}</td>
                    <td className="py-2 text-center text-default-400">{hole.strokeIndex}</td>
                    <td className="py-2 text-right text-default-400">
                      {hole.distanceMeters ?? '—'}
                    </td>
                  </tr>
                ))}

                {/* Back 9 subtotal */}
                {back9.length > 0 && (
                  <tr className="border-b-2 border-default-300 bg-golf-green/5 font-semibold">
                    <td className="py-2 text-golf-green">In</td>
                    <td className="py-2 text-center text-golf-green">{back9Par}</td>
                    <td className="py-2 text-center text-default-400">—</td>
                    <td className="py-2 text-right text-default-400">
                      {back9Yds > 0 ? back9Yds : '—'}
                    </td>
                  </tr>
                )}

                {/* Total */}
                <tr className="bg-golf-green/10 font-bold">
                  <td className="py-2.5 text-golf-green">Total</td>
                  <td className="py-2.5 text-center text-golf-green">{totalPar}</td>
                  <td className="py-2.5 text-center text-default-400">—</td>
                  <td className="py-2.5 text-right text-default-400">
                    {totalYds > 0 ? totalYds : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* Start Round CTA */}
      <div className="flex justify-end">
        <Button
          as={Link}
          href={`/dashboard/rounds/new?courseId=${courseId}&teeId=${selectedTeeId}`}
          color="success"
          size="lg"
          startContent={<IconGolf className="h-5 w-5" aria-hidden="true" />}
          className="font-semibold"
        >
          Start Round
        </Button>
      </div>
    </div>
  );
}
