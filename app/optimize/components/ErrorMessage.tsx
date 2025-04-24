import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage = ({ message, className }: ErrorMessageProps) => {
  return (
    <div role="alert" className={cn("rounded-lg", className)}>
      <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <AlertTitle className="text-sm font-medium text-red-800">Error</AlertTitle>
          <AlertDescription className="text-sm text-red-700">{message}</AlertDescription>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage; 