import React, { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ResumeUploadFormProps {
  file: File | null;
  setFile: (file: File | null) => void;
  jobDescription: string;
  setJobDescription: (description: string) => void;
  isScoring: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onSubmit?: (e: React.FormEvent) => void;
}

export default function ResumeUploadForm({
  file,
  setFile,
  jobDescription,
  setJobDescription,
  isScoring,
  fileInputRef,
  onSubmit
}: ResumeUploadFormProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-6 h-min">
        <h2 className="text-xl font-semibold mb-6">Upload Documents</h2>
        
        {/* Resume Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Resume</label>
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-1">
                {file ? file.name : "Drop your resume here or click to browse"}
              </p>
              <p className="text-xs text-gray-500">
                Accepted formats: PDF, DOC, DOCX
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Job Description</label>
          <textarea 
            className="w-full h-40 rounded-lg border-gray-200 resize-none focus:ring-2 focus:ring-blue-500 p-3"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <Button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            disabled={!file || !jobDescription || isScoring}
          >
            {isScoring ? 'Scoring...' : 'Score Resume'}
          </Button>
        </div>
      </div>
    </form>
  );
} 