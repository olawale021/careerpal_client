import { fetchApi } from "@/lib/api";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ResumeData, ResumeResponse, ScoreResponse } from "../types";

export function useResumeOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [response, setResponse] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("summary");
  
  // Score-related state
  const [scoreResult, setScoreResult] = useState<ScoreResponse | null>(null);
  const [scoringMode, setScoringMode] = useState<boolean>(true);
  const [isScoring, setIsScoring] = useState<boolean>(false);
  // const [resumeId, setResumeId] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [resumeResponse, setResumeResponse] = useState<ResumeResponse | null>(null);

  // Refs for auto-scrolling
  const responseSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scoreResultRef = useRef<HTMLDivElement>(null);
  const resumeContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      console.error("Error:", error);
    }
  }, [error]);

  useEffect(() => {
    if (response && responseSectionRef.current) {
      responseSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [response]);

  useEffect(() => {
    if (scoreResult && scoreResultRef.current) {
      scoreResultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [scoreResult]);

  // Handle "Score Another Resume" button click
  const handleScoreAnother = () => {
    setScoreResult(null);
    setScoringMode(true); // Make sure we're in scoring mode
  };

  // Convert score to star rating (0-5 scale)
  const getStarRating = (score: number) => {
    return (score / 100) * 5;
  };

  // Get color class based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };

  // Helper function to convert File to Base64 (kept for potential future use)
  // Currently not used after switching to FormData
  /* 
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  */

  // Submit form and call scoring API
  const handleScoreSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!file || !jobDescription) {
      alert("Please upload a resume and enter a job description.");
      return;
    }

    setIsScoring(true);
    setScoringMode(true); // Set to scoring mode when scoring
    
    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('job_description', jobDescription);
      // If using file directly instead of base64
      formData.append('file', file);
      
      const response = await fetchApi<{ data: ScoreResponse }>("/resume/score", {
        method: "POST",
        data: formData,
        // Let browser set content type with boundary
      });

      if (response?.data) {
        setScoreResult(response.data);
        console.log("Score response:", response.data);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Failed to score resume. Please try again.");
    } finally {
      setIsScoring(false);
    }
  };

  // Submit form and call optimization API
  const handleOptimize = async () => {
    setError(null);

    // Improved validation with more specific error messages
    if (!jobDescription?.trim()) {
      setError("Please enter a job description.");
      return;
    }

    if (!file) {
      setError("Please upload a resume file.");
      return;
    }

    setLoading(true);
    
    try {
      // Use FormData instead of JSON for consistency with the scoring function
      const formData = new FormData();
      formData.append('job_description', jobDescription.trim());
      formData.append('file', file);
      
      // Debug log to verify data
      console.log("Sending optimization request with FormData:", {
        hasJobDescription: !!jobDescription.trim(),
        jobDescriptionLength: jobDescription.trim().length,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      
      const response = await fetchApi<{ data: ResumeData }>("/resume/optimize", {
        method: "POST",
        data: formData,
        // Let browser set content type with boundary
      });

      // Add detailed console logging
      console.log("Full API response:", response);
      
      if (response?.data) {
        setResponse(response.data);
        setResumeResponse(response as unknown as ResumeResponse); // Store the full response
        setScoringMode(false); // Switch to optimization mode
        setActiveTab("summary");
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (error) {
      console.error("Error:", error);
      // More detailed error message based on the error
      if (error instanceof Error) {
        setError(error.message || "Failed to optimize resume. Please try again.");
      } else {
        setError("Failed to optimize resume. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    file,
    setFile,
    jobDescription,
    setJobDescription,
    response,
    loading,
    error,
    activeTab,
    setActiveTab,
    scoreResult,
    setScoreResult,
    scoringMode,
    isScoring,
    isPdfGenerating,
    setIsPdfGenerating,
    resumeResponse,
    responseSectionRef,
    fileInputRef,
    scoreResultRef,
    resumeContentRef,
    handleScoreSubmit,
    handleOptimize,
    handleScoreAnother,
    getStarRating,
    getScoreColorClass
  };
} 