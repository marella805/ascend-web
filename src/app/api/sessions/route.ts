import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { createSession, getExercises } from '@/lib/db/queries';

export async function POST(req: Request) {
  await ensureDb();
  const { modality, title } = await req.json();
  const id = await createSession('demo-user-alex', modality, title);
  return NextResponse.json({ id });
}

export async function GET(req: Request) {
  await ensureDb();
  const { searchParams } = new URL(req.url);
  const modality = searchParams.get('modality') ?? undefined;
  const exercises = await getExercises(modality);
  return NextResponse.json({ exercises });
}
