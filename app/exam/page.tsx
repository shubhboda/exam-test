'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer?: string;
}

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch('/api/questions')
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSelectOption = (optionIndex: number) => {
    if (submitted) return;
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    let newScore = 0;
    questions.forEach((q) => {
      const selectedIndex = selectedAnswers[q.id];
      if (q.correctAnswer && selectedIndex !== undefined) {
        const correctIndex = q.correctAnswer.charCodeAt(0) - 65; // Assumes 'A' is 65
        if (selectedIndex === correctIndex) {
          newScore++;
        }
      }
    });
    setScore(newScore);
    setSubmitted(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return <div className="flex justify-center items-center h-screen">No exam available. Please ask admin to upload questions.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <h1 className="text-2xl font-bold">Exam Portal</h1>
          {submitted && (
            <div className="text-xl font-bold">
              Score: {score} / {questions.length}
            </div>
          )}
        </div>

        <div className="p-8">
          {!submitted ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {currentQuestion.id}. {currentQuestion.text}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAnswers[currentQuestion.id] === index
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            selectedAnswers[currentQuestion.id] === index
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-400'
                          }`}
                        >
                          {selectedAnswers[currentQuestion.id] === index && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="text-gray-700">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" /> Previous
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Submit Exam
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Exam Completed!</h2>
                <p className="text-lg text-gray-600">
                  You scored <span className="font-bold text-blue-600">{score}</span> out of{' '}
                  <span className="font-bold">{questions.length}</span>
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Review Answers</h3>
                {questions.map((q, idx) => {
                  const selectedIdx = selectedAnswers[q.id];
                  const correctIdx = q.correctAnswer ? q.correctAnswer.charCodeAt(0) - 65 : -1;
                  const isCorrect = selectedIdx === correctIdx;
                  
                  return (
                    <div key={q.id} className={`p-4 border rounded-lg ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <p className="font-medium text-gray-900 mb-3">
                        {idx + 1}. {q.text}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedIdx === optIdx;
                          const isCorrectOpt = correctIdx === optIdx;
                          
                          let style = "text-gray-600";
                          if (isCorrectOpt) style = "font-bold text-green-700";
                          else if (isSelected && !isCorrect) style = "font-bold text-red-700";
                          
                          return (
                            <div key={optIdx} className="flex items-start">
                              <span className={`mr-2 ${style}`}>
                                {opt}
                              </span>
                              {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 inline" />}
                              {isCorrectOpt && <CheckCircle className="w-5 h-5 text-green-500 inline" />}
                            </div>
                          );
                        })}
                      </div>
                      {!q.correctAnswer && <p className="text-xs text-gray-500 mt-2">No correct answer provided in PDF.</p>}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                    Retake Exam
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
