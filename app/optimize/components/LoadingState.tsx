import React from "react";
import { Loader } from "lucide-react";

interface LoadingStateProps {
  type: "scoring" | "optimizing";
}

export default function LoadingState({ type }: LoadingStateProps) {
  const title = type === "scoring" ? "Scoring your resume..." : "Optimizing your resume...";
  const description = type === "scoring" 
    ? "We're analyzing how well your resume matches this job description."
    : "We're analyzing your resume against the job description to provide tailored improvements.";

  return (
    <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center justify-center text-center h-full">
      <Loader className="h-10 w-10 text-blue-500 animate-spin mb-4" />
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md">{description}</p>
    </div>
  );
} 