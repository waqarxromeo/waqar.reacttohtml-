import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultViewer } from './components/ResultViewer';
import { Button } from './components/Button';
import { extractZipContents, formatFilesForPrompt } from './services/fileProcessing';
import { generateSingleHtml } from './services/geminiService';
import { ProcessingStatus } from './types';
import { Boxes, Zap, Terminal, AlertTriangle, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>({ step: 'idle', message: '' });
  const [resultHtml, setResultHtml] = useState<string | null>(null);

  const processFile = async () => {
    if (!file) return;

    // Check for API Key
    if (!process.env.API_KEY) {
      setStatus({ 
        step: 'error', 
        message: 'Missing API Key. Ensure process.env.API_KEY is available.' 
      });
      return;
    }

    try {
      // 1. Extract
      setStatus({ step: 'extracting', message: 'Extracting files from archive...' });
      const files = await extractZipContents(file);
      
      if (files.length === 0) {
        throw new Error("No valid source files found in the archive.");
      }

      setStatus({ step: 'analyzing', message: `Analyzed ${files.length} files. Preparing for Gemini...` });

      // 2. Format
      const projectStructure = formatFilesForPrompt(files);

      // 3. Generate
      const html = await generateSingleHtml(
        projectStructure, 
        process.env.API_KEY, 
        (update) => setStatus(prev => ({ ...prev, ...update }))
      );

      setResultHtml(html);
      setStatus({ step: 'completed', message: 'Conversion successful!' });

    } catch (error: any) {
      console.error(error);
      setStatus({ step: 'error', message: error.message || "Something went wrong." });
    }
  };

  const reset = () => {
    setFile(null);
    setResultHtml(null);
    setStatus({ step: 'idle', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 flex flex-col font-sans selection:bg-primary-500/30">
      {/* Header */}
      <header className="border-b border-gray-800/60 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              React Bundler AI
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="hidden sm:flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              Powered by Gemini 2.5 Flash / 3 Pro
            </span>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {!resultHtml ? (
            <div className="flex flex-col items-center justify-center space-y-12 animate-fade-in">
              <div className="text-center space-y-6 max-w-3xl">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-sm text-primary-400 mb-4">
                  <Terminal className="w-3 h-3 mr-2" />
                  <span>Client-side Bundling via AI</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Turn your <span className="text-primary-500">React App</span> into a <br className="hidden md:block"/> single HTML file.
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Upload your project ZIP. Our AI analyzes the structure, resolves dependencies, and merges everything into one portable file.
                </p>
              </div>

              <div className="w-full max-w-2xl bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-2xl">
                <FileUploader 
                  onFileSelected={setFile} 
                  disabled={status.step !== 'idle' && status.step !== 'error'} 
                />

                <div className="mt-8 flex justify-center">
                  {status.step === 'idle' || status.step === 'error' ? (
                     <Button 
                     size="lg" 
                     className="w-full sm:w-auto min-w-[200px] text-lg py-3"
                     disabled={!file}
                     onClick={processFile}
                     icon={<Zap className="w-5 h-5 fill-current" />}
                   >
                     Bundle with AI
                   </Button>
                  ) : (
                    <div className="flex flex-col items-center space-y-4 w-full">
                       <div className="flex items-center space-x-3 text-primary-400">
                          <div className="relative">
                            <div className="w-3 h-3 bg-primary-500 rounded-full animate-ping absolute" />
                            <div className="w-3 h-3 bg-primary-500 rounded-full relative" />
                          </div>
                          <span className="font-medium text-lg animate-pulse">{status.message}</span>
                       </div>
                       
                       {/* Progress Bar Visual */}
                       <div className="w-full max-w-md h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-primary-500 transition-all duration-1000 ${
                            status.step === 'extracting' ? 'w-[20%]' :
                            status.step === 'analyzing' ? 'w-[40%]' :
                            status.step === 'generating' ? 'w-[80%]' : 'w-full'
                          }`} />
                       </div>
                       <p className="text-xs text-gray-500">This usually takes about 30-60 seconds.</p>
                    </div>
                  )}
                </div>
              </div>

              {status.step === 'error' && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/10 px-4 py-2 rounded-lg border border-red-900/30">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{status.message}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={reset} className="!text-gray-400 hover:!text-white">
                  ← Convert another project
                </Button>
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Bundling Complete</span>
                </div>
              </div>
              <ResultViewer htmlContent={resultHtml} />
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} React Bundler AI. Experimental Tool.</p>
          <p className="mt-2 text-xs">Note: Extremely large projects may exceed AI context limits.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
