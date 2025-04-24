"use client";

import { FileText, Upload, X } from "lucide-react";
import { ResumeUploaderProps } from "./types";

export function ResumeUploader({
  resumes,
  selectedResumeId,
  handleResumeSelect,
  fileInputRef,
  handleFileChange,
  file,
  setFile,
  formatDate,
  getSelectedResumeName,
}: ResumeUploaderProps) {
  return (
    <div>
      {/* Resume Selection & Upload in one line */}
      <div className="flex items-center gap-3">
        <div className="flex-grow">
          <select
            className="w-full p-2.5 bg-white border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            value={selectedResumeId || ""}
            onChange={handleResumeSelect}
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">Select a resume</option>
            {resumes.map((resume) => (
              <option key={resume.resume_id} value={resume.resume_id}>
                {resume.file_name} - {formatDate(resume.uploaded_at)}
              </option>
            ))}
          </select>
        </div>
        
        <span className="text-gray-400">or</span>
        
        <div>
          <label htmlFor="file-upload" className="cursor-pointer flex items-center text-blue-600 hover:text-blue-500 text-sm">
            <Upload className="h-4 w-4 mr-1" />
            <span>Upload resume</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
          <span className="text-xs text-gray-500 block mt-1">PDF, DOC up to 10MB</span>
        </div>
      </div>

      {/* Selected File Info */}
      {(file || selectedResumeId) && (
        <div className="mt-4 flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
          <FileText className="h-5 w-5 text-blue-500 mr-2" />
          <div className="text-sm font-medium text-gray-700 truncate flex-1">
            {getSelectedResumeName()}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
} 