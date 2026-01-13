import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full text-center transform transition-all hover:scale-105">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Exam Portal</h1>
        <p className="text-gray-500 mb-8">Manage exams or take a test.</p>
        
        <div className="space-y-4">
          <Link 
            href="/exam" 
            className="block w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md"
          >
            Start Exam
          </Link>
          
          <Link 
            href="/admin" 
            className="block w-full py-4 px-6 bg-white border-2 border-gray-200 hover:border-blue-500 text-gray-700 font-bold rounded-lg transition-all"
          >
            Admin Panel
          </Link>
        </div>
        
        <div className="mt-8 text-xs text-gray-400">
          Built with Next.js & Tailwind CSS
        </div>
      </div>
    </div>
  );
}
