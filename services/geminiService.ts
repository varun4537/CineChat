import { GoogleGenAI, Type } from "@google/genai";
import { Movie } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeChatLog = async (chatText: string): Promise<Movie[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze the following chat log from a movie club. 
        Extract unique movies that are being recommended, discussed, or reviewed.
        
        If a movie is mentioned multiple times across the chat, consolidate it into a single entry but increase the 'mentionCount'.
        
        For each movie, infer or extract the following details:
        1. Title (Correct full title)
        2. Year (Release year, estimate if unknown but try to be accurate)
        3. Director (if known or inferable)
        4. Genres (List of genres, e.g., Sci-Fi, Drama, Horror)
        5. Language (Primary language of the film)
        6. Country (Country of origin)
        7. Summary (A brief 1-sentence synopsis)
        8. Recommender (The name of the person who FIRST recommended it or is most associated with it. If unclear, leave null)
        9. Sentiment (The general vibe of the discussion: positive, neutral, negative, mixed)
        10. Mention Count (How many times it was discussed or mentioned in the log. Minimum 1.)

        Chat Log content:
        ${chatText.substring(0, 100000)} 
        // Note: Truncating to ~100k characters for safety.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              year: { type: Type.INTEGER },
              director: { type: Type.STRING },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } },
              language: { type: Type.STRING },
              country: { type: Type.STRING },
              summary: { type: Type.STRING },
              recommender: { type: Type.STRING, nullable: true },
              sentiment: { 
                type: Type.STRING, 
                enum: ['positive', 'neutral', 'negative', 'mixed'] 
              },
              mentionCount: { type: Type.INTEGER, description: "Number of times mentioned/discussed" }
            },
            required: ["title", "genres", "language", "country", "summary", "mentionCount"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as Movie[];
    }
    return [];
  } catch (error) {
    console.error("Error analyzing chat log:", error);
    throw error;
  }
};