export interface FilterProps {
  onFilterChange: (filters: FilterValues) => void;
  values: FilterValues;
  onClearFiltersAction: () => void;
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

export interface FilterSectionProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';

export const JOB_TYPES: JobType[] = [
  'Full-time',
  'Part-time',
  'Contract', 
  'Internship',
  'Remote'
];

export interface JobTypeFilterProps {
  selectedJobTypes: JobType[];
  onJobTypeChange: (jobType: JobType) => void;
}

export interface LocationFilterProps {
  location: string;
  onChange: (location: string) => void;
}

export interface SalaryFilterProps {
  minSalary: number;
  maxSalary: number;
  onMinSalaryChange: (value: number) => void;
  onMaxSalaryChange: (value: number) => void;
}

export interface RemoteFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export interface DatePostedFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export interface TitleFilterProps {
  title: string;
  onChange: (title: string) => void;
}

export const REMOTE_OPTIONS = [
  "On-site only",
  "Remote",
  "Hybrid",
];

export const DATE_POSTED_OPTIONS = [
  "Any time",
  "Past 24 hours",
  "Past week",
  "Past month",
];

export interface DateFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

export interface ExperienceLevelProps {
  selectedLevels: string[];
  onLevelChange: (level: string) => void;
}

export const EXPERIENCE_LEVELS = [
  'Entry Level',
  'Mid Level',
  'Senior Level',
  'Executive'
]; 