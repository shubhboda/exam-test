import { NextResponse } from 'next/server';
import { getQuestions } from '@/lib/store';

export async function GET() {
  const questions = await getQuestions();
  return NextResponse.json(questions);
}
