import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (content: string) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File) => {
    if (file && file.type === "text/plain") {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          onFileSelect(text);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a .txt file");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300 ease-out
          ${dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleChange}
          accept=".txt"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {fileName ? (
            <>
              <div className="p-4 bg-purple-500/20 rounded-full mb-4 text-purple-400">
                <FileText className="w-10 h-10" />
              </div>
              <p className="text-lg font-medium text-zinc-200">{fileName}</p>
              <p className="text-sm text-zinc-400 mt-2">Ready for analysis</p>
            </>
          ) : (
            <>
              <div className={`p-4 rounded-full mb-4 transition-colors ${dragActive ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'}`}>
                <Upload className="w-10 h-10" />
              </div>
              <p className="mb-2 text-lg font-medium text-zinc-200">
                <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-zinc-500">
                Export your chat history (WhatsApp, Telegram, Discord, etc.) as a .txt file
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
