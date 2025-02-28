"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, DollarSign, Calendar, Building, ExternalLink } from "lucide-react";
import { formatDate } from "../../components/ui/utils";
import ResumeScore from "./ResumeScore";

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
  if (!job) return <p className="p-4 text-gray-500">Select a job to view details</p>;

  return (
    <Card className="border-0 rounded-none h-screen overflow-y-auto font-josefin">
      <CardHeader className="space-y-4">
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
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Resume Score Component */}
        <ResumeScore jobDescription={job.description} />
        
        <Separator />

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Job Description</h3>
          <p className="text-lg text-muted-foreground whitespace-pre-line">
            {job.description || "No description available"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobDetails;