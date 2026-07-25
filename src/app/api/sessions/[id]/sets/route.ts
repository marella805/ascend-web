import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { addSet } from '@/lib/db/queries';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const { exerciseId, weightKg, reps, isWarmup } = await req.json();
  const setId = await addSet(id, exerciseId, weightKg, reps, isWarmup);
  return NextResponse.json({ id: setId });
}
