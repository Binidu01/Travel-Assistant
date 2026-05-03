import { Palmtree } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm shrink-0">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Palmtree className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Sri Lanka Travel Assistant</h1>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <Palmtree className="w-16 h-16 text-blue-400 mb-5" />
        <h2 className="text-6xl font-bold text-gray-200 mb-2">404</h2>
        <p className="text-xl font-semibold text-gray-700 mb-2">Page not found</p>
        <p className="text-sm text-gray-500 text-center max-w-xs mb-8">
          Looks like this page got lost somewhere between Colombo and Ella.
        </p>
        <a
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600
                     text-white text-sm font-medium rounded-full transition-all active:scale-95 shadow-sm"
        >
          Back to chat
        </a>
      </div>
    </div>
  );
}