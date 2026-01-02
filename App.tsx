import React, { useState } from 'react';
import { Clapperboard, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { analyzeChatLog } from './services/geminiService';
import { Movie, AnalysisStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileProcess = async (content: string) => {
    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setMovies([]);

    try {
      const results = await analyzeChatLog(content);
      setMovies(results);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze the chat log. Ensure your API key is valid and the file contains text.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(AnalysisStatus.IDLE);
    setMovies([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-purple-500/30">
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg text-white shadow-lg shadow-purple-900/20">
              <Clapperboard className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              CineChat <span className="font-light text-zinc-500">Analyzer</span>
            </h1>
          </div>
          {status === AnalysisStatus.COMPLETE && (
            <button 
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors hover:bg-zinc-900 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {status === AnalysisStatus.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                Turn chat logs into <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  movie recommendations
                </span>
              </h2>
              <p className="text-lg text-zinc-400">
                Upload your movie club's chat history (.txt) and let AI extract, classify, and visualize every movie mentioned.
              </p>
            </div>
            
            <div className="w-full max-w-2xl">
               <FileUpload onFileSelect={handleFileProcess} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-sm text-zinc-500 mt-12 w-full max-w-4xl">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <strong className="block text-zinc-300 mb-1">Smart Extraction</strong>
                Identify titles even from casual conversation.
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <strong className="block text-zinc-300 mb-1">Auto-Classification</strong>
                Genre, Country, Language & Sentiment analysis.
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <strong className="block text-zinc-300 mb-1">Visual Insights</strong>
                See what your group loves the most.
              </div>
            </div>
          </div>
        )}

        {status === AnalysisStatus.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
              <Loader2 className="w-16 h-16 text-purple-500 animate-spin relative z-10" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white">Analyzing Chat Log...</h3>
              <p className="text-zinc-500 mt-2">Extracting movie titles and gathering metadata.</p>
              <p className="text-zinc-600 text-sm mt-1">This uses Gemini 3 Flash, so it's super fast.</p>
            </div>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <div className="p-4 bg-red-500/10 rounded-full text-red-500">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-xl font-semibold text-white">Analysis Failed</h3>
              <p className="text-zinc-400 mt-2">{error}</p>
              <button 
                onClick={reset}
                className="mt-6 px-6 py-2 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-white font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {status === AnalysisStatus.COMPLETE && (
          <Dashboard movies={movies} />
        )}

      </main>
    </div>
  );
};

export default App;
