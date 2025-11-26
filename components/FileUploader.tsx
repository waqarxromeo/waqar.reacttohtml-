import React, { useCallback, useState } from 'react';
import { Upload, FileArchive, X, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    // Basic validation for zip
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError("Please upload a .zip file. .rar files are not supported by the browser-based extractor.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [onFileSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    // You might want to notify parent to clear file as well if needed
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`
          relative flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-2xl transition-all duration-300
          ${dragActive 
            ? 'border-primary-500 bg-primary-500/10 scale-[1.02]' 
            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleChange}
              accept=".zip"
              disabled={disabled}
            />
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="p-4 mb-4 rounded-full bg-gray-700/50">
                <Upload className="w-10 h-10 text-gray-400" />
              </div>
              <p className="mb-2 text-xl font-semibold text-gray-300">
                Drop your React Project here
              </p>
              <p className="text-sm text-gray-500">
                Support for .zip archives (Max 50MB)
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-6 animate-fade-in">
             <div className="p-4 mb-4 rounded-full bg-green-500/20 ring-1 ring-green-500/50">
                <FileArchive className="w-10 h-10 text-green-400" />
              </div>
            <p className="text-lg font-medium text-white mb-2">{selectedFile.name}</p>
            <p className="text-sm text-gray-400 mb-6">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            
            <button 
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-3 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};