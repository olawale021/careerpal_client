import React from "react";

interface SkillsProps {
  skills?: {
    technical_skills?: string[];
    soft_skills?: string[];
    [key: string]: string[] | undefined;
  };
}

export default function Skills({ skills }: SkillsProps) {
  if (!skills) {
    return (
      <>
        <h3 className="text-xl font-semibold mb-4">Skills</h3>
        <p className="text-gray-500 italic">No skills information available</p>
      </>
    );
  }

  return (
    <>
      <h3 className="text-xl font-semibold mb-4">Skills</h3>
      <div className="space-y-6">
        {Object.entries(skills).map(([category, skillList]) => {
          if (!skillList) return null;
          
          const formattedCategory = category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          return (
            <div key={category} className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">
                {formattedCategory}
              </h4>
              <div className="flex flex-wrap gap-2">
                {skillList.map((skill: string, index: number) => (
                  <span 
                    key={`${category}-${index}`}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
} 