import { useState, useRef, useEffect, FormEvent } from "react";
import { fetchApi } from "@/lib/api";
import { ResumeData, ScoreResponse, ResumeResponse } from "../types";

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
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      const response = await fetchApi("/resume/score", {
        method: "POST",
        body: formData,
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

    if (!file || !jobDescription) {
      alert("Please upload a resume and enter a job description.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      const response = await fetchApi("/resume/optimize", {
        method: "POST",
        body: formData,
      });

      // Add detailed console logging
      console.log("Full API response:", response);
      console.log("Contact details:", response?.contact_details);
      
      if (response?.data) {
        setResponse(response.data);
        setResumeResponse(response); // Store the full response
        setScoringMode(false); // Switch to optimization mode
        setActiveTab("summary");
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to optimize resume. Please try again.");
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