import { cn } from '@/lib/utils';
import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface BotCardProps {
  children: React.ReactNode;
  className?: string;
}

export function BotCard({ children, className }: BotCardProps) {
  return (
    <Card className={cn('max-w-full bg-card shadow-sm', className)}>
      <CardContent className="p-4 text-sm text-foreground leading-relaxed">
        {children}
      </CardContent>
    </Card>
  );
}
