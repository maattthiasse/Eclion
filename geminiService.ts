import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export interface AIAnalysisResult {
  companyName: string;
  trainingName: string;
  dates: string[];
  participants: { name: string; email?: string; role?: string; }[];
}

// --- ZONE DE DIAGNOSTIC ---
const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log("🔍 DIAGNOSTIC CLÉ API :");
if (!rawKey) {
    console.error("❌ LA CLÉ EST VIDE ! Vérifiez Vercel et le redéploiement.");
} else {
    console.log("✅ LA CLÉ EST PRÉSENTE (Début : " + rawKey.substring(0, 5) + "...)");
}
// --------------------------

const API_KEY = rawKey || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export const parseConventionDocument = async (base64Image: string, mimeType: string): Promise<AIAnalysisResult> => {
  if (!API_KEY) throw new Error("API Key is missing (Bloqué par le code)");

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            companyName: { type: SchemaType.STRING },
            trainingName: { type: SchemaType.STRING },
            dates: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            participants: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: { name: { type: SchemaType.STRING }, email: { type: SchemaType.STRING }, role: { type: SchemaType.STRING } },
              },
            },
          },
          required: ["companyName", "trainingName", "dates", "participants"],
        },
      },
    });

    const cleanBase64 = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;

    const result = await model.generateContent([
      "Analyse ce document convention. Extrait Entreprise, Sujet, Dates (YYYY-MM-DD) et Participants.",
      { inlineData: { data: cleanBase64, mimeType: mimeType } },
    ]);

    return JSON.parse(result.response.text()) as AIAnalysisResult;
  } catch (error) {
    console.error("❌ Erreur Gemini:", error);
    throw error;
  }
};

export const generateTrainingObjectives = async (trainingName: string): Promise<string[]> => {
    return ["Objectif 1", "Objectif 2"];
};
