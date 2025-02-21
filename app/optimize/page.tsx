"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText } from "lucide-react";

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

const OptimizeResume: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [response, setResponse] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL: string = process.env.NEXT_PUBLIC_API_URL || "https://a3de-209-35-91-116.ngrok-free.app";

  // Ref for auto-scrolling to results
  const responseSectionRef = useRef<HTMLDivElement>(null);

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
      const res = await fetch(`${API_URL}/resume/optimize`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const rawData: { message: string; data: ResumeData } = await res.json();
      console.log("API Response:", rawData);
      setResponse(rawData.data);

      alert(" Resume optimized successfully! Check the updated details below.");
    } catch (error) {
      console.error(" Error:", error);
      setError("Failed to optimize resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render skills section
  const renderSkills = (skills: Skills) => (
    <div className="grid grid-cols-2 gap-6">
      {Object.entries(skills).map(([category, skillList]: [string, string[]]) => (
        <div key={category} className="space-y-3">
          <h4 className="font-medium text-gray-800 text-sm uppercase tracking-wider">
            {category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {skillList.map((skill: string, index: number) => (
              <span 
                key={`${category}-${skill}-${index}`}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium"
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
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Resume Optimizer</h2>
          <p className="text-gray-600 mb-6">
            Upload your resume and job description to enhance your resume for better job matching.
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="border-2 border-dashed rounded-lg p-6 relative">
              <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600 mt-2">
                  {file ? <span className="flex items-center justify-center gap-2"><FileText className="h-5 w-5" /> {file.name}</span> : "Drag & drop your resume, or click to select a file"}
                </p>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description</label>
              <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." className="h-32" />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading || !file || !jobDescription}>
              {loading ? "Optimizing..." : "Optimize Resume"}
            </Button>
          </form>
        </div>
      </Card>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Display Optimized Resume */}
      {response && (
        <div ref={responseSectionRef} className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden p-6">
          {response.summary && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Updated Summary</h3>
              <p className="text-gray-700 leading-relaxed">{response.summary}</p>
            </div>
          )}

          {response.skills && (
            <div className="border-b py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Updated Skills</h3>
              {renderSkills(response.skills)}
            </div>
          )}

          {response.work_experience?.map((job, index) => (
            <div key={index} className="border-b py-4">
              <h3 className="text-lg font-semibold text-gray-900">Updated Work Experience</h3>
              <h4 className="font-semibold">{job.role} - {job.company}</h4>
              <p className="text-sm">{job.period} | {job.location}</p>
            </div>
          ))}

          {response.education?.map((edu, index) => (
            <div key={index} className="border-b py-4">
              <h3 className="text-lg font-semibold text-gray-900">Education</h3>
              <h4 className="font-semibold">{edu.degree}</h4>
              <p className="text-sm">{edu.institution} | {edu.location}</p>
            </div>
          ))}

          {response.certifications?.map((cert, index) => (
            <div key={index} className="border-b py-4">
              <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
              <p>{cert.title} ({cert.year})</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OptimizeResume;
