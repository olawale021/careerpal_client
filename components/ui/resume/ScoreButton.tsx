"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader } from "lucide-react";
import { ScoreButtonProps } from "./types";

export function ScoreButton({
  isLoading,
  jobDescription,
  selectedResumeId,
  file,
  scoreResume
}: ScoreButtonProps) {
  const handleScoreClick = () => {
    // Debug logging
    console.log("Score Resume button clicked");
    console.log("Job description available:", !!jobDescription);
    console.log("Job description type:", typeof jobDescription);
    console.log("Job description length:", jobDescription?.length || 0);
    console.log("Selected resume ID:", selectedResumeId);
    console.log("Uploaded file:", file?.name || "none");
    
    scoreResume();
  };

  return (
    <>
      <Button 
        onClick={handleScoreClick} 
        disabled={isLoading || !jobDescription || (!selectedResumeId && !file)} 
        className="w-full mt-4 bg-black text-white font-medium py-2.5 px-4 rounded hover:bg-gray-800 transition-colors"
      >
        {isLoading ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Analyzing Resume...
          </>
        ) : (
          "Score Resume"
        )}
      </Button>
      
      {!jobDescription && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Required</AlertTitle>
          <AlertDescription className="text-sm">
            Select a job to enable resume scoring
          </AlertDescription>
        </Alert>
      )}
    </>
  );
} 