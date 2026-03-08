import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, Search, Filter, TrendingUp, TrendingDown, Users, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import TransactionDialog from '@/components/TransactionDialog';
import MemberFeesManager from '@/components/MemberFeesManager';
import { useComingSoonToast } from '@/components/ComingSoonToast';
import { SectionResponsible } from '@/components/SectionResponsible';
import SectionPageLayout from '@/components/shared/SectionPageLayout';
import SectionPageHeader from '@/components/shared/SectionPageHeader';
import SectionStatsGrid from '@/components/shared/SectionStatsGrid';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  transaction_date: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  user_id: string;
  member_id?: string;
  created_at: string;
  updated_at: string;
}

interface FinancialStats {
  total_income: number;
  total_expenses: number;
  current_balance: number;
  pending_fees: number;
  overdue_fees_count: number;
}

export default function Tesoreria() {
  return (
    <SectionPageLayout bgGradient="bg-gradient-to-br from-emerald-50 to-green-100">
      {(user) => <TesoreriaContent user={user} />}
    </SectionPageLayout>
  );
}

function TesoreriaContent({ user }: { user: { id: string } }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showComingSoon } = useComingSoonToast();
  const [activeTab, setActiveTab] = useState('bilancio');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financialStats, setFinancialStats] = useState<FinancialStats>({
    total_income: 0, total_expenses: 0, current_balance: 0, pending_fees: 0, overdue_fees_count: 0
  });
  const [loadingData, setLoadingData] = useState(true);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');

  const fetchFinancialData = async () => {
    try {
      setLoadingData(true);
      const [{ data: transactionsData, error: tErr }, { data: feesData, error: fErr }] = await Promise.all([
        supabase.from('transactions').select('*').order('transaction_date', { ascending: false }).limit(50),
        supabase.from('member_fees').select('*, members!inner(first_name, last_name)').order('due_date', { ascending: false }),
      ]);
      if (tErr) throw tErr;
      if (fErr) throw fErr;

      setTransactions((transactionsData as Transaction[]) || []);

      const totalIncome = transactionsData?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const totalExpenses = transactionsData?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const pendingFees = feesData?.filter(f => f.status === 'pending').reduce((s, f) => s + Number(f.amount), 0) || 0;
      const overdueFees = feesData?.filter(f => f.status === 'overdue').length || 0;

      setFinancialStats({
        total_income: totalIncome, total_expenses: totalExpenses,
        current_balance: totalIncome - totalExpenses, pending_fees: pendingFees,
        overdue_fees_count: overdueFees
      });
    } catch (error) {
      console.error('Errore nel caricamento dei dati finanziari:', error);
      toast({ title: "Errore", description: "Impossibile caricare i dati finanziari.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { fetchFinancialData(); }, [user]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);

  const treasuryStats = [
    { label: 'Entrate Totali', value: formatCurrency(financialStats.total_income), color: 'text-green-600', bgColor: 'bg-green-100', icon: TrendingUp },
    { label: 'Uscite Totali', value: formatCurrency(financialStats.total_expenses), color: 'text-red-600', bgColor: 'bg-red-100', icon: TrendingDown },
    { label: 'Saldo Attuale', value: formatCurrency(financialStats.current_balance), color: financialStats.current_balance >= 0 ? 'text-green-600' : 'text-red-600', bgColor: financialStats.current_balance >= 0 ? 'bg-green-100' : 'bg-red-100', icon: DollarSign },
    { label: 'Quote Attese', value: formatCurrency(financialStats.pending_fees), color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Clock },
  ];

  return (
    <>
      <SectionPageHeader
        title="Tesoreria"
        subtitle="Gestione finanziaria e tracking quote soci"
        icon={DollarSign}
        iconColor="bg-emerald-600"
        actions={
          <Button size="sm" onClick={() => { setTransactionType('income'); setIsTransactionDialogOpen(true); }}>
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuova Transazione</span>
          </Button>
        }
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <SectionResponsible section="tesoreria" />
        <SectionStatsGrid stats={treasuryStats} loading={loadingData} />

        {financialStats.overdue_fees_count > 0 && (
          <Card className="mb-4 sm:mb-6 border-red-200 bg-red-50/50">
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800 text-sm sm:text-base">
                    Attenzione: {financialStats.overdue_fees_count} quote scadute
                  </p>
                  <p className="text-xs sm:text-sm text-red-700">
                    Ci sono delle quote soci in scadenza che richiedono attenzione.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-4">
              <TabsTrigger value="bilancio" className="text-xs sm:text-sm">Bilancio</TabsTrigger>
              <TabsTrigger value="transazioni" className="text-xs sm:text-sm">Transazioni</TabsTrigger>
              <TabsTrigger value="quote" className="text-xs sm:text-sm">Quote Soci</TabsTrigger>
              <TabsTrigger value="budget" className="text-xs sm:text-sm">Budget</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="bilancio" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => { setTransactionType('income'); setIsTransactionDialogOpen(true); }}>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-600" />Nuova Entrata</CardTitle></CardHeader>
                <CardContent><Button className="w-full" variant="outline" size="sm">Registra Entrata</Button></CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => { setTransactionType('expense'); setIsTransactionDialogOpen(true); }}>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-600" />Nuova Uscita</CardTitle></CardHeader>
                <CardContent><Button className="w-full" variant="outline" size="sm">Registra Uscita</Button></CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab('quote')}>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" />Gestisci Quote</CardTitle></CardHeader>
                <CardContent><Button className="w-full" variant="outline" size="sm">Quote Soci</Button></CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Ultime Transazioni</CardTitle>
                <CardDescription>Panoramica delle entrate e uscite recenti</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Caricamento transazioni...</p>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-2 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {t.type === 'income' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{t.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {t.category} • {format(new Date(t.transaction_date), 'dd MMM yyyy', { locale: it })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessuna transazione registrata</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transazioni" className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cerca transazioni..." className="pl-10" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtri</Button>
                    <Button variant="outline" size="sm">Esporta</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Storico Transazioni</CardTitle>
                <CardDescription>Tutte le entrate e uscite del club</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-2 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {t.type === 'income' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{t.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {t.category} • {format(new Date(t.transaction_date), 'dd MMM yyyy', { locale: it })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </p>
                          {t.payment_method && <p className="text-xs text-muted-foreground">{t.payment_method}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessuna transazione</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quote" className="space-y-6">
            <MemberFeesManager />
          </TabsContent>

          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Budget</CardTitle>
                <CardDescription>Pianifica e monitora il budget del club</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Gestione budget in preparazione</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <TransactionDialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
        transactionType={transactionType}
        onTransactionSaved={fetchFinancialData}
      />
    </>
  );
}
