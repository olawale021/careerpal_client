// Re-export JobFilters component as Filter for backward compatibility
import { JobFilters } from "../filters/JobFilters";

export type { FilterProps, FilterValues } from "../filters/types";
export { JobFilters as Filter };

// Also provide a default export for compatibility
const Filter = JobFilters;
export default Filter;
