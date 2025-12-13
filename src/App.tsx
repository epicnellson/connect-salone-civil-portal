import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ChatInterface } from "./components/ChatInterface";
import { ServiceDirectory } from "./components/ServiceDirectory";
import { RepresentativeFinder } from "./components/RepresentativeFinder";
import { useState } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'services' | 'representatives'>('chat');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SL</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Connect Salone</h1>
                <p className="text-xs text-gray-600">Sierra Leone Government Services</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Content activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
      
      <Toaster />
    </div>
  );
}

function Content({ activeTab, setActiveTab }: { 
  activeTab: 'chat' | 'services' | 'representatives';
  setActiveTab: (tab: 'chat' | 'services' | 'representatives') => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Unauthenticated>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Connect Salone
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Your unified portal for Sierra Leone government services
          </p>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {loggedInUser?.email?.split('@')[0] || 'Citizen'}!
          </h2>
          <p className="text-gray-600">
            How can we help you with government services today?
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🤖 AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Services
          </button>
          <button
            onClick={() => setActiveTab('representatives')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'representatives'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Officials
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'services' && <ServiceDirectory />}
        {activeTab === 'representatives' && <RepresentativeFinder />}
      </Authenticated>
    </div>
  );
}
