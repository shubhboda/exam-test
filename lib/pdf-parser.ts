import PDFParser from 'pdf2json';
import { Question } from './types';

export async function parsePdfToQuestions(buffer: Buffer): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1); // 1 = text mode

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error(errData.parserError);
      reject(errData.parserError);
    });

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        const text = pdfParser.getRawTextContent();
        
        // pdf2json output often has page breaks and weird spacing.
        // We need to normalize it.
        // Usually it comes as a big string.
        
        const lines = text.split(/\r\n|\n|\r/).map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('----------------Page'));
        const questions: Question[] = [];
        
        let currentQuestion: Partial<Question> | null = null;
        let currentOptions: string[] = [];
        
        const questionRegex = /^(\d+)[\.)]\s+(.+)/;
        const optionRegex = /^([A-D]|[a-d])[\.)]\s+(.+)/;
        const answerRegex = /^Answer:\s*([A-D]|[a-d])/i;
        
        for (const line of lines) {
          // Clean up artifacts if any
          const cleanLine = line.replace(/(\r\n|\n|\r)/gm, " ").trim();
          if (!cleanLine) continue;

          const questionMatch = cleanLine.match(questionRegex);
          const optionMatch = cleanLine.match(optionRegex);
          const answerMatch = cleanLine.match(answerRegex);
          
          if (questionMatch) {
            // Save previous question if exists
            if (currentQuestion && currentOptions.length > 0) {
              questions.push({
                id: currentQuestion.id!,
                text: currentQuestion.text!,
                options: [...currentOptions],
                correctAnswer: currentQuestion.correctAnswer,
              });
            }
            
            // Start new question
            currentQuestion = {
              id: parseInt(questionMatch[1]),
              text: questionMatch[2],
            };
            currentOptions = [];
          } else if (answerMatch && currentQuestion) {
              currentQuestion.correctAnswer = answerMatch[1].toUpperCase();
          } else if (optionMatch && currentQuestion) {
            // Add option
            currentOptions.push(cleanLine);
          } else if (currentQuestion) {
            // Append to current question text or option if it's a continuation
            if (currentOptions.length > 0) {
              // Append to last option
              currentOptions[currentOptions.length - 1] += ' ' + cleanLine;
            } else {
              // Append to question text
              currentQuestion.text += ' ' + cleanLine;
            }
          }
        }
        
        // Add last question
        if (currentQuestion && currentOptions.length > 0) {
          questions.push({
            id: currentQuestion.id!,
            text: currentQuestion.text!,
            options: [...currentOptions],
            correctAnswer: currentQuestion.correctAnswer,
          });
        }
        
        resolve(questions);
      } catch (e) {
        reject(e);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}
