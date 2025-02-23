"use client";
import { useState, useEffect } from "react";
import { Button, Text } from "@tremor/react";
import { createICSFile } from "../services/generateICSfile";
import { generateEventDetails } from "../services/generateEventDetails";
import EventHistory from "./EventHistory";
import { EventConfirmationModal } from "./EventConfirmationModal";
import { TranscriptionTypewriter } from "./TranscriptionTypewriter";
import { v4 as uuidv4 } from "uuid";
import { showSuccessToast, showInfoToast } from "./ui/Toast";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { EventDetails } from "../types/event";

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [key: number]: {
      isFinal: boolean;
      0: {
        transcript: string;
      };
    };
  };
}

interface HistoryItem {
  id: string;
  transcription: string;
  eventDetails: EventDetails;
  timestamp: number;
  downloadUrl: string;
}

/**
 * Main component for voice-to-calendar functionality
 * Handles voice recording, transcription, and event creation
 */

const VoiceToCalendar = () => {
  const [transcription, setTranscription] = useState<string>("");
  const [recording, setRecording] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [finalTranscript, setFinalTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [pendingEventDetails, setPendingEventDetails] =
    useState<EventDetails | null>(null);
  const [accumulatedTranscript, setAccumulatedTranscript] =
    useState<string>("");

  const saveHistory = (newHistory: HistoryItem[]): void => {
    localStorage.setItem("eventHistory", JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const handleConfirmEvent = async (
    updatedDetails: EventDetails
  ): Promise<void> => {
    try {
      const downloadUrl = createICSFile(updatedDetails);

      const historyItem: HistoryItem = {
        id: uuidv4(),
        transcription,
        eventDetails: updatedDetails,
        timestamp: Date.now(),
        downloadUrl,
      };

      const newHistory = [historyItem, ...history];
      saveHistory(newHistory);
      setShowConfirmation(false);
      showSuccessToast("Event created successfully!");
    } catch (error) {
      console.error("Error creating ICS file:", error);
      setError("Error creating calendar file. Please try again.");
    }
  };

  const removeHistoryItem = (id: string): void => {
    const newHistory = history.filter((item) => item.id !== id);
    saveHistory(newHistory);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("eventHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentInterimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setAccumulatedTranscript((prev) => prev + " " + transcript);
              setFinalTranscript((prev) => prev + " " + transcript);
            } else {
              currentInterimTranscript += transcript;
            }
          }
          setInterimTranscript(currentInterimTranscript);
          setTranscription(
            accumulatedTranscript + " " + currentInterimTranscript
          );
        };

        recognition.onend = () => {
          if (recording) {
            recognition.start();
          }
        };

        setRecognition(recognition);
      }
    }
  }, [recording, accumulatedTranscript]);

  const startRecording = async (): Promise<void> => {
    try {
      if (recognition) {
        setFinalTranscript("");
        setInterimTranscript("");
        setTranscription("");
        recognition.start();
        setRecording(true);
        setError("");
        showInfoToast("Recording in progress...");
      } else {
        throw new Error("Speech recognition not supported");
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      setError("Error starting recording. Please try again.");
    }
  };

  const stopRecording = async (): Promise<void> => {
    if (recognition) {
      recognition.stop();
      setRecording(false);
      toast.dismiss();
      setTranscription(finalTranscript + " " + interimTranscript);
      setInterimTranscript("");
    }
  };

  const handleTranscriptionChange = (newText: string): void => {
    setTranscription(newText);
    setAccumulatedTranscript(newText);
    setFinalTranscript(newText);
  };

  const resetTranscription = (): void => {
    setTranscription("");
    setAccumulatedTranscript("");
    setFinalTranscript("");
    setInterimTranscript("");
    setError("");
  };

  const clearHistory = (): void => {
    saveHistory([]);
  };

  const handleCreateEvent = async (): Promise<void> => {
    try {
      setIsProcessing(true);
      setError("");
      console.log("Creating event from text:", transcription);

      const eventDetails = await generateEventDetails(transcription);
      console.log("Event details generated:", eventDetails);

      setPendingEventDetails(eventDetails);
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Error creating event. Please check your input and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-xl p-6 border border-violet-100/50 dark:border-violet-700/30"
      >
        <h2 className="text-lg font-semibold text-violet-900 dark:text-violet-50 mb-3">
          How to Create an Event
        </h2>
        <div className="space-y-2 text-sm text-violet-700 dark:text-violet-100">
          <p>Include the following in your description:</p>
          <motion.ul
            className="list-disc list-inside space-y-1 ml-2"
            variants={{
              show: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {[
              "Event title or purpose",
              'Date and time (e.g., "tomorrow at 2pm", "next Monday at 3pm")',
              "Duration (if not specified, defaults to 30 minutes)",
              "Location (optional)",
              "Any additional details or description",
            ].map((item, index) => (
              <motion.li
                key={index}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 },
                }}
                className="text-violet-600 dark:text-violet-200"
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex gap-4">
          <Button
            onClick={recording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`flex-1 transition-all duration-200 transform hover:scale-[1.02] ${
              recording
                ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 border-0"
                : "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 border-0"
            } shadow-lg hover:shadow-xl group`}
          >
            <div className="flex items-center justify-center gap-2 transition-transform duration-200 group-hover:translate-y-[1px]">
              {recording ? (
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white/60 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              ) : (
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              )}
              {recording ? "Stop Recording" : "Start Recording"}
            </div>
          </Button>

          {transcription && (
            <Button
              onClick={resetTranscription}
              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 border-0 shadow-lg hover:shadow-xl group"
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </motion.svg>
            </Button>
          )}
        </div>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-600 dark:text-gray-200"
          >
            <span className="animate-pulse">Processing...</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 rounded-lg"
          >
            <Text className="text-red-700 dark:text-red-200">{error}</Text>
          </motion.div>
        )}

        <TranscriptionTypewriter
          text={transcription}
          className="w-full transform transition-all duration-300 hover:shadow-lg"
          onTextChange={handleTranscriptionChange}
          isRecording={recording}
        />

        <Button
          onClick={handleCreateEvent}
          disabled={!transcription || isProcessing || recording}
          className={`w-full transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl group border-0 ${
            !transcription || isProcessing || recording
              ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75"
              : "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
          }`}
        >
          <span className="transition-transform duration-200 group-hover:translate-y-[1px]">
            {isProcessing ? "Creating Event..." : "Create Event"}
          </span>
        </Button>
      </motion.div>

      <EventHistory
        history={history}
        onClearHistory={clearHistory}
        onRemoveItem={removeHistoryItem}
      />

      {showConfirmation && pendingEventDetails && (
        <EventConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          eventDetails={pendingEventDetails}
          onConfirm={handleConfirmEvent}
        />
      )}
    </div>
  );
};

export default VoiceToCalendar;
