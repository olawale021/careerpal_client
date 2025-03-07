import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { useResumeEdit } from "../../context/ResumeEditContext";

interface SummaryProps {
  summary?: string;
}

export default function Summary({ summary }: SummaryProps) {
  const { editableResume, updateResumeField } = useResumeEdit();
  
  React.useEffect(() => {
    if (summary && !editableResume.summary) {
      updateResumeField('summary', summary);
    }
  }, [summary, editableResume.summary, updateResumeField]);

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateResumeField('summary', e.target.value);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Professional Summary</h3>
      <Textarea 
        className="min-h-[120px] text-base"
        value={editableResume.summary || ''}
        onChange={handleSummaryChange}
        placeholder="Your professional summary..."
      />
      <p className="text-sm text-gray-500">
        A concise overview of your professional background and key strengths.
      </p>
    </div>
  );
} 