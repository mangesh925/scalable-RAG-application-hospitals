import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import {
  ClerkProvider,
  SignedOut,
  SignedIn,
  SignUpButton,
  SignInButton,
} from '@clerk/nextjs';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hospital RAG System - Document Analysis',
  description: 'AI-powered document analysis for healthcare professionals',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SignedOut>
            {/* Simple Hospital Landing Page */}
            <div className="min-h-screen bg-white">
              {/* Header */}
              <header className="border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">H</span>
                    </div>
                    <span className="text-black font-semibold text-xl">Hospital RAG System</span>
                  </div>
                  <div className="flex space-x-4">
                    <SignInButton mode="modal">
                      <button className="text-gray-600 hover:text-black px-4 py-2">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                </div>
              </header>

              {/* Main Content - Two Column Layout */}
              <main className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  
                  {/* Left Side - Content */}
                  <div>
                    <h1 className="text-5xl font-bold text-black mb-6">
                      AI Document Analysis for Healthcare
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                      Streamline medical document processing for hospitals and healthcare facilities. 
                      Analyze patient records, research papers, and clinical documentation instantly.
                    </p>
                    
                    <div className="space-y-6 mb-8">
                      <div className="flex items-start space-x-4">
                        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mt-1">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-black">Patient Record Analysis</h3>
                          <p className="text-gray-600">Quickly extract key information from medical histories</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mt-1">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-black">Clinical Documentation</h3>
                          <p className="text-gray-600">Process treatment plans and medical reports efficiently</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mt-1">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-black">Research Integration</h3>
                          <p className="text-gray-600">Analyze medical research and clinical studies</p>
                        </div>
                      </div>
                    </div>

                    <SignUpButton mode="modal">
                      <button className="bg-black text-white px-8 py-3 rounded font-semibold hover:bg-gray-800">
                        Start Analyzing Documents
                      </button>
                    </SignUpButton>
                  </div>

                  {/* Right Side - Hospital Features */}
                  <div className="bg-gray-50 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-black mb-6">For Healthcare Professionals</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded border">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-black">Upload Medical Documents</h3>
                        </div>
                        <p className="text-gray-600 text-sm">Upload patient files, lab results, and clinical notes</p>
                      </div>

                      <div className="bg-white p-6 rounded border">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-black">Ask Medical Questions</h3>
                        </div>
                        <p className="text-gray-600 text-sm">Query symptoms, treatments, and drug interactions</p>
                      </div>

                      <div className="bg-white p-6 rounded border">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-black">Get Instant Insights</h3>
                        </div>
                        <p className="text-gray-600 text-sm">Receive AI-powered analysis with source references</p>
                      </div>
                    </div>


                  </div>
                </div>
              </main>
              
            </div>
          </SignedOut>
          
          <SignedIn>
            {children}
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
