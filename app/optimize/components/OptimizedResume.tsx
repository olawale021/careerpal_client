import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, Edit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeData, ResumeResponse } from "../types";
import { ResumeEditProvider, useResumeEdit } from "../context/ResumeEditContext";
import Summary from "./sections/Summary";
import Skills from "./sections/Skills";
import WorkExperience from "./sections/WorkExperience";
import Education from "./sections/Education";
import Certifications from "./sections/Certifications";
import Projects from "./sections/Projects";
import { usePdfGenerator } from "../hooks/usePdfGenerator";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface OptimizedResumeProps {
  response: ResumeData;
  handleDownloadPdf: (editableResume?: ResumeData) => void;
  isPdfGenerating: boolean;
}

interface OptimizedResumeContentProps {
  response: ResumeData;
  handleDownloadPdf: (editableResume?: ResumeData) => void;
  isPdfGenerating: boolean;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  resumeContentRef: React.RefObject<HTMLDivElement | null>;
}

export default function OptimizedResume({
  response,
  handleDownloadPdf,
  isPdfGenerating
}: OptimizedResumeProps) {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const resumeContentRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  return (
    <ResumeEditProvider initialData={response}>
      <OptimizedResumeContent 
        response={response}
        handleDownloadPdf={handleDownloadPdf}
        isPdfGenerating={isPdfGenerating}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        resumeContentRef={resumeContentRef}
      />
    </ResumeEditProvider>
  );
}

function OptimizedResumeContent({
  response,
  handleDownloadPdf,
  isPdfGenerating,
  isEditMode,
  setIsEditMode,
  activeTab,
  setActiveTab,
  resumeContentRef
}: OptimizedResumeContentProps) {
  const { editableResume } = useResumeEdit();
  const { generatePreview, previewUrl } = usePdfGenerator();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const handlePreview = async () => {
    const resumeResponse = {
      data: editableResume,
      original: response
    } as ResumeResponse;
    await generatePreview(editableResume, resumeResponse);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="p-3 sm:p-4 bg-white border-b">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Optimized Resume</h2>
            </div>
            
            {/* Action Buttons - Stack on mobile */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditMode(!isEditMode);
                }}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-xs flex items-center justify-center"
              >
                {isEditMode ? 'View Mode' : 'Edit Mode'}
                <Edit className="ml-1 h-3 w-3" />
              </Button>
              
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handlePreview();
                }}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-xs flex items-center justify-center"
              >
                Preview
                <FileText className="ml-1 h-3 w-3" />
              </Button>
              
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleDownloadPdf(editableResume);
                }}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-xs flex items-center justify-center"
                disabled={isPdfGenerating}
              >
                {isPdfGenerating ? 'Generating...' : 'Download PDF'}
                <Download className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tabs Section */}
        <div ref={resumeContentRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="w-full min-w-max border-b">
                <TabsTrigger
                  value="summary"
                  className="flex-1 min-w-[100px] px-2 py-3 text-sm"
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger 
                  value="skills"
                  className="flex-1 min-w-[100px] px-2 py-3 text-sm"
                >
                  Skills
                </TabsTrigger>
                <TabsTrigger 
                  value="experience"
                  className="flex-1 min-w-[100px] px-2 py-3 text-sm"
                >
                  Experience
                </TabsTrigger>
                <TabsTrigger 
                  value="education"
                  className="flex-1 min-w-[100px] px-2 py-3 text-sm"
                >
                  Education
                </TabsTrigger>
                <TabsTrigger 
                  value="certifications"
                  className="flex-1 min-w-[100px] px-2 py-3 text-sm"
                >
                  Certificates
                </TabsTrigger>
                <TabsTrigger 
                  value="projects"
                  className="flex-1 min-w-[100px] px-2 py-3 text-sm"
                >
                  Projects
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Content Section */}
            <div className="p-3 sm:p-6">
              <TabsContent value="summary" className="mt-0 focus:outline-none">
                <div className="space-y-4">
                  <Summary summary={response.summary} />
                </div>
              </TabsContent>
              
              <TabsContent value="skills" className="mt-0 focus:outline-none">
                <div className="space-y-4">
                  <Skills {...response.skills} isEditMode={isEditMode} />
                </div>
              </TabsContent>
              
              <TabsContent value="experience" className="mt-0 focus:outline-none">
                <div className="space-y-4">
                  <WorkExperience {...response.work_experience} isEditMode={isEditMode} />
                </div>
              </TabsContent>
              
              <TabsContent value="education" className="mt-0 focus:outline-none">
                <div className="space-y-4">
                  <Education education={response.education} />
                </div>
              </TabsContent>
              
              <TabsContent value="certifications" className="mt-0 focus:outline-none">
                <div className="space-y-4">
                  <Certifications certifications={response.certifications} />
                </div>
              </TabsContent>
              
              <TabsContent value="projects" className="mt-0 focus:outline-none">
                <div className="space-y-4">
                  <Projects projects={response.projects} isEditMode={isEditMode} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
  <DialogContent className="max-w-6xl w-full h-[100vh] p-2">
    <DialogTitle>Resume Preview</DialogTitle>
    <DialogDescription className="mb-2">
      Preview how your resume will look when downloaded
    </DialogDescription>
    {previewUrl && (
      <div className="w-full h-[calc(100%-0rem)] overflow-scroll">
        <iframe
  src={previewUrl}
  className="w-full h-[90vh]"
  title="Resume Preview"
  style={{ 
    border: 'none',
    width: '100%',
    height: '100vh', // Adjust this to ensure full visibility
    overflow: 'auto'
    
  }}
/>

      </div>
    )}
  </DialogContent>
</Dialog>
    </>
  );
}