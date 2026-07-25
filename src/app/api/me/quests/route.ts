import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { getQuests } from '@/lib/db/queries';

export async function GET() {
  await ensureDb();
  return NextResponse.json(await getQuests());
}
