'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully uploaded and parsed ${data.count} questions!` });
        setQuestions(data.questions);
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during upload.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Panel - Upload MCQ PDF</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-center w-full mb-6">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
            </label>
          </div>

          {file && (
            <div className="flex items-center mb-4 p-2 bg-blue-50 rounded text-blue-700">
              <FileText className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">{file.name}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-colors ${
              !file || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : 'Upload and Parse'}
          </button>

          {message && (
            <div
              className={`mt-4 p-4 rounded-md flex items-center ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          )}
        </div>

        {questions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Parsed Questions Preview</h2>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <p className="font-medium text-gray-900 mb-2">
                    {q.id}. {q.text}
                  </p>
                  <ul className="space-y-1 ml-4">
                    {q.options.map((opt: string, i: number) => (
                      <li key={i} className="text-gray-600 text-sm">
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
