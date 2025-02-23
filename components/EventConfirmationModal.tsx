"use client";

import { Dialog } from "@headlessui/react";
import {
  Card,
  Text,
  Button,
  TextInput as TremorTextInput,
  Textarea,
} from "@tremor/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EventDetails } from "../types/event";

interface EventConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: EventDetails;
  onConfirm: (updatedDetails: EventDetails) => Promise<void>;
}

// Create a custom TextInput component that extends the Tremor one
const TextInput = TremorTextInput as React.ComponentType<
  React.ComponentProps<"input">
>;

/**
 * Modal component for confirming and editing event details
 * Allows users to review and modify event information before creation
 */

// Custom styling for date/time inputs
const dateTimeInputStyles = `
  text-gray-900 dark:text-gray-50 
  bg-white dark:bg-gray-800 
  border-gray-200 dark:border-gray-700
  focus:border-violet-500 dark:focus:border-violet-400
  focus:ring-2 focus:ring-violet-500/20
  rounded-tremor-default
  transition-colors duration-200
  [color-scheme:light_dark]
  hover:border-violet-400
`;

// Formats date array to datetime-local input format
const formatDateTime = (dateArr: number[] | undefined) => {
  if (!dateArr || dateArr.length < 5) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}T${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }
  const [year, month, day, hour, minute] = dateArr;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const parseDateTimeToArray = (
  dateTimeString: string
): [number, number, number, number, number] => {
  const date = new Date(dateTimeString);
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ] as [number, number, number, number, number];
};

export function EventConfirmationModal({
  isOpen,
  onClose,
  eventDetails,
  onConfirm,
}: EventConfirmationModalProps) {
  const [details, setDetails] = useState(eventDetails);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30"
            aria-hidden="true"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card className="p-6">
                  <Dialog.Title className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-50">
                    Confirm Event Details
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div>
                      <Text className="mb-1 text-gray-700 dark:text-gray-200">
                        Event Title
                      </Text>
                      <TextInput
                        value={details.title}
                        onChange={(e) =>
                          setDetails({ ...details, title: e.target.value })
                        }
                        className="text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      />
                    </div>

                    <div>
                      <Text className="mb-1 text-gray-700 dark:text-gray-200">
                        Description
                      </Text>
                      <Textarea
                        value={details.description}
                        onChange={(e) =>
                          setDetails({
                            ...details,
                            description: e.target.value,
                          })
                        }
                        className="text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text className="mb-1 text-gray-700 dark:text-gray-200">
                          Start Time
                        </Text>
                        <TextInput
                          type="datetime-local"
                          value={formatDateTime(details.start)}
                          onChange={(e) => {
                            setDetails({
                              ...details,
                              start: parseDateTimeToArray(e.target.value),
                            });
                          }}
                          className={`${dateTimeInputStyles} cursor-pointer`}
                        />
                      </div>

                      <div>
                        <Text className="mb-1 text-gray-700 dark:text-gray-200">
                          End Time
                        </Text>
                        <TextInput
                          type="datetime-local"
                          value={formatDateTime(details.end)}
                          onChange={(e) => {
                            setDetails({
                              ...details,
                              end: parseDateTimeToArray(e.target.value),
                            });
                          }}
                          className={`${dateTimeInputStyles} cursor-pointer`}
                        />
                      </div>
                    </div>

                    <div>
                      <Text className="mb-1 text-gray-700 dark:text-gray-200">
                        Location (optional)
                      </Text>
                      <TextInput
                        value={details.location || ""}
                        onChange={(e) =>
                          setDetails({ ...details, location: e.target.value })
                        }
                        className="text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      variant="secondary"
                      onClick={onClose}
                      className="border-0 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 
                      dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 
                      text-gray-700 dark:text-gray-300 group transform transition-all duration-200 hover:scale-[1.02]"
                    >
                      <span className="transition-transform duration-200 group-hover:translate-y-[1px]">
                        Cancel
                      </span>
                    </Button>
                    <Button
                      onClick={() => onConfirm(details)}
                      className="border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 
                      hover:from-violet-600 hover:to-fuchsia-600 transform transition-all duration-200 
                      hover:scale-[1.02] shadow-lg hover:shadow-xl group text-white"
                    >
                      <span className="transition-transform duration-200 group-hover:translate-y-[1px]">
                        Create Event
                      </span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
