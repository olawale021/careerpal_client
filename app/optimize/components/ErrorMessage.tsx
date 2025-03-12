import React from "react";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage = ({ message, className }: ErrorMessageProps) => {
  return (
    <div className={`text-red-500 text-sm ${className || ''}`}>
      {message}
    </div>
  );
};

export default ErrorMessage; 