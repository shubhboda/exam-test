import fs from 'fs';
import path from 'path';
import mongoose, { Schema, Model } from 'mongoose';
import { Question } from './types';

// --- Configuration ---
const DATA_FILE = path.join(process.cwd(), 'data', 'questions.json');
const USE_MONGODB = !!process.env.MONGODB_URI;

// --- MongoDB Schema ---
const QuestionSchema = new Schema<Question>({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: false },
});

// Avoid recompiling model if it exists
const QuestionModel: Model<Question> = mongoose.models.Question || mongoose.model<Question>('Question', QuestionSchema);

// --- In-Memory Store (Fallback) ---
// Global variable to persist across hot reloads in serverless (to some extent)
declare global {
  var __inMemoryQuestions: Question[] | undefined;
}

if (!global.__inMemoryQuestions) {
  global.__inMemoryQuestions = [];
}

// --- DB Connection ---
async function connectDB() {
  if (!process.env.MONGODB_URI) return;
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
  }
}

// --- API ---

export async function getQuestions(): Promise<Question[]> {
  // 1. MongoDB
  if (USE_MONGODB) {
    await connectDB();
    try {
      // @ts-ignore
      const questions = await QuestionModel.find({}).sort({ id: 1 }).lean();
      return questions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));
    } catch (error) {
      console.error('Failed to fetch from MongoDB:', error);
      return [];
    }
  }

  // 2. File System (Local Development only)
  // We check if we can write to the file system. If not (Vercel), we skip to In-Memory.
  const isReadOnly = isFileSystemReadOnly();
  
  if (!isReadOnly && fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading file:', e);
      return [];
    }
  }

  // 3. In-Memory (Fallback for Vercel without DB)
  console.warn('Using In-Memory Store (Data will be lost on restart). Connect MongoDB for persistence.');
  return global.__inMemoryQuestions || [];
}

export async function saveQuestions(questions: Question[]): Promise<void> {
  // 1. MongoDB
  if (USE_MONGODB) {
    await connectDB();
    try {
        // Clear existing for simplicity or append? 
        // User wants "mcq set ho jaye", usually implies a new set.
        // Let's delete all and insert new for this simple app.
        await QuestionModel.deleteMany({});
        await QuestionModel.insertMany(questions);
        return;
    } catch (error) {
        console.error('Failed to save to MongoDB:', error);
        throw new Error('Database save failed');
    }
  }

  // 2. File System (Local Development)
  const isReadOnly = isFileSystemReadOnly();

  if (!isReadOnly) {
    try {
        // Ensure directory exists
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(questions, null, 2));
        return;
    } catch (error: any) {
        // If EROFS (Read-only), fall through to In-Memory
        if (error.code !== 'EROFS') {
             console.error('File save error:', error);
             // If it's not EROFS, it might be permission or something else, but we can try memory.
        }
    }
  }

  // 3. In-Memory (Fallback)
  console.warn('Saving to In-Memory Store (Non-persistent).');
  global.__inMemoryQuestions = questions;
}

export async function clearQuestions(): Promise<void> {
    if (USE_MONGODB) {
        await connectDB();
        await QuestionModel.deleteMany({});
        return;
    }

    const isReadOnly = isFileSystemReadOnly();
    if (!isReadOnly) {
        try {
             fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
        } catch (e) { /* ignore */ }
    }
    
    global.__inMemoryQuestions = [];
}

function isFileSystemReadOnly(): boolean {
    // Basic heuristic: Vercel / AWS Lambda usually have specific env vars or we can try access.
    // Easiest is to try-catch the write, but we want to avoid the error log if possible.
    // NODE_ENV === 'production' often implies read-only in serverless unless specified otherwise.
    // But let's rely on the try/catch in saveQuestions mostly.
    // However, getQuestions needs to know where to look.
    
    // If we are on Vercel, process.env.VERCEL is set.
    if (process.env.VERCEL) return true;
    
    return false; 
}
