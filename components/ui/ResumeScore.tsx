"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchApi } from "@/lib/api";
import { AlertCircle, Check, ChevronDown, ExternalLink, FileText, Loader, Star, Upload, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types for resume score response
interface ScoreResponse {
  match_score: number;
  missing_skills: string[];
  recommendations: string[];
  matched_skills?: string[];
  extracted_text?: unknown; // For debugging
}

interface Resume {
  resume_id: string;
  file_name: string;
  uploaded_at: string;
  signed_url: string;
}

interface ResumeScoreProps {
  jobDescription?: string;
  resumeId?: string;
  jobTitle?: string;
}

// Define the component props interface
interface MobileResumeScorerProps {
  resumes: Resume[];
  selectedResumeId: string | null;
  handleResumeSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  isLoading: boolean;
  scoreResume: () => void;
  jobDescription: string | undefined;
}

const ResumeScore: React.FC<ResumeScoreProps> = ({ jobDescription, resumeId }) => {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(resumeId || null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Add this line to create the file input reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch User ID
  const fetchUserId = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      setError(null);
      const response = await fetchApi<{ user_id: string }>(`/users/lookup/email?email=${encodeURIComponent(session.user.email)}`, {
        headers: { Authorization: `Bearer ${session?.user?.jwt}` },
      });

      if (response?.user_id) {
        setUserId(response.user_id);
      } else {
        throw new Error("User ID not found.");
      }
    } catch (err) {
      console.error("Error fetching user ID:", err);
      setError("Failed to fetch user ID.");
    }
  }, [session?.user?.email, session?.user?.jwt]);

  // Fetch User Resumes
  const fetchUserResumes = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const response = await fetchApi<{ resumes: Resume[] }>(`/resume/get-resumes?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${session?.user?.jwt}` },
      });

      if (response?.resumes?.length > 0) {
        setResumes(response.resumes);
        if (!selectedResumeId) {
          setSelectedResumeId(response.resumes[0].resume_id);
        }
      } else {
        setResumes([]);
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setError("Failed to fetch resumes.");
    }
  }, [userId, session?.user?.jwt, selectedResumeId]);

  // Effect to fetch user ID & resumes if needed
  useEffect(() => {
    if (!session?.user?.email) return;
    if (!userId) fetchUserId();
    if (userId) fetchUserResumes();
  }, [session?.user?.email, userId, fetchUserId, fetchUserResumes]);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSelectedResumeId(null);
      setError(null);
    }
  };

  // Handle resume selection from dropdown
  const handleResumeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedResumeId(e.target.value || null);
    setFile(null);
  };

  // Extract keywords from job description

  // Helper function to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Submit resume for scoring
  const scoreResume = async () => {
    if (!jobDescription) {
      setError("No job description available for scoring.");
      return;
    }

    if (!selectedResumeId && !file) {
      setError("Please either select an existing resume or upload a new one.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare request data
      const requestData: {
        job_description: string;
        resume_id?: string;
        file_content?: string;
        file_name?: string;
        file_type?: string;
      } = { job_description: jobDescription };
      
      if (selectedResumeId) {
        requestData.resume_id = selectedResumeId;
      } else if (file) {
        // Convert file to base64 for JSON submission
        const fileBase64 = await fileToBase64(file);
        requestData.file_content = fileBase64;
        requestData.file_name = file.name;
        requestData.file_type = file.type;
      }
      
      const response = await fetchApi<{ data: ScoreResponse }>("/resume/score", {
        method: "POST",
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response?.data) {
        setScoreResult(response.data);
        console.log("Full response:", response); // For debugging
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (err) {
      console.error("Score Resume Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert score to rating (0-5 scale)
  const getStarRating = (score: number) => {
    return (score / 100) * 5;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '/');
  };

  // Get the resume filename
  const getSelectedResumeName = () => {
    if (file) return file.name;
    if (selectedResumeId) {
      const resume = resumes.find(r => r.resume_id === selectedResumeId);
      return resume ? `${resume.file_name} - ${formatDate(resume.uploaded_at)}` : null;
    }
    return null;
  };

  // Get color class based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };

  // Get text label based on score

  // Add this state to detect mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Card className={`mt-3 ${isMobile ? 'border-0 shadow-none' : 'border rounded-lg'}`}>
      <CardContent className="p-0">
        {!scoreResult ? (
          isMobile ? (
            <MobileResumeScorer 
              resumes={resumes}
              selectedResumeId={selectedResumeId}
              handleResumeSelect={handleResumeSelect}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              file={file}
              setFile={setFile}
              isLoading={isLoading}
              scoreResume={scoreResume}
              jobDescription={jobDescription}
            />
          ) : (
            <div className="p-6">
              {/* Resume Selection & Upload in one line */}
              <div className="flex items-center gap-3">
                <div className="flex-grow">
                  <select
                    className="w-full p-2.5 bg-white border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={selectedResumeId || ""}
                    onChange={handleResumeSelect}
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select a resume</option>
                    {resumes.map((resume) => (
                      <option key={resume.resume_id} value={resume.resume_id}>
                        {resume.file_name} - {formatDate(resume.uploaded_at)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <span className="text-gray-400">or</span>
                
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer flex items-center text-blue-600 hover:text-blue-500 text-sm">
                    <Upload className="h-4 w-4 mr-1" />
                    <span>Upload resume</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                  <span className="text-xs text-gray-500 block mt-1">PDF, DOC up to 10MB</span>
                </div>
              </div>

              {/* Selected File Info */}
              {(file || selectedResumeId) && (
                <div className="mt-4 flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <div className="text-sm font-medium text-gray-700 truncate flex-1">
                    {getSelectedResumeName()}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setSelectedResumeId(null);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Score Button */}
              <Button 
                onClick={scoreResume} 
                disabled={isLoading || !jobDescription || (!selectedResumeId && !file)} 
                className="w-full mt-4 bg-black text-white font-medium py-2.5 px-4 rounded hover:bg-gray-800 transition-colors"
              >
                {isLoading ? "Analyzing Resume..." : "Score Resume"}
              </Button>
              
              {!jobDescription && (
                <p className="mt-2 text-sm text-amber-600">
                  Select a job to enable resume scoring
                </p>
              )}
            </div>
          )
        ) : (
          <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
            {/* Modern Circular Score Gauge */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                {/* SVG Gauge */}
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Small tick marks around the circle */}
                  {Array.from({ length: 36 }).map((_, i) => {
                    const angle = (i * 10 * Math.PI) / 180 - Math.PI / 2;
                    const isMajor = i % 9 === 0; // Major ticks at 0, 25, 50, 75, 100
                    const tickLength = isMajor ? 8 : 4;
                    const innerRadius = isMajor ? 75 : 82;
                    const textRadius = 65;
                    const x1 = 100 + innerRadius * Math.cos(angle);
                    const y1 = 100 + innerRadius * Math.sin(angle);
                    const x2 = 100 + (innerRadius + tickLength) * Math.cos(angle);
                    const y2 = 100 + (innerRadius + tickLength) * Math.sin(angle);
                    const textX = 100 + textRadius * Math.cos(angle);
                    const textY = 100 + textRadius * Math.sin(angle);
                    
                    return (
                      <g key={i}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={isMajor ? "#999" : "#ccc"}
                          strokeWidth={isMajor ? "1" : "0.5"}
                        />
                        {isMajor && (
                          <text
                            x={textX}
                            y={textY}
                            fontSize="10"
                            fill="#999"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {i === 0 ? "0" : i === 9 ? "25" : i === 18 ? "50" : i === 27 ? "75" : "100"}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  
                  {/* Light background track */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="14"
                    strokeLinecap="round"
                    transform="rotate(-90, 100, 100)"
                    strokeDasharray="329.9 439.8"
                  />
                  
                  {/* Blue progress arc */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#1e88e5"
                    strokeWidth="14"
                    strokeLinecap="round"
                    transform="rotate(-90, 100, 100)"
                    strokeDasharray={`${(scoreResult.match_score / 100) * 329.9} 439.8`}
                  />
                  
                  {/* Blue dot at the end of the progress */}
                  <circle
                    cx={100 + 70 * Math.cos(((scoreResult.match_score / 100) * 270 - 90) * Math.PI / 180)}
                    cy={100 + 70 * Math.sin(((scoreResult.match_score / 100) * 270 - 90) * Math.PI / 180)}
                    r="7"
                    fill="white"
                    stroke="#1e88e5"
                    strokeWidth="2"
                  />
                  
                  {/* Center text */}
                  <text
                    x="100"
                    y="85"
                    fontSize="12"
                    fill="#757575"
                    textAnchor="middle"
                  >
                    Match Score
                  </text>
                  
                  <text
                    x="100"
                    y="115"
                    fontSize="36"
                    fontWeight="bold"
                    textAnchor="middle"
                    className={getScoreColorClass(scoreResult.match_score)}
                  >
                    {scoreResult.match_score}%
                  </text>
                </svg>
              </div>
              
              {/* Star Rating */}
              <div className="flex items-center justify-center mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const rating = getStarRating(scoreResult.match_score);
                    const fullStar = star <= Math.floor(rating);
                    const halfStar = !fullStar && star === Math.ceil(rating) && rating % 1 >= 0.3;
                    
                    return (
                      <div key={star} className="w-5 h-5 mx-0.5">
                        {fullStar ? (
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ) : halfStar ? (
                          <div className="relative">
                            <Star className="absolute w-5 h-5 text-gray-300" />
                            <div className="absolute overflow-hidden w-2.5 h-5">
                              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            </div>
                          </div>
                        ) : (
                          <Star className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  {getStarRating(scoreResult.match_score).toFixed(1)} Rating
                </span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Skills Section */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-800 mb-2">Skills Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Missing Skills */}
                {scoreResult.missing_skills && scoreResult.missing_skills.length > 0 && (
                  <div className="bg-gray-50 border rounded-lg p-3">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center text-sm">
                      <X className="h-4 w-4 mr-1 text-amber-500" />
                      Missing Skills ({scoreResult.missing_skills.length})
                    </h4>
                    <ul className="space-y-1 pl-2 text-xs">
                      {scoreResult.missing_skills.map((skill, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-600 mr-1.5 flex-shrink-0 p-0.5">
                            <X className="h-2 w-2" />
                          </span>
                          <span className="text-gray-700">{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Matched Skills */}
                {scoreResult.matched_skills && scoreResult.matched_skills.length > 0 && (
                  <div className="bg-green-50 border rounded-lg p-3">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center text-sm">
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                      Matched Skills ({scoreResult.matched_skills.length})
                    </h4>
                    <ul className="space-y-1 pl-2 text-xs">
                      {scoreResult.matched_skills.map((skill, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-1.5 flex-shrink-0 p-0.5">
                            <Check className="h-2 w-2" />
                          </span>
                          <span className="text-gray-700">{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {scoreResult.recommendations && scoreResult.recommendations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recommendations ({scoreResult.recommendations.length})
                    </h4>
                    <ul className="space-y-1 pl-2 text-xs">
                      {scoreResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-1.5 flex-shrink-0 p-0.5">
                            <Check className="h-2 w-2" />
                          </span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={() => setScoreResult(null)} 
                variant="outline"
                className="flex-1 text-sm"
              >
                Score Another Resume
              </Button>
              
              <Button 
                className="flex-1 bg-black text-white hover:bg-gray-800 text-sm"
              >
                <span>Optimize Resume</span>
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MobileResumeScorer: React.FC<MobileResumeScorerProps> = ({
  resumes,
  selectedResumeId,
  handleResumeSelect,
  fileInputRef,
  handleFileChange,
  file,
  setFile,
  isLoading,
  scoreResume,
  jobDescription
}) => {
  return (
    <div className="px-2 py-3">
      <div className="flex items-center mb-3">
        <FileText className="h-5 w-5 text-gray-600 mr-2" />
        <h2 className="text-base font-semibold">Resume Match Score</h2>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex flex-col gap-2">
          {/* Resume selection dropdown */}
          <div className="relative w-full">
            <select
              id="mobile-resume-select"
              className="w-full p-2.5 bg-white border border-gray-300 text-gray-700 rounded-md appearance-none pr-8"
              value={selectedResumeId || ""}
              onChange={handleResumeSelect}
            >
              <option value="">Select a resume</option>
              {resumes.map((resume) => (
                <option key={resume.resume_id} value={resume.resume_id}>
                  {resume.file_name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
          
          {/* Upload option */}
          <div className="relative">
            <Button 
              variant="outline"
              className="w-full p-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
        
        {/* Show selected file */}
        {file && (
          <div className="mt-2 flex items-center bg-white p-2 rounded border">
            <FileText className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
            <button 
              className="text-gray-500 hover:text-red-500"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = '';
                setFile(null);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Score button */}
      <Button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          scoreResume();
        }}
        disabled={isLoading || !jobDescription || (!selectedResumeId && !file)} 
        className="w-full py-2 bg-black text-white font-medium rounded-md"
      >
        {isLoading ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Score Resume"
        )}
      </Button>
    </div>
  );
};

export default ResumeScore;