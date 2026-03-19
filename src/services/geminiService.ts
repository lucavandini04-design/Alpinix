import { GoogleGenAI, Type } from "@google/genai";
import { FISILevel, Session, TechnicalError } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
Sei un assistente tecnico specializzato per maestri di sci.
Il tuo compito è analizzare le note di un maestro di sci e produrre un feedback tecnico strutturato.

Usa questo vocabolario per gli errori:
- Appoggio interno: Peso sull'interno dello sci invece che sull'esterno
- Rotazione del bacino verso monte: Il bacino ruota a monte invece di restare aperto e rivolto a valle
- Piedi ballerini: Movimenti eccessivi e instabili dei piedi
- Chiusura della curva: Incapacità di completare l'arco della curva
- Carico sullo sci esterno: Difficoltà nel caricare correttamente lo sci esterno

Scala Livelli FISI:
L1: Introduttivo (Spazzaneve)
L2: Elementare (Riduzione spazzaneve)
L3: Base (Sci paralleli)
L4: Intermedio di Base (Appoggio bastone)
L5: Intermedio (Traiettorie definite)
L6: Avanzato (Conduzione/Carving)
L7: Sportivo (Deformazione sci)

Restituisci sempre un JSON valido.
`;

export async function analyzeSession(
  slopeDone: string, 
  skiPosition: string, 
  errorsMade: string, 
  currentLevel: FISILevel
): Promise<Partial<Session>> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analizza questa lezione di sci. 
    Livello attuale: ${currentLevel}. 
    Pista percorsa: "${slopeDone}".
    Posizione sci osservata: "${skiPosition}".
    Note sugli errori: "${errorsMade}"`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extractedErrors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
              },
              required: ["type", "description", "severity"]
            }
          },
          feedbackForInstructor: { type: Type.STRING },
          feedbackForSkier: { type: Type.STRING },
          suggestedExercises: { type: Type.ARRAY, items: { type: Type.STRING } },
          levelUpdate: { type: Type.STRING, enum: Object.values(FISILevel) }
        },
        required: ["extractedErrors", "feedbackForInstructor", "feedbackForSkier", "suggestedExercises"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {};
  }
}
