"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, DollarSign, Calendar, Building, ExternalLink } from "lucide-react";
import { formatDate } from "../../components/ui/utils";
import ResumeScore from "./ResumeScore";
import { useEffect, useState } from "react";
import styles from "./JobDetails.module.css";

// ✅ Define Job Interface
interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  job_type?: string;
  remote_working?: string;
  created_at: string;
  link?: string;
  description?: string;
}

// ✅ Use `JobDetailsProps` properly
interface JobDetailsProps {
  job: Job | null;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!job) return <p className="p-4 text-gray-500">Select a job to view details</p>;

  const formatJobDescription = (description: string | undefined) => {
    if (!description) return <p>No description available</p>;
    
    // Split text by newlines
    const segments = description.split(/\n/).filter(Boolean);
    
    return (
      <div className={styles.formattedDescription}>
        {segments.map((segment, index) => {
          segment = segment.trim();
          if (!segment) return null;
          
          // Check if this looks like a section heading
          // Match patterns like "Something:" or "SOMETHING:" or "1. Something:"
          const isHeading = /^([A-Z][a-zA-Z\s]+:|[A-Z\s]+:|[0-9]+\.\s+[A-Z][a-zA-Z\s]+:)/g.test(segment);
          
          if (isHeading) {
            return <h4 key={index} className={styles.detectedHeading}>{segment}</h4>;
          }
          
          // Check if this looks like a list item (starts with bullet, dash, asterisk, or number)
          const isListItem = /^[-•*]|^\d+[.)]/.test(segment);
          
          if (isListItem) {
            // Clean up the bullet point if needed
            const cleanContent = segment.replace(/^[-•*]|\d+[.)]\s*/, '').trim();
            return <div key={index} className={styles.listItem}>{cleanContent}</div>;
          }
          
          // Regular paragraph
          return <p key={index} className={styles.textParagraph}>{segment}</p>;
        })}
      </div>
    );
  };

  return (
    <div className={isMobile ? styles.mobileJobDetails : ""}>
      <Card className={`border-0 rounded-none h-screen overflow-y-auto font-josefin ${isMobile ? 'px-2' : ''}`}>
        <CardHeader className={isMobile ? styles.cardHeader : "space-y-4"}>
          {/* Mobile-optimized header */}
          {isMobile ? (
            <>
              <div className={styles.metaRow}>
                <h1 className={styles.title}>{job.title}</h1>
                <div className={styles.metaItem}>
                  <Building className="h-4 w-4" />
                  <span>{job.company}</span>
                </div>
              </div>
              
              <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
                <div className={styles.metaItem}>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{job.salary || "Not specified"}</span>
                </div>
                <div className={styles.metaItem}>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(job.created_at)}</span>
                </div>
              </div>
              
              <div>
                {job.job_type && <span className={`${styles.badge} bg-gray-100`}>{job.job_type}</span>}
                {job.remote_working && <span className={`${styles.badge} bg-gray-100`}>{job.remote_working}</span>}
              </div>
              
              {job.link && (
                <Button 
                  className={styles.applyButton}
                  asChild
                >
                  <a href={job.link} target="_blank" rel="noopener noreferrer">
                    Apply Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </>
          ) : (
            // Desktop layout (unchanged)
            <>
              <div className="flex justify-between items-start">
                {/* Left side - Title and Company */}
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground text-lg">
                    <Building className="h-5 w-5" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-lg">
                    {job.job_type && <Badge variant="secondary" className="text-lg">{job.job_type}</Badge>}
                    {job.remote_working && <Badge variant="secondary" className="text-lg">{job.remote_working}</Badge>}
                  </div>
                </div>

                {/* Right side - Location, Salary, Posted Date */}
                <div className="text-lg space-y-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span>{job.salary || "Not specified"}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>{formatDate(job.created_at)}</span>
                  </div>
                </div>
              </div>

              {job.link && (
                <Button 
                  className="w-full sm:w-auto text-lg bg-[#2b90ed] hover:bg-[#2477c7] text-white transition-colors" 
                  asChild
                >
                  <a href={job.link} target="_blank" rel="noopener noreferrer">
                    Apply Now
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              )}
            </>
          )}
        </CardHeader>

        <CardContent className={isMobile ? "py-2" : "space-y-6"}>
          {/* Resume Score Component */}
          <ResumeScore jobDescription={job.description} />
          
          <Separator className={isMobile ? styles.separator : ""} />

          <div className={isMobile ? "" : "space-y-4"}>
            <h3 className={isMobile ? styles.sectionTitle : "text-2xl font-semibold"}>
              Job Description
            </h3>
            
            {isMobile ? (
              <div className={styles.description}>
                {formatJobDescription(job.description)}
              </div>
            ) : (
              <p className="text-lg text-muted-foreground whitespace-pre-line">
                {job.description || "No description available"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetails;