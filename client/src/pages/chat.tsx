import { useState } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatArea } from "@/components/chat/chat-area";

export default function Chat() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [provider, setProvider] = useState<string>("openai");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        apiKey={apiKey}
        setApiKey={setApiKey}
        provider={provider}
        setProvider={setProvider}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <ChatArea
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        apiKey={apiKey}
        provider={provider}
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  );
}
