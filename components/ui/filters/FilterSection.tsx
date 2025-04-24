import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { FilterSectionProps } from "./types";

export const FilterSection = ({ 
  children, 
  title, 
  icon 
}: FilterSectionProps) => {
  return (
    <Card className="bg-white p-0 w-full border-0 shadow-sm">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
            <div className="flex items-center gap-2 text-left font-medium">
              {icon && <span className="text-gray-500">{icon}</span>}
              <span>{title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            {children}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default FilterSection; 