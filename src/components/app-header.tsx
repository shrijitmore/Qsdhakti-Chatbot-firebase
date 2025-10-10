import { AppLogo } from "@/components/icons";

export function AppHeader() {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo className="h-8 w-8" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Qshakti Chatbot
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
