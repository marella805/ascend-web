import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { finishSession } from '@/lib/db/queries';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const envelope = await finishSession(id);
  if (!envelope) return NextResponse.json({ error: 'Session not found or already finished' }, { status: 404 });
  return NextResponse.json(envelope);
}
