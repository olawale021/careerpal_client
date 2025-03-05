// Type Definitions for Resume Data
export interface WorkExperience {
  company: string;
  title: string;
  dates: string;
  bullets: string[];
  location?: string;
}

export interface Education {
  school: string;
  degree: string;
  dates: string;
  location?: string;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
}

export interface ResumeData {
  summary?: string;
  skills?: {
    technical_skills?: string[];
    soft_skills?: string[];
    [key: string]: string[] | undefined;
  };
  work_experience?: WorkExperience[];
  education?: Education[];
  certifications?: string[];
  projects?: Project[];
  contact_details?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
}

// Score response interface
export interface ScoreResponse {
  match_score: number;
  missing_skills: string[];
  recommendations: string[];
  matched_skills?: string[];
  extracted_text?: unknown;
}

// Update the state interface to include contact details
export interface ResumeResponse {
  data: ResumeData;
  original: unknown;
  contact_details: {
    name?: string;
    email?: string;
    phone_number?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
} 