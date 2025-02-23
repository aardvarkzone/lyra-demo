"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * Typewriter component for displaying transcribed text
 * Features animated typing effect and editable textarea
 */

interface TranscriptionTypewriterProps {
  text: string;
  className?: string;
  cursorClassName?: string;
  onTextChange?: (text: string) => void;
  isRecording?: boolean;
}

export const TranscriptionTypewriter = ({
  text,
  className,
  cursorClassName,
  onTextChange,
  isRecording = false,
}: TranscriptionTypewriterProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Handles the typewriter animation effect
   */
  useEffect(() => {
    if (!isRecording) {
      setDisplayText(text);
      return;
    }

    if (text === displayText) return;

    setIsTyping(true);
    const words = text.split(" ");

    const typeNextWord = () => {
      setDisplayText((prev) => {
        const nextWordCount = prev.split(" ").length;
        if (nextWordCount < words.length) {
          return words.slice(0, nextWordCount + 1).join(" ");
        }
        setIsTyping(false);
        return prev;
      });
    };

    const timer = setInterval(typeNextWord, 50);
    return () => clearInterval(timer);
  }, [text, isRecording, displayText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setDisplayText(newText);
    onTextChange?.(newText);
  };

  return (
    <div className={cn("relative", className)}>
      <textarea
        value={displayText}
        onChange={handleTextChange}
        disabled={isRecording}
        placeholder="Type or speak your event details here..."
        className="w-full min-h-[150px] p-4 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md transition-shadow duration-200"
      />
      {isTyping && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className={cn(
            "absolute bottom-4 right-4 inline-block w-[2px] h-4 bg-violet-500",
            cursorClassName
          )}
        />
      )}
    </div>
  );
};
