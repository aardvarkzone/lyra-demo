"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, Text, Button } from "@tremor/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { IoChevronDown } from "react-icons/io5";
import { useState } from "react";

interface HistoryItem {
  id: string;
  transcription: string;
  eventDetails: {
    title: string;
    description: string;
    start: [number, number, number, number, number];
    end: [number, number, number, number, number];
    location?: string;
  };
  timestamp: number;
  downloadUrl: string;
}

interface EventHistoryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "medium",
  }).format(date);
}

/**
 * Component for displaying and managing event history
 * Shows created events with options to download, share, or delete
 */

// Individual history item component
function HistoryItem({
  item,
  onRemoveItem,
}: {
  item: HistoryItem;
  onRemoveItem: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmailShare = () => {
    const subject = encodeURIComponent(item.eventDetails.title);
    const body = encodeURIComponent(`
Event Details:
${item.eventDetails.title}
${item.eventDetails.description}
Time: ${item.eventDetails.start.join("/")} - ${item.eventDetails.end.join("/")}
Location: ${item.eventDetails.location || "Not specified"}
    `);

    // Create mailto link with ICS file as data URL
    const mailtoLink = `mailto:?subject=${subject}&body=${body}&attach=${item.downloadUrl}`;
    window.location.href = mailtoLink;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Text className="font-medium text-gray-900 dark:text-gray-50">
              {item.eventDetails.title}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-300">
              Created on {formatDate(new Date(item.timestamp))}
            </Text>
          </div>
          <div className="flex space-x-2">
            <Button
              size="xs"
              variant="secondary"
              onClick={() => onRemoveItem(item.id)}
              icon={TrashIcon}
              className="hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            />
            <Button
              size="xs"
              variant="secondary"
              onClick={() => window.open(item.downloadUrl, "_blank")}
            >
              Download ICS
            </Button>
            <Button
              size="xs"
              variant="secondary"
              onClick={handleEmailShare}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </Button>
          </div>
        </div>

        <motion.div className="mt-4 space-y-2">
          <details
            open={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            className="text-sm"
          >
            <summary className="cursor-pointer text-blue-500 hover:text-blue-600 flex items-center gap-1">
              View Details
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <IoChevronDown />
              </motion.span>
            </summary>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 space-y-2 pl-4"
            >
              <Text className="text-gray-700 dark:text-gray-200">
                Original Text: {item.transcription}
              </Text>
              <Text>Description: {item.eventDetails.description}</Text>
              <Text>
                Location: {item.eventDetails.location || "Not specified"}
              </Text>
              <Text>
                Time: {item.eventDetails.start.join("/")} -{" "}
                {item.eventDetails.end.join("/")}
              </Text>
            </motion.div>
          </details>
        </motion.div>
      </Card>
    </motion.div>
  );
}

export default function EventHistory({
  history,
  onClearHistory,
  onRemoveItem,
}: EventHistoryProps) {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-50">
          Event History
        </Text>
        {history.length > 0 && (
          <Button variant="secondary" color="red" onClick={onClearHistory}>
            Clear All
          </Button>
        )}
      </motion.div>

      {history.length === 0 ? (
        <Text className="text-gray-500 dark:text-gray-300 italic">
          No events created yet
        </Text>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {history.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onRemoveItem={onRemoveItem}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
