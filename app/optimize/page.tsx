"use client";

import React, { } from "react";

import { FileText } from "lucide-react";

import ResumeUploadForm from "./components/ResumeUploadForm";
import ScoreResult from "./components/ScoreResult";
import OptimizedResume from "./components/OptimizedResume";
import LoadingState from "./components/LoadingState";
import ErrorMessage from "./components/ErrorMessage";
import { useResumeOptimizer } from "./hooks/useResumeOptimizer";
import { usePdfGenerator } from "./hooks/usePdfGenerator";



export default function OptimizeResume() {
  const {
    file,
    setFile,
    jobDescription,
    setJobDescription,
    response,
    loading,
    error,
    scoreResult,
    setScoreResult,
    scoringMode,
    isScoring,
    fileInputRef,
    resumeResponse,
    handleScoreSubmit,
    handleOptimize,
    handleScoreAnother
  } = useResumeOptimizer();

  const { isPdfGenerating, generatePdf, setIsPdfGenerating, error: pdfError } = usePdfGenerator();

  const handleDownloadPdf = async () => {
    if (response && resumeResponse) {
      setIsPdfGenerating(true);
      try {
        await generatePdf(response, resumeResponse);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setIsPdfGenerating(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Resume Review</h1>
      
      <form onSubmit={handleScoreSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form Section */}
          <ResumeUploadForm
            file={file}
            setFile={setFile}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            isScoring={isScoring}
            fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
          />

          {/* Right Column - Results Section */}
          <div>
            {loading ? (
              <LoadingState type="optimizing" />
            ) : isScoring ? (
              <LoadingState type="scoring" />
            ) : scoreResult && scoringMode ? (
              <ScoreResult 
                scoreResult={scoreResult} 
                handleOptimize={handleOptimize}
                loading={loading}
                setScoreResult={setScoreResult}
              />
            ) : response && !scoringMode ? (
              <OptimizedResume 
                response={response}
                handleDownloadPdf={handleDownloadPdf}
                handleScoreAnother={handleScoreAnother}
                isPdfGenerating={isPdfGenerating}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="p-3 bg-blue-50 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Two-Step Resume Optimization</h3>
                <p className="text-gray-600 max-w-md">
                  First, score your resume against the job description. If your score is good, you can proceed to optimize your resume to improve your chances of getting noticed.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
      
      {error && <ErrorMessage message={error} />}
      {pdfError && <ErrorMessage message={pdfError} />}
    </div>
  );
}