"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { AlertCircle, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface UserResponse {
  user_id: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface UploadResponse {
  file_url: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface UploadState {
  file: File | null;
  isUploading: boolean;
  error: string | null;
  success: boolean;
  uploadedUrl: string | null;
  userId: string | null;
}

export default function UploadPage() {
  const { data: session } = useSession();
  
  const [state, setState] = useState<UploadState>({
    file: null,
    isUploading: false,
    error: null,
    success: false,
    uploadedUrl: null,
    userId: null,
  });

  // Fetch user ID when session is available
  useEffect(() => {
    const fetchUserId = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetchApi(`/users/lookup/email?email=${encodeURIComponent(session.user.email)}`) as UserResponse;
          if (!response.user_id) {
            throw new Error('User ID not found in response');
          }
          setState(prev => ({ ...prev, userId: response.user_id }));
        } catch (error) {
          console.error('Error fetching user ID:', error);
          setState(prev => ({
            ...prev,
            error: 'Failed to fetch user ID. Please try again later.'
          }));
        }
      }
    };

    fetchUserId();
  }, [session?.user?.email]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setState(prev => ({
        ...prev,
        file: e.target.files![0],
        error: null,
        success: false,
      }));
    }
  };

  const handleUpload = async () => {
    if (!state.file) {
      setState(prev => ({ ...prev, error: "Please select a file to upload" }));
      return;
    }

    if (!state.userId) {
      setState(prev => ({ ...prev, error: "User ID not found. Please try again later." }));
      return;
    }

    setState(prev => ({ ...prev, isUploading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', state.file);
      formData.append('user_id', state.userId);
      formData.append('is_primary', 'false');

      const response = await fetchApi('/resume/upload', {
        method: 'POST',
        body: formData,
      }) as UploadResponse;

      setState(prev => ({
        ...prev,
        success: true,
        uploadedUrl: response.file_url,
        file: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to upload resume',
      }));
    } finally {
      setState(prev => ({ ...prev, isUploading: false }));
    }
  };

  // Show loading state while fetching user ID
  if (!state.userId && !state.error) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50">
            <div className="space-y-2 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX up to 10MB
              </p>
            </div>
          </div>

          {/* Selected File Display */}
          {state.file && (
            <div className="flex items-center space-x-2 text-sm">
              <Upload className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{state.file.name}</span>
              <span className="text-gray-500">
                ({Math.round(state.file.size / 1024)} KB)
              </span>
            </div>
          )}

          {/* Error Message */}
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {state.success && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <AlertDescription>
                Resume uploaded successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!state.file || state.isUploading || !state.userId}
            className="w-full"
          >
            {state.isUploading ? "Uploading..." : "Upload Resume"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
