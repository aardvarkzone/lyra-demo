/**
 * API route for handling audio transcription
 * Uses OpenAI's Whisper API to convert audio to text
 */

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Uploadable } from "openai/uploads.mjs";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!audio) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const response = await openai.audio.transcriptions.create({
      file: audio as Uploadable,
      model: "whisper-1",
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Error transcribing audio" },
      { status: 500 }
    );
  }
}
