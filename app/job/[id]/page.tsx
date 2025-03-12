"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Clock,
  Building,
  LucideIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";  // Add this import

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  posting_date: string;
  closing_date: string;
  hours: string;
  job_type: string;
  remote_working: string;
  link: string;
  created_at: string;
}

interface DetailItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}

const DetailItem = ({ icon: Icon, label, value, className }: DetailItemProps) => (
  <div className={cn("flex items-start gap-3", className)}>
    <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="container max-w-4xl mx-auto p-6 space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardContent>
    </Card>
  </div>
);

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobDetails() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",  // ✅ Bypass Ngrok warning page
            },
          }
        );
  
        const text = await response.text(); // Read response as text first
        console.log("Raw API Response:", text); // ✅ Debug response
  
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
  
        const data = JSON.parse(text); // ✅ Now parse JSON safely
        setJob(data);
      } catch (error) {
        console.error("Fetch Job Details Error:", error);
      } finally {
        setLoading(false);
      }
    }
  
    if (id) fetchJobDetails();
  }, [id]);
  

  if (loading) return <LoadingSkeleton />;

  if (!job) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card className="text-center p-6">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <CardTitle className="text-xl mb-2">Job Not Found</CardTitle>
          <CardDescription>
            The job posting you&apos;re looking for doesn&apos;t exist or has been removed.
          </CardDescription>
          <Button className="mt-4" asChild>
            <a href="/dashboard">Back to Jobs</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
            </div>
            <Button asChild size="lg" className="w-full md:w-auto">
              <a href={job.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Apply Now
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {job.job_type && (
              <Badge variant="secondary">{job.job_type}</Badge>
            )}
            {job.hours && (
              <Badge variant="secondary">{job.hours}</Badge>
            )}
            {job.remote_working && (
              <Badge variant="secondary">{job.remote_working}</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem
              icon={MapPin}
              label="Location"
              value={job.location}
            />
            <DetailItem
              icon={DollarSign}
              label="Salary"
              value={job.salary || "Not specified"}
            />
            <DetailItem
              icon={Calendar}
              label="Posted Date"
              value={job.posting_date ? format(new Date(job.posting_date), "PPP") : "Not specified"}
            />
            <DetailItem
              icon={Clock}
              label="Application Deadline"
              value={job.closing_date ? format(new Date(job.closing_date), "PPP") : "Not specified"}
            />
          </div>

          <Separator />

          {/* Job Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Description</h3>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-sm text-muted-foreground">{job.description}</p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button asChild size="lg" className="flex-1">
              <a href={job.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Apply Now
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="flex-1" asChild>
              <a href="/dashboard">Back to Jobs</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}