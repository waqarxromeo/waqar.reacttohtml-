import React, { useState, useEffect } from 'react';
import { Download, Eye, Code, Check } from 'lucide-react';
import { Button } from './Button';

interface ResultViewerProps {
  htmlContent: string;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ htmlContent }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bundled-app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 animate-fade-in-up">
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900/50">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">Generation Complete</h3>
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'preview' 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'code' 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Code className="w-4 h-4 mr-2" />
                Source
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" onClick={handleCopy} className="!py-1.5 !text-sm">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Code className="w-4 h-4 mr-2" />}
              {copied ? 'Copied' : 'Copy HTML'}
            </Button>
            <Button onClick={handleDownload} className="!py-1.5 !text-sm">
              <Download className="w-4 h-4 mr-2" />
              Download HTML
            </Button>
          </div>
        </div>

        <div className="relative h-[600px] bg-gray-900">
          {activeTab === 'preview' ? (
            <iframe
              title="Preview"
              srcDoc={htmlContent}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-modals"
            />
          ) : (
            <div className="w-full h-full overflow-auto p-6">
              <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap break-all">
                {htmlContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
