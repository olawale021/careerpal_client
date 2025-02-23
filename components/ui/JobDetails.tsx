"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, DollarSign, Calendar, Building, ExternalLink } from "lucide-react";
import DetailItem from "./DetailItem";
import { formatDate } from "../../components/ui/utils";

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
    <Card className="sticky top-0 border-0 rounded-none h-screen overflow-y-auto">
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{job.company}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {job.job_type && <Badge variant="secondary">{job.job_type}</Badge>}
          {job.remote_working && <Badge variant="secondary">{job.remote_working}</Badge>}
        </div>
        {job.link && (
          <Button className="w-full sm:w-auto" asChild>
            <a href={job.link} target="_blank" rel="noopener noreferrer">
              Apply Now
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <DetailItem icon={MapPin} label="Location" value={job.location} />
          <DetailItem icon={DollarSign} label="Salary" value={job.salary || "Not specified"} />
          <DetailItem icon={Calendar} label="Posted" value={formatDate(job.created_at)} />
        </div>
        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Job Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {job.description || "No description available"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobDetails;
