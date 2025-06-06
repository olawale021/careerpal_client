"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";


import { useRouter } from "next/navigation";
// import { Card, CardContent } from "@/components/ui/card";
import LandingHeader from "@/components/ui/landing-header";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Add console log to help debug
  console.log("Auth status:", status, "Session:", session);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Use the new header component */}
      <LandingHeader />

      {/* Hero Section with gradient background that fades to white */}
      <section className="relative bg-gradient-to-b from-white via-blue-50 to-white pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Magically simplify<br />
              your job search
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Automated resume building, effortless interview prep, real-time insights.
              Set up in 10 mins. Back to job hunting by 10:11am.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
                onClick={() => status === 'authenticated' ? router.push('/dashboard') : router.push('/login')}
              >
                {status === 'authenticated' ? 'Go to Dashboard' : 'Start free trial'}
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 text-lg px-8 py-6">
                Pricing <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">For job seekers at all career levels</p>
          </div>

          {/* Dashboard Preview Image */}
          <div className="rounded-lg shadow-xl overflow-hidden border border-gray-200 bg-white">
            <Image 
              src="/search-job.png"
              alt="CareerPal Dashboard"
              width={1200}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>
        
        {/* Decorative gradient overlay to ensure smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Section with Images - Redesigned for larger images */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides all the tools you need to stand out in the job market
            </p>
          </div>

          {/* Feature 1 - Resume Builder with gradient */}
          <div className="relative bg-gradient-to-b from-white via-blue-50 to-white py-12 mb-4">
            {/* Feature tag and title - centered */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-3">
                Resume Builder
              </div>
              <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                Create ATS-optimized resumes in minutes
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                Our AI analyzes job descriptions and tailors your resume to highlight the most relevant skills and experiences.
              </p>
            </div>
            
            {/* Large image - full width */}
            <div className="rounded-lg shadow-xl overflow-hidden border border-gray-200 mb-8 max-w-5xl mx-auto">
              <Image
                src="/resume.png"
                alt="Resume Builder"
                width={2000}
                height={1200}
                className="w-full h-auto"
              />
            </div>
            
            {/* Features list - centered in 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-medium mb-2">Keyword optimization</h4>
                <p className="text-gray-600">Get past ATS systems with optimized keywords</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-medium mb-2">Professional templates</h4>
                <p className="text-gray-600">Choose from templates for any industry</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-medium mb-2">AI content suggestions</h4>
                <p className="text-gray-600">Get smart suggestions to improve your resume</p>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Link href="/resume-builder" className="text-blue-600 font-medium flex items-center justify-center">
                Build Your Resume <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Client Review Section */}
            <div className="mt-4 max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-100 p-2">
                  <Image
                    src="/avatars/user1.jpg"
                    alt="Sarah Johnson"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                    <span className="text-sm text-gray-500">Software Engineer</span>
                  </div>
                  <p className="text-gray-600 italic">
                    &ldquo;The AI-powered resume builder helped me tailor my resume perfectly for tech roles. 
                    I landed interviews with top companies within weeks!&rdquo;
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
          </div>

          {/* Feature 2 - Interview Prep with gradient */}
          <div className="relative bg-gradient-to-b from-white via-blue-50 to-white py-12 mb-4">
            {/* Feature tag and title - centered */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 mb-3">
                Interview Preparation
              </div>
              <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                Practice with AI-powered interview simulations
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                Get ready for your interviews with personalized questions based on your target role and receive instant feedback.
              </p>
            </div>
            
            {/* Large image - full width */}
            <div className="rounded-lg shadow-xl overflow-hidden border border-gray-200 mb-4 max-w-5xl mx-auto">
              <Image
                src="/interview-prep.png"
                alt="Interview Preparation"
                width={2000}
                height={1200}
                className="w-full h-auto"
              />
            </div>
            
            {/* Features list - centered in 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-medium mb-2">Role-specific questions</h4>
                <p className="text-gray-600">Practice with questions tailored to your target role</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-medium mb-2">Real-time feedback</h4>
                <p className="text-gray-600">Get instant feedback on your interview answers</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-medium mb-2">Behavioral & technical</h4>
                <p className="text-gray-600">Practice both behavioral and technical interviews</p>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <Link href="/interview-prep" className="text-green-600 font-medium flex items-center justify-center">
                Prepare for Interviews <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Client Review Section */}
            <div className="mt-4 max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-green-100 p-2">
                  <Image
                    src="/avatars/user2.jpg"
                    alt="Michael Chen"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                    <span className="text-sm text-gray-500">Product Manager</span>
                  </div>
                  <p className="text-gray-600 italic">
                    &ldquo;The interview preparation feature is a game-changer. The AI simulations helped me 
                    practice effectively and build confidence. Highly recommended!&rdquo;
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
          </div>

          {/* Feature 3 - Cover Letter with gradient */}
          <div className="relative bg-gradient-to-b from-white via-blue-50 to-white py-12">
            {/* Feature tag and title - centered */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 mb-3">
                Cover Letter Generator
              </div>
              <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                Generate personalized cover letters in seconds
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                Create compelling cover letters that highlight your relevant skills and experience for each job application.
              </p>
            </div>
            
            {/* Large image - full width */}
            <div className="rounded-lg shadow-xl overflow-hidden border border-gray-200 mb-4 max-w-5xl mx-auto">
              <Image 
                src="/cover-letter.png"
                alt="Cover Letter Generator"
                width={2000}
                height={1200}
                className="w-full h-auto"
              />
            </div>
            
            {/* Features list - centered in 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-medium mb-2">Customized for each job</h4>
                <p className="text-gray-600">Tailor your cover letter for each application</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-medium mb-2">Professional tone</h4>
                <p className="text-gray-600">Perfect formatting and professional language</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-medium mb-2">Highlight achievements</h4>
                <p className="text-gray-600">Showcase your most relevant accomplishments</p>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Link href="/cover-letter" className="text-purple-600 font-medium flex items-center justify-center">
                Create Cover Letter <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Client Review Section */}
            <div className="mt-4 max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-purple-100 p-2">
                  <Image
                    src="/avatars/user3.jpg"
                    alt="Emily Rodriguez"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Emily Rodriguez</h4>
                    <span className="text-sm text-gray-500">Marketing Director</span>
                  </div>
                  <p className="text-gray-600 italic">
                    &ldquo;Creating customized cover letters used to take hours. With CareerPal, I can generate
                    compelling cover letters in minutes. It&apos;s been invaluable in my job search!&rdquo;
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-lg font-medium text-gray-600 mb-8">
            Trusted by fast-growing job seekers
          </h2>
          {/* <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity">
                <Image 
                  src={`https://placehold.co/120x32/e2e8f0/64748b?text=Logo+${num}`}
                  alt="Company logo" 
                  width={120} 
                  height={32} 
                />
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Free Your Time Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Free your time to <span className="text-blue-600">build</span> your career
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Your time as a job seeker is extremely valuable, don&apos;t waste it on formatting resumes or writing cover letters.
            Set job search on autopilot and replace manual work with AI assistance.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
            onClick={() => status === 'authenticated' ? router.push('/dashboard') : router.push('/login')}
          >
            {status === 'authenticated' ? 'Go to Dashboard' : 'Start free trial'}
          </Button>
        </div>
      </section>
    </div>
  );
}
