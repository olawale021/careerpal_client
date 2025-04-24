import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FileText, Upload } from "lucide-react";
import React, { ChangeEvent } from "react";

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
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Upload Documents</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Resume Upload */}
          <div>
            <Label htmlFor="resume-upload" className="text-sm font-medium mb-2">Resume</Label>
            <div
              className={cn(
                "mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
                file 
                  ? "border-green-400 bg-green-50" 
                  : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                {file ? (
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                ) : (
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                )}
                <p className="text-sm font-medium mb-1">
                  {file ? file.name : "Drop your resume here or click to browse"}
                </p>
                <p className="text-xs text-gray-500">
                  Accepted formats: PDF, DOC, DOCX
                </p>
              </div>
            </div>
            <input
              id="resume-upload"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Job Description */}
          <div>
            <Label htmlFor="job-description" className="text-sm font-medium">Job Description</Label>
            <Textarea 
              id="job-description"
              className="mt-2 min-h-40 resize-none"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              For best results, include the complete job description with requirements and responsibilities.
            </p>
          </div>

          {/* Action Button */}
          <Button 
            type="submit"
            className="w-full font-medium"
            variant="default"
            size="lg"
            disabled={!file || !jobDescription.trim() || isScoring}
          >
            {isScoring ? 'Scoring Resume...' : 'Score Resume'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
} 