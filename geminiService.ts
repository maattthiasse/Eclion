import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Définition directe du type pour éviter les erreurs d'import
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

// CORRECTION MAJEURE : On utilise import.meta.env pour Vite (pas process.env)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// On initialise le SDK standard
const genAI = new GoogleGenerativeAI(API_KEY);

export const parseConventionDocument = async (base64Image: string, mimeType: string): Promise<AIAnalysisResult> => {
  try {
    // Utilisation du modèle stable 1.5 Flash
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

    // Nettoyage du format base64
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
    return JSON.parse(responseText) as AIAnalysisResult;

  } catch (error) {
    console.error("Erreur Gemini:", error);
    throw error;
  }
};

export const generateTrainingObjectives = async (trainingName: string): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING }
        }
      }
    });

    const result = await model.generateContent(
      `Génère 4 objectifs pédagogiques courts pour la formation : "${trainingName}".`
    );
    
    return JSON.parse(result.response.text()) as string[];
  } catch (error) {
    console.error("Erreur Objectifs:", error);
    return ["Comprendre les bases", "Pratiquer les concepts", "Appliquer en situation", "Évaluer les acquis"];
  }
};
