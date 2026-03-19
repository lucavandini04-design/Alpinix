/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  ChevronRight, 
  History, 
  Award, 
  Mountain,
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Search,
  Calendar,
  MessageSquare,
  Dumbbell,
  FileText,
  Printer,
  X,
  Settings,
  Mail,
  Phone,
  School,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Skier, FISILevel, FISI_LEVEL_DETAILS, Session, InstructorProfile, Lesson, ImaeConfig } from './types';
import { analyzeSession } from './services/geminiService';

// Logo Component mimicking the provided image accurately
const AlpinixLogo = ({ className = "w-6 h-6", showText = true }: { className?: string, showText?: boolean }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background Mountains */}
    <path d="M10 80 L35 35 L60 80" stroke="currentColor" strokeWidth="1.5" />
    <path d="M40 80 L65 35 L90 80" stroke="currentColor" strokeWidth="1.5" />
    
    {/* Grid Pattern on Mountains */}
    <g stroke="currentColor" strokeWidth="0.5" opacity="0.2">
      {/* Horizontal lines */}
      <path d="M15 72 H85" />
      <path d="M20 64 H80" />
      <path d="M25 56 H75" />
      <path d="M30 48 H70" />
      {/* Vertical lines */}
      <path d="M20 80 V64" />
      <path d="M30 80 V48" />
      <path d="M40 80 V35" />
      <path d="M50 80 V30" />
      <path d="M60 80 V35" />
      <path d="M70 80 V48" />
      <path d="M80 80 V64" />
    </g>

    {/* Main Central Peak */}
    <path d="M25 80 L50 25 L75 80" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    
    {/* Green Accents */}
    <path d="M45 80 L50 72 L55 80" stroke="#006837" strokeWidth="2" strokeLinejoin="round" />
    <path d="M55 45 L68 75" stroke="#006837" strokeWidth="2.5" strokeLinecap="round" />

    {/* Text ALPINIX */}
    {showText && (
      <text x="50" y="105" textAnchor="middle" fill="currentColor" style={{ font: 'bold 16px sans-serif', letterSpacing: '1px' }}>ALPINIX</text>
    )}
  </svg>
);

// Mock initial data
const INITIAL_SKIERS: Skier[] = [
  {
    id: '1',
    name: 'Marco Rossi',
    email: 'marco.rossi@example.com',
    phone: '+39 333 1234567',
    age: 28,
    language: 'Italiano',
    background: {
      experienceStatus: "Ha già sciato quest'anno",
      lastTime: '1 anno fa',
      lessonMotivation: 'Affinare la tecnica'
    },
    currentLevel: FISILevel.L4,
    sessions: [
      {
        id: 's1',
        date: '2026-03-10',
        instructorNotes: 'Buona gestione del bastone, ma ancora un po di rotazione del bacino a monte nelle curve a sinistra.',
        extractedErrors: [
          { type: 'Rotazione del bacino verso monte', description: 'Tendenza a ruotare il bacino verso monte nelle curve a sinistra', severity: 'medium' }
        ],
        feedbackForInstructor: 'Lavorare sulla separazione busto-gambe.',
        feedbackForSkier: 'Ottimo lavoro con i bastoncini! Prova a mantenere le spalle più rivolte a valle.',
        suggestedExercises: ['Esercizio dell\'aeroplano', 'Curve solo con sci esterno']
      }
    ]
  }
];

export default function App() {
  const [skiers, setSkiers] = useState<Skier[]>(() => {
    const saved = localStorage.getItem('skiers');
    return saved ? JSON.parse(saved) : INITIAL_SKIERS;
  });
  const [instructorProfile, setInstructorProfile] = useState<InstructorProfile>(() => {
    const saved = localStorage.getItem('instructorProfile');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      phone: '',
      schoolEmail: '',
      schoolPhone: ''
    };
  });
  const [imaeConfig, setImaeConfig] = useState<ImaeConfig>(() => {
    const saved = localStorage.getItem('imaeConfig');
    return saved ? JSON.parse(saved) : {
      apiUrl: 'https://api.imae.it/v1',
      apiKey: '',
      instructorId: '',
      autoSync: false
    };
  });
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('lessons');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedSkierId, setSelectedSkierId] = useState<string | null>(null);
  const [isAddingSkier, setIsAddingSkier] = useState(false);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [isShowingReport, setIsShowingReport] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'skiers' | 'agenda' | 'settings'>('skiers');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    localStorage.setItem('skiers', JSON.stringify(skiers));
  }, [skiers]);

  useEffect(() => {
    localStorage.setItem('instructorProfile', JSON.stringify(instructorProfile));
  }, [instructorProfile]);

  useEffect(() => {
    localStorage.setItem('imaeConfig', JSON.stringify(imaeConfig));
  }, [imaeConfig]);

  useEffect(() => {
    localStorage.setItem('lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    if (imaeConfig.autoSync && !imaeConfig.lastSync) {
      handleSyncImae();
    }
  }, []);

  const selectedSkier = skiers.find(s => s.id === selectedSkierId);

  const handleAddSkier = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSkier: Skier = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      age: formData.get('age') ? Number(formData.get('age')) : undefined,
      language: formData.get('language') as string,
      background: {
        experienceStatus: formData.get('experienceStatus') as any,
        lastTime: formData.get('lastTime') as string,
        lessonMotivation: formData.get('lessonMotivation') as any
      },
      currentLevel: formData.get('level') as FISILevel || FISILevel.L1,
      sessions: []
    };
    setSkiers([...skiers, newSkier]);
    setIsAddingSkier(false);
  };

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setInstructorProfile({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      schoolEmail: formData.get('schoolEmail') as string,
      schoolPhone: formData.get('schoolPhone') as string,
    });
    
    setImaeConfig({
      ...imaeConfig,
      apiUrl: formData.get('imaeApiUrl') as string,
      apiKey: formData.get('imaeApiKey') as string,
      instructorId: formData.get('imaeInstructorId') as string,
      autoSync: formData.get('imaeAutoSync') === 'on'
    });

    setActiveTab('skiers');
  };

  const handleSyncImae = async () => {
    setIsSyncing(true);
    // Simulate API call to IMAE
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const allMockLessons: Lesson[] = [];
    const names = ['Giulia Bianchi', 'Marco Rossi', 'Luca Verdi', 'Elena Neri', 'Paolo Bruni', 'Sofia Conti', 'Chiara Galli', 'Matteo Ricci'];
    const locations = ['Campo Scuola', 'Pista 5', 'Pista 2', 'Pista 10', 'Snowpark', 'Pista 1', 'Pista 12'];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Add 2-4 lessons per day
      const numLessons = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numLessons; j++) {
        const startH = 9 + j * 2;
        const endH = 11 + j * 2;
        const skierName = names[Math.floor(Math.random() * names.length)];
        
        allMockLessons.push({
          id: `imae-${dateStr}-${j}`,
          skierName,
          skierDetails: {
            email: `${skierName.toLowerCase().replace(' ', '.')}@example.com`,
            phone: `+39 333 ${Math.floor(1000000 + Math.random() * 9000000)}`,
            age: 18 + Math.floor(Math.random() * 40),
            language: Math.random() > 0.3 ? 'Italiano' : 'Inglese',
            currentLevel: Object.values(FISILevel)[Math.floor(Math.random() * 7)],
            background: {
              experienceStatus: "Ha già sciato quest'anno",
              lastTime: '1 anno fa',
              lessonMotivation: 'Affinare la tecnica'
            }
          },
          startTime: `${startH.toString().padStart(2, '0')}:00`,
          endTime: `${endH.toString().padStart(2, '0')}:00`,
          date: dateStr,
          location: locations[Math.floor(Math.random() * locations.length)],
          status: 'scheduled'
        });
      }
    }

    setLessons(allMockLessons);
    setImaeConfig({ ...imaeConfig, lastSync: new Date().toLocaleString() });
    setIsSyncing(false);
  };

  const handleStartLesson = (lesson: Lesson) => {
    // Check if skier exists, if not create one or ask to map
    let skier = skiers.find(s => s.id === lesson.skierId || s.name.toLowerCase() === lesson.skierName.toLowerCase());
    
    let targetSkierId = '';

    if (!skier) {
      const newSkier: Skier = {
        id: Date.now().toString(),
        name: lesson.skierName,
        email: lesson.skierDetails?.email,
        phone: lesson.skierDetails?.phone,
        age: lesson.skierDetails?.age,
        language: lesson.skierDetails?.language,
        background: lesson.skierDetails?.background || {
          experienceStatus: 'Ha già sciato quest\'anno',
          lastTime: '',
          lessonMotivation: 'Affinare la tecnica'
        },
        currentLevel: lesson.skierDetails?.currentLevel || FISILevel.L1,
        sessions: []
      };
      setSkiers([...skiers, newSkier]);
      targetSkierId = newSkier.id;
    } else {
      targetSkierId = skier.id;
    }

    // Update lesson to link it locally
    setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, skierId: targetSkierId } : l));
    
    setSelectedSkierId(targetSkierId);
    setActiveTab('skiers');
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const handleAddSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSkier) return;

    const formData = new FormData(e.currentTarget);
    const slopeDone = formData.get('slopeDone') as string;
    const skiPosition = formData.get('skiPosition') as string;
    const errorsMade = formData.get('errorsMade') as string;
    
    setIsAnalyzing(true);
    const analysis = await analyzeSession(slopeDone, skiPosition, errorsMade, selectedSkier.currentLevel);
    setIsAnalyzing(false);

    const newSession: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      slopeDone,
      skiPosition: skiPosition as any,
      errorsMade,
      instructorNotes: `Pista: ${slopeDone}. Sci: ${skiPosition}. Errori: ${errorsMade}`,
      extractedErrors: analysis.extractedErrors || [],
      feedbackForInstructor: analysis.feedbackForInstructor || '',
      feedbackForSkier: analysis.feedbackForSkier || '',
      suggestedExercises: analysis.suggestedExercises || [],
      levelUpdate: analysis.levelUpdate
    };

    const updatedSkiers = skiers.map(s => {
      if (s.id === selectedSkier.id) {
        return {
          ...s,
          currentLevel: analysis.levelUpdate || s.currentLevel,
          sessions: [newSession, ...s.sessions]
        };
      }
      return s;
    });

    setSkiers(updatedSkiers);
    setIsAddingSession(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredSkiers = skiers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedLessons = lessons
    .filter(l => l.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const todayFormatted = new Date(selectedDate).toLocaleDateString('it-IT', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0] print:bg-white print:text-black">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center sticky top-0 bg-[#E4E3E0] z-10 print:hidden">
        <div className="flex items-center gap-4">
          <AlpinixLogo className="text-[#141414] w-16 h-16" />
          <div className="border-l border-[#141414]/20 pl-4">
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest leading-tight">Technical Assistant v1.0</p>
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest leading-tight">FISI Certified Reference</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 print:hidden">
          <div className="flex bg-[#141414]/5 p-1 rounded-sm gap-1">
            <button 
              onClick={() => setActiveTab('skiers')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${activeTab === 'skiers' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
            >
              Anagrafica
            </button>
            <button 
              onClick={() => setActiveTab('agenda')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${activeTab === 'agenda' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
            >
              Agenda IMAE
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${activeTab === 'settings' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
            >
              Impostazioni
            </button>
          </div>

          {!selectedSkierId && !isAddingSkier && activeTab === 'skiers' && (
            <button 
              onClick={() => setIsAddingSkier(true)}
              className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={18} />
              NUOVO SCIATORE
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 print:p-0">
        <AnimatePresence mode="wait">
          {/* Settings View */}
          {activeTab === 'settings' && !selectedSkierId && !isAddingSkier && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="border-b border-[#141414] pb-6">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Impostazioni Sistema</h2>
                <p className="text-xs opacity-50 font-mono uppercase mt-1">Configura il tuo profilo e le integrazioni esterne</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#141414]/10 pb-2">
                      <Users size={18} />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Profilo Maestro</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-50">Nome Completo</label>
                        <input name="name" defaultValue={instructorProfile.name} className="w-full bg-white border border-[#141414] p-4 focus:outline-none focus:ring-2 ring-[#141414]/5" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase opacity-50">Email Personale</label>
                          <input type="email" name="email" defaultValue={instructorProfile.email} className="w-full bg-white border border-[#141414] p-4 focus:outline-none focus:ring-2 ring-[#141414]/5" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase opacity-50">Telefono</label>
                          <input name="phone" defaultValue={instructorProfile.phone} className="w-full bg-white border border-[#141414] p-4 focus:outline-none focus:ring-2 ring-[#141414]/5" />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#141414]/10 pb-2">
                      <School size={18} />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Dati Scuola Sci</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-50">Email Scuola</label>
                        <input type="email" name="schoolEmail" defaultValue={instructorProfile.schoolEmail} className="w-full bg-white border border-[#141414] p-4 focus:outline-none focus:ring-2 ring-[#141414]/5" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-50">Telefono Scuola</label>
                        <input name="schoolPhone" defaultValue={instructorProfile.schoolPhone} className="w-full bg-white border border-[#141414] p-4 focus:outline-none focus:ring-2 ring-[#141414]/5" />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#141414]/10 pb-2">
                      <RefreshCw size={18} />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Integrazione IMAE</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-50">API Endpoint</label>
                        <input name="imaeApiUrl" defaultValue={imaeConfig.apiUrl} className="w-full bg-white border border-[#141414] p-4 focus:outline-none focus:ring-2 ring-[#141414]/5 font-mono text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase opacity-50">API Key</label>
                          <input type="password" name="imaeApiKey" defaultValue={imaeConfig.apiKey} placeholder="••••••••" className="w-full bg-white border border-[#141414] p-4 focus:outline-none focus:ring-2 ring-[#141414]/5 font-mono text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase opacity-50">ID Maestro IMAE</label>
                          <input name="imaeInstructorId" defaultValue={imaeConfig.instructorId} className="w-full bg-white border border-[#141414] p-4 focus:outline-none focus:ring-2 ring-[#141414]/5 font-mono text-xs" />
                        </div>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer bg-white border border-[#141414] p-4 hover:bg-[#141414]/5 transition-colors">
                        <input type="checkbox" name="imaeAutoSync" defaultChecked={imaeConfig.autoSync} className="w-4 h-4 accent-[#141414]" />
                        <span className="text-xs uppercase font-bold">Sincronizzazione Automatica all'avvio</span>
                      </label>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#141414]/10 pb-2">
                      <Settings size={18} />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Preferenze App</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-50">Lingua Interfaccia</label>
                        <select className="w-full bg-white border border-[#141414] p-4 focus:outline-none text-sm uppercase font-bold">
                          <option>Italiano</option>
                          <option>English</option>
                          <option>Deutsch</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      className="w-full bg-[#141414] text-[#E4E3E0] py-6 font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity shadow-xl"
                    >
                      SALVA TUTTE LE IMPOSTAZIONI
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* Agenda View */}
          {activeTab === 'agenda' && !selectedSkierId && !isAddingSkier && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end border-b border-[#141414] pb-6">
                <div>
                  <h2 className="text-3xl font-bold uppercase tracking-tighter">{todayFormatted}</h2>
                  <p className="text-xs opacity-50 font-mono uppercase mt-1">
                    Agenda IMAE  Ultimo aggiornamento: {imaeConfig.lastSync || 'Mai'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSyncImae}
                    disabled={isSyncing}
                    className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-6 py-3 text-sm font-bold uppercase hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Sincronizza' : 'Aggiorna'}
                  </button>
                </div>
              </div>

              {/* Date Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[0, 1, 2, 3, 4, 5].map(offset => {
                  const d = new Date();
                  d.setDate(d.getDate() + offset);
                  const dStr = d.toISOString().split('T')[0];
                  const isActive = selectedDate === dStr;
                  return (
                    <button
                      key={dStr}
                      onClick={() => setSelectedDate(dStr)}
                      className={`flex-shrink-0 px-6 py-3 border border-[#141414] transition-all ${
                        isActive 
                          ? 'bg-[#141414] text-[#E4E3E0]' 
                          : 'bg-white hover:bg-[#141414]/5'
                      }`}
                    >
                      <p className="text-[10px] font-mono uppercase opacity-50 leading-none mb-1">
                        {d.toLocaleDateString('it-IT', { weekday: 'short' })}
                      </p>
                      <p className="text-lg font-bold leading-none">
                        {d.getDate()} {d.toLocaleDateString('it-IT', { month: 'short' })}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {sortedLessons.length > 0 ? (
                  sortedLessons.map(lesson => (
                    <div key={lesson.id} className="bg-white border border-[#141414] p-8 flex justify-between items-center group hover:shadow-xl transition-all relative overflow-hidden">
                      {lesson.skierId && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" title="Sciatore già censito" />
                      )}
                      <div className="flex gap-12 items-center">
                        <div className="text-center min-w-[100px]">
                          <p className="text-3xl font-bold font-mono tracking-tighter">{lesson.startTime}</p>
                          <p className="text-[10px] opacity-50 font-mono uppercase tracking-widest mt-1">Inizio Lezione</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold uppercase tracking-tight">{lesson.skierName}</h3>
                            {lesson.skierId && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">Anagrafica OK</span>
                            )}
                          </div>
                          <div className="flex gap-6">
                            <span className="text-xs font-mono uppercase opacity-50 flex items-center gap-2">
                              <Clock size={14} /> Fino alle {lesson.endTime}
                            </span>
                            <span className="text-xs font-mono uppercase opacity-50 flex items-center gap-2">
                              <ExternalLink size={14} /> {lesson.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <button 
                          onClick={() => handleStartLesson(lesson)}
                          className="bg-[#141414] text-[#E4E3E0] px-8 py-4 font-bold uppercase text-sm tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                          {lesson.skierId ? 'VAI ALLA SCHEDA' : 'CREA E INIZIA'}
                          <ChevronRight size={18} />
                        </button>
                        <p className="text-[10px] font-mono uppercase opacity-30">ID IMAE: {lesson.id}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 border border-dashed border-[#141414]/30 text-center space-y-4">
                    <p className="opacity-30 italic font-serif text-xl">Nessuna lezione in agenda per questa data.</p>
                    <button 
                      onClick={handleSyncImae}
                      className="text-xs font-bold uppercase underline hover:opacity-70"
                    >
                      Prova a sincronizzare ora
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Dashboard List */}
          {activeTab === 'skiers' && !selectedSkierId && !isAddingSkier && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                <input 
                  type="text" 
                  placeholder="CERCA SCIATORE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-[#141414] p-4 pl-12 focus:outline-none focus:bg-white/50 transition-colors placeholder:opacity-30 font-mono text-sm"
                />
              </div>

              <div className="border border-[#141414]">
                <div className="grid grid-cols-[1fr_120px_120px_40px] p-4 border-b border-[#141414] bg-[#141414]/5">
                  <span className="text-[11px] font-serif italic opacity-50 uppercase tracking-wider">Nome Sciatore</span>
                  <span className="text-[11px] font-serif italic opacity-50 uppercase tracking-wider">Livello FISI</span>
                  <span className="text-[11px] font-serif italic opacity-50 uppercase tracking-wider">Sessioni</span>
                  <span></span>
                </div>
                {filteredSkiers.length > 0 ? (
                  filteredSkiers.map(skier => (
                    <div 
                      key={skier.id}
                      onClick={() => setSelectedSkierId(skier.id)}
                      className="grid grid-cols-[1fr_120px_120px_40px] p-4 border-b border-[#141414] last:border-0 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors cursor-pointer group"
                    >
                      <span className="font-medium">{skier.name}</span>
                      <span className="font-mono text-sm">{skier.currentLevel} - {FISI_LEVEL_DETAILS[skier.currentLevel].name}</span>
                      <span className="font-mono text-sm">{skier.sessions.length}</span>
                      <ChevronRight size={18} className="opacity-30 group-hover:opacity-100" />
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center opacity-30 italic font-serif">Nessun risultato trovato</div>
                )}
              </div>
            </motion.div>
          )}

          {/* Add Skier Form */}
          {isAddingSkier && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto border border-[#141414] bg-white p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-tight">Nuova Scheda Sciatore</h2>
                <button onClick={() => setIsAddingSkier(false)} className="opacity-50 hover:opacity-100"><ArrowLeft /></button>
              </div>
              
              <form onSubmit={handleAddSkier} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50">Nome Completo</label>
                  <input required name="name" className="w-full border-b border-[#141414] py-2 focus:outline-none focus:border-b-2" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase opacity-50">Email</label>
                    <input type="email" name="email" className="w-full border-b border-[#141414] py-2 focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase opacity-50">Telefono</label>
                    <input type="tel" name="phone" className="w-full border-b border-[#141414] py-2 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase opacity-50">Età</label>
                    <input type="number" name="age" className="w-full border-b border-[#141414] py-2 focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase opacity-50">Lingua</label>
                    <input name="language" className="w-full border-b border-[#141414] py-2 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase opacity-50">Livello Iniziale (FISI)</label>
                    <select name="level" className="w-full border-b border-[#141414] py-2 focus:outline-none">
                      {Object.values(FISILevel).map(l => (
                        <option key={l} value={l}>{l} - {FISI_LEVEL_DETAILS[l].name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#141414]/10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase opacity-50">Esperienza Precedente</label>
                    <select name="experienceStatus" className="w-full border-b border-[#141414] py-2 focus:outline-none bg-transparent">
                      <option value="Prima volta">Prima volta assoluta</option>
                      <option value="Prima volta della stagione">Prima volta della stagione</option>
                      <option value="Ha già sciato quest'anno">Ha già sciato quest'anno</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase opacity-50">Motivazione della Lezione</label>
                    <select name="lessonMotivation" className="w-full border-b border-[#141414] py-2 focus:outline-none bg-transparent">
                      <option value="Imparare a sciare">Imparare a sciare</option>
                      <option value="Affinare la tecnica">Affinare la tecnica</option>
                      <option value="Agonismo">Agonismo</option>
                      <option value="Freeski">Freeski</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#141414] text-[#E4E3E0] py-4 font-bold uppercase tracking-widest hover:opacity-90">
                  CREA SCHEDA
                </button>
              </form>
            </motion.div>
          )}

          {/* Skier Detail View */}
          {selectedSkier && !isShowingReport && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-start">
                <button 
                  onClick={() => setSelectedSkierId(null)}
                  className="flex items-center gap-2 text-sm font-mono opacity-50 hover:opacity-100 transition-opacity"
                >
                  <ArrowLeft size={16} /> TORNA ALLA LISTA
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsShowingReport(true)}
                    className="border border-[#141414] text-[#141414] px-6 py-3 font-bold uppercase tracking-tight flex items-center gap-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
                  >
                    <FileText size={20} /> GENERA REPORT / PDF
                  </button>
                  <button 
                    onClick={() => setIsAddingSession(true)}
                    className="bg-[#141414] text-[#E4E3E0] px-6 py-3 font-bold uppercase tracking-tight flex items-center gap-2"
                  >
                    <Plus size={20} /> AGGIUNGI SESSIONE
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
                {/* Left Column: Sessions History */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold uppercase tracking-tight border-b border-[#141414] pb-2 flex items-center gap-2">
                    <History size={20} /> Cronologia Sessioni
                  </h3>
                  
                  {selectedSkier.sessions.length > 0 ? (
                    selectedSkier.sessions.map(session => (
                      <div key={session.id} className="border border-[#141414] bg-white overflow-hidden">
                        <div className="bg-[#141414] text-[#E4E3E0] p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Calendar size={16} />
                            <span className="font-mono text-sm">{session.date}</span>
                          </div>
                          {session.levelUpdate && (
                            <div className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                              PROMOSSO A {session.levelUpdate}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#141414]/5 p-4 border border-[#141414]/10">
                            <div>
                              <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Pista</label>
                              <p className="text-xs font-bold uppercase">{session.slopeDone || 'N/D'}</p>
                            </div>
                            <div>
                              <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Assetto Sci</label>
                              <p className="text-xs font-bold uppercase">{session.skiPosition || 'N/D'}</p>
                            </div>
                            <div>
                              <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Errori Rilevati</label>
                              <p className="text-xs">{session.errorsMade || 'N/D'}</p>
                            </div>
                          </div>

                          {session.extractedErrors.length > 0 && (
                            <div>
                              <label className="text-[10px] font-mono uppercase opacity-50 block mb-2">Errori Tecnici Rilevati</label>
                              <div className="flex flex-wrap gap-2">
                                {session.extractedErrors.map((err, i) => (
                                  <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 text-xs font-medium flex items-center gap-2">
                                    <AlertCircle size={12} /> {err.type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#141414]/5">
                            <div className="space-y-2">
                              <label className="text-[10px] font-mono uppercase opacity-50 flex items-center gap-1">
                                <MessageSquare size={12} /> Feedback per lo Sciatore
                              </label>
                              <p className="text-sm">{session.feedbackForSkier}</p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-mono uppercase opacity-50 flex items-center gap-1">
                                <Award size={12} /> Feedback per il Maestro
                              </label>
                              <p className="text-sm opacity-70">{session.feedbackForInstructor}</p>
                            </div>
                          </div>

                          {session.suggestedExercises.length > 0 && (
                            <div className="bg-[#141414]/5 p-4">
                              <label className="text-[10px] font-mono uppercase opacity-50 flex items-center gap-1 mb-2">
                                <Dumbbell size={12} /> Esercizi Suggeriti
                              </label>
                              <ul className="text-sm space-y-1">
                                {session.suggestedExercises.map((ex, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-[#141414] rounded-full" /> {ex}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 border border-dashed border-[#141414]/30 text-center opacity-30 italic font-serif">
                      Nessuna sessione registrata. Inizia la prima lezione!
                    </div>
                  )}
                </div>

                {/* Right Column: Skier Info & Stats */}
                <div className="space-y-8">
                  <div className="border border-[#141414] bg-white p-6">
                    <h3 className="text-lg font-bold uppercase tracking-tight mb-4 border-b border-[#141414] pb-2">Dati Personali</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="opacity-50">Email:</span>
                        <span className="font-mono text-right">{selectedSkier.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50">Telefono:</span>
                        <span className="font-mono text-right">{selectedSkier.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50">Età:</span>
                        <span className="font-mono text-right">{selectedSkier.age || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50">Lingua:</span>
                        <span className="font-mono text-right">{selectedSkier.language || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#141414] bg-white p-6">
                    <h3 className="text-lg font-bold uppercase tracking-tight mb-4 border-b border-[#141414] pb-2">Profilo Tecnico</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-mono uppercase opacity-50">Livello Attuale</span>
                        <span className="text-2xl font-bold">{selectedSkier.currentLevel}</span>
                      </div>
                      <div className="p-3 bg-[#141414] text-[#E4E3E0] rounded-sm">
                        <p className="text-[10px] font-mono uppercase opacity-50 mb-1">Obiettivo Tecnico</p>
                        <p className="text-sm font-medium">{FISI_LEVEL_DETAILS[selectedSkier.currentLevel].goal}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#141414] bg-white p-6">
                    <h3 className="text-lg font-bold uppercase tracking-tight mb-4 border-b border-[#141414] pb-2">Background</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="opacity-50">Stato:</span>
                        <span className="font-mono text-right">{selectedSkier.background.experienceStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50">Motivazione:</span>
                        <span className="font-mono text-right">{selectedSkier.background.lessonMotivation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50">Ultima volta:</span>
                        <span className="font-mono">{selectedSkier.background.lastTime || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Technical Report View */}
          {isShowingReport && selectedSkier && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#141414] p-12 shadow-xl space-y-12 max-w-4xl mx-auto print:shadow-none print:border-0 print:p-0 print:max-w-none print:w-full print:m-0"
            >
              <div className="flex justify-between items-start print:hidden">
                <button 
                  onClick={() => setIsShowingReport(false)}
                  className="flex items-center gap-2 text-sm font-mono opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X size={16} /> CHIUDI REPORT
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={handlePrint}
                    className="bg-[#141414] text-[#E4E3E0] px-6 py-3 font-bold uppercase tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Printer size={20} /> STAMPA / SALVA PDF
                  </button>
                </div>
              </div>

              {/* Report Header */}
              <div className="text-center space-y-4 border-b-2 border-[#141414] pb-8">
                <div className="flex justify-center mb-4">
                  <AlpinixLogo className="text-[#141414] w-24 h-24" />
                </div>
                <h1 className="text-4xl font-bold uppercase tracking-tighter">Report Tecnico dello Sciatore</h1>
                <p className="font-mono text-sm opacity-50 uppercase tracking-widest">Generato il {new Date().toLocaleDateString('it-IT')}</p>
              </div>

              {/* Skier Info */}
              <div className="grid grid-cols-2 gap-12 print-no-break">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50">Sciatore</label>
                  <p className="text-2xl font-bold uppercase">{selectedSkier.name}</p>
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-[10px] font-mono uppercase opacity-50">Livello FISI Attuale</label>
                  <p className="text-2xl font-bold uppercase">{selectedSkier.currentLevel} - {FISI_LEVEL_DETAILS[selectedSkier.currentLevel].name}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 print-no-break border-t border-[#141414]/10 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase opacity-50">Email</label>
                  <p className="text-sm font-mono">{selectedSkier.email || '-'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase opacity-50">Telefono</label>
                  <p className="text-sm font-mono">{selectedSkier.phone || '-'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase opacity-50">Età</label>
                  <p className="text-sm font-mono">{selectedSkier.age || '-'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase opacity-50">Lingua</label>
                  <p className="text-sm font-mono">{selectedSkier.language || '-'}</p>
                </div>
              </div>

              {/* Improvement Summary */}
              <div className="space-y-6 print-no-break">
                <h3 className="text-xl font-bold uppercase tracking-tight border-b border-[#141414] pb-2">Sintesi del Miglioramento</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="p-6 bg-[#141414]/5 space-y-4">
                    <p className="text-sm leading-relaxed">
                      Lo sciatore ha completato <strong>{selectedSkier.sessions.length} sessioni</strong>. 
                      Ha mostrato una progressione costante verso l'obiettivo tecnico del livello {selectedSkier.currentLevel}.
                    </p>
                    {selectedSkier.sessions.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase opacity-50">Ultimo Feedback Tecnico</label>
                        <p className="text-sm italic">"{selectedSkier.sessions[0].feedbackForSkier}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Last Lesson Details */}
              {selectedSkier.sessions.length > 0 && (
                <div className="space-y-6 print-no-break">
                  <h3 className="text-xl font-bold uppercase tracking-tight border-b border-[#141414] pb-2">Dettaglio Ultima Lezione ({selectedSkier.sessions[0].date})</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-mono uppercase opacity-50 block mb-2">Attività Svolta</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#141414]/5 p-4 border border-[#141414]/10 mb-4">
                        <div>
                          <label className="text-[9px] font-mono uppercase opacity-50 block mb-1">Pista Percorsa</label>
                          <p className="text-sm font-bold uppercase">{selectedSkier.sessions[0].slopeDone || 'N/D'}</p>
                        </div>
                        <div>
                          <label className="text-[9px] font-mono uppercase opacity-50 block mb-1">Posizione Sci</label>
                          <p className="text-sm font-bold uppercase">{selectedSkier.sessions[0].skiPosition || 'N/D'}</p>
                        </div>
                        <div>
                          <label className="text-[9px] font-mono uppercase opacity-50 block mb-1">Errori Osservati</label>
                          <p className="text-sm">{selectedSkier.sessions[0].errorsMade || 'N/D'}</p>
                        </div>
                      </div>
                      <p className="text-xs opacity-50 italic">Note complete: {selectedSkier.sessions[0].instructorNotes}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-mono uppercase opacity-50 flex items-center gap-1">
                          <Dumbbell size={12} /> Esercizi Futuri Consigliati
                        </label>
                        <ul className="text-sm space-y-2">
                          {selectedSkier.sessions[0].suggestedExercises.map((ex, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                              <span>{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-mono uppercase opacity-50 flex items-center gap-1">
                          <AlertCircle size={12} /> Punti di Attenzione
                        </label>
                        <ul className="text-sm space-y-2">
                          {selectedSkier.sessions[0].extractedErrors.map((err, i) => (
                            <li key={i} className="flex items-start gap-2 text-red-700">
                              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                              <span>{err.type}: {err.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Reference (from PDF) */}
              <div className="space-y-8 pt-8 border-t-4 border-[#141414] print-no-break">
                <div className="bg-[#141414] text-[#E4E3E0] p-6">
                  <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Riferimento Tecnico FISI - {selectedSkier.currentLevel}</h3>
                  <p className="text-sm opacity-70 italic">{FISI_LEVEL_DETAILS[selectedSkier.currentLevel].goal}</p>
                </div>

                {/* FISI Level Scale Table */}
                <div className="space-y-4 print-no-break">
                  <h4 className="text-[14px] font-bold uppercase tracking-widest text-[#F27D26] border-b-2 border-[#F27D26] pb-1">Scala dei Livelli — Sci Italiano FISI</h4>
                  <div className="border border-[#141414]/20">
                    <div className="grid grid-cols-[80px_1fr_2fr] bg-[#F27D26] text-white p-2 text-[11px] font-bold uppercase">
                      <span>Livello</span>
                      <span>Nome</span>
                      <span>Obiettivo Tecnico</span>
                    </div>
                    {Object.values(FISILevel).map((level) => {
                      const isCurrent = level === selectedSkier.currentLevel;
                      return (
                        <div 
                          key={level} 
                          className={`grid grid-cols-[80px_1fr_2fr] p-2 text-[11px] border-b border-[#141414]/10 last:border-0 ${
                            isCurrent ? 'bg-[#FFF7ED] font-bold text-[#F27D26] border-y-2 border-[#F27D26]/30' : 'bg-white'
                          }`}
                        >
                          <span className="font-mono">{level}</span>
                          <span className="uppercase">{FISI_LEVEL_DETAILS[level].name}</span>
                          <span className="flex items-center gap-2">
                            {FISI_LEVEL_DETAILS[level].goal}
                            {isCurrent && (
                              <span className="text-[11px] whitespace-nowrap font-bold">← {selectedSkier.name}</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] opacity-40 italic text-right">Riferimento tecnico: Sci Italiano — Italian Ski, FISI 2022 · Livello {selectedSkier.currentLevel} — {FISI_LEVEL_DETAILS[selectedSkier.currentLevel].name}</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-serif italic text-lg border-b border-[#141414]/20 pb-1">Definizione: Curve {FISI_LEVEL_DETAILS[selectedSkier.currentLevel].name}</h4>
                    <p className="text-sm leading-relaxed text-justify">
                      {FISI_LEVEL_DETAILS[selectedSkier.currentLevel].definition}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-serif italic text-lg border-b border-[#141414]/20 pb-1">Modello Tecnico</h4>
                    <p className="text-sm leading-relaxed text-justify">
                      {FISI_LEVEL_DETAILS[selectedSkier.currentLevel].technicalModel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer of Report */}
              <div className="pt-12 grid grid-cols-2 gap-12 border-t border-[#141414]/20 print-no-break">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono uppercase opacity-50">Contatti Maestro</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-bold uppercase">{instructorProfile.name || 'Maestro non specificato'}</p>
                    {instructorProfile.email && <p className="flex items-center gap-2"><Mail size={12} /> {instructorProfile.email}</p>}
                    {instructorProfile.phone && <p className="flex items-center gap-2"><Phone size={12} /> {instructorProfile.phone}</p>}
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <h4 className="text-[10px] font-mono uppercase opacity-50">Scuola di Sci</h4>
                  <div className="space-y-1 text-sm">
                    {instructorProfile.schoolEmail && <p className="flex items-center justify-end gap-2">{instructorProfile.schoolEmail} <Mail size={12} /></p>}
                    {instructorProfile.schoolPhone && <p className="flex items-center justify-end gap-2">{instructorProfile.schoolPhone} <Phone size={12} /></p>}
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-between items-end opacity-50 print-no-break">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono uppercase">ALPINIX Technical Assistant</p>
                  <p className="text-[10px] font-mono uppercase">Certificazione FISI - Sci Italiano</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-48 h-px bg-[#141414]" />
                  <p className="text-[10px] font-mono uppercase">Firma del Maestro: {instructorProfile.name}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Session Modal */}
      <AnimatePresence>
        {isAddingSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isAnalyzing && setIsAddingSession(false)}
              className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#E4E3E0] border border-[#141414] p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">Nuovo Feedback Lezione</h2>
              <form onSubmit={handleAddSession} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50">1. Che pista avete fatto? (Dettato)</label>
                  <textarea 
                    required 
                    name="slopeDone" 
                    rows={2}
                    placeholder="Es. Pista 5, Campo scuola..."
                    className="w-full bg-white border border-[#141414] p-4 focus:outline-none focus:ring-2 ring-[#141414]/10 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50">2. Come tiene gli sci?</label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 border border-[#141414] p-4 cursor-pointer hover:bg-[#141414]/5 transition-colors has-[:checked]:bg-[#141414] has-[:checked]:text-[#E4E3E0]">
                      <input type="radio" name="skiPosition" value="paralleli" required className="hidden" />
                      <span className="text-sm font-bold uppercase">Paralleli</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-2 border border-[#141414] p-4 cursor-pointer hover:bg-[#141414]/5 transition-colors has-[:checked]:bg-[#141414] has-[:checked]:text-[#E4E3E0]">
                      <input type="radio" name="skiPosition" value="spazzaneve" required className="hidden" />
                      <span className="text-sm font-bold uppercase">Spazzaneve</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50">3. Che errori ha fatto? (Dettato)</label>
                  <textarea 
                    required 
                    name="errorsMade" 
                    rows={4}
                    placeholder="Descrivi gli errori osservati..."
                    className="w-full bg-white border border-[#141414] p-4 focus:outline-none focus:ring-2 ring-[#141414]/10 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => setIsAddingSession(false)}
                    className="flex-1 border border-[#141414] py-4 font-bold uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors disabled:opacity-50"
                  >
                    ANNULLA
                  </button>
                  <button 
                    type="submit" 
                    disabled={isAnalyzing}
                    className="flex-1 bg-[#141414] text-[#E4E3E0] py-4 font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#E4E3E0]/30 border-t-[#E4E3E0] rounded-full animate-spin" />
                        ANALISI AI...
                      </>
                    ) : (
                      'SALVA SESSIONE'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto p-12 border-t border-[#141414]/10 mt-12 flex justify-between items-center opacity-30 print:hidden">
        <span className="text-[10px] font-mono uppercase tracking-widest">© 2026 ALPINIX Systems</span>
        <div className="flex gap-6">
          <span className="text-[10px] font-mono uppercase tracking-widest">FISI Certified Reference</span>
          <span className="text-[10px] font-mono uppercase tracking-widest">AI Technical Analysis</span>
        </div>
      </footer>
    </div>
  );
}
