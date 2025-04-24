"use client";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/components/ui/utils";
import { Building2, ChevronRight, Clock, DollarSign, MapPin } from "lucide-react";

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
  
  interface JobCardProps {
    job: Job;
    isSelected: boolean;
    onSelect: () => void; // ✅ No need to pass `job` from parent component
  }
  
  const formatPostedDate = (dateString?: string) => {
    if (!dateString) return 'Recently posted';
    try {
      const formattedDate = formatDate(dateString);
      return `Posted ${formattedDate !== 'Invalid date' ? formattedDate : 'recently'}`;
    } catch (error) {
      console.error("Error formatting posted date:", error);
      return 'Recently posted';
    }
  };

  const JobCard: React.FC<JobCardProps> = ({ job, isSelected, onSelect }) => (
  <div 
  onClick={onSelect}
    className={`cursor-pointer border-b border-gray-200 hover:bg-blue-50 font-josefin ${
      isSelected ? 'bg-blue-50' : 'bg-white'
    }`}
  >
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
        <h3 className="text-xl font-semibold text-black mb-1">
            {job.title}
        </h3>

          <div className="space-y-1 text-base">
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
            {job.job_type && (
              <Badge 
                variant="outline" 
                className="bg-[#fff1ef] text-[#f26749] border-[#ffd4cc] hover:bg-[#ffe4df]"
              >
                {job.job_type}
              </Badge>
            )}
            {job.remote_working && (
              <Badge 
                variant="outline" 
                className="bg-[#edf5fd] text-[#2b90ed] border-[#cce4fb] hover:bg-[#dcedfc]"
              >
                {job.remote_working}
              </Badge>
            )}
          </div>
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatPostedDate(job.created_at)}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
      </div>
    </div>
  </div>
);

export default JobCard;
