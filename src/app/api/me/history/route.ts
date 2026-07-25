import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { getHistory } from '@/lib/db/queries';

export async function GET() {
  await ensureDb();
  return NextResponse.json(await getHistory());
}
