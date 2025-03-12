"use client";

import React, { FormEvent } from "react";

import { FileText } from "lucide-react";

import ResumeUploadForm from "./components/ResumeUploadForm";
import ScoreResult from "./components/ScoreResult";
import OptimizedResume from "./components/OptimizedResume";
import LoadingState from "./components/LoadingState";
import ErrorMessage from "./components/ErrorMessage";
import { useResumeOptimizer } from "./hooks/useResumeOptimizer";
import { usePdfGenerator } from "./hooks/usePdfGenerator";
import { ResumeEditProvider } from "./context/ResumeEditContext";
import { ResumeData } from "./types";



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
  } = useResumeOptimizer();

  const { isPdfGenerating, downloadPdf, setIsPdfGenerating, error: pdfError } = usePdfGenerator();

  const handleDownloadPdf = async (editableResume?: ResumeData) => {
    if (response && resumeResponse) {
      setIsPdfGenerating(true);
      try {
        await downloadPdf({...response, ...(editableResume || {})}, resumeResponse);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setIsPdfGenerating(false);
      }
    }
  };

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-screen pb-16">
      <div className="w-full px-4 py-4 sm:py-6 sm:px-6 md:max-w-7xl md:mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">Resume Review</h1>
        
        <div className="flex flex-col md:flex-row md:gap-4">
          {/* Left Column - Upload Form */}
          <div className="w-full md:w-[40%] flex flex-col space-y-4">
            <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <ResumeUploadForm
                  file={file}
                  setFile={setFile}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  isScoring={isScoring}
                  fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                  onSubmit={(e: FormEvent<Element>) => handleScoreSubmit(e as FormEvent<HTMLFormElement>)}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="w-full md:w-[60%] mt-4 md:mt-0">
            <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
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
                  <ResumeEditProvider initialData={response}>
                    <OptimizedResume
                      response={response}
                      handleDownloadPdf={handleDownloadPdf}
                      isPdfGenerating={isPdfGenerating}
                    />
                  </ResumeEditProvider>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="p-3 bg-blue-50 rounded-full mb-4">
                      <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">Two-Step Resume Optimization</h3>
                    <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                      First, score your resume against the job description. Then, optimize your resume to improve your chances of getting noticed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {error && <ErrorMessage message={error} className="mt-4" />}
        {pdfError && <ErrorMessage message={pdfError} className="mt-4" />}
      </div>
    </div>
  );
}