"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Save,
} from "lucide-react";
import { fetchApi } from "@/lib/api";

interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  county: string;
}

interface Resume {
  resume_id: string;
  file_name: string;
  uploaded_at: string;
  is_primary: boolean;
  signed_url: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    county: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Memoize fetchResumes to prevent unnecessary recreations
  const fetchResumes = useCallback(async (user_id: string) => {
    try {
      setLoading(true);
      setError(null);
  
      const data = await fetchApi(`/resume/get-resumes?user_id=${user_id}`, {  //  Append `user_id` in query params
        headers: {
          Authorization: `Bearer ${session?.user?.jwt}`,
        },
      });
  
      console.log("Resumes fetched:", data);
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
  
      console.log("Fetching user ID for:", session?.user?.email);
  
      const data = await fetchApi(`/users/lookup/email?email=${encodeURIComponent(session?.user?.email || '')}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.jwt}`,
        },
      });
  
      console.log("User ID fetched:", data);
  
      if (!data.user_id) {
        throw new Error("User ID not found");
      }
  
      setUserId(data.user_id);
      await fetchResumes(data.user_id);
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
      formData.append("is_primary", "false");


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
      const response = await fetchApi(`/resume/set-primary`, {
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
    if (!userId) return;
  
    try {
      setError(null);
  
      await fetchApi(`/resume/delete`, {
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
  
      await fetchResumes(userId);
    } catch (err) {
      setError("Failed to delete resume");
      console.error("Delete error:", err);
    }
  };  

  const handleProfileUpdate = async () => {
    try {
      setIsSaving(true);
      // Add API call to save profile data
      await fetchApi('/users/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.jwt}`,
        },
        body: JSON.stringify(profile),
      });
      // Show success message
    } catch {
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
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

  return (
    <div className="container mx-auto px-4 py-8 font-josefin">
      {/* Profile Header with Form */}
      <Card className="bg-white rounded-xl shadow-sm mb-8">
        <CardHeader className="p-8">
          <div className="flex items-start gap-8">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={session?.user?.image || "/avatar-placeholder.png"}
                alt={session?.user?.name || "Profile"}
              />
              <AvatarFallback className="text-2xl">
                {session?.user?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <CardTitle className="text-3xl mb-6">Personal Information</CardTitle>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Fields */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-lg">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="text-lg py-6"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-lg">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="text-lg py-6"
                    placeholder="Enter your last name"
                  />
                </div>

                {/* Contact Fields */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-lg">Email</Label>
                  <Input
                    id="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="text-lg py-6 bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-lg">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                    className="text-lg py-6"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Address Fields */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address1" className="text-lg">Address Line 1</Label>
                  <Input
                    id="address1"
                    value={profile.address1}
                    onChange={(e) => setProfile({ ...profile, address1: e.target.value })}
                    className="text-lg py-6"
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address2" className="text-lg">Address Line 2 (Optional)</Label>
                  <Input
                    id="address2"
                    value={profile.address2}
                    onChange={(e) => setProfile({ ...profile, address2: e.target.value })}
                    className="text-lg py-6"
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-lg">City</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="text-lg py-6"
                    placeholder="Enter your city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county" className="text-lg">County</Label>
                  <Input
                    id="county"
                    value={profile.county}
                    onChange={(e) => setProfile({ ...profile, county: e.target.value })}
                    className="text-lg py-6"
                    placeholder="Enter your county"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postcode" className="text-lg">Postcode</Label>
                  <Input
                    id="postcode"
                    value={profile.postcode}
                    onChange={(e) => setProfile({ ...profile, postcode: e.target.value })}
                    className="text-lg py-6"
                    placeholder="Enter your postcode"
                  />
                </div>
              </div>

              <Button
                onClick={handleProfileUpdate}
                disabled={isSaving}
                className="mt-8 text-lg py-6 px-8"
              >
                <Save className="h-5 w-5 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg">Error</AlertTitle>
          <AlertDescription className="text-base">{error}</AlertDescription>
        </Alert>
      )}

      {/* Resume Management Section */}
      <Card className="bg-white rounded-xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-8 border-b">
          <CardTitle className="text-2xl">Resume Management</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="text-lg px-6 py-5 rounded-lg">
                <UploadCloud className="h-5 w-5 mr-2" />
                Upload Resume
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">Upload Resume</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-lg text-gray-500
                      file:mr-4 file:py-3 file:px-4
                      file:rounded-lg file:border-0
                      file:text-lg file:font-medium
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full text-lg py-6"
                >
                  {uploading ? "Uploading..." : "Upload Resume"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-8">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-lg font-medium">File Name</TableHead>
                  <TableHead className="text-lg font-medium">Uploaded</TableHead>
                  <TableHead className="text-lg font-medium">Status</TableHead>
                  <TableHead className="text-lg font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-lg text-gray-500">
                      Loading resumes...
                    </TableCell>
                  </TableRow>
                ) : resumes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-lg text-gray-500">
                      No resumes uploaded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  resumes.map((resume) => (
                    <TableRow key={resume.resume_id}>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span className="text-lg">{resume.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-lg">
                        {new Date(resume.uploaded_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {resume.is_primary ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-lg">Primary</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleSetPrimary(resume.resume_id)}
                            className="text-base"
                          >
                            Set as Primary
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => window.open(resume.signed_url, "_blank")}
                            className="p-3"
                          >
                            <Download className="h-5 w-5" />
                          </Button>
                          <Button
                            size="lg"
                            variant="destructive"
                            onClick={() => handleDelete(resume.resume_id)}
                            className="p-3"
                          >
                            <Trash className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
