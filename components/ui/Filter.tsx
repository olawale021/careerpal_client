"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  jobType: string[];
  location: string;
  salaryMin: string;
  salaryMax: string;
  remote: string;
  datePosted: string;
  title: string;
}

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Internship",
];

const REMOTE_OPTIONS = [
  "On-site only",
  "Remote",
  "Hybrid",
];

const DATE_POSTED_OPTIONS = [
  "Any time",
  "Past 24 hours",
  "Past week",
  "Past month",
];

export function Filter({ onFilterChange }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    jobType: [],
    location: "",
    salaryMin: "",
    salaryMax: "",
    remote: "",
    datePosted: "Any time",
    title: "",
  });

  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);

  const handleJobTypeToggle = (type: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleApplyFilters = () => {
    const newFilters = {
      ...activeFilters,
      jobType: selectedJobTypes,
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const defaultFilters: FilterValues = {
      jobType: [],
      location: "",
      salaryMin: "",
      salaryMax: "",
      remote: "",
      datePosted: "Any time",
      title: "",
    };
    setActiveFilters(defaultFilters);
    setSelectedJobTypes([]);
    onFilterChange(defaultFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.title) count++;
    if (activeFilters.jobType.length > 0) count++;
    if (activeFilters.location) count++;
    if (activeFilters.salaryMin || activeFilters.salaryMax) count++;
    if (activeFilters.remote) count++;
    if (activeFilters.datePosted !== "Any time") count++;
    return count;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 font-josefin">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md font-josefin">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Filters</SheetTitle>
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                className="text-base text-muted-foreground"
                onClick={handleClearFilters}
              >
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Title Filter */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Job Title</Label>
            <Input
              className="text-base"
              placeholder="Search job titles..."
              value={activeFilters.title}
              onChange={(e) =>
                setActiveFilters({ ...activeFilters, title: e.target.value })
              }
            />
          </div>

          <Separator />

          {/* Job Type Filter */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Job Type</Label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={selectedJobTypes.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleJobTypeToggle(type)}
                  className="rounded-full"
                >
                  {type}
                  {selectedJobTypes.includes(type) && (
                    <X className="ml-2 h-3 w-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Location Filter */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Location</Label>
            <Input
              placeholder="Enter location..."
              value={activeFilters.location}
              onChange={(e) =>
                setActiveFilters({ ...activeFilters, location: e.target.value })
              }
            />
          </div>

          <Separator />

          {/* Salary Range Filter */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Salary Range</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={activeFilters.salaryMin}
                  onChange={(e) =>
                    setActiveFilters({
                      ...activeFilters,
                      salaryMin: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Max"
                  value={activeFilters.salaryMax}
                  onChange={(e) =>
                    setActiveFilters({
                      ...activeFilters,
                      salaryMax: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Remote Work Filter */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Remote Work</Label>
            <Select
              value={activeFilters.remote}
              onValueChange={(value) =>
                setActiveFilters({ ...activeFilters, remote: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select remote work preference" />
              </SelectTrigger>
              <SelectContent>
                {REMOTE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Date Posted Filter */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Date Posted</Label>
            <Select
              value={activeFilters.datePosted}
              onValueChange={(value) =>
                setActiveFilters({ ...activeFilters, datePosted: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_POSTED_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button onClick={handleApplyFilters} className="w-full">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 