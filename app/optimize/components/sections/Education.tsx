import React from "react";
import { GraduationCap, Calendar, MapPin } from "lucide-react";
import { Education } from "../../types";

interface EducationProps {
  education?: Education[];
}

export default function EducationSection({ education }: EducationProps) {
  if (!education || education.length === 0) {
    return (
      <>
        <h3 className="text-xl font-semibold mb-4">Education</h3>
        <p className="text-gray-500 italic">No education information available</p>
      </>
    );
  }

  return (
    <>
      <h3 className="text-xl font-semibold mb-4">Education</h3>
      <div className="space-y-6">
        {education.map((edu, index) => (
          <div key={index} className="flex items-start">
            <div className="bg-blue-50 p-3 rounded-lg mr-4">
              <GraduationCap className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
              <p className="text-gray-600">{edu.school}</p>
              <div className="text-sm text-gray-500 mt-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> {edu.dates}
                {edu.location && (
                  <>
                    <span className="mx-2">•</span>
                    <MapPin className="h-3 w-3 mr-1" /> {edu.location}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
} 