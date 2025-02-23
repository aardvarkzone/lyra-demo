import OpenAI from "openai";

/**
 * OpenAI client configuration
 * Sets up the OpenAI client with API key for browser usage
 */

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

export default openai; 