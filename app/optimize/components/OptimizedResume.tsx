import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Edit, Expand, FileText } from "lucide-react";
import React, { useRef, useState } from "react";
import { ResumeEditProvider, useResumeEdit } from "../context/ResumeEditContext";
import { usePdfGenerator } from "../hooks/usePdfGenerator";
import { ResumeData, ResumeResponse } from "../types";
import Certifications from "./sections/Certifications";
import Education from "./sections/Education";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import Summary from "./sections/Summary";
import WorkExperience from "./sections/WorkExperience";

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
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  const handlePreview = async () => {
    setIsPreviewLoading(true);
    const resumeResponse = {
      data: editableResume,
      original: response
    } as ResumeResponse;
    await generatePreview(editableResume, resumeResponse);
    setIsPreviewOpen(true);
    setIsPreviewLoading(false);
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
                {(editableResume.skills && Object.keys(editableResume.skills).length > 0) && (
                  <TabsTrigger 
                    value="skills"
                    className="flex-1 min-w-[100px] px-2 py-3 text-sm"
                  >
                    Skills
                  </TabsTrigger>
                )}
                {(editableResume.work_experience && editableResume.work_experience.length > 0) && (
                  <TabsTrigger 
                    value="experience"
                    className="flex-1 min-w-[100px] px-2 py-3 text-sm"
                  >
                    Experience
                  </TabsTrigger>
                )}
                {(editableResume.education && editableResume.education.length > 0) && (
                  <TabsTrigger 
                    value="education"
                    className="flex-1 min-w-[100px] px-2 py-3 text-sm"
                  >
                    Education
                  </TabsTrigger>
                )}
                {(editableResume.certifications && editableResume.certifications.length > 0) && (
                  <TabsTrigger 
                    value="certifications"
                    className="flex-1 min-w-[100px] px-2 py-3 text-sm"
                  >
                    Certificates
                  </TabsTrigger>
                )}
                {(editableResume.projects && editableResume.projects.length > 0) && (
                  <TabsTrigger 
                    value="projects"
                    className="flex-1 min-w-[100px] px-2 py-3 text-sm"
                  >
                    Projects
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            
            {/* Content Section */}
            <div className="p-3 sm:p-6">
              <TabsContent value="summary" className="mt-0 focus:outline-none">
                <div className="space-y-4">
                  <Summary summary={response.summary} />
                </div>
              </TabsContent>
              
              {(editableResume.skills && Object.keys(editableResume.skills).length > 0) && (
                <TabsContent value="skills" className="mt-0 focus:outline-none">
                  <div className="space-y-4">
                    <Skills {...response.skills} isEditMode={isEditMode} />
                  </div>
                </TabsContent>
              )}
              
              {(editableResume.work_experience && editableResume.work_experience.length > 0) && (
                <TabsContent value="experience" className="mt-0 focus:outline-none">
                  <div className="space-y-4">
                    <WorkExperience {...response.work_experience} isEditMode={isEditMode} />
                  </div>
                </TabsContent>
              )}
              
              {(editableResume.education && editableResume.education.length > 0) && (
                <TabsContent value="education" className="mt-0 focus:outline-none">
                  <div className="space-y-4">
                    <Education education={response.education} />
                  </div>
                </TabsContent>
              )}
              
              {(editableResume.certifications && editableResume.certifications.length > 0) && (
                <TabsContent value="certifications" className="mt-0 focus:outline-none">
                  <div className="space-y-4">
                    <Certifications certifications={response.certifications} />
                  </div>
                </TabsContent>
              )}
              
              {(editableResume.projects && editableResume.projects.length > 0) && (
                <TabsContent value="projects" className="mt-0 focus:outline-none">
                  <div className="space-y-4">
                    <Projects projects={response.projects} isEditMode={isEditMode} />
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] p-2">
          <DialogTitle>Resume Preview</DialogTitle>
          <DialogDescription className="mb-2">
            Preview how your resume will look when downloaded
          </DialogDescription>
          {isPreviewLoading ? (
            <div className="w-full h-[calc(100%-4rem)] flex items-center justify-center bg-gray-50 rounded-md">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">Generating preview...</p>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="w-full h-[calc(100%-4rem)] overflow-hidden border border-gray-200 rounded-md flex flex-col items-center bg-gray-50 relative">
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white"
                  onClick={() => window.open(previewUrl, '_blank')}
                >
                  <Expand className="h-4 w-4 mr-1" /> Open in New Tab
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewUrl;
                    link.download = "resume.pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
              
              {/* Direct iframe with simple fallback strategy */}
              <div className="w-full h-full">
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  style={{backgroundColor: 'white'}}
                  aria-label="PDF Resume Preview"
                />
              </div>
              
              {/* Fallback message that appears beneath iframe */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-100 p-2 text-center text-sm">
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  If the preview doesn&apos;t appear, click here to open in a new tab
                </a>
              </div>
            </div>
          ) : (
            <div className="w-full h-[calc(100%-4rem)] flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Could not generate preview</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}