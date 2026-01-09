
import { GoogleGenAI } from "@google/genai";

/**
 * Low-latency response for review drafts using Flash-Lite
 */
export const generateAIDraft = async (reviewText: string, rating: number, businessName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `
      You are the customer success manager at ${businessName}.
      Write a professional, empathetic, and concise response to a ${rating}-star review.
      Review text: "${reviewText}"
      Keep it under 50 words. 
      If rating 1-3: focus on resolution and empathy.
      If rating 4-5: focus on gratitude and welcome back.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });

    return response.text || "Thank you for your feedback.";
  } catch (error) {
    console.error("AI Generation failed", error);
    return "Thank you for your valuable feedback.";
  }
};

/**
 * Complex task: Strategic analysis using Gemini 3 Pro
 */
export const getStrategicInsights = async (reviews: any[], businessName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const reviewContext = reviews.map(r => `Rating: ${r.rating}, Comment: ${r.text}`).join('\n');
    const prompt = `Analyze these customer reviews for ${businessName} and provide a 3-point strategic improvement plan.
    Reviews:
    ${reviewContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    return response.text;
  } catch (error) {
    return "Unable to generate strategic insights at this time.";
  }
};

/**
 * Search Grounding: Get market trends using Gemini 3 Flash
 * Returns a success flag for robust UI handling.
 */
export const getMarketTrends = async (niche: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What are the top 3 customer service trends in the ${niche} industry for 2024? Focus on competitive advantages.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    return {
      success: true,
      text: response.text || "No trends found for this niche.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Market Trends Error:", error);
    return { 
      success: false, 
      text: "Our global trend monitors are currently undergoing maintenance. Please try again in a few moments.", 
      sources: [] 
    };
  }
};

/**
 * Maps Grounding: Analyze local competition using Gemini 2.5 Flash
 * Returns a success flag for robust UI handling.
 */
export const getLocalInsights = async (businessType: string, lat?: number, lng?: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const locationPrompt = lat && lng ? `near latitude ${lat}, longitude ${lng}` : "nearby";
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `What are the top rated ${businessType} businesses ${locationPrompt}? Provide a summary of their reputation and how a competitor could differentiate.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
          }
        }
      },
    });

    return {
      success: true,
      text: response.text || "No local insights available for this region.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Local Insights Error:", error);
    return { 
      success: false, 
      text: "The local mapping shard is temporarily unresponsive. We're working to restore the link.", 
      sources: [] 
    };
  }
};
