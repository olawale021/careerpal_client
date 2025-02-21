"use client"; // Ensures client-only rendering

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import JobsTable from "@/components/ui/jobs-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw } from "lucide-react";

interface Filters {
    search: string;
    location: string;
    jobType: string;
    salary: number[];
    remote: string;
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [filters, setFilters] = useState<Filters>({
        search: "",
        location: "",
        jobType: "",
        salary: [0, 100000],
        remote: "",
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login"); // Redirect if not logged in
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!session) return null; // Prevent UI flicker before redirect

    const handleResetFilters = () => {
        setFilters({
            search: "",
            location: "",
            jobType: "",
            salary: [0, 100000],
            remote: "",
        });
    };

    return (
        <div className="container mx-auto p-4 lg:p-8 min-h-screen">
            <div className="space-y-8">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mt-4">Job Listings</h1>
                    <p className="text-muted-foreground mt-2">
                        Browse and find the perfect job opportunities.
                    </p>
                </div>

                {/* Filters Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Search Filter */}
                    <Input
                        placeholder="Search job title..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />

                    {/* Location Filter */}
                    <Input
                        placeholder="Location..."
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    />

                    {/* Job Type Filter */}
                    <Select onValueChange={(value) => setFilters({ ...filters, jobType: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Job Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Salary Range Filter */}
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Salary Range (£)</p>
                        <Slider
                            min={0}
                            max={100000}
                            step={1000}
                            value={filters.salary}
                            onValueChange={(value) => setFilters({ ...filters, salary: value })}
                        />
                        <Badge variant="secondary" className="mt-2">
                            £{filters.salary[0]} - £{filters.salary[1]}
                        </Badge>
                    </div>

                    {/* Remote Work Filter */}
                    <Select onValueChange={(value) => setFilters({ ...filters, remote: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Remote Work" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="On-site">On-site</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Refresh Button */}
                <div className="flex justify-end">
                    <Button onClick={handleResetFilters}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Reset Filters
                    </Button>
                </div>

                {/* Jobs Table */}
                <JobsTable filters={filters} />
            </div>
        </div>
    );
}
