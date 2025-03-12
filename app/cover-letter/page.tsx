"use client";

import React, { useState, useRef } from "react";
import { FileText, Send, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchApi } from "@/lib/api";

export default function CoverLetterGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverLetterRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleJobDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(event.target.value);
  };

  const generateCoverLetter = async () => {
    if (!jobDescription) {
      setError("Please enter a job description.");
      return;
    }

    if (!file) {
      setError("Please upload a resume.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription);
      formData.append("resume_file", file);

      const response = await fetchApi("/cover-letter/generate", {
        method: "POST",
        body: formData,
      });

      if (response?.cover_letter) {
        setCoverLetter(response.cover_letter);
        setActiveTab("result");
      } else {
        throw new Error("Failed to generate cover letter.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCoverLetter = () => {
    if (!coverLetter) return;
    
    const element = document.createElement("a");
    const file = new Blob([coverLetter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "cover_letter.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Cover Letter Generator</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Create</TabsTrigger>
          <TabsTrigger value="result" disabled={!coverLetter}>Result</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-1">
                      {file ? file.name : "Drop your resume here or click to browse"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Accepted formats: PDF, DOC, DOCX
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[300px]"
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                  />
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    onClick={generateCoverLetter} 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Generate Cover Letter
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="result">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Cover Letter</CardTitle>
              <Button variant="outline" onClick={downloadCoverLetter}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              <div 
                ref={coverLetterRef}
                className="bg-white p-6 rounded-lg border border-gray-200 whitespace-pre-line"
              >
                {coverLetter}
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("upload")}>
                  Back to Editor
                </Button>
                <Button onClick={downloadCoverLetter}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Cover Letter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
