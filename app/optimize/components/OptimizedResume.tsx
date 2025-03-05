import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeData } from "../types";
import Summary from "./sections/Summary";
import Skills from "./sections/Skills";
import WorkExperience from "./sections/WorkExperience";
import Education from "./sections/Education";
import Certifications from "./sections/Certifications";
import Projects from "./sections/Projects";

interface OptimizedResumeProps {
  response: ResumeData;
  handleDownloadPdf: () => void;
  handleScoreAnother: () => void;
  isPdfGenerating: boolean;
}

export default function OptimizedResume({
  response,
  handleDownloadPdf,
  handleScoreAnother,
  isPdfGenerating
}: OptimizedResumeProps) {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const resumeContentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Optimized Resume</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleDownloadPdf}
            variant="outline"
            size="sm"
            className="text-xs flex items-center"
            disabled={isPdfGenerating}
          >
            {isPdfGenerating ? 'Generating...' : 'Download PDF'}
            <Download className="ml-1 h-3 w-3" />
          </Button>
          <Button
            onClick={handleScoreAnother}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Score Another Resume
          </Button>
        </div>
      </div>
      
      <div ref={resumeContentRef}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="certifications">Certificates</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            <TabsContent value="summary" className="mt-0">
              <Summary summary={response.summary} />
            </TabsContent>
            
            <TabsContent value="skills" className="mt-0">
              <Skills skills={response.skills} />
            </TabsContent>
            
            <TabsContent value="experience" className="mt-0">
              <WorkExperience workExperience={response.work_experience} />
            </TabsContent>
            
            <TabsContent value="education" className="mt-0">
              <Education education={response.education} />
            </TabsContent>
            
            <TabsContent value="certifications" className="mt-0">
              <Certifications certifications={response.certifications} />
            </TabsContent>
            
            <TabsContent value="projects" className="mt-0">
              <Projects projects={response.projects} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}