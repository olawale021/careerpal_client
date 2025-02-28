"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
// import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

// Type Definitions for Resume Data
interface Skills {
  "Technical Skills": string[];
  "Soft Skills": string[];
  [key: string]: string[];
}

interface WorkExperience {
  company: string;
  location: string;
  role: string;
  period: string;
  responsibilities: string[];
}

interface Education {
  institution: string;
  location: string;
  degree: string;
  period: string;
}

interface Certification {
  title: string;
  year: string;
}

interface Project {
  title: string;
  description: string;
  technologies_used: string[];
}

interface VolunteeringExperience {
  organization: string;
  role: string;
  period: string;
  responsibilities: string[];
}

interface ResumeData {
  summary?: string;
  skills?: Skills;
  work_experience?: WorkExperience[];
  education?: Education[];
  certifications?: Certification[];
  projects?: Project[];
  volunteering_experience?: VolunteeringExperience[];
}

export default function OptimizeResume() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [response, setResponse] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Log the error if it exists
  useEffect(() => {
    if (error) {
      console.error("Error:", error);
    }
  }, [error]);

  // Ref for auto-scrolling to results
  const responseSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (response && responseSectionRef.current) {
      responseSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [response]);

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // Submit form and call API
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!file || !jobDescription) {
      alert("Please upload a resume and enter a job description.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      const res = await fetch(`/api/proxy?path=/resume/optimize`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const rawData: { message: string; data: ResumeData } = await res.json();
      console.log("API Response:", rawData);
      setResponse(rawData.data);

      alert("Resume optimized successfully! Check the updated details below.");
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to optimize resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render skills section
  const renderSkills = (skills: Skills) => (
    <div className="space-y-6">
      {Object.entries(skills).map(([category, skillList]: [string, string[]]) => (
        <div key={category}>
          <h4 className="font-semibold text-gray-800 mb-3">
            {category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {skillList.map((skill: string, index: number) => (
              <span 
                key={`${category}-${skill}-${index}`}
                className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Upload Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-6">Upload Documents</h2>
            
            {/* Resume Upload */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">Resume</label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : "Drop your resume here or click to browse"}
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Job Description</label>
              <textarea 
                className="w-full h-40 rounded-lg border-gray-200 resize-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Right Column - Results Section */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Updated Summary</h3>
              <div className="prose max-w-none">
                {response && response.summary && (
                  <p>{response.summary}</p>
                )}
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6">Updated Skills</h3>
              {response && response.skills && renderSkills(response.skills)}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <Button 
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Optimizing...' : 'Optimize Resume'}
          </Button>
        </div>
      </form>
    </div>
  );
}
