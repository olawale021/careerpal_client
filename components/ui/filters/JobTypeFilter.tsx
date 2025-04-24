import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Briefcase, Check } from "lucide-react";
import FilterSection from "./FilterSection";
import { JOB_TYPES, JobTypeFilterProps } from "./types";

export const JobTypeFilter = ({ 
  selectedJobTypes,
  onJobTypeChange 
}: JobTypeFilterProps) => {
  return (
    <FilterSection title="Job Type" icon={<Briefcase size={18} />}>
      <div className="flex flex-col gap-3">
        {JOB_TYPES.map((jobType) => (
          <div className="flex items-center space-x-2" key={jobType}>
            <Checkbox
              id={`job-type-${jobType}`}
              checked={selectedJobTypes.includes(jobType)}
              onCheckedChange={() => onJobTypeChange(jobType)}
              className="h-4 w-4 rounded-sm border-gray-300 text-primary"
            />
            <Label
              htmlFor={`job-type-${jobType}`}
              className="text-sm font-normal cursor-pointer flex items-center"
            >
              {jobType}
              {selectedJobTypes.includes(jobType) && (
                <Check size={14} className="ml-1 text-primary" />
              )}
            </Label>
          </div>
        ))}
      </div>
    </FilterSection>
  );
};

export default JobTypeFilter; 