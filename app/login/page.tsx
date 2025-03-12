"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";

export default function AuthPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="flex min-h-screen">
      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-center items-center p-8 text-white">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-6">Optimize Your Resume with AI</h1>
          <p className="text-xl mb-8">Get personalized resume feedback and improvements powered by advanced AI technology.</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-500 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
              <p>Smart feedback for your resume in seconds</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">ATS Optimization</h3>
              <p>Make your resume stand out to recruiters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8 bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="flex justify-center mb-6">
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Welcome to CareerPal
            </CardTitle>
            <CardDescription className="text-base">
              Join thousands of professionals who trust CareerPal to optimize their resumes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={() => signIn("google", {
                callbackUrl: `${window.location.origin}/dashboard`,
                redirect: false
              })}
            >
              <FcGoogle className="h-5 w-5 mr-3" />
              Continue with Google
            </Button>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-500">
            By continuing, you agree to CareerPal&apos;s Terms of Service and Privacy Policy
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}