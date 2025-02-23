/**
 * Type definitions for calendar events
 * Defines the structure of event details used throughout the application
 */

export interface EventDetails {
  title: string;
  description: string;
  start: [number, number, number, number, number];
  end: [number, number, number, number, number];
  location?: string;
} 