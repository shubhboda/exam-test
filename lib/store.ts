import fs from 'fs';
import path from 'path';
import { Question } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'questions.json');

export function getQuestions(): Question[] {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveQuestions(questions: Question[]): void {
  // Merge with existing or overwrite? User said "mcq set ho jaye", implies replacing or adding.
  // Let's overwrite for this "set" but maybe appending is better. 
  // For simplicity, let's append but check for duplicates or just overwrite if it's a new "exam".
  // Actually, let's just save them.
  
  // Reading existing to append
  const existing = getQuestions();
  // Simple merge strategy: append new ones, maybe re-id them?
  // Let's just replace for now to keep it simple as "uploading a set".
  // Or append.
  const newQuestions = [...existing, ...questions];
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(newQuestions, null, 2));
}

export function clearQuestions(): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}
