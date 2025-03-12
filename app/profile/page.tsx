"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  
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
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Profile Card */}
        <Card className="mt-4 shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarImage
                    src={session?.user?.image || "/avatar-placeholder.png"}
                    alt={session?.user?.name || "Profile"}
                  />
                  <AvatarFallback className="text-2xl">
                    {session?.user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Form Section */}
              <div className="flex-1 w-full">
                <CardTitle className="text-2xl mb-4">Personal Information</CardTitle>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  {/* Name Fields - Side by side on larger screens */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        placeholder="Enter your first name"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        placeholder="Enter your last name"
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={session?.user?.email || ""}
                        disabled
                        className="h-11 bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={profile.phoneNumber}
                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                        placeholder="Enter your phone number"
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address1">Address Line 1</Label>
                      <Input
                        id="address1"
                        value={profile.address1}
                        onChange={(e) => setProfile({ ...profile, address1: e.target.value })}
                        placeholder="Enter your street address"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                      <Input
                        id="address2"
                        value={profile.address2}
                        onChange={(e) => setProfile({ ...profile, address2: e.target.value })}
                        placeholder="Apartment, suite, etc."
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* City, County, Postcode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        placeholder="Enter your city"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="county">County</Label>
                      <Input
                        id="county"
                        value={profile.county}
                        onChange={(e) => setProfile({ ...profile, county: e.target.value })}
                        placeholder="Enter your county"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode</Label>
                      <Input
                        id="postcode"
                        value={profile.postcode}
                        onChange={(e) => setProfile({ ...profile, postcode: e.target.value })}
                        placeholder="Enter your postcode"
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={isSaving}
                      className="w-full sm:w-auto h-11"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Resume List */}
        <Card className="mt-4 shadow-sm">
          <CardHeader>
            <CardTitle>Resumes</CardTitle>
            {loading ? (
              <p>Loading resumes...</p>
            ) : (
              <>
                <div className="mb-4">
                  <Input type="file" onChange={handleFileChange} />
                  <Button 
                    onClick={handleUpload} 
                    disabled={!file || uploading}
                    className="mt-2"
                  >
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </div>
                <div className="space-y-2">
                  {resumes.map((resume) => (
                    <div key={resume.resume_id} className="flex items-center justify-between">
                      <span>{resume.file_name}</span>
                      <div className="space-x-2">
                        {!resume.is_primary && (
                          <Button 
                            onClick={() => handleSetPrimary(resume.resume_id)}
                            variant="outline"
                            size="sm"
                          >
                            Set as Primary
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDelete(resume.resume_id)}
                          variant="destructive"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
