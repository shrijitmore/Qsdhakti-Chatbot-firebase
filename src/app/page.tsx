import { AppHeader } from "@/components/app-header";
import ChatInterface from "@/components/chat/chat-interface";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
