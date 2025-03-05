import React from "react";

interface SummaryProps {
  summary?: string;
}

export default function Summary({ summary }: SummaryProps) {
  return (
    <>
      <h3 className="text-xl font-semibold mb-4">Professional Summary</h3>
      <div className="prose max-w-none">
        {summary ? (
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        ) : (
          <p className="text-gray-500 italic">No summary available</p>
        )}
      </div>
    </>
  );
} 