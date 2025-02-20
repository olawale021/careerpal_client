"use client";

import React, { useState, DragEvent, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation"; // ✅ Import useRouter for navigation
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResumeScoreResponse {
  match_score: number;
  missing_skills: string[];
  recommendations: string[];
}

const UploadResume: React.FC = () => {
  const router = useRouter(); // ✅ Initialize Next.js Router
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [response, setResponse] = useState<ResumeScoreResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const API_URL: string = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  // Drag & Drop Handling
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // **Form Submission**
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !jobDescription) {
      alert("Please upload a resume and enter a job description.");
      return;
    }
  
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);
  
    try {
      const res = await fetch(`${API_URL}/resume/score`, {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
  
      const rawData = await res.json();
      console.log("Raw API Response:", rawData); //logging API response
  
      // ✅ Extracting nested `data` correctly
      const formattedResponse: ResumeScoreResponse = {
        match_score: rawData.data.match_score ?? 0,
        missing_skills: rawData.data.missing_skills ?? [],
        recommendations: rawData.data.recommendations ?? [],
      };
  
      console.log("Updating response state with:", formattedResponse);
      setResponse(formattedResponse); // Ensure state is updated
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to get resume score.");
    } finally {
      setLoading(false);
    }
  };
  

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Resume Match Analyzer</h2>
          <p className="text-gray-600 mb-6">
            Upload your resume and job description to get a detailed match analysis.
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {file ? (
                      <span className="flex items-center justify-center gap-2">
                        <FileText className="h-5 w-5" />
                        {file.name}
                      </span>
                    ) : (
                      "Drag and drop your resume, or click to select a file"
                    )}
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-500">PDF or DOCX up to 10MB</p>
              </div>
            </div>

            {/* Job Description Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description</label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="h-32"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !file || !jobDescription}
              variant="default"
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </form>

          {/* Results Section */}
          {/* Ensure response exists before rendering */}
{response ? (
  <div className="mt-8 space-y-6">
    <h3 className="text-lg font-semibold">Match Analysis</h3>

    {/* Match Score */}
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Match Score</span>
        <span className={`text-lg font-bold ${getScoreColor(response.match_score)}`}>
          {response.match_score}%
        </span>
      </div>
      <Progress value={response.match_score} className="h-2" />
    </div>

    {/* Missing Skills Alert */}
    {response.missing_skills.length > 0 && (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">Missing Skills:</span>
          <ul className="list-disc pl-5 mt-2">
            {response.missing_skills.map((skill, index) => (
              <li key={index} className="text-sm">{skill}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    )}

    {/* Recommendations Section */}
    {response.recommendations.length > 0 && (
      <div className="space-y-3">
        <h4 className="font-medium">Recommendations</h4>
        {response.recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
            <span>{rec}</span>
          </div>
        ))}
      </div>
    )}
  </div>
) : (
  <p className="text-center text-gray-500">No data available.</p>
)}

        </div>
      </Card>
    </div>
  );
};

export default UploadResume;
