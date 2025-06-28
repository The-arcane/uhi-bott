"use client";

import { Avatar } from "@/components/ui/avatar";
import { BotIcon } from "@/components/icons";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface Message {
  id: string;
  role: "user" | "bot";
  content: React.ReactNode;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role === "bot";
  const isTyping = message.content === "...";

  return (
    <div
      className={cn(
        "flex items-start gap-3 data-[state=bot]:animate-in data-[state=bot]:fade-in data-[state=bot]:duration-500",
        isBot ? "justify-start" : "justify-end"
      )}
      data-state={isBot ? "bot" : "user"}
    >
      {isBot && (
        <Avatar className="h-9 w-9 shrink-0">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
            <BotIcon className="h-5 w-5" />
          </div>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-md rounded-xl px-4 py-3 text-sm md:text-base",
          isBot
            ? "bg-card text-card-foreground shadow-sm border"
            : "bg-primary text-primary-foreground",
          !isBot && "whitespace-pre-wrap"
        )}
      >
        {isTyping ? (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-current delay-0" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-current delay-150" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-current delay-300" />
          </div>
        ) : isBot ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent hover:underline"
                />
              ),
              p: ({ node, ...props }) => (
                <p {...props} className="mb-2 last:mb-0" />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="list-disc list-inside space-y-1" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="list-decimal list-inside space-y-1" />
              ),
            }}
          >
            {String(message.content)}
          </ReactMarkdown>
        ) : (
          message.content
        )}
      </div>
      {!isBot && (
        <Avatar className="h-9 w-9 shrink-0">
           <div className="flex h-full w-full items-center justify-center rounded-full bg-accent text-accent-foreground">
            <User className="h-5 w-5" />
          </div>
        </Avatar>
      )}
    </div>
  );
}
