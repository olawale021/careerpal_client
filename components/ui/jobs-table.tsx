"use client";

import { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCcw, 
  ExternalLink, 
  Building2, 
  // MapPin, 
  // DollarSign, 
  // Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

      const res = await fetch(`https://a3de-209-35-91-116.ngrok-free.app/jobs?${queryParams}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [page, filters]); // Include filters in dependencies


  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]); // Now fetchJobs is a valid dependency
  //  Function to update filters
  // const updateFilters = (newFilters: Partial<typeof filters>) => {
  //   setFilters((prev) => ({ ...prev, ...newFilters }));
  // };

  // ✅ Handle manual refresh
  const handleRefresh = () => {
    fetchJobs();
  };

  // ✅ Loading skeleton component
  const TableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Badge variant="default" className="text-lg py-1">
            {jobs.length}
          </Badge>
          Job Listings
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-8 w-8"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh jobs</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh job listings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <CardContent>
        {loading ? (
          <TableSkeleton />
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try refreshing or changing your search criteria.
            </p>
            <div className="mt-6">
              <Button onClick={handleRefresh}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[300px]">Position</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>{job.salary ? job.salary : "Not specified"}</TableCell>
                    <TableCell>
                      <span className="text-sm">{format(new Date(job.created_at), "MMM d, yyyy")}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/job/${job.id}`}>
                          View <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ✅ Pagination Controls */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Page</span>
            <Badge variant="secondary" className="h-6 px-3">{page}</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            className="flex items-center gap-2"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
