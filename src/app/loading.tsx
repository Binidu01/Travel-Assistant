import { Palmtree } from 'lucide-react';

export default function Loading() {
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
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        {/* Spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Palmtree className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}