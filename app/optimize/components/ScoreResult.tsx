import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, AlertCircle, X, Star, Check, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ScoreResponse } from "../types";

interface ScoreResultProps {
  scoreResult: ScoreResponse;
  handleOptimize: () => void;
  loading: boolean;
  setScoreResult: React.Dispatch<React.SetStateAction<ScoreResponse | null>>;
}

export default function ScoreResult({ 
  scoreResult, 
  handleOptimize, 
  loading,
  setScoreResult 
}: ScoreResultProps) {
  // Convert score to star rating (0-5 scale)
  const getStarRating = (score: number) => {
    return (score / 100) * 5;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-white border-b flex items-center space-x-2">
        <FileText className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold">Resume Match Score</h2>
      </div>
      
      <div className="p-6">
        {/* Modern Circular Score Gauge */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-48 h-48">
            {/* SVG Gauge */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="16"
              />
              
              {/* Score arc */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={scoreResult.match_score >= 40 ? "#10b981" : "#f43f5e"}
                strokeWidth="16"
                strokeDasharray={`${(scoreResult.match_score / 100) * 502} 502`}
                strokeDashoffset={-126}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
              
              {/* Score text */}
              <text
                x="100"
                y="90"
                textAnchor="middle"
                fontSize="48"
                fontWeight="700"
                fill={scoreResult.match_score >= 40 ? "#10b981" : "#f43f5e"}
              >
                {Math.round(scoreResult.match_score)}
              </text>
              <text
                x="100"
                y="120"
                textAnchor="middle"
                fontSize="18"
                fill="#6b7280"
              >
                out of 100
              </text>
            </svg>
          </div>
          
          <div className="flex items-center justify-center mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => {
                const rating = getStarRating(scoreResult.match_score);
                const fullStar = star <= Math.floor(rating);
                const halfStar = !fullStar && star === Math.ceil(rating) && rating % 1 >= 0.3;
                
                return (
                  <div key={star} className="w-5 h-5 mx-0.5">
                    {fullStar ? (
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ) : halfStar ? (
                      <div className="relative">
                        <Star className="absolute w-5 h-5 text-gray-300" />
                        <div className="absolute overflow-hidden w-2.5 h-5">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    ) : (
                      <Star className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                );
              })}
            </div>
            <span className="ml-2 text-sm text-gray-500">
              {getStarRating(scoreResult.match_score).toFixed(1)} Rating
            </span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Skills Analysis */}
        <div className="mb-4">
          <h3 className="font-medium text-gray-800 mb-2">Skills Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Missing Skills */}
            {scoreResult.missing_skills && scoreResult.missing_skills.length > 0 && (
              <div className="bg-gray-50 border rounded-lg p-3">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center text-sm">
                  <X className="h-4 w-4 mr-1 text-amber-500" />
                  Missing Skills ({scoreResult.missing_skills.length})
                </h4>
                <ul className="space-y-1 pl-2 text-xs">
                  {scoreResult.missing_skills.map((skill, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-600 mr-1.5 flex-shrink-0 p-0.5">
                        <X className="h-2 w-2" />
                      </span>
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Matched Skills */}
            {scoreResult.matched_skills && scoreResult.matched_skills.length > 0 && (
              <div className="bg-green-50 border rounded-lg p-3">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center text-sm">
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  Matched Skills ({scoreResult.matched_skills.length})
                </h4>
                <ul className="space-y-1 pl-2 text-xs">
                  {scoreResult.matched_skills.map((skill, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-1.5 flex-shrink-0 p-0.5">
                        <Check className="h-2 w-2" />
                      </span>
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Recommendations */}
            {scoreResult.recommendations && scoreResult.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 md:col-span-2">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recommendations ({scoreResult.recommendations.length})
                </h4>
                <ul className="space-y-1 pl-2 text-xs">
                  {scoreResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-1.5 flex-shrink-0 p-0.5">
                        <Check className="h-2 w-2" />
                      </span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        {scoreResult.match_score < 40 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 mb-2">Your resume needs improvement</h4>
                <p className="text-amber-700 text-sm mb-3">
                  Your resume score is below 40%, which suggests it may not be well-aligned with this job description.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/resume/create" className="inline-flex items-center justify-center bg-black text-white font-medium py-2 px-4 rounded hover:bg-gray-800 transition-colors text-sm">
                    Create a new resume for this job
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                  <Button 
                    onClick={() => setScoreResult(null)}
                    variant="outline" 
                    className="text-sm"
                  >
                    Try another resume
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Button 
              onClick={handleOptimize} 
              disabled={loading}
              className="w-full bg-black text-white hover:bg-gray-800 font-medium"
            >
              {loading ? 'Optimizing...' : 'Optimize Resume'}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 