import { Bot, User } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface ChatAvatarProps {
  role: 'user' | 'bot';
}

export function ChatAvatar({ role }: ChatAvatarProps) {
  return (
    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
      <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
        {role === 'bot' ? (
          <Bot className="h-5 w-5 text-primary" />
        ) : (
          <User className="h-5 w-5 text-primary" />
        )}
      </div>
    </Avatar>
  );
}
