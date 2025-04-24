"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, FileText, Loader, Upload, X } from "lucide-react";
import { MobileResumeUploaderProps } from "./types";

export function MobileResumeUploader({
  resumes,
  selectedResumeId,
  handleResumeSelect,
  fileInputRef,
  handleFileChange,
  file,
  setFile,
  isLoading,
  scoreResume,
  jobDescription
}: MobileResumeUploaderProps) {
  return (
    <div className="px-2 py-3">
      <div className="flex items-center mb-3">
        <FileText className="h-5 w-5 text-gray-600 mr-2" />
        <h2 className="text-base font-semibold">Resume Match Score</h2>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex flex-col gap-2">
          {/* Resume selection dropdown */}
          <div className="relative w-full">
            <select
              id="mobile-resume-select"
              className="w-full p-2.5 bg-white border border-gray-300 text-gray-700 rounded-md appearance-none pr-8"
              value={selectedResumeId || ""}
              onChange={handleResumeSelect}
            >
              <option value="">Select a resume</option>
              {resumes.map((resume) => (
                <option key={resume.resume_id} value={resume.resume_id}>
                  {resume.file_name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
          
          {/* Upload option */}
          <div className="relative">
            <Button 
              variant="outline"
              className="w-full p-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
        
        {/* Show selected file */}
        {file && (
          <div className="mt-2 flex items-center bg-white p-2 rounded border">
            <FileText className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
            <button 
              className="text-gray-500 hover:text-red-500"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = '';
                setFile(null);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Score button */}
      <Button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          scoreResume();
        }}
        disabled={isLoading || !jobDescription || (!selectedResumeId && !file)} 
        className="w-full py-2 bg-black text-white font-medium rounded-md"
      >
        {isLoading ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Score Resume"
        )}
      </Button>
    </div>
  );
} 