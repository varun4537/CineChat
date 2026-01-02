import { GoogleGenAI, Type } from "@google/genai";
import { Movie } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeChatLog = async (chatText: string): Promise<Movie[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze the following chat log from a movie club. 
        Extract every movie mentioned that is being recommended, discussed, or reviewed.
        
        For each movie, infer or extract the following details:
        1. Title (Correct full title)
        2. Year (Release year, estimate if unknown but try to be accurate)
        3. Director (if known or inferable)
        4. Genres (List of genres, e.g., Sci-Fi, Drama, Horror)
        5. Language (Primary language of the film)
        6. Country (Country of origin)
        7. Summary (A brief 1-sentence synopsis)
        8. Recommender (The name of the person who recommended it, if apparent in the text structure like "User: I liked X")
        9. Sentiment (The general vibe of the recommendation: positive, neutral, negative, mixed)

        Chat Log content:
        ${chatText.substring(0, 100000)} 
        // Note: Truncating to ~100k characters for safety, though Gemini can handle more. 
        // In a real prod app, we'd chunk this.
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
            },
            required: ["title", "genres", "language", "country", "summary"],
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
