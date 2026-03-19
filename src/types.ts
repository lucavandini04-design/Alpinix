import { Type } from "@google/genai";

export enum FISILevel {
  L1 = "L1",
  L2 = "L2",
  L3 = "L3",
  L4 = "L4",
  L5 = "L5",
  L6 = "L6",
  L7 = "L7"
}

export interface InstructorProfile {
  name: string;
  email: string;
  phone: string;
  schoolEmail: string;
  schoolPhone: string;
}

export const FISI_LEVEL_DETAILS = {
  [FISILevel.L1]: { 
    name: "Introduttivo", 
    goal: "Imparare a curvare a spazzaneve",
    definition: "Dalla curva precedente, mantenendo la posizione a spazzaneve, iniziare la curva successiva tramite la diminuzione della presa di spigolo e la contemporanea azione rotatoria degli arti inferiori. Dalla massima pendenza proseguire la traiettoria di curva ricercando il carico sullo sci esterno, continuando l’azione rotatoria. Il segmento superiore del corpo rimane solidale con i segmenti inferiori e collabora al mantenimento della centralità.",
    technicalModel: "Dal punto di vista tecnico la diminuzione della presa di spigolo consente di cambiare direzione ed avviene contemporaneamente alla rotazione di entrambi gli sci che continua durante tutta la curva. La parte alta del corpo favorisce la rotazione degli arti inferiori nel senso di curva. È necessario mantenere la centralità durante tutta la curva, in particolare nella prima parte dove aumenta la pendenza. Dalla massima pendenza in poi il carico sullo sci esterno avviene contemporaneamente ad un abbassamento del baricentro e a un aumento della presa di spigolo."
  },
  [FISILevel.L2]: { 
    name: "Elementare", 
    goal: "Curvare riducendo lo spazzaneve",
    definition: "Dalla curva precedente, diminuendo l’angolazione iniziare la curva successiva tramite l’azione rotatoria degli arti inferiori e la contemporanea apertura a spazzaneve. Dalla massima pendenza riavvicinare lo sci interno a quello esterno, proseguire con l’azione rotatoria ricercando il carico sullo sci esterno in angolazione. La parte superiore del corpo collabora al mantenimento della centralità e alla distribuzione del carico sullo sci esterno gestendo le inerzie rotazionali.",
    technicalModel: "Attraverso la diminuzione dell’angolazione si riduce la presa di spigolo che consente di cambiare direzione. La rotazione di entrambi gli arti inferiori avviene contemporaneamente all’apertura di entrambi gli sci a spazzaneve. Dalla massima pendenza in poi il carico sullo sci esterno avviene contemporaneamente all’avvicinamento dello sci interno a quello esterno. L’abbassamento del baricentro, l’aumento dell’angolazione e l’azione rotatoria consentono di determinare una traiettoria curvilinea."
  },
  [FISILevel.L3]: { 
    name: "Base", 
    goal: "Imparare a curvare a sci paralleli",
    definition: "Dalla curva precedente, diminuendo l’angolazione iniziare la curva successiva tramite l’azione rotatoria degli arti inferiori a sci paralleli, ricercando la perpendicolarità. Proseguire gestendo l’azione rotatoria ricercando il carico sullo sci esterno in angolazione. La parte superiore del corpo collabora al mantenimento della centralità e alla distribuzione del carico sullo sci esterno gestendo le inerzie rotazionali.",
    technicalModel: "Dal punto di vista tecnico attraverso la diminuzione dell’angolazione si riduce la presa di spigolo che consente di cambiare direzione. Contemporaneamente alla rotazione di entrambi gli arti inferiori e alla ricerca della perpendicolarità si raggiunge la massima pendenza. Dalla massima pendenza in poi la distribuzione del carico sullo sci esterno avviene contemporaneamente all’aumento dell’angolazione e all’azione rotatoria."
  },
  [FISILevel.L4]: { 
    name: "Intermedio di Base", 
    goal: "Curvare con appoggio del bastone",
    definition: "Dalla curva precedente, diminuendo l’angolazione con l’appoggio del bastone effettuare il cambio degli spigoli. Iniziare la curva successiva tramite l’azione rotatoria degli arti inferiori e la diminuzione della presa di spigolo ricercando la perpendicolarità. Proseguire gestendo l’azione rotatoria e il carico sullo sci esterno in angolazione. La parte superiore del corpo collabora alla ricerca della centralità e alla distribuzione del carico sullo sci esterno gestendo le inerzie rotazionali.",
    technicalModel: "Viene introdotto per la prima volta l’appoggio del bastone che diventa determinante per avere un corretto tempismo esecutivo. La preparazione e l’appoggio del bastone favoriscono la direzione dei movimenti e determinano il ritmo della sciata. La preparazione dell’appoggio del bastone inizia in prossimità della massima pendenza e viene effettuato tra spatola e attacco."
  },
  [FISILevel.L5]: { 
    name: "Intermedio", 
    goal: "Curvare in traiettorie definite",
    definition: "Dalla curva precedente, diminuendo l’angolazione con l’appoggio del bastone effettuare il cambio degli spigoli e indirizzare gli sci nella traiettoria di curva ricercando la perpendicolarità. Proseguire gestendo l’azione rotatoria, la presa di spigolo e il carico sullo sci esterno. La parte superiore del corpo collabora alla ricerca della centralità e alla distribuzione del carico sullo sci esterno gestendo le inerzie rotazionali.",
    technicalModel: "L’appoggio del bastone diventa determinante per avere un corretto tempismo esecutivo ed effettuare la traiettoria di curva voluta. Una contemporanea diminuzione dell’angolazione abbinata all’appoggio del bastone permette di effettuare il cambio degli spigoli che varierà in funzione della velocità, della traiettoria di curva, della pendenza e della tipologia di neve."
  },
  [FISILevel.L6]: { 
    name: "Avanzato", 
    goal: "Curvare ricercando la conduzione (carving)",
    definition: "Dalla curva precedente, diminuendo l’angolazione con l’appoggio del bastone effettuare il cambio degli spigoli e indirizzare gli sci nella traiettoria di curva ricercando la perpendicolarità. Proseguire ricercando la conduzione e il carico sullo sci esterno. Modulare la forza muscolare in relazione alle inerzie. La parte superiore del corpo collabora alla ricerca della centralità e alla distribuzione del carico sullo sci esterno gestendo le inerzie rotazionali.",
    technicalModel: "Migliorando la coordinazione dell’appoggio del bastone e la gestione dei movimenti, la figura dello sciatore risulta essere più elegante. Il gesto tecnico si affina sino ad ottenere una buona conduzione dello sci durante la traiettoria di curva che varia in funzione dell’arco, della neve e della pendenza. La ricerca di perpendicolarità assume un’importanza rilevante."
  },
  [FISILevel.L7]: { 
    name: "Sportivo", 
    goal: "Conduzione con deformazione degli sci",
    definition: "Dalla curva precedente, diminuendo l’angolazione con l’appoggio del bastone effettuare il cambio degli spigoli e indirizzare gli sci nella traiettoria di curva ricercando la deformazione attraverso la perpendicolarità e il carico sullo sci esterno. Proseguire la traiettoria di curva con la massima conduzione possibile. Modulare la forza muscolare in relazione alle inerzie. La parte superiore del corpo collabora alla ricerca della centralità e all’ottimizzazione del carico sullo sci esterno gestendo le inerzie rotazionali.",
    technicalModel: "Questo livello rappresenta la massima espressione dello sci Italiano. In esso lo sciatore raggiunge capacità tecniche molto elevate che consentono di sfruttare le caratteristiche degli sci al fine di ottenere la massima conduzione possibile anche su pendii molto ripidi e in diverse tipologie di neve. L’utilizzo ottimale delle azioni motorie permette di sfruttare la deformazione degli sci."
  }
};

export interface Skier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  age?: number;
  language?: string;
  background: {
    experienceStatus: "Prima volta" | "Prima volta della stagione" | "Ha già sciato quest'anno";
    lastTime: string;
    lessonMotivation: "Imparare a sciare" | "Affinare la tecnica" | "Agonismo" | "Freeski";
  };
  currentLevel: FISILevel;
  sessions: Session[];
}

export interface Session {
  id: string;
  date: string;
  slopeDone?: string;
  skiPosition?: 'paralleli' | 'spazzaneve';
  errorsMade?: string;
  instructorNotes: string;
  extractedErrors: TechnicalError[];
  feedbackForInstructor: string;
  feedbackForSkier: string;
  suggestedExercises: string[];
  levelUpdate?: FISILevel;
}

export interface TechnicalError {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface Lesson {
  id: string;
  skierName: string;
  skierId?: string; // Link to existing Skier if mapped
  skierDetails?: {
    email?: string;
    phone?: string;
    age?: number;
    language?: string;
    currentLevel?: FISILevel;
    background?: {
      experienceStatus: "Prima volta" | "Prima volta della stagione" | "Ha già sciato quest'anno";
      lastTime: string;
      lessonMotivation: "Imparare a sciare" | "Affinare la tecnica" | "Agonismo" | "Freeski";
    };
  };
  startTime: string;
  endTime: string;
  date: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface ImaeConfig {
  apiUrl: string;
  apiKey: string;
  instructorId: string;
  lastSync?: string;
  autoSync: boolean;
}

export const TECHNICAL_ERRORS_DICTIONARY = [
  { type: "Appoggio interno", description: "Peso sull'interno dello sci invece che sull'esterno" },
  { type: "Rotazione del bacino verso monte", description: "Il bacino ruota a monte invece di restare aperto e rivolto a valle" },
  { type: "Piedi ballerini", description: "Movimenti eccessivi e instabili dei piedi" },
  { type: "Chiusura della curva", description: "Incapacità di completare l'arco della curva" },
  { type: "Carico sullo sci esterno", description: "Difficoltà nel caricare correttamente lo sci esterno" }
];
