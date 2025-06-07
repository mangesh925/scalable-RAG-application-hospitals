'use client';

import { UserButton, useUser } from "@clerk/nextjs";
import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Hospital RAG System...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-black font-semibold text-xl">Hospital RAG System</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">Dr. {user?.firstName}</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 flex flex-col mt-16">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-black mb-2">Medical Document Analysis</h2>
          <p className="text-gray-600 text-sm">Upload patient records, clinical notes, or research papers</p>
        </div>
        <FileUploadComponent />
        
        {/* Quick Actions for Healthcare */}
       
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col mt-16">
        <ChatComponent />
      </div>
    </div>
  );
}
