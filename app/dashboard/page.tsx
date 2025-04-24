"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobType, JobTypeFilter } from "@/components/ui/filters";
import { Input } from "@/components/ui/input";
import JobCard from '@/components/ui/JobCard';
import JobDetails from '@/components/ui/JobDetails';
import { Pagination } from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useApi } from "@/hooks/use-api";
import { GlobeIcon, SlidersHorizontal, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  requirements: string[];
  posted_date: string;
  application_url: string;
  tags: string[];
  link?: string;
}

interface JobsResponse {
  jobs?: Job[];
  total?: number;
  total_jobs?: number;
  total_pages?: number;
  page?: number;
  limit?: number;
  error?: string;
  data?: {
    jobs: Job[];
    total?: number;
    total_jobs?: number;
    total_pages?: number;
    page?: number;
    limit?: number;
  };
}

// Define default filters
interface FilterValues {
  jobType: JobType[];
  location: string;
  daysPosted: number | null;
  title: string;
}

const defaultFilters: FilterValues = {
  jobType: [],
  location: '',
  daysPosted: null,
  title: ''
};

// Add error boundary around the JobTypeFilter component
const SafeJobTypeFilter = ({ 
  selectedJobTypes, 
  onJobTypeChange 
}: {
  selectedJobTypes: JobType[];
  onJobTypeChange: (jobType: JobType) => void;
}) => {
  try {
    return (
      <JobTypeFilter 
        selectedJobTypes={selectedJobTypes}
        onJobTypeChange={onJobTypeChange}
      />
    );
  } catch (error) {
    console.error("Error rendering JobTypeFilter:", error);
    return (
      <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-600">
        Job type filters temporarily unavailable
      </div>
    );
  }
};

// Create safe filter components for location and date posted
const SafeLocationFilter = ({ onLocationChange, value }: { onLocationChange: (location: string) => void, value: string }) => {
  const [location, setLocation] = useState(value);
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };
  
  const handleLocationSubmit = () => {
    onLocationChange(location);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLocationSubmit();
    }
  };
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Location</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Enter location..."
          value={location}
          onChange={handleLocationChange}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button 
          size="sm" 
          onClick={handleLocationSubmit}
          variant="outline"
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

const SafeDatePostedFilter = ({ onDateFilterChange, value }: { onDateFilterChange: (days: number | null) => void, value: number | null }) => {
  const dateOptions = [
    { label: "Any time", value: null },
    { label: "Past 24 hours", value: 1 },
    { label: "Past week", value: 7 },
    { label: "Past month", value: 30 },
  ];
  const [selectedDate, setSelectedDate] = useState<number | null>(value);
  
  const handleDateChange = (value: number | null) => {
    setSelectedDate(value);
    onDateFilterChange(value);
  };
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Date Posted</h3>
      <div className="flex flex-col gap-1.5">
        {dateOptions.map(option => (
          <div 
            key={option.label}
            className={`px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
              selectedDate === option.value 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            }`}
            onClick={() => handleDateChange(option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const SafeRemoteFilter = ({ 
  value, 
  onChange 
}: { 
  value: string[], 
  onChange: (isRemote: boolean) => void 
}) => {
  const isRemote = value.includes('Remote');
  
  return (
    <Button
      variant={isRemote ? "default" : "outline"}
      size="sm"
      className="text-xs"
      onClick={() => onChange(!isRemote)}
    >
      <GlobeIcon className="h-3.5 w-3.5 mr-1.5" />
      Remote
    </Button>
  );
};

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const { data: session } = useSession();
  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading">("idle");
  
  // Use filters object instead of individual states
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  
  // Use a ref to prevent extra renders/loops
  const fetchedRef = useRef(false);
  const initialFetchDone = useRef(false);
  
  // Use the API hook
  const jobsApi = useApi<JobsResponse>();

  // Add remoteFilter state
  const [remoteFilter, setRemoteFilter] = useState<boolean>(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Create a single source of truth for all filter parameters
  const filterParams = useCallback(() => {
    const params: Record<string, string> = {
      page: currentPage.toString(),
    };
    
    if (filters.title) {
      // Send as both title and search parameters to cover different backend implementations
      params.title = filters.title;
      params.search = filters.title; // Add an additional search parameter
      params.q = filters.title;      // Add q parameter which is commonly used for search
    }
    
    if (filters.location) params.location = filters.location;
    if (filters.daysPosted) params.days_posted = filters.daysPosted.toString();
    
    // Apply job type filter if any are selected
    if (filters.jobType.length > 0) {
      params.job_type = filters.jobType[0];
    }
    
    // Apply other filters
    appliedFilters.forEach(filter => {
      if (filter === "Remote") {
        params.remote = "true";
      }
    });
    
    return params;
  }, [currentPage, filters, appliedFilters]);

  // Mark that we need to fetch when filter params change
  useEffect(() => {
    console.log("Filter params changed", {
      currentPage,
      title: filters.title,
      location: filters.location,
      daysPosted: filters.daysPosted,
      jobTypes: filters.jobType.length,
      appliedFilters: appliedFilters.length
    });
    
    if (initialFetchDone.current) {
      fetchedRef.current = false;
    }
  }, [currentPage, filters, appliedFilters]);

  // Effect for the initial fetch
  useEffect(() => {
    console.log("Initial fetch effect", { 
      session: !!session?.user?.jwt,
      initialFetchDone: initialFetchDone.current,
      fetchStatus
    });
    
    if (session?.user?.jwt && !initialFetchDone.current && fetchStatus === "idle") {
      fetchedRef.current = false;
      initialFetchDone.current = true;
    }
  }, [session, fetchStatus]);

  // Add handleRemoteChange function
  const handleRemoteChange = (isRemote: boolean) => {
    setRemoteFilter(isRemote);
    setAppliedFilters(prev => {
      if (isRemote) {
        return [...prev.filter(f => f !== 'Remote'), 'Remote'];
      } else {
        return prev.filter(f => f !== 'Remote');
      }
    });
  };

  // Modify the fetchJobs function to fix how parameters are sent to the server
  useEffect(() => {
    const fetchJobs = async () => {
      // Don't fetch if we already did or are currently fetching
      if (fetchedRef.current || !session?.user?.jwt || fetchStatus === "loading") {
        console.log("Skipping fetch", { 
          fetchedRef: fetchedRef.current,
          hasSession: !!session?.user?.jwt,
          fetchStatus
        });
        return;
      }

      console.log("Starting fetch");
      setFetchStatus("loading");
      fetchedRef.current = true;
      
      try {
        const queryParams = filterParams();        
        console.log("Query params:", queryParams);
        
        // Include remote filter in the fetch if needed
        if (remoteFilter) {
          queryParams.remote = "true";
        }
        
        // Construct a proper query string to ensure parameters are passed correctly
        let queryString = Object.entries(queryParams)
          .filter(([, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');
        
        // Prepend with ? if there are any params
        if (queryString) {
          queryString = '?' + queryString;
        }
        
        console.log(`Fetching with query string: ${queryString}`);
        
        const response = await jobsApi.fetch<JobsResponse>('/api/proxy', {
          method: 'get',
          params: {
            path: `/jobs${queryString}`,
          },
          headers: {
            'Authorization': `Bearer ${session?.user?.jwt}`,
            'Content-Type': 'application/json',
          },
        });

        console.log("API response:", response);
        
        // Additional diagnostics for the response
        if (!response.jobs && !response.data?.jobs) {
          console.error("❌ No jobs data in response:", response);
          
          // Check if there might be error information
          if (response.error) {
            console.error("Server returned error:", response.error);
          }
          
          // Log the structure of the response
          console.log("Response structure:", {
            hasJobsProperty: 'jobs' in response,
            hasDataProperty: 'data' in response,
            responseKeys: Object.keys(response)
          });
        }
        
        // Handle the case where response might be nested
        let jobResults: Job[] = [];
        let totalPageCount = 1;
        
        if (response.jobs) {
          jobResults = response.jobs;
          totalPageCount = response.total_pages || 1;
        } else if (response.data && response.data.jobs) {
          // Handle case where API returns a nested data object
          jobResults = response.data.jobs;
          totalPageCount = response.data.total_pages || 1;
        }
        
        // Apply stricter client-side filtering when a search term is present
        // because the backend doesn't seem to filter properly
        let appliedClientSideFiltering = false;
        
        // Client-side filtering for search term
        if (filters.title && filters.title.trim() !== '') {
          appliedClientSideFiltering = true;
          const searchTerm = filters.title.toLowerCase().trim();
          console.log(`Applying client-side filter for search term: "${searchTerm}"`);
          
          // Stronger relevance filtering - prioritize title matches
          const exactMatches: Job[] = [];
          const partialMatches: Job[] = [];
          const weakMatches: Job[] = [];
          
          jobResults.forEach(job => {
            const title = job.title?.toLowerCase() || '';
            const company = job.company?.toLowerCase() || '';
            const description = job.description?.toLowerCase() || '';
            const location = job.location?.toLowerCase() || '';
            const tags = job.tags?.map(t => t.toLowerCase()) || [];
            
            // Check for exact title match
            if (title.includes(searchTerm)) {
              exactMatches.push(job);
            } 
            // Check for company or strong description match
            else if (company.includes(searchTerm) || 
                    (description.includes(searchTerm) && description.includes('software'))) {
              partialMatches.push(job);
            }
            // Check for any other weak match in description or tags
            else if (description.includes(searchTerm) || 
                    tags.some(tag => tag.includes(searchTerm)) ||
                    location.includes(searchTerm)) {
              weakMatches.push(job);
            }
          });
          
          // Combine matches with highest relevance first
          const filteredJobs = [...exactMatches, ...partialMatches, ...weakMatches];
          
          // Only use client-side filtering if we have matching results
          if (filteredJobs.length > 0) {
            console.log(`Client-side filtered from ${jobResults.length} to ${filteredJobs.length} jobs`);
            console.log(`- Exact title matches: ${exactMatches.length}`);
            console.log(`- Partial matches: ${partialMatches.length}`);
            console.log(`- Weak matches: ${weakMatches.length}`);
            
            jobResults = filteredJobs;
            // Adjust total pages based on new result count to prevent pagination issues
            const newTotalPages = Math.max(1, Math.ceil(filteredJobs.length / 20));
            totalPageCount = newTotalPages;
          } else if (searchTerm.length >= 3) {
            // If no matches and we have a substantial search term, show empty results
            console.log("No matching jobs found for search term");
            jobResults = [];
            totalPageCount = 1;
          }
        }
        
        // Apply client-side location filtering if needed
        if (filters.location && filters.location.trim() !== '') {
          appliedClientSideFiltering = true;
          const locationTerm = filters.location.toLowerCase().trim();
          console.log(`Applying client-side filter for location: "${locationTerm}"`);
          
          // Normalize location strings for better matching
          const normalizeLocation = (loc: string): string => {
            return loc.toLowerCase()
              .replace(/,\s+/g, ',') // Remove spaces after commas
              .replace(/\s+/g, ' ') // Normalize multiple spaces
              .trim();
          };
          
          const normalizedSearchTerm = normalizeLocation(locationTerm);
          
          // Filter jobs that match the location
          const locationFilteredJobs = jobResults.filter(job => {
            if (!job.location) return false;
            
            const jobLocation = normalizeLocation(job.location);
            
            // Try multiple matching strategies
            
            // 1. Direct substring match
            if (jobLocation.includes(normalizedSearchTerm)) {
              return true;
            }
            
            // 2. Check individual parts of location (city, state, country)
            const searchParts = normalizedSearchTerm.split(/[\s,]+/);
            const locationParts = jobLocation.split(/[\s,]+/);
            
            // Check if any search part is contained in any location part
            const hasMatchingPart = searchParts.some(searchPart => 
              locationParts.some(locationPart => 
                locationPart.includes(searchPart) || searchPart.includes(locationPart)
              )
            );
            
            if (hasMatchingPart) {
              return true;
            }
            
            // 3. Special case for remote
            if (normalizedSearchTerm === 'remote' && 
                (jobLocation.includes('remote') || jobLocation.includes('anywhere'))) {
              return true;
            }
            
            return false;
          });
          
          console.log(`Location filtering: from ${jobResults.length} to ${locationFilteredJobs.length} jobs`);
          
          if (locationFilteredJobs.length > 0) {
            jobResults = locationFilteredJobs;
            // Adjust total pages based on new filtered count
            const newTotalPages = Math.max(1, Math.ceil(locationFilteredJobs.length / 20));
            totalPageCount = newTotalPages;
          } else if (normalizedSearchTerm.length >= 2) {
            // If no matches for a substantial location search, show empty results
            console.log("No matching jobs found for location");
            jobResults = [];
            totalPageCount = 1;
          }
        }
        
        if (jobResults.length > 0) {
          setJobs(jobResults);
          setTotalPages(totalPageCount);
          
          // Auto-select first job on desktop if none is selected
          if (!selectedJob && !isMobile) {
            setSelectedJob(jobResults[0]);
          }
        } else {
          console.log("No jobs found after filtering");
          setJobs([]);
          setTotalPages(1);
          // Clear selected job when no results
          if (selectedJob && appliedClientSideFiltering) {
            setSelectedJob(null);
          }
        }
      } catch (err) {
        console.error("Error in fetchJobs:", err);
        // Even on error, we've attempted the fetch
        fetchedRef.current = true;
        setJobs([]);
      } finally {
        setFetchStatus("idle");
      }
    };
    
    fetchJobs();
  }, [session, fetchStatus, jobsApi, filterParams, selectedJob, isMobile, remoteFilter, filters.title, filters.location, filters.daysPosted, filters.jobType]);

  const handlePageChange = (page: number) => {
    console.log("Page changed to:", page);
    setCurrentPage(page);
    // Explicitly reset fetchedRef to ensure we fetch when page changes
    fetchedRef.current = false;
  };
  
  // Handler for the JobTypeFilter
  const handleJobTypeChange = (jobType: JobType) => {
    console.log("Job type filter changed:", jobType);
    setFilters(prev => ({
      ...prev,
      jobType: prev.jobType.includes(jobType) 
        ? prev.jobType.filter(jt => jt !== jobType) 
        : [...prev.jobType, jobType]
    }));
    setCurrentPage(1);
    // Ensure we fetch with new filter
    fetchedRef.current = false;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  // Enhance the handleSearch function to perform better searching
  const handleSearch = () => {
    console.log("Search triggered with term:", filters.title);
    // Reset to page 1 when searching
    setCurrentPage(1);
    
    // If search term is empty, just do a regular fetch
    if (!filters.title || filters.title.trim() === '') {
      fetchedRef.current = false;
      return;
    }
    
    // No longer resetting other filters when searching - allow combined filters
    // Force a new fetch for the search
    fetchedRef.current = false;
  };

  // Add new handler for location filter
  const handleLocationChange = (location: string) => {
    console.log("Location filter changed to:", location);
    setFilters(prev => ({
      ...prev,
      location
    }));
    setCurrentPage(1);
    // Ensure we fetch with new filter
    fetchedRef.current = false;
  };
  
  // Add new handler for date posted filter
  const handleDateFilterChange = (days: number | null) => {
    console.log("Date filter changed to:", days);
    setFilters(prev => ({
      ...prev,
      daysPosted: days
    }));
    setCurrentPage(1);
    // Ensure we fetch with new filter
    fetchedRef.current = false;
  };
  
  // Update clearFilters to also clear new filters
  const clearFilters = () => {
    console.log("Clearing all filters");
    setFilters(defaultFilters);
    setAppliedFilters([]);
    setCurrentPage(1);
    setRemoteFilter(false);
    
    // Force a new fetch after clearing
    fetchedRef.current = false;
  };

  const handleSelectJob = (job: Job) => {
    console.log("Selected job application URL:", job.application_url);
    console.log("Selected job link URL:", job.link);
    console.log("Full job data:", job);
    setSelectedJob(job);
  };

  // Add missing handleBackToList function
  const handleBackToList = () => {
    setSelectedJob(null);
  };

  const formatDateSafely = (dateString?: string) => {
    if (!dateString) return '';
    
    // Check if it's a valid date format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateString}`);
      return dateString; // Return the original string if it's not a valid date
    }
    
    return dateString;
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-5 h-full">
        <div className="flex flex-col overflow-hidden md:col-span-2 border-r">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold mb-4">Job Listings</h1>
            
            <div className="flex items-center gap-2 mb-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <SlidersHorizontal className="h-4 w-4" />
                    {(filters.jobType.length > 0 || filters.location || filters.daysPosted || remoteFilter) && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {[
                          filters.jobType.length > 0 ? 1 : 0,
                          filters.location ? 1 : 0,
                          filters.daysPosted ? 1 : 0,
                          remoteFilter ? 1 : 0
                        ].reduce((a, b) => a + b, 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-xl">Filters</SheetTitle>
                      {(filters.jobType.length > 0 || filters.location || filters.daysPosted || remoteFilter) && (
                        <Button
                          variant="ghost"
                          className="text-base text-muted-foreground"
                          onClick={clearFilters}
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {/* Job Type Filter */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Job Type</h3>
                      <SafeJobTypeFilter
                        selectedJobTypes={filters.jobType}
                        onJobTypeChange={handleJobTypeChange}
                      />
                    </div>
                    
                    <div className="border-t my-4"></div>
                    
                    {/* Location Filter */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Location</h3>
                      <SafeLocationFilter
                        onLocationChange={handleLocationChange}
                        value={filters.location}
                      />
                    </div>
                    
                    <div className="border-t my-4"></div>
                    
                    {/* Date Posted Filter */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Date Posted</h3>
                      <SafeDatePostedFilter
                        onDateFilterChange={handleDateFilterChange}
                        value={filters.daysPosted}
                      />
                    </div>
                    
                    <div className="border-t my-4"></div>
                    
                    {/* Remote Filter */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Work Type</h3>
                      <SafeRemoteFilter
                        value={appliedFilters}
                        onChange={handleRemoteChange}
                      />
                    </div>
                  </div>
                  
                  <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <Button 
                      onClick={() => {
                        // This will force a refetch with current filters
                        fetchedRef.current = false;
                        // Close the sheet after applying filters
                        document.querySelector('[data-radix-collection-item]')?.dispatchEvent(
                          new MouseEvent('click', { bubbles: true })
                        );
                      }} 
                      className="w-full"
                    >
                      Apply Filters
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              
              <Input
                placeholder="Search jobs..."
                value={filters.title}
                onChange={handleSearchChange}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="sm">Search</Button>
              
              {(filters.jobType.length > 0 || filters.location || filters.daysPosted || remoteFilter) && (
                <Button onClick={clearFilters} variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Add a row of active filter chips/badges */}
            {(filters.jobType.length > 0 || filters.location || filters.daysPosted || remoteFilter) && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {filters.jobType.map(jobType => (
                  <Badge 
                    key={jobType} 
                    className="py-1 px-2 flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full"
                    variant="outline"
                  >
                    {jobType}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleJobTypeChange(jobType)} 
                    />
                  </Badge>
                ))}
                
                {filters.location && (
                  <Badge 
                    className="py-1 px-2 flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full"
                    variant="outline"
                  >
                    📍 {filters.location}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        setFilters(prev => ({...prev, location: ''}));
                        fetchedRef.current = false;
                      }} 
                    />
                  </Badge>
                )}
                
                {filters.daysPosted && (
                  <Badge 
                    className="py-1 px-2 flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full"
                    variant="outline"
                  >
                    {filters.daysPosted === 1 
                      ? 'Last 24 hours' 
                      : filters.daysPosted === 7 
                        ? 'Last week' 
                        : 'Last month'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleDateFilterChange(null)} 
                    />
                  </Badge>
                )}
                
                {remoteFilter && (
                  <Badge 
                    className="py-1 px-2 flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full"
                    variant="outline"
                  >
                    Remote
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoteChange(false)} 
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {fetchStatus === "loading" ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">No jobs found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="divide-y">
                {jobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={{
                      id: Number(job.id),
                      title: job.title,
                      company: job.company,
                      location: job.location,
                      salary: job.salary,
                      job_type: job.tags?.includes("Full Time") ? "Full Time" : 
                                job.tags?.includes("Part Time") ? "Part Time" : 
                                job.tags?.includes("Contract") ? "Contract" : undefined,
                      remote_working: job.tags?.includes("Remote") ? "Remote" : undefined,
                      created_at: formatDateSafely(job.posted_date)
                    }}
                    isSelected={selectedJob?.id === job.id}
                    onSelect={() => handleSelectJob(job)} 
                  />
                ))}
              </div>
            )}
          </div>
          
          {fetchStatus !== "loading" && jobs.length > 0 && (
            <div className="border-t p-4">
              <Pagination 
                totalPages={totalPages} 
                currentPage={currentPage} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </div>

        <div className={`md:col-span-3 ${selectedJob ? "block" : "hidden md:block"} h-full overflow-y-auto`}>
          {isMobile && selectedJob && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="m-4" 
              onClick={handleBackToList}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to list
            </Button>
          )}
          
          <JobDetails 
            job={selectedJob ? {
              id: Number(selectedJob.id),
              title: selectedJob.title,
              company: selectedJob.company,
              location: selectedJob.location,
              salary: selectedJob.salary,
              job_type: selectedJob.tags?.includes("Full Time") ? "Full Time" : 
                       selectedJob.tags?.includes("Part Time") ? "Part Time" : 
                       selectedJob.tags?.includes("Contract") ? "Contract" : undefined,
              remote_working: selectedJob.tags?.includes("Remote") ? "Remote" : undefined,
              created_at: formatDateSafely(selectedJob.posted_date),
              // Use link property instead of application_url
              link: selectedJob.link || 
                   `https://www.google.com/search?q=${encodeURIComponent(`${selectedJob.title} ${selectedJob.company} job application`)}`,
              description: selectedJob?.description
            } : null} 
          />
        </div>
      </div>
    </div>
  );
}
