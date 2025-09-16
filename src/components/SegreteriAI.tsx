import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Play, Pause, Square, Save, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RecordingSession {
  transcript: string;
  confidence: number;
  duration: number;
  startTime: Date;
  endTime?: Date;
}

export default function SegreteriAI() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [sessions, setSessions] = useState<RecordingSession[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState<'verbali' | 'comunicazioni'>('verbali');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = new Date();
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Registrazione avviata",
        description: "Sto registrando la riunione...",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Errore",
        description: "Impossibile avviare la registrazione. Verifica i permessi del microfono.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const processRecording = async () => {
    if (chunksRef.current.length === 0) return;

    setIsTranscribing(true);
    
    try {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Call transcription API
        const { data, error } = await supabase.functions.invoke('speech-to-text', {
          body: { 
            audioBase64: base64Audio,
            language: 'it-IT'
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        const newSession: RecordingSession = {
          transcript: data.transcript || '',
          confidence: data.confidence || 0,
          duration: recordingTime,
          startTime: startTimeRef.current || new Date(),
          endTime: new Date()
        };

        setSessions(prev => [...prev, newSession]);
        setCurrentTranscript(prev => prev + '\n\n' + data.transcript);

        toast({
          title: "Trascrizione completata",
          description: `Trascritte ${data.wordCount} parole con confidenza ${Math.round(data.confidence * 100)}%`,
        });
      };

      reader.onerror = () => {
        throw new Error('Errore nella lettura del file audio');
      };

      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "Errore trascrizione",
        description: error.message || "Errore durante la trascrizione dell'audio",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const saveAsDocument = async () => {
    if (!currentTranscript.trim() || !documentTitle.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un titolo e assicurati di avere una trascrizione",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('documents')
        .insert({
          title: documentTitle,
          type: documentType,
          content: currentTranscript,
          status: 'draft',
          user_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Documento salvato",
        description: `"${documentTitle}" è stato salvato come bozza`,
      });

      setDocumentTitle('');
      setCurrentTranscript('');
      setSessions([]);

    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio del documento",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadTranscript = () => {
    if (!currentTranscript.trim()) return;
    
    const element = document.createElement('a');
    const file = new Blob([currentTranscript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `trascrizione_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Registrazione Riunione
          </CardTitle>
          <CardDescription>
            Registra e trascrivi automaticamente le tue riunioni
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <Button 
                onClick={startRecording} 
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Mic className="w-5 h-5 mr-2" />
                Inizia Registrazione
              </Button>
            ) : (
              <>
                <Button 
                  onClick={pauseRecording}
                  variant="outline"
                  size="lg"
                >
                  {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                  {isPaused ? 'Riprendi' : 'Pausa'}
                </Button>
                <Button 
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Ferma
                </Button>
              </>
            )}
          </div>
          
          {isRecording && (
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-red-600">
                {formatTime(recordingTime)}
              </div>
              <div className="flex items-center justify-center mt-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm text-muted-foreground">
                  {isPaused ? 'In pausa' : 'Registrando...'}
                </span>
              </div>
            </div>
          )}

          {isTranscribing && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Trascrizione in corso...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session History */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sessioni di Registrazione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Sessione {index + 1}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {formatTime(session.duration)}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(session.confidence * 100)}% confidenza
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.startTime.toLocaleTimeString('it-IT')} - {session.endTime?.toLocaleTimeString('it-IT')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      {currentTranscript && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Trascrizione</CardTitle>
              <Button 
                onClick={downloadTranscript}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Scarica
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={currentTranscript}
              onChange={(e) => setCurrentTranscript(e.target.value)}
              rows={10}
              className="w-full resize-y"
              placeholder="La trascrizione apparirà qui..."
            />
          </CardContent>
        </Card>
      )}

      {/* Save as Document */}
      {currentTranscript && (
        <Card>
          <CardHeader>
            <CardTitle>Salva come Documento</CardTitle>
            <CardDescription>
              Salva la trascrizione come documento ufficiale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="document-title">Titolo Documento</Label>
                <Input
                  id="document-title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="es. Verbale Consiglio Direttivo del..."
                />
              </div>
              <div>
                <Label htmlFor="document-type">Tipo Documento</Label>
                <select
                  id="document-type"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as 'verbali' | 'comunicazioni')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="verbali">Verbale</option>
                  <option value="comunicazioni">Comunicazione</option>
                </select>
              </div>
            </div>
            
            <Button 
              onClick={saveAsDocument}
              className="w-full"
              disabled={!documentTitle.trim() || !currentTranscript.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Salva Documento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}