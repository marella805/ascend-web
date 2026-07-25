import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { getCharacterSheet } from '@/lib/db/queries';

export async function GET() {
  await ensureDb();
  const data = await getCharacterSheet();
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}
