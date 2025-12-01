import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Send, Sparkles, Volume2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, getAuthToken } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type MentorStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

const AIMentor = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mentorStatus, setMentorStatus] = useState<MentorStatus>('idle');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Te rog autentifică-te pentru a folosi AI Mentor");
      navigate("/login");
    }
  }, [navigate]);

  // Auto-scroll la ultimul mesaj
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Pornește înregistrarea audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAndSend(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setMentorStatus('listening');
      toast.success("🎙️ Ascult... vorbește acum!");
    } catch (error) {
      console.error('Recording error:', error);
      toast.error("Nu am putut accesa microfonul. Verifică permisiunile.");
    }
  };

  // Oprește înregistrarea
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Transcrie audio și trimite mesaj
  const transcribeAndSend = async (audioBlob: Blob) => {
    try {
      setMentorStatus('thinking');

      // Step 1: Transcrie audio cu Whisper
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      console.log('🎤 Trimit audio pentru transcribere...', audioBlob.size, 'bytes');

      const transcribeResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/ai-mentor/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        console.error('❌ Eroare transcribere:', errorData);
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const { text } = await transcribeResponse.json();
      console.log('✅ Text transcris:', text);
      
      // VALIDARE: Verifică dacă textul transcris este valid
      if (!text || text.trim().length === 0) {
        toast.error("Nu am putut înțelege ce ai spus. Te rog încearcă din nou.");
        setMentorStatus('idle');
        return;
      }

      if (text.trim().length < 3) {
        toast.error("Mesajul este prea scurt. Te rog vorbește mai mult.");
        setMentorStatus('idle');
        return;
      }
      
      // Afișează textul transcris în toast pentru confirmare
      toast.success(`Am înțeles: "${text}"`);
      
      // Adaugă mesajul user-ului
      const userMessage: Message = {
        role: 'user',
        content: text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Step 2: Trimite la GPT pentru răspuns
      await sendMessageToMentor(text);
      
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error("Nu am putut transcrie audio-ul");
      setMentorStatus('idle');
    }
  };

  // Trimite mesaj text
  const sendTextMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    await sendMessageToMentor(inputText);
  };

  // Comunică cu AI Mentor
  const sendMessageToMentor = async (message: string) => {
    try {
      setMentorStatus('thinking');
      console.log('📤 Trimit mesaj la mentor:', message.substring(0, 50));

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/ai-mentor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          message,
          conversationId,
        }),
      });

      console.log('📥 Răspuns primit:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Eroare chat:', errorData);
        throw new Error(errorData.error || 'Failed to chat with mentor');
      }

      const data = await response.json();
      console.log('✅ Date primite:', {
        conversationId: data.conversationId,
        messageLength: data.message?.length,
        totalMessages: data.messages?.length
      });
      
      // Setează conversationId pentru mesaje viitoare
      if (!conversationId) {
        setConversationId(data.conversationId);
      }

      // VALIDARE: Verifică dacă răspunsul este valid
      if (!data.message || data.message.trim().length === 0) {
        console.error('❌ Răspuns gol de la mentor');
        toast.error("Nu am primit un răspuns valid de la mentor");
        setMentorStatus('idle');
        return;
      }

      // Adaugă răspunsul asistentului
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      console.log('✅ Mesaj asistent adăugat:', data.message.substring(0, 50));

      // Generează și play audio
      await playAudioResponse(data.message);

    } catch (error) {
      console.error('Chat error:', error);
      toast.error("Nu am putut comunica cu mentorul");
      setMentorStatus('idle');
    }
  };

  // Generează și redă răspuns audio
  const playAudioResponse = async (text: string) => {
    try {
      setMentorStatus('speaking');
      console.log('🔊 Generez audio pentru:', text.substring(0, 50));

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      console.log('🎯 API URL:', `${apiUrl}/ai-mentor/speech`);

      const response = await fetch(`${apiUrl}/ai-mentor/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      console.log('📥 Răspuns TTS status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Eroare generare audio:', response.status, errorText);
        throw new Error(`Failed to generate speech: ${response.status}`);
      }

      const audioBlob = await response.blob();
      console.log('✅ Audio blob primit:', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      if (audioBlob.size === 0) {
        console.error('❌ Audio blob este gol!');
        throw new Error('Audio blob is empty');
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('🔗 Audio URL creat:', audioUrl);
      
      const audio = new Audio(audioUrl);
      
      audio.onloadeddata = () => {
        console.log('✅ Audio loaded, duration:', audio.duration);
      };

      audio.onended = () => {
        console.log('✅ Audio terminat de redat');
        setMentorStatus('idle');
        URL.revokeObjectURL(audioUrl); // Cleanup
      };

      audio.onerror = (err) => {
        console.error('❌ Eroare redare audio:', err);
        console.error('Audio error details:', {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState
        });
        setMentorStatus('idle');
        toast.error("Eroare la redarea audio-ului");
      };

      console.log('▶️ Încep redarea audio...');
      
      try {
        await audio.play();
        console.log('✅ Audio se redă!');
      } catch (playError) {
        console.error('❌ Eroare la play():', playError);
        
        // Handling pentru autoplay policy
        if (playError instanceof DOMException && playError.name === 'NotAllowedError') {
          console.warn('⚠️ Browser blocked autoplay. User interaction needed.');
          toast.error("Browser-ul a blocat redarea automată. Apasă pe ecran pentru a auzi răspunsul.", {
            duration: 5000,
          });
          
          // Încearcă să redai la prima interacțiune
          const playOnClick = async () => {
            try {
              await audio.play();
              document.removeEventListener('click', playOnClick);
            } catch (e) {
              console.error('Failed to play on click:', e);
            }
          };
          document.addEventListener('click', playOnClick, { once: true });
        } else {
          throw playError;
        }
      }

    } catch (error) {
      console.error('❌ TTS error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Nu am putut genera audio: ${errorMessage}`);
      setMentorStatus('idle');
    }
  };

  // Status indicator
  const getStatusInfo = () => {
    switch (mentorStatus) {
      case 'listening':
        return { text: 'Ascult...', color: 'bg-blue-500', icon: Mic };
      case 'thinking':
        return { text: 'Gândesc...', color: 'bg-yellow-500', icon: Loader2 };
      case 'speaking':
        return { text: 'Vorbesc...', color: 'bg-green-500', icon: Volume2 };
      default:
        return { text: 'Pregătit', color: 'bg-gray-400', icon: Sparkles };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Mentor
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vorbește cu mentorul tău AI! Explică-mi ce dificultăți întâmpini la cod și te voi ajuta pas cu pas.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
            {/* Avatar Video Section */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 flex items-center justify-center">
                  {avatarVideoUrl ? (
                    <video
                      ref={videoRef}
                      src={avatarVideoUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                    />
                  ) : (
                    <div className="text-center p-8">
                      {/* Avatar animat */}
                      <div className="relative w-48 h-48 mx-auto mb-6">
                        {/* Cap */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 shadow-2xl flex items-center justify-center">
                          {/* Față */}
                          <div className="relative w-full h-full flex flex-col items-center justify-center">
                            {/* Ochi */}
                            <div className="flex gap-8 mb-4">
                              <div className={`w-6 h-6 bg-white rounded-full flex items-center justify-center transition-all animate-blink ${
                                mentorStatus === 'listening' ? 'scale-110' : ''
                              }`}>
                                <div className={`w-3 h-3 bg-gray-900 rounded-full transition-all ${
                                  mentorStatus === 'thinking' ? 'animate-bounce' : ''
                                }`} />
                              </div>
                              <div className={`w-6 h-6 bg-white rounded-full flex items-center justify-center transition-all animate-blink ${
                                mentorStatus === 'listening' ? 'scale-110' : ''
                              }`}>
                                <div className={`w-3 h-3 bg-gray-900 rounded-full transition-all ${
                                  mentorStatus === 'thinking' ? 'animate-bounce' : ''
                                }`} />
                              </div>
                            </div>
                          
                          {/* Gură - animată când vorbește */}
                          <div className="relative">
                            {mentorStatus === 'speaking' ? (
                              <div className="relative">
                                <div className="w-12 h-8 bg-gray-900 rounded-full animate-talk" />
                                <div className="absolute -inset-1 w-14 h-10 bg-gray-800 rounded-full opacity-30 animate-pulse" />
                              </div>
                            ) : (
                              <div className={`w-10 h-3 bg-gray-900 rounded-full transition-all ${
                                mentorStatus === 'listening' ? 'w-12 h-5 rounded-lg' : ''
                              }`} />
                            )}
                          </div>
                        </div>
                        </div>
                        
                        {/* Efecte de undă când vorbește */}
                        {mentorStatus === 'speaking' && (
                          <>
                            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-75" />
                            <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-pulse" />
                          </>
                        )}
                        
                        {/* Efecte de undă când ascultă */}
                        {mentorStatus === 'listening' && (
                          <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-pulse" />
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {mentorStatus === 'speaking' ? '🗣️ Îți răspund...' : 
                         mentorStatus === 'listening' ? '👂 Te ascult...' :
                         mentorStatus === 'thinking' ? '🤔 Mă gândesc...' :
                         'Bună! Sunt profesorul tău AI'}
                      </h3>
                      <p className="text-gray-300">
                        {mentorStatus === 'idle' ? 
                          'Apasă pe butonul de microfon sau scrie-mi un mesaj pentru a începe' :
                          'Procesez răspunsul tău...'}
                      </p>
                    </div>
                  )}
                  
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`${statusInfo.color} text-white flex items-center gap-2`}>
                      <StatusIcon className={`h-3 w-3 ${mentorStatus === 'thinking' ? 'animate-spin' : ''}`} />
                      {statusInfo.text}
                    </Badge>
                  </div>
                </div>

                {/* Controls */}
                <div className="p-6 bg-card space-y-4">
                  <div className="flex items-center gap-3">
                    <Button
                      size="lg"
                      variant={isRecording ? "destructive" : "default"}
                      className="flex-1"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={mentorStatus === 'thinking' || mentorStatus === 'speaking'}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="mr-2 h-5 w-5" />
                          Oprește Înregistrarea
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-5 w-5" />
                          🎙️ Vorbește cu mine
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-end gap-2">
                    <Textarea
                      placeholder="Sau scrie-mi mesajul tău aici..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendTextMessage();
                        }
                      }}
                      className="min-h-[60px]"
                      disabled={mentorStatus !== 'idle'}
                    />
                    <Button
                      onClick={sendTextMessage}
                      disabled={!inputText.trim() || mentorStatus !== 'idle'}
                      size="lg"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Log Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Transcript Conversație
                </CardTitle>
                <CardDescription>
                  Istoricul discuției tale cu mentorul AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
                  <AnimatePresence>
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Conversația ta va apărea aici</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] p-3 rounded-lg ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {msg.role === 'assistant' && (
                                  <Sparkles className="h-4 w-4 mt-1 flex-shrink-0" />
                                )}
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              </div>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString('ro-RO')}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Tips Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>💡 Sfaturi pentru o conversație eficientă</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold mb-2">🎯 Fii Specific</h4>
                  <p className="text-sm text-muted-foreground">
                    Descrie exact ce problemă ai întâmpinat și ce ai încercat deja
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <h4 className="font-semibold mb-2">📝 Arată Codul</h4>
                  <p className="text-sm text-muted-foreground">
                    Poți copia-paste fragmente de cod în chat pentru analiză detaliată
                  </p>
                </div>
                <div className="p-4 bg-pink-50 dark:bg-pink-950 rounded-lg">
                  <h4 className="font-semibold mb-2">❓ Pune Întrebări</h4>
                  <p className="text-sm text-muted-foreground">
                    Nu există întrebări proaste! Întreabă orice legat de programare
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIMentor;
