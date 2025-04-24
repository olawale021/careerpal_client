import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FilterSection } from './FilterSection';
import { EXPERIENCE_LEVELS, ExperienceLevelProps } from './types';

export function ExperienceLevelFilter({
  selectedLevels,
  onLevelChange,
}: ExperienceLevelProps) {
  return (
    <FilterSection title="Experience Level">
      <div className="space-y-3">
        {EXPERIENCE_LEVELS.map((level) => (
          <div key={level} className="flex items-center space-x-2">
            <Checkbox
              id={`level-${level}`}
              checked={selectedLevels.includes(level)}
              onCheckedChange={() => onLevelChange(level)}
            />
            <Label
              htmlFor={`level-${level}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {level}
            </Label>
          </div>
        ))}
      </div>
    </FilterSection>
  );
} 