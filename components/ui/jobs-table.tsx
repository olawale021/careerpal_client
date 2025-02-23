import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCcw, 
  Building2, 
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
// import { useMediaQuery } from "react-responsive";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  link: string;
  created_at: string;
}

interface Filters {
  search: string;
  location: string;
  jobType: string;
  salary: number[];
  remote: string;
}

interface JobsTableProps {
  filters: Filters;
}

export default function JobsTable({ filters }: JobsTableProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // const isMobile = useMediaQuery({ maxWidth: 768 });

  const fetchJobs = useCallback(async () => {
    try {
      setRefreshing(true);
      setLoading(true);
  
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(filters.search && { search: filters.search }),
        ...(filters.location && { location: filters.location }),
        ...(filters.jobType && { jobType: filters.jobType }),
        ...(filters.remote && { remote: filters.remote }),
        minSalary: filters.salary[0].toString(),
        maxSalary: filters.salary[1].toString(),
      });
  
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs?${queryParams}`;
      
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
  
      const text = await res.text();
      
      try {
        const data = JSON.parse(text);
        setJobs(data.jobs || []);
      } catch (error) {
        console.error("JSON Parse Error:", error);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const TableSkeleton = () => (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );

  const MobileJobCard = ({ job }: { job: Job }) => (
    <Link href={`/job/${job.id}`}>
      <div className="flex flex-col bg-white p-4 border-b border-gray-200 hover:bg-blue-50 active:bg-blue-100 cursor-pointer">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-600 mb-1 line-clamp-2">
              {job.title}
            </h3>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center text-gray-900">
                <Building2 className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span className="font-medium">{job.company}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{job.location}</span>
              </div>

              {job.salary && (
                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span>{job.salary}</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200">
                <Briefcase className="h-3 w-3 mr-1" />
                Full-time
              </Badge>
              {filters.remote === "Remote" && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200">
                  Remote
                </Badge>
              )}
            </div>

            <div className="mt-3 flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{getTimeAgo(job.created_at)}</span>
            </div>
          </div>
          
          <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
        </div>
      </div>
    </Link>
  );

  return (
    <Card className="border-0 shadow-none bg-gray-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Badge variant="default" className="text-lg py-1">
            {jobs.length}
          </Badge>
          Jobs Found
        </CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchJobs}
          disabled={refreshing}
          className="h-8 w-8"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <TableSkeleton />
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white mx-4 rounded-lg">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search filters
            </p>
            <div className="mt-6">
              <Button onClick={fetchJobs} variant="outline">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh Results
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            {jobs.map((job) => (
              <MobileJobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-white border-t">
          <Button 
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))} 
            disabled={page === 1}
            variant="outline"
            className="w-28"
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-8 px-3">
              Page {page}
            </Badge>
          </div>
          <Button 
            onClick={() => setPage((prev) => prev + 1)}
            className="w-28"
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}