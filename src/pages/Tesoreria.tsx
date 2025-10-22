import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, Search, Filter, ArrowLeft, TrendingUp, TrendingDown, PieChart, Users, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import TransactionDialog from '@/components/TransactionDialog';
import MemberFeesManager from '@/components/MemberFeesManager';
import { useComingSoonToast } from '@/components/ComingSoonToast';
import HelpSupport from '@/components/HelpSupport';
import { SectionResponsible } from '@/components/SectionResponsible';

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

interface MemberFee {
  id: string;
  member_id: string;
  fee_type: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  members: {
    first_name: string;
    last_name: string;
  };
}

interface FinancialStats {
  total_income: number;
  total_expenses: number;
  current_balance: number;
  pending_fees: number;
  overdue_fees_count: number;
}

export default function Tesoreria() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showComingSoon } = useComingSoonToast();
  const [activeTab, setActiveTab] = useState('bilancio');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [memberFees, setMemberFees] = useState<MemberFee[]>([]);
  const [financialStats, setFinancialStats] = useState<FinancialStats>({
    total_income: 0,
    total_expenses: 0,
    current_balance: 0,
    pending_fees: 0,
    overdue_fees_count: 0
  });
  const [loadingData, setLoadingData] = useState(true);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');

  const fetchFinancialData = async () => {
    if (!user) return;

    try {
      setLoadingData(true);

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;

      // Fetch member fees with member info
      const { data: feesData, error: feesError } = await supabase
        .from('member_fees')
        .select(`
          *,
          members!inner(first_name, last_name)
        `)
        .order('due_date', { ascending: false });

      if (feesError) throw feesError;

      setTransactions((transactionsData as Transaction[]) || []);
      setMemberFees((feesData as MemberFee[]) || []);

      // Calculate financial statistics
      const totalIncome = transactionsData
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

      const totalExpenses = transactionsData
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

      const pendingFees = feesData
        ?.filter(f => f.status === 'pending')
        .reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0) || 0;

      const overdueFees = feesData
        ?.filter(f => f.status === 'overdue').length || 0;

      setFinancialStats({
        total_income: totalIncome,
        total_expenses: totalExpenses,
        current_balance: totalIncome - totalExpenses,
        pending_fees: pendingFees,
        overdue_fees_count: overdueFees
      });

    } catch (error) {
      console.error('Errore nel caricamento dei dati finanziari:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati finanziari.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'In Attesa', variant: 'secondary' as const },
      paid: { label: 'Pagato', variant: 'default' as const },
      overdue: { label: 'Scaduto', variant: 'destructive' as const },
      waived: { label: 'Esentato', variant: 'outline' as const }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' };
  };

  const treasuryStats = [
    { 
      label: 'Entrate Totali', 
      value: formatCurrency(financialStats.total_income), 
      trend: 'up' as const, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      icon: TrendingUp
    },
    { 
      label: 'Uscite Totali', 
      value: formatCurrency(financialStats.total_expenses), 
      trend: 'down' as const, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      icon: TrendingDown
    },
    { 
      label: 'Saldo Attuale', 
      value: formatCurrency(financialStats.current_balance), 
      trend: 'neutral' as const, 
      color: financialStats.current_balance >= 0 ? 'text-green-600' : 'text-red-600', 
      bgColor: financialStats.current_balance >= 0 ? 'bg-green-100' : 'bg-red-100',
      icon: DollarSign
    },
    { 
      label: 'Quote Attese', 
      value: formatCurrency(financialStats.pending_fees), 
      trend: 'neutral' as const, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      icon: Clock
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Tesoreria</h1>
                <p className="text-sm text-muted-foreground">Gestione finanziaria e tracking quote soci</p>
              </div>
            </div>
            
            <Button onClick={() => {
              setTransactionType('income');
              setIsTransactionDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nuova Transazione
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SectionResponsible section="tesoreria" />
        
        {/* Financial Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {treasuryStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-2 ${stat.bgColor} rounded-full`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overdue Fees Alert */}
        {financialStats.overdue_fees_count > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">
                    Attenzione: {financialStats.overdue_fees_count} quote scadute
                  </p>
                  <p className="text-sm text-red-700">
                    Ci sono delle quote soci in scadenza che richiedono attenzione.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bilancio">Bilancio</TabsTrigger>
            <TabsTrigger value="transazioni">Transazioni</TabsTrigger>
            <TabsTrigger value="quote">Quote Soci</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="bilancio" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Nuova Entrata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setTransactionType('income');
                      setIsTransactionDialogOpen(true);
                    }}
                  >
                    Registra Entrata
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Nuova Uscita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setTransactionType('expense');
                      setIsTransactionDialogOpen(true);
                    }}
                  >
                    Registra Uscita
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Gestisci Quote
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('quote')}
                  >
                    Quote Soci
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Ultime Transazioni</CardTitle>
                <CardDescription>
                  Panoramica delle entrate e uscite recenti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento transazioni...</p>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? 
                            <TrendingUp className="w-4 h-4 text-green-600" /> :
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          }
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.category} • {format(new Date(transaction.transaction_date), 'dd MMM yyyy', { locale: it })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          {transaction.payment_method && (
                            <p className="text-xs text-muted-foreground">{transaction.payment_method}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessuna transazione registrata</p>
                    <p className="text-sm">Inizia registrando le prime entrate e uscite</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transazioni" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Cerca transazioni..." 
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtri
                  </Button>
                  <Button variant="outline">
                    Esporta
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storico Transazioni</CardTitle>
                <CardDescription>
                  Tutte le entrate e uscite del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento...</p>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'income' ? 
                              <TrendingUp className="w-4 h-4 text-green-600" /> :
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.category} • {format(new Date(transaction.transaction_date), 'dd MMMM yyyy', { locale: it })}
                            </p>
                            {transaction.reference_number && (
                              <p className="text-xs text-muted-foreground">Rif: {transaction.reference_number}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          {transaction.payment_method && (
                            <p className="text-xs text-muted-foreground">{transaction.payment_method}</p>
                          )}
                          {transaction.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{transaction.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessuna transazione trovata</p>
                    <p className="text-sm">Le transazioni appariranno qui una volta registrate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quote" className="space-y-6">
            <MemberFeesManager onStatsUpdate={(stats) => {
              setFinancialStats(prev => ({
                ...prev,
                pending_fees: stats.pending_fees || 0,
                overdue_fees_count: stats.overdue_fees || 0
              }));
            }} />
          </TabsContent>

          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Budget</CardTitle>
                <CardDescription>
                  Pianificazione e monitoraggio budget per progetti e attività
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground cursor-pointer hover:bg-muted/50 rounded-lg transition-colors" onClick={() => showComingSoon("Funzionalità Budget", "Gestisci i budget per progetti e attività del club")}>
                  <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Funzionalità di budget in arrivo</p>
                  <p className="text-sm">Gestisci i budget per progetti e attività del club</p>
                  <Button variant="outline" className="mt-4">Clicca per info</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <TransactionDialog
        isOpen={isTransactionDialogOpen}
        onClose={() => setIsTransactionDialogOpen(false)}
        onSuccess={() => {
          fetchFinancialData();
          setIsTransactionDialogOpen(false);
        }}
        transactionType={transactionType}
      />
    </div>
  );
}