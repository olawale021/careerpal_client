import React from "react";
import { Award } from "lucide-react";

interface CertificationsProps {
  certifications?: string[];
}

export default function Certifications({ certifications }: CertificationsProps) {
  if (!certifications || certifications.length === 0) {
    return (
      <>
        <h3 className="text-xl font-semibold mb-4">Certifications</h3>
        <p className="text-gray-500 italic">No certifications available</p>
      </>
    );
  }

  return (
    <>
      <h3 className="text-xl font-semibold mb-4">Certifications</h3>
      <div className="space-y-4">
        {certifications.map((cert, index) => (
          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Award className="h-5 w-5 text-yellow-500 mr-3" />
            <span className="text-gray-700">{cert}</span>
          </div>
        ))}
      </div>
    </>
  );
} 