"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: {
    name: string;
    avatar?: string;
    uid: string;
  };
  timestamp: Date;
}

interface ChatMessageItemProps {
  message: ChatMessage;
  currentUserUid?: string | null;
}

export function ChatMessageItem({ message, currentUserUid }: ChatMessageItemProps) {
  const isSenderCurrentUser = message.sender.uid === currentUserUid;

  return (
    <div
      className={cn(
        "flex items-start space-x-3 py-3 px-4 rounded-lg",
        isSenderCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {!isSenderCurrentUser && (
        <div className="h-8 w-8 shrink-0 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium">
            {message.sender.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div
        className={cn(
          "max-w-[70%] space-y-1",
          isSenderCurrentUser ? "order-1 items-end flex flex-col" : "order-2 items-start"
        )}
      >
        {!isSenderCurrentUser && (
          <p className="text-xs text-muted-foreground font-medium">
            {message.sender.name}
          </p>
        )}
        <div
          className={cn(
            "p-3 rounded-xl shadow-md",
            isSenderCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-card text-card-foreground border"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>
        <p className="text-xs text-muted-foreground/80">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
      {isSenderCurrentUser && (
        <div className="h-8 w-8 shrink-0 ml-3 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium">
            {message.sender.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}