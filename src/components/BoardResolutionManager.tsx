import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Vote, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Resolution {
  id: string;
  title: string;
  date: string;
  status: 'approved' | 'rejected' | 'pending';
  description?: string;
  votes_for?: number;
  votes_against?: number;
  votes_abstain?: number;
}

export const BoardResolutionManager = () => {
  const { toast } = useToast();
  const [resolutions] = useState<Resolution[]>([]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approvata</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Respinta</Badge>;
      default:
        return <Badge variant="secondary">In attesa</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Delibere del Direttivo</h3>
          <p className="text-sm text-muted-foreground">
            Gestisci le delibere e le decisioni del consiglio
          </p>
        </div>
        <Button onClick={() => {
          toast({
            title: "Funzionalità in sviluppo",
            description: "La gestione delle delibere sarà disponibile presto",
          });
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuova Delibera
        </Button>
      </div>

      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-purple-600" />
            Sistema di Votazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Registra le delibere del consiglio direttivo con sistema di votazione integrato
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Proposta</p>
              <p className="text-xs text-muted-foreground">Redigi la delibera</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Vote className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-medium">Votazione</p>
              <p className="text-xs text-muted-foreground">Registra i voti</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Archiviazione</p>
              <p className="text-xs text-muted-foreground">Storico delibere</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {resolutions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Vote className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Non ci sono delibere registrate. Crea la prima delibera del direttivo!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {resolutions.map((resolution) => (
            <Card key={resolution.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {resolution.title}
                      {getStatusBadge(resolution.status)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(resolution.date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              {resolution.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{resolution.description}</p>
                  {resolution.status !== 'pending' && (
                    <div className="flex gap-4 text-xs">
                      <span className="text-green-600">Favorevoli: {resolution.votes_for || 0}</span>
                      <span className="text-red-600">Contrari: {resolution.votes_against || 0}</span>
                      <span className="text-gray-600">Astenuti: {resolution.votes_abstain || 0}</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};