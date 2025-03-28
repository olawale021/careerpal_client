"use client";

import { useEffect, useState, useCallback } from "react";
import JobCard from "../../components/ui/JobCard";
import JobDetails from "../../components/ui/JobDetails";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { fetchApi } from '../../lib/api';
import { Filter, FilterValues } from "../../components/ui/Filter";

//  Define Job Interface
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

// Define default filters
const defaultFilters: FilterValues = {
  jobType: [],
  location: '',
  salaryMin: '0',
  salaryMax: '0',
  remote: '',
  datePosted: '',
  title: ''
};

export default function Dashboard() {
  // ✅ Explicitly define state type
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [currentFilters, setCurrentFilters] = useState<FilterValues>(defaultFilters);

  // ✅ Ensure window check only runs on client
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobileView(window.innerWidth < 768);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch Jobs and Set Initial Selection (but only for desktop)
  const fetchJobs = useCallback(async (currentPage: number, filters: FilterValues) => {
    try {
      setLoading(true);
      const data = await fetchApi(`/jobs?page=${currentPage}&limit=8&${Object.entries(filters).map(([key, value]) => `${key}=${value}`).join('&')}`);
      setJobs(data.jobs || []);
      setTotalPages(data.total_pages || 1);
      
      // Automatically select the first job if none is selected and we have jobs
      // BUT ONLY IF we're on desktop view
      if (data.jobs && data.jobs.length > 0 && !selectedJob && !isMobileView) {
        setSelectedJob(data.jobs[0]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedJob, isMobileView]); // Add isMobileView to dependency array

  // ✅ Fetch Jobs on Page Change or Filter Change
  useEffect(() => {
    fetchJobs(page, currentFilters);
  }, [page, currentFilters, fetchJobs]);

  // ✅ Handle Page Change for Pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleFilterChange = (filters: FilterValues) => {
    setCurrentFilters(filters);
    setPage(1); // Reset to page 1 when filters change
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    // Don't reset filters or refetch jobs here
  };

  const clearFilters = () => {
    setCurrentFilters(defaultFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-4">
      {isMobileView && selectedJob ? (
        <div className="p-2">
          <Button onClick={() => setSelectedJob(null)} variant="outline" className="mb-2 text-sm py-1 px-3">
            ← Back to Jobs
          </Button>
          <JobDetails job={selectedJob} />
        </div>
      ) : (
        <div className="grid md:grid-cols-[2fr,3fr] min-h-screen">
          <div className="border-r flex flex-col h-[calc(100vh-64px)]">
            <div className="p-4 border-b">
              <Filter 
                onFilterChange={handleFilterChange}
                values={currentFilters}
                onClearFiltersAction={clearFilters}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <p className="text-center py-6">Loading jobs...</p>
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    isSelected={selectedJob?.id === job.id} 
                    onSelect={() => handleJobSelect(job)} 
                  />
                ))
              ) : (
                <p className="text-center py-6">No jobs found matching your criteria</p>
              )}
            </div>

            <div className="flex justify-between items-center p-4 border-t bg-white">
              <Button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 1} 
                variant="outline" 
                className="w-28"
              >
                Previous
              </Button>
              <Badge variant="secondary" className="px-3 py-1">
                Page {page} of {totalPages}
              </Badge>
              <Button 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page >= totalPages} 
                className="w-28"
              >
                Next
              </Button>
            </div>
          </div>

          <div className="hidden md:block h-[calc(100vh-64px)] overflow-y-auto">
            {selectedJob ? (
              <JobDetails job={selectedJob} />
            ) : (
              <p className="p-6 text-center">Select a job to view details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
