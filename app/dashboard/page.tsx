"use client";

import { useEffect, useState, useCallback } from "react";
import JobCard from "../../components/ui/JobCard";
import JobDetails from "../../components/ui/JobDetails";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { fetchApi } from '../../lib/api';

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
}

export default function Dashboard() {
  // ✅ Explicitly define state type
  const [state, setState] = useState<{
    jobs: Job[];
    loading: boolean;
    page: number;
    totalPages: number;
    selectedJob: Job | null;
    isMobileView: boolean;
  }>({
    jobs: [],
    loading: true,
    page: 1,
    totalPages: 1,
    selectedJob: null,
    isMobileView: false,
  });

  useEffect(() => {
    const handleResize = () => {
      setState((prev) => ({
        ...prev,
        isMobileView: window.innerWidth < 768,
      }));
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //  Fetch Jobs from API
  const fetchJobs = useCallback(async () => {
    try {
      const data = await fetchApi(`/jobs?page=${state.page}&limit=10`);
      
      setState((prev) => ({
        ...prev,
        jobs: data.jobs || [],
        totalPages: data.total_pages || 1,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }, [state.page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ✅ Handle Page Change for Pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= state.totalPages) {
      setState((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {state.isMobileView && state.selectedJob ? (
        <div className="p-4">
          <Button onClick={() => setState({ ...state, selectedJob: null })} variant="outline" className="mb-4">
            ← Back to Jobs
          </Button>
          <JobDetails job={state.selectedJob} />
        </div>
      ) : (
        <div className="grid md:grid-cols-[2fr,3fr] min-h-screen">
          <div className="border-r">
            {state.jobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                isSelected={state.selectedJob?.id === job.id} 
                onSelect={() => setState({ ...state, selectedJob: job })} 
              />
            ))}

            <div className="flex justify-between items-center p-4 border-t">
              <Button onClick={() => handlePageChange(state.page - 1)} disabled={state.page === 1} variant="outline" className="w-28">
                Previous
              </Button>
              <Badge variant="secondary" className="px-3 py-1">
                Page {state.page} of {state.totalPages}
              </Badge>
              <Button onClick={() => handlePageChange(state.page + 1)} disabled={state.page >= state.totalPages} className="w-28">
                Next
              </Button>
            </div>
          </div>

          <div className="hidden md:block">
            <JobDetails job={state.selectedJob} />
          </div>
        </div>
      )}
    </div>
  );
}
