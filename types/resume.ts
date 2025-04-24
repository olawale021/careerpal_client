export interface ResumeAnalysis {
  matched_skills?: string[];
  missing_skills?: string[];
  recommendations: string[];
  match_percentage?: number;
  match_score?: number;
} 