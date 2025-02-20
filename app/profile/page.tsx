"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  UploadCloud,
  Trash,
  CheckCircle,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// interface User {
//   name?: string | null;
//   email?: string | null;
//   image?: string | null;
//   jwt?: string;
// }

interface Resume {
  id: string;
  file_name: string;
  uploaded_at: string;
  is_primary: boolean;
  presigned_url: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

   // Memoize fetchResumes to prevent unnecessary recreations
   const fetchResumes = useCallback(async (user_id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/resume/get-resumes?user_id=${user_id}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.jwt}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch resumes");
      }

      const data = await response.json();
      setResumes(data.resumes);
    } catch (err) {
      setError("Failed to load resumes");
      console.error("Resume fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.jwt]);

  // Memoize fetchUserIdAndResumes to prevent unnecessary recreations
  const fetchUserIdAndResumes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userIdResponse = await fetch(
        `${API_URL}/users/lookup/email?email=${session?.user?.email}`,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.jwt}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!userIdResponse.ok) {
        throw new Error("Failed to fetch user ID");
      }

      const { user_id } = await userIdResponse.json();
      if (!user_id) {
        throw new Error("User ID not found");
      }

      setUserId(user_id);
      await fetchResumes(user_id);
    } catch (err) {
      setError("Failed to load user data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, session?.user?.jwt, fetchResumes]);

  // Update useEffect to include all dependencies
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      setError("Authentication required");
      setLoading(false);
      return;
    }
    fetchUserIdAndResumes();
  }, [session?.user?.email, status, fetchUserIdAndResumes]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", userId);

      const response = await fetch(`${API_URL}/resume/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.jwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      await fetchResumes(userId);
      setFile(null);
    } catch (err) {
      setError("Failed to upload resume");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (resumeId: string) => {
    if (!userId) return;

    try {
      setError(null);
      const response = await fetch(`${API_URL}/resume/set-primary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.jwt}`,
        },
        body: JSON.stringify({
          resume_id: resumeId,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set primary resume");
      }

      await fetchResumes(userId);
    } catch (err) {
      setError("Failed to update primary resume");
      console.error("Set primary error:", err);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!userId) {
      setError("User ID is missing");
      return;
    }
  
    try {
      setError(null);
  
      const response = await fetch(`${API_URL}/resume/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.jwt}`,
        },
        body: JSON.stringify({
          resume_id: resumeId,
          user_id: userId,
        }),
      });
  
      // Check if response is OK
      if (!response.ok) {
        let errorMsg = "Failed to delete resume";
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
        }
        throw new Error(errorMsg);
      }
  
      await fetchResumes(userId); // Refresh UI after deletion
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };  
  
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please sign in to access your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Table content with proper "key" usage
  const ResumeTableContent = () => {
    if (loading) {
      return (
        <TableRow key="loading-state">
          <TableCell colSpan={4} className="text-center py-4">
            Loading resumes...
          </TableCell>
        </TableRow>
      );
    }

    if (resumes.length === 0) {
      return (
        <TableRow key="empty-state">
          <TableCell colSpan={4} className="text-center py-4">
            No resumes uploaded yet.
          </TableCell>
        </TableRow>
      );
    }

    return (
      <>
        {resumes.map((resume, index) => (
          <TableRow key={`${resume.id}-${index}`}>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">{resume.file_name}</span>
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {new Date(resume.uploaded_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {resume.is_primary ? (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPrimary(resume.id)}
                    className="whitespace-nowrap"
                  >
                    Set Primary
                  </Button>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(resume.presigned_url, "_blank")}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(resume.id)}
                className="h-8 w-8 p-0"
                >
                <Trash className="h-4 w-4" />
                </Button>

              </div>
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={session?.user?.image || "/avatar-placeholder.png"}
              alt={session?.user?.name || "Profile"}
            />
            <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{session?.user?.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resume List / Upload Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Uploaded Resumes</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4" />
                <span>Upload Resume</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Resume</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20"
                  />
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <ResumeTableContent />
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
