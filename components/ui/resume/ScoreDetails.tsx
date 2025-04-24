"use client";

import { ResumeAnalysis } from "@/types/resume";
import { AlertCircle, Check } from "lucide-react";

export function ScoreDetails({ scoreResult }: { scoreResult: ResumeAnalysis }) {
  return (
    <div className="mt-6 space-y-6">
      {/* Skill Match Analysis */}
      <div className="space-y-3">
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold">Matched Skills</h3>
        </div>
        
        <div className="pl-7">
          {scoreResult.matched_skills && scoreResult.matched_skills.length > 0 ? (
            <ul className="space-y-1">
              {scoreResult.matched_skills.map((skill, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-green-500 text-lg mr-1.5">•</span>
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No matched skills found.</p>
          )}
        </div>
      </div>

      {/* Missing Skills Section */}
      <div className="space-y-3">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
          <h3 className="text-lg font-semibold">Missing Skills</h3>
        </div>
        
        <div className="pl-7">
          {scoreResult.missing_skills && scoreResult.missing_skills.length > 0 ? (
            <ul className="space-y-1">
              {scoreResult.missing_skills.map((skill, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-amber-500 text-lg mr-1.5">•</span>
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No missing skills found.</p>
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Recommendations</h3>
        <div className="bg-blue-50 p-4 rounded-md">
          <ul className="space-y-2">
            {scoreResult.recommendations?.map((rec, index) => (
              <li key={index} className="text-sm text-gray-700">
                {index + 1}. {rec}
              </li>
            )) || <li className="text-sm text-gray-500 italic">No recommendations available.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
} 