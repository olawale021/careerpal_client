// Types for resume score response
export interface ScoreResponse {
  match_score: number;
  missing_skills: string[];
  recommendations: string[];
  matched_skills?: string[];
  extracted_text?: unknown; // For debugging
}

export interface Resume {
  resume_id: string;
  file_name: string;
  uploaded_at: string;
  signed_url: string;
}

export interface ResumeScoreProps {
  jobDescription?: string;
  resumeId?: string;
  jobTitle?: string;
}

// UI components props
export interface ResumeUploaderProps {
  resumes: Resume[];
  selectedResumeId: string | null;
  handleResumeSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  formatDate: (date: string) => string;
  getSelectedResumeName: () => string;
}

export interface ScoreButtonProps {
  isLoading: boolean;
  jobDescription?: string;
  selectedResumeId: string | null;
  file: File | null;
  scoreResume: () => void;
}

export interface ScoreGaugeProps {
  score: number;
}

export interface ScoreDetailsProps {
  scoreResult: ScoreResponse;
  getScoreColorClass: (score: number) => string;
}

export interface MobileResumeUploaderProps {
  resumes: Resume[];
  selectedResumeId: string | null;
  handleResumeSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  isLoading: boolean;
  scoreResume: () => void;
  jobDescription?: string;
} 