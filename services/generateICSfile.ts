import { createEvent } from "ics";
import type { EventAttributes } from "ics";

interface EventDetails {
  start: [number, number, number, number, number];
  end: [number, number, number, number, number];
  title: string;
  description: string;
  location?: string;
}

/**
 * Service for generating ICS calendar files
 * Creates downloadable calendar event files in ICS format
 */

// Creates an ICS file from event details and returns a download URL
export const createICSFile = (eventDetails: EventDetails): string => {
  try {
    console.log("Creating ICS file with details:", eventDetails);

    const event: EventAttributes = {
      start: eventDetails.start,
      end: eventDetails.end,
      title: eventDetails.title,
      description: eventDetails.description,
      location: eventDetails.location,
    };

    const { error, value } = createEvent(event);

    if (error) {
      console.error("Error creating ICS event:", error);
      throw error;
    }

    if (!value) {
      throw new Error("No value returned from createEvent");
    }

    // Create a Blob and return an object URL
    const blob = new Blob([value], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    console.log("ICS file created successfully");
    return url;
  } catch (error) {
    console.error("Error in createICSFile:", error);
    throw new Error("Failed to create ICS file");
  }
}; 