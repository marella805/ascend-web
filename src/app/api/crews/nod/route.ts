import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { sendNod } from '@/lib/db/queries';

export async function POST(req: Request) {
  await ensureDb();
  const { toUserId } = await req.json();
  const result = await sendNod('demo-user-alex', toUserId);
  return NextResponse.json(result);
}
