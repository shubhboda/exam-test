import { NextRequest, NextResponse } from 'next/server';
import { parsePdfToQuestions } from '@/lib/pdf-parser';
import { saveQuestions } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const questions = await parsePdfToQuestions(buffer);
    
    if (questions.length === 0) {
       return NextResponse.json({ error: 'No questions found in PDF. Please ensure format is correct.' }, { status: 400 });
    }

    await saveQuestions(questions);

    return NextResponse.json({ success: true, count: questions.length, questions });
  } catch (error: any) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ error: `Failed to process PDF: ${error.message || error}` }, { status: 500 });
  }
}
