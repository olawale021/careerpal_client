import React, { createContext, useContext, useState } from 'react';
import { ResumeData, Project } from '../types';

interface ResumeEditContextType {
  editableResume: ResumeData;
  updateResumeField: <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => void;
  updateWorkExperience: (index: number, field: keyof Project, value: unknown) => void;
  updateEducation: (index: number, field: string, value: unknown) => void;
  updateSkills: (category: string, skills: string[]) => void;
  updateProject: (index: number, field: keyof Project, value: unknown) => void;
  resetToOriginal: (originalData: ResumeData) => void;
  updateProjects: (projects: Project[]) => void;
}

const ResumeEditContext = createContext<ResumeEditContextType | undefined>(undefined);

export function ResumeEditProvider({ children, initialData }: { children: React.ReactNode; initialData: ResumeData }) {
  const [editableResume, setEditableResume] = useState<ResumeData>(initialData);

  const updateResumeField = <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setEditableResume(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateWorkExperience = (index: number, field: keyof Project, value: unknown) => {
    if (!editableResume.work_experience) return;
    
    const updatedExperience = [...editableResume.work_experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    
    setEditableResume(prev => ({
      ...prev,
      work_experience: updatedExperience
    }));
  };

  const updateEducation = (index: number, field: string, value: unknown) => {
    if (!editableResume.education) return;
    
    const updatedEducation = [...editableResume.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    
    setEditableResume(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const updateSkills = (category: string, skills: string[]) => {
    setEditableResume(prev => ({
      ...prev,
      skills: {
        ...(prev.skills || {}),
        [category]: skills
      }
    }));
  };

  const updateProject = (index: number, field: keyof Project, value: unknown) => {
    if (!editableResume.projects) return;
    
    const updatedProjects = [...editableResume.projects];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value
    };
    
    setEditableResume(prev => ({
      ...prev,
      projects: updatedProjects
    }));
  };

  const resetToOriginal = (originalData: ResumeData) => {
    setEditableResume(originalData);
  };

  const updateProjects = (projects: Project[]) => {
    setEditableResume(prev => ({
      ...prev,
      projects
    }));
  };

  return (
    <ResumeEditContext.Provider 
      value={{ 
        editableResume, 
        updateResumeField,
        updateWorkExperience,
        updateEducation,
        updateSkills,
        updateProject,
        resetToOriginal,
        updateProjects
      }}
    >
      {children}
    </ResumeEditContext.Provider>
  );
}

export function useResumeEdit() {
  const context = useContext(ResumeEditContext);
  if (context === undefined) {
    throw new Error('useResumeEdit must be used within a ResumeEditProvider');
  }
  return context;
} 