"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">CareerPal</h3>
          <p className="text-gray-400">
            AI-powered career acceleration platform helping job seekers land their dream jobs
          </p>
        </div>
        <div>
          <h4 className="text-white text-base font-medium mb-4">Product</h4>
          <ul className="space-y-2">
            <li><Link href="/resume-builder" className="hover:text-white">Resume Builder</Link></li>
            <li><Link href="/cover-letter" className="hover:text-white">Cover Letter Generator</Link></li>
            <li><Link href="/interview-prep" className="hover:text-white">Interview Preparation</Link></li>
            <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-base font-medium mb-4">Company</h4>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-base font-medium mb-4">Legal</h4>
          <ul className="space-y-2">
            <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center">
        <p>© {new Date().getFullYear()} CareerPal. All rights reserved.</p>
      </div>
    </footer>
  );
} 