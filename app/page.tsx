"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Welcome to Resume Enhancer</h1>
      <p className="mt-4">Get your resume analyzed and optimized!</p>

      <Link
        href="/upload"
        className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
      >
        Upload Resume
      </Link>
    </div>
  );
}
