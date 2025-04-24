"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useResumeCache } from "@/hooks/use-resume-cache";
import { fetchApi } from "@/lib/api";
import { AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { memo, useEffect, useRef, useState } from "react";
import { MobileResumeUploader } from "./MobileResumeUploader";
import { ResumeUploader } from "./ResumeUploader";
import { ScoreButton } from "./ScoreButton";
import { ScoreDetails } from "./ScoreDetails";
import { ScoreGauge } from "./ScoreGauge";
import { ResumeScoreProps, ScoreResponse } from "./types";

// Wrap the component with memo to prevent unnecessary rerenders
const ResumeScore: React.FC<ResumeScoreProps> = memo(({ jobDescription, resumeId }) => {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Add this line to create the file input reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch User ID only once
  useEffect(() => {
    const fetchUserIdOnce = async () => {
      if (!session?.user?.email || userId) return;

      try {
        setError(null);
        const response = await fetchApi<{ user_id: string }>(`/users/lookup/email?email=${encodeURIComponent(session.user.email)}`, {
          headers: { Authorization: `Bearer ${session?.user?.jwt}` },
        });

        if (response?.user_id) {
          setUserId(response.user_id);
        } else {
          throw new Error("User ID not found.");
        }
      } catch (err) {
        console.error("Error fetching user ID:", err);
        setError("Failed to fetch user ID.");
      }
    };

    fetchUserIdOnce();
  }, [session?.user?.email, session?.user?.jwt, userId]);

  // Use the cached resume hook
  const {
    resumes,
    loading: isLoadingResumes,
    error: resumeError,
    selectedResumeId,
    setSelectedResumeId
  } = useResumeCache(
    userId,
    resumeId,
    session?.user?.jwt
  );

  // Set error from resume hook if needed
  useEffect(() => {
    if (resumeError) {
      setError(resumeError);
    }
  }, [resumeError]);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSelectedResumeId(null);
      setError(null);
    }
  };

  // Handle resume selection from dropdown
  const handleResumeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedResumeId(e.target.value || null);
    setFile(null);
  };

  // Helper function to convert File to Base64
  // const fileToBase64 = (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => {
  //       const base64 = reader.result as string;
  //       // Remove data URL prefix (e.g., "data:application/pdf;base64,")
  //       const base64Data = base64.split(',')[1];
  //       resolve(base64Data);
  //     };
  //     reader.onerror = (error) => reject(error);
  //   });
  // };

  // Submit resume for scoring
  const scoreResume = async () => {
    if (!jobDescription) {
      setError("No job description available for scoring.");
      return;
    }

    if (!selectedResumeId && !file) {
      setError("Please either select an existing resume or upload a new one.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Log the request data for debugging
      console.log("[ResumeScore] Resume scoring request initiated");
      console.log("[ResumeScore] Using cached resume ID:", selectedResumeId);
      
      // Create the request data body
      const requestData = new FormData();
      requestData.append('job_description', jobDescription);
      
      if (selectedResumeId) {
        requestData.append('resume_id', selectedResumeId);
      } else if (file) {
        requestData.append('file', file);
      }

      // Using fetch directly instead of the fetchApi wrapper
      const response = await fetch(`/api/proxy?path=/resume/score`, {
        method: 'POST',
        body: requestData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error (${response.status}): ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      if (data?.data) {
        setScoreResult(data.data);
        console.log("[ResumeScore] Score result received:", data.data.match_score);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (err) {
      console.error("[ResumeScore] Score Resume Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSelectedResumeName = () => {
    if (file) return file.name;
    if (selectedResumeId) {
      const selected = resumes.find(r => r.resume_id === selectedResumeId);
      return selected ? selected.file_name : 'Selected Resume';
    }
    return '';
  };

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Log when the component re-renders for debugging
  console.log("[ResumeScore] Render with resumes:", resumes.length, "isLoadingResumes:", isLoadingResumes);

  return (
    <Card className={`mt-3 ${isMobile ? 'border-0 shadow-none' : 'border rounded-lg'}`}>
      <CardContent className="p-0">
        {!scoreResult ? (
          isLoadingResumes ? (
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm text-gray-500">Loading your resumes...</p>
            </div>
          ) : isMobile ? (
            <MobileResumeUploader
              resumes={resumes}
              selectedResumeId={selectedResumeId}
              handleResumeSelect={handleResumeSelect}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              file={file}
              setFile={setFile}
              isLoading={isLoading}
              scoreResume={scoreResume}
              jobDescription={jobDescription}
            />
          ) : (
            <div className="p-6">
              <ResumeUploader
                resumes={resumes}
                selectedResumeId={selectedResumeId}
                handleResumeSelect={handleResumeSelect}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                file={file}
                setFile={setFile}
                formatDate={formatDate}
                getSelectedResumeName={getSelectedResumeName}
              />

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <ScoreButton 
                isLoading={isLoading}
                jobDescription={jobDescription}
                selectedResumeId={selectedResumeId}
                file={file}
                scoreResume={scoreResume}
              />
            </div>
          )
        ) : (
          <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <ScoreGauge score={scoreResult.match_score} />
            <ScoreDetails 
              scoreResult={scoreResult}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Add display name for debugging
ResumeScore.displayName = 'ResumeScore';

export default ResumeScore; 