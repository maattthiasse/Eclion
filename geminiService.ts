import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Définition du type (on le laisse ici pour éviter les erreurs)
export interface AIAnalysisResult {
  companyName: string;
  trainingName: string;
  dates: string[];
  participants: {
    name: string;
    email?: string;
    role?: string;
  }[];
}

// --- ZONE DE DIAGNOSTIC (DÉBUT) ---
console.log("--- TEST CLÉ API ---");
// Cette ligne va afficher dans la console si la clé est vue ou non
const envKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log("État de la clé :", envKey ? "✅ PRÉSENTE (Commence par " + envKey.substring(0, 5) + "...)" : "❌ ABSENTE / VIDE");
// --- ZONE DE DIAGNOSTIC (FIN) ---


const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialisation de Gemini
const genAI = new GoogleGenerativeAI(API_KEY);

export const parseConventionDocument = async (base64Image: string, mimeType: string): Promise<AIAnalysisResult> => {
  // Petite sécurité supplémentaire
  if (!API_KEY) {
    console.error("⛔ ERREUR BLOQUANTE : La clé API est vide. Le code ne peut pas contacter Google.");
    throw new Error("API Key is missing in the code");
  }

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
            dates: { 
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            },
            participants: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  email: { type: SchemaType.STRING },
                  role: { type: SchemaType.STRING },
                },
              },
            },
          },
          required: ["companyName", "trainingName", "dates", "participants"],
        },
      },
    });

    const cleanBase64 = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const result = await model.generateContent([
      "Analyse ce document. Extrait le nom de l'entreprise (via SIRET), le sujet, les dates (YYYY-MM-DD), et les participants.",
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();
    console.log("✅ Réponse Gemini reçue :", responseText); // Log de succès
    return JSON.parse(responseText) as AIAnalysisResult;

  } catch (error) {
    console.error("❌ Erreur Gemini:", error);
    throw error;
  }
};

export const generateTrainingObjectives = async (trainingName: string): Promise<string[]> => {
  // ... (vous pouvez laisser le reste de cette fonction tel quel ou la supprimer si inutilisée)
  return ["Objectif 1", "Objectif 2"]; 
};
