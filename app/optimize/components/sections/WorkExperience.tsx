import React from "react";
import { Calendar, Briefcase, MapPin } from "lucide-react";
import { WorkExperience } from "../../types";

interface WorkExperienceProps {
  workExperience?: WorkExperience[];
}

export default function WorkExperienceSection({ workExperience }: WorkExperienceProps) {
  if (!workExperience || workExperience.length === 0) {
    return (
      <>
        <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
        <p className="text-gray-500 italic">No work experience available</p>
      </>
    );
  }

  return (
    <>
      <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
      <div className="space-y-8">
        {workExperience.map((exp, index) => (
          <div key={index} className="border-l-2 border-gray-200 pl-4 py-1 hover:border-blue-500 transition-colors">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-lg text-gray-800">{exp.title}</h4>
              <span className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> {exp.dates}
              </span>
            </div>
            
            <div className="text-gray-700 font-medium mb-2 flex items-center">
              <Briefcase className="h-4 w-4 mr-1 text-gray-500" /> {exp.company}
              {exp.location && (
                <>
                  <span className="mx-2">•</span>
                  <MapPin className="h-3 w-3 mr-1 text-gray-500" /> {exp.location}
                </>
              )}
            </div>

            <ul className="mt-2 space-y-2">
              {exp.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 mr-2"></span>
                  <span className="text-gray-600">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
} 