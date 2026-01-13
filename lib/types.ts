export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer?: string;
}

export interface Exam {
  id: string;
  title: string;
  questions: Question[];
}
