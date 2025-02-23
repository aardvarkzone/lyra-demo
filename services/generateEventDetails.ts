import openai from "../utils/openAIClient";

interface EventDetails {
  title: string;
  description: string;
  start: [number, number, number, number, number];
  end: [number, number, number, number, number];
  location?: string;
}

/**
 * Service for generating structured event details from text
 * Uses OpenAI's GPT-3.5 to parse natural language into event data
 */

function parseRelativeDate(text: string): Date {
  const now = new Date();
  if (text.includes("tomorrow")) {
    now.setDate(now.getDate() + 1);
  }
  // Add more relative date parsing as needed
  return now;
}

// Main function to generate event details using OpenAI
export async function generateEventDetails(text: string): Promise<EventDetails> {
  try {
    console.log("Generating event details from:", text);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a calendar event parser. Extract event details from text and return JSON.
          The current date and time is: ${new Date().toISOString()}

          Guidelines:
          1. Handle relative dates (tomorrow, next week, etc.)
          2. Default duration to 30 minutes if not specified
          3. Extract location if mentioned
          4. Create clear, concise title
          5. Include relevant details in description
          6. Use 24-hour format for time
          7. Handle time zones appropriately

          Return JSON in this format:
          {
            "title": "Brief, clear event title",
            "description": "Detailed description including all relevant information",
            "start": [year, month, day, hour, minute],
            "end": [year, month, day, hour, minute],
            "location": "Location if specified" (optional)
          }`
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}") as EventDetails;
    console.log("Generated event details:", result);

    // Validate and adjust dates if needed
    const baseDate = parseRelativeDate(text.toLowerCase());
    if (text.toLowerCase().includes("tomorrow")) {
      result.start[0] = baseDate.getFullYear();
      result.start[1] = baseDate.getMonth() + 1;
      result.start[2] = baseDate.getDate();

      result.end[0] = baseDate.getFullYear();
      result.end[1] = baseDate.getMonth() + 1;
      result.end[2] = baseDate.getDate();
    }

    return result;
  } catch (error) {
    console.error("Error generating event details:", error);
    throw new Error("Failed to generate event details");
  }
} 