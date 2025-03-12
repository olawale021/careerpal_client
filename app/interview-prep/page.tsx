"use client";

import React, { useState, useRef } from "react";
import { FileText, Send, Loader2, MessageSquare, Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fetchApi } from "@/lib/api";

type Question = string;
type Answer = string;

interface QuestionCategory {
  technical_questions: string[];
  behavioral_questions: string[];
  situational_questions: string[];
  role_specific_questions: string[];
  culture_fit_questions: string[];
}

interface QuestionsResponse {
  questions: QuestionCategory;
  metadata: {
    job_analyzed: boolean;
    resume_analyzed: boolean;
    question_count: number;
    categories: number;
  };
}

interface AnswerTips {
  answer_structure: string[];
  key_points: string[];
  skills_to_emphasize: string[];
  mistakes_to_avoid: string[];
  example_answer: string;
}

interface AnswerTipsResponse {
  question: string;
  answer_tips: AnswerTips;
}

interface AnswerFeedback {
  question: string;
  strengths: string[];
  improvements: string[];
  score: number;
  better_answer: string;
}

interface SimulationResponse {
  answer_feedback: AnswerFeedback[];
  overall_evaluation: {
    score: number;
    strengths: string[];
    improvements: string[];
    recommendation: string;
  };
}

export default function InterviewPrep() {
  // File and input states
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  
  // Questions and answers states
  const [questionsResponse, setQuestionsResponse] = useState<QuestionsResponse | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [answerTips, setAnswerTips] = useState<AnswerTipsResponse | null>(null);
  
  // Simulation states
  const [simulationQuestions, setSimulationQuestions] = useState<Question[]>([]);
  const [simulationAnswers, setSimulationAnswers] = useState<Answer[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResponse | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [loading, setLoading] = useState<boolean>(false);
  const [tipsLoading, setTipsLoading] = useState<boolean>(false);
  const [simulationLoading, setSimulationLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);
  const tipsRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleJobDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(event.target.value);
  };

  const handleQuestionCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(event.target.value);
    if (!isNaN(count) && count >= 1 && count <= 10) {
      setQuestionCount(count);
    }
  };

  const generateQuestions = async () => {
    if (!jobDescription) {
      setError("Please enter a job description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription);
      formData.append("question_count", questionCount.toString());
      
      if (file) {
        formData.append("resume_file", file);
      }

      const response = await fetchApi("/interview/questions", {
        method: "POST",
        body: formData,
      });

      if (response && !response.error) {
        setQuestionsResponse(response);
        setActiveTab("questions");
        // Scroll to questions section
        if (questionsRef.current) {
          questionsRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        throw new Error(response.error || "Failed to generate interview questions.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const getAnswerTips = async (question: string) => {
    if (!question || !jobDescription) {
      setError("Question and job description are required.");
      return;
    }

    setTipsLoading(true);
    setError(null);
    setSelectedQuestion(question);
    setActiveTab("tips");

    try {
      const formData = new FormData();
      formData.append("question", question);
      formData.append("job_description", jobDescription);

      const response = await fetchApi("/interview/answer-tips", {
        method: "POST",
        body: formData,
      });

      if (response && !response.error) {
        setAnswerTips(response);
        // Scroll to tips section
        if (tipsRef.current) {
          tipsRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        throw new Error(response.error || "Failed to generate answer tips.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setTipsLoading(false);
    }
  };

  const addQuestionToSimulation = (question: string) => {
    if (!simulationQuestions.includes(question)) {
      setSimulationQuestions([...simulationQuestions, question]);
      setSimulationAnswers([...simulationAnswers, ""]);
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const newAnswers = [...simulationAnswers];
    newAnswers[index] = answer;
    setSimulationAnswers(newAnswers);
  };

  const removeQuestionFromSimulation = (index: number) => {
    const newQuestions = [...simulationQuestions];
    const newAnswers = [...simulationAnswers];
    newQuestions.splice(index, 1);
    newAnswers.splice(index, 1);
    setSimulationQuestions(newQuestions);
    setSimulationAnswers(newAnswers);
  };

  const runSimulation = async () => {
    if (simulationQuestions.length === 0) {
      setError("Please add at least one question to the simulation.");
      return;
    }

    if (simulationQuestions.some((_, i) => !simulationAnswers[i])) {
      setError("Please provide answers for all questions.");
      return;
    }

    setSimulationLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription);
      
      simulationQuestions.forEach((q) => {
        formData.append("questions", q);
      });
      
      simulationAnswers.forEach((a) => {
        formData.append("answers", a);
      });

      const response = await fetchApi("/interview/simulate", {
        method: "POST",
        body: formData,
      });

      if (response && !response.error) {
        setSimulationResults(response);
        setActiveTab("results");
        // Scroll to results section
        if (simulationRef.current) {
          simulationRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        throw new Error(response.error || "Failed to simulate interview.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setSimulationLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-emerald-500";
    if (score >= 4) return "text-amber-500";
    if (score >= 2) return "text-orange-500";
    return "text-red-500";
  };

  const resetAll = () => {
    setActiveTab("generate");
    setQuestionsResponse(null);
    setSelectedQuestion("");
    setAnswerTips(null);
    setSimulationQuestions([]);
    setSimulationAnswers([]);
    setSimulationResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold">Interview Preparation</h1>
          <Button 
            variant="outline" 
            onClick={resetAll}
            className="text-sm sm:text-base"
          >
            Reset All
          </Button>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto p-1 bg-gray-100 rounded-lg mb-6">
            {[
              { value: "generate", label: "Generate" },
              { value: "questions", label: "Questions", disabled: !questionsResponse },
              { value: "tips", label: "Answer Tips", disabled: !answerTips },
              { value: "simulation", label: "Simulation", disabled: simulationQuestions.length === 0 },
              { value: "results", label: "Results", disabled: !simulationResults }
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                className="py-2 text-xs sm:text-sm whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Generate Tab Content */}
          <TabsContent value="generate">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Resume Upload Card */}
              <Card className="overflow-hidden h-fit">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Resume Information</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Upload your resume (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-lg p-4 sm:p-8 text-center 
                             hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center">
                      <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-4" />
                      <p className="text-sm sm:text-base text-gray-600 mb-1">
                        {file ? file.name : "Drop your resume here or click to browse"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Accepted formats: PDF, DOC, DOCX
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Job Description Card */}
              <Card className="overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Job Information</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Enter the job description to generate tailored questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[150px] sm:min-h-[200px] text-sm sm:text-base"
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                  />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm sm:text-base font-medium flex items-center">
                        Questions per category
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 sm:h-5 sm:w-5 ml-2 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs sm:text-sm">
                                Number of questions per category (Technical, Behavioral, etc.)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={questionCount}
                        onChange={handleQuestionCountChange}
                        className="w-20 text-center text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-sm sm:text-base">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={generateQuestions} 
                    className="w-full py-2 sm:py-6 text-sm sm:text-base" 
                    disabled={loading || !jobDescription}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Generate Interview Questions
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <div ref={questionsRef}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Interview Questions</CardTitle>
                  <CardDescription className="text-base">
                    {questionsResponse?.metadata?.question_count} questions per category
                    {questionsResponse?.metadata?.resume_analyzed ? " (tailored to your resume)" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {questionsResponse && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="technical">
                        <AccordionTrigger className="text-base">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-blue-500">Technical</Badge>
                            Technical Questions
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-4">
                            {questionsResponse.questions.technical_questions.map((question, index) => (
                              <li key={`tech-${index}`} className="p-3 bg-gray-50 rounded-md">
                                <div className="flex justify-between items-start">
                                  <p className="text-base">{question}</p>
                                  <div className="flex space-x-2 ml-4">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => getAnswerTips(question)}
                                      className="text-sm"
                                    >
                                      <HelpCircle className="h-4 w-4 mr-1" />
                                      Tips
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => addQuestionToSimulation(question)}
                                      className="text-sm"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Practice
                                    </Button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="behavioral">
                        <AccordionTrigger className="text-base">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-green-500">Behavioral</Badge>
                            Behavioral Questions
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-4">
                            {questionsResponse.questions.behavioral_questions.map((question, index) => (
                              <li key={`behav-${index}`} className="p-3 bg-gray-50 rounded-md">
                                <div className="flex justify-between items-start">
                                  <p className="text-base">{question}</p>
                                  <div className="flex space-x-2 ml-4">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => getAnswerTips(question)}
                                      className="text-sm"
                                    >
                                      <HelpCircle className="h-4 w-4 mr-1" />
                                      Tips
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => addQuestionToSimulation(question)}
                                      className="text-sm"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Practice
                                    </Button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="situational">
                        <AccordionTrigger className="text-base">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-amber-500">Situational</Badge>
                            Situational Questions
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-4">
                            {questionsResponse.questions.situational_questions.map((question, index) => (
                              <li key={`sit-${index}`} className="p-3 bg-gray-50 rounded-md">
                                <div className="flex justify-between items-start">
                                  <p className="text-base">{question}</p>
                                  <div className="flex space-x-2 ml-4">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => getAnswerTips(question)}
                                      className="text-sm"
                                    >
                                      <HelpCircle className="h-4 w-4 mr-1" />
                                      Tips
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => addQuestionToSimulation(question)}
                                      className="text-sm"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Practice
                                    </Button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="role">
                        <AccordionTrigger className="text-base">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-purple-500">Role</Badge>
                            Role-Specific Questions
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-4">
                            {questionsResponse.questions.role_specific_questions.map((question, index) => (
                              <li key={`role-${index}`} className="p-3 bg-gray-50 rounded-md">
                                <div className="flex justify-between items-start">
                                  <p className="text-base">{question}</p>
                                  <div className="flex space-x-2 ml-4">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => getAnswerTips(question)}
                                      className="text-sm"
                                    >
                                      <HelpCircle className="h-4 w-4 mr-1" />
                                      Tips
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => addQuestionToSimulation(question)}
                                      className="text-sm"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Practice
                                    </Button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="culture">
                        <AccordionTrigger className="text-base">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-pink-500">Culture</Badge>
                            Culture Fit Questions
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-4">
                            {questionsResponse.questions.culture_fit_questions.map((question, index) => (
                              <li key={`culture-${index}`} className="p-3 bg-gray-50 rounded-md">
                                <div className="flex justify-between items-start">
                                  <p className="text-base">{question}</p>
                                  <div className="flex space-x-2 ml-4">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => getAnswerTips(question)}
                                      className="text-sm"
                                    >
                                      <HelpCircle className="h-4 w-4 mr-1" />
                                      Tips
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => addQuestionToSimulation(question)}
                                      className="text-sm"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Practice
                                    </Button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  
                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("generate")}>
                      Back to Generator
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("simulation")} 
                      disabled={simulationQuestions.length === 0}
                    >
                      Go to Practice Simulation
                      {simulationQuestions.length > 0 && (
                        <Badge className="ml-2 bg-blue-500">{simulationQuestions.length}</Badge>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Answer Tips Tab */}
          <TabsContent value="tips">
            <div ref={tipsRef}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Answer Tips</CardTitle>
                  <CardDescription className="text-base">
                    Guidance for answering: {selectedQuestion}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tipsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                      <p>Loading answer tips...</p>
                    </div>
                  ) : answerTips ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Answer Structure</h3>
                        <ol className="list-decimal pl-5 space-y-1">
                          {answerTips.answer_tips.answer_structure.map((step, index) => (
                            <li key={index} className="text-sm">{step}</li>
                          ))}
                        </ol>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Key Points to Include</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {answerTips.answer_tips.key_points.map((point, index) => (
                            <li key={index} className="text-sm">{point}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Skills to Emphasize</h3>
                        <div className="flex flex-wrap gap-2">
                          {answerTips.answer_tips.skills_to_emphasize.map((skill, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-50">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Mistakes to Avoid</h3>
                        <ul className="list-disc pl-5 space-y-1 text-red-600">
                          {answerTips.answer_tips.mistakes_to_avoid.map((mistake, index) => (
                            <li key={index} className="text-sm">{mistake}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Example Answer</h3>
                        <div className="p-4 bg-gray-50 rounded-md text-sm italic">
                          {answerTips.answer_tips.example_answer}
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={() => setActiveTab("questions")}>
                          Back to Questions
                        </Button>
                        <Button onClick={() => addQuestionToSimulation(selectedQuestion)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Add to Practice Simulation
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p>No answer tips available. Please select a question first.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Simulation Tab */}
          <TabsContent value="simulation">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Practice Simulation</CardTitle>
                <CardDescription className="text-base">
                  Answer the questions as you would in a real interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                {simulationQuestions.length > 0 ? (
                  <div className="space-y-6">
                    {simulationQuestions.map((question, index) => (
                      <div key={index} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{index + 1}. {question}</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeQuestionFromSimulation(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Type your answer here..."
                          className="min-h-[120px]"
                          value={simulationAnswers[index]}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => getAnswerTips(question)}
                          >
                            <HelpCircle className="h-4 w-4 mr-1" />
                            Get Tips
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={() => setActiveTab("questions")}>
                        Back to Questions
                      </Button>
                      <Button 
                        onClick={runSimulation}
                        disabled={simulationLoading || simulationQuestions.some((_, i) => !simulationAnswers[i])}
                      >
                        {simulationLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Answers...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Run Simulation
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p>No questions available. Please generate questions first.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Results Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Simulation Results</CardTitle>
                <CardDescription className="text-base">
                  Overall evaluation and answer feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                {simulationResults ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Overall Evaluation</h3>
                      <p className={getScoreColor(simulationResults.overall_evaluation.score)}>
                        {simulationResults.overall_evaluation.score}/10
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Strengths</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {Array.isArray(simulationResults.overall_evaluation.strengths) ? 
                          simulationResults.overall_evaluation.strengths.map((strength, index) => (
                            <li key={index} className="text-sm">{strength}</li>
                          )) : 
                          <li className="text-sm">{simulationResults.overall_evaluation.strengths}</li>
                        }
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Improvements</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {Array.isArray(simulationResults.overall_evaluation.improvements) ? 
                          simulationResults.overall_evaluation.improvements.map((improvement, index) => (
                            <li key={index} className="text-sm">{improvement}</li>
                          )) :
                          <li className="text-sm">{simulationResults.overall_evaluation.improvements}</li>
                        }
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Recommendation</h3>
                      <p className="text-sm italic">
                        {simulationResults.overall_evaluation.recommendation}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Answer Feedback</h3>
                      <div className="space-y-4">
                        {simulationResults.answer_feedback.map((feedback, index) => (
                          <div key={index} className="p-4 border rounded-md">
                            <div className="flex justify-between items-start">
                              <p className="text-sm">{feedback.question}</p>
                              <div className="flex space-x-2 ml-4">
                                <Badge className="bg-blue-500">{feedback.score}/10</Badge>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => getAnswerTips(feedback.question)}
                                >
                                  <HelpCircle className="h-4 w-4 mr-1" />
                                  Get Tips
                                </Button>
                              </div>
                            </div>
                            <div className="mt-2">
                              <h4 className="text-sm font-medium mb-1">Strengths</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {Array.isArray(feedback.strengths) ? 
                                  feedback.strengths.map((strength, index) => (
                                    <li key={index} className="text-sm">{strength}</li>
                                  )) : 
                                  <li className="text-sm">{feedback.strengths}</li>
                                }
                              </ul>
                            </div>
                            <div className="mt-2">
                              <h4 className="text-sm font-medium mb-1">Improvements</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {Array.isArray(feedback.improvements) ? 
                                  feedback.improvements.map((improvement, index) => (
                                    <li key={index} className="text-sm">{improvement}</li>
                                  )) : 
                                  <li className="text-sm">{feedback.improvements}</li>
                                }
                              </ul>
                            </div>
                            <div className="mt-2">
                              <h4 className="text-sm font-medium mb-1">Better Answer</h4>
                              <p className="text-sm italic">
                                {feedback.better_answer}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p>No results available. Please run the simulation first.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
