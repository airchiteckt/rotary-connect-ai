import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, CreditCard, Clock, CheckCircle, AlertCircle, Settings, Plus, Calendar } from 'lucide-react';
import { format, addYears, isAfter, isBefore } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FeeSettingsDialog from './FeeSettingsDialog';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  membership_start_date: string;
  status: string;
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
  members: {
    first_name: string;
    last_name: string;
  };
}

interface MemberFeesManagerProps {
  onStatsUpdate?: (stats: any) => void;
}

export default function MemberFeesManager({ onStatsUpdate }: MemberFeesManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [memberFees, setMemberFees] = useState<MemberFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [generatingFees, setGeneratingFees] = useState(false);

  const ANNUAL_FEE_AMOUNT = 50; // Default annual fee amount

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
        .order('first_name');

      if (membersError) throw membersError;

      // Load member fees
      const { data: feesData, error: feesError } = await supabase
        .from('member_fees')
        .select(`
          *,
          members!inner(first_name, last_name)
        `)
        .order('due_date', { ascending: false });

      if (feesError) throw feesError;

      setMembers(membersData || []);
      setMemberFees(feesData || []);

      // Update statistics
      if (onStatsUpdate && feesData) {
        const pendingFees = feesData.filter(fee => fee.status === 'pending').length;
        const overdueFees = feesData.filter(fee => fee.status === 'overdue').length;
        const paidFees = feesData.filter(fee => fee.status === 'paid').length;
        
        onStatsUpdate({
          pending_fees: pendingFees,
          overdue_fees: overdueFees,
          paid_fees: paidFees
        });
      }

    } catch (error) {
      console.error('Errore nel caricamento dati:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati delle quote.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAnnualFees = async () => {
    if (!user) return;

    setGeneratingFees(true);
    try {
      const currentYear = new Date().getFullYear();
      const feesToCreate = [];

      for (const member of members) {
        // Check if member already has fee for current year
        const existingFee = memberFees.find(fee => 
          fee.member_id === member.id && 
          fee.fee_type === 'annual' && 
          new Date(fee.due_date).getFullYear() === currentYear
        );

        if (!existingFee) {
          // Calculate due date based on membership start date
          const membershipStart = new Date(member.membership_start_date);
          let dueDate = new Date(membershipStart);
          
          // Set due date to the anniversary of membership start in current year
          dueDate.setFullYear(currentYear);
          
          // If anniversary has passed, set for next year
          if (isBefore(dueDate, new Date())) {
            dueDate = addYears(dueDate, 1);
          }

          feesToCreate.push({
            user_id: user.id,
            member_id: member.id,
            fee_type: 'annual',
            amount: ANNUAL_FEE_AMOUNT,
            due_date: format(dueDate, 'yyyy-MM-dd'),
            status: isAfter(new Date(), dueDate) ? 'overdue' : 'pending',
            notes: `Quota annuale ${currentYear} - Generata automaticamente`
          });
        }
      }

      if (feesToCreate.length > 0) {
        const { error } = await supabase
          .from('member_fees')
          .insert(feesToCreate);

        if (error) throw error;

        toast({
          title: "Successo",
          description: `Generate ${feesToCreate.length} quote annuali.`,
        });

        await loadData();
      } else {
        toast({
          title: "Informazione",
          description: "Tutte le quote annuali sono già state generate.",
        });
      }

    } catch (error) {
      console.error('Errore nella generazione quote:', error);
      toast({
        title: "Errore",
        description: "Impossibile generare le quote annuali.",
        variant: "destructive",
      });
    } finally {
      setGeneratingFees(false);
    }
  };

  const markFeeAsPaid = async (feeId: string) => {
    try {
      const { error } = await supabase
        .from('member_fees')
        .update({
          status: 'paid',
          paid_date: format(new Date(), 'yyyy-MM-dd'),
          payment_method: 'Contanti'
        })
        .eq('id', feeId);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Quota marcata come pagata.",
      });

      await loadData();
    } catch (error) {
      console.error('Errore nell\'aggiornamento quota:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato della quota.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = isAfter(new Date(), new Date(dueDate)) && status === 'pending';
    
    if (isOverdue) {
      return <Badge variant="destructive">Scaduta</Badge>;
    }

    const statusConfig = {
      pending: { label: 'In Attesa', variant: 'secondary' as const },
      paid: { label: 'Pagata', variant: 'default' as const },
      overdue: { label: 'Scaduta', variant: 'destructive' as const },
      waived: { label: 'Esentata', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Gestione Quote Soci</span>
              </CardTitle>
              <CardDescription>
                Gestisci le quote associative e monitora i pagamenti
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Impostazioni
              </Button>
              <Button onClick={generateAnnualFees} disabled={generatingFees}>
                {generatingFees ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Genera Quote Annuali
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {memberFees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nessuna quota registrata</h3>
              <p className="text-sm mb-4">
                Inizia generando le quote annuali per i soci attivi
              </p>
              <Button onClick={generateAnnualFees} disabled={generatingFees}>
                <Plus className="w-4 h-4 mr-2" />
                Genera Quote Annuali
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Totale Quote',
                    value: memberFees.length,
                    icon: CreditCard,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100'
                  },
                  {
                    label: 'In Attesa',
                    value: memberFees.filter(fee => fee.status === 'pending').length,
                    icon: Clock,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-100'
                  },
                  {
                    label: 'Pagate',
                    value: memberFees.filter(fee => fee.status === 'paid').length,
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100'
                  },
                  {
                    label: 'Scadute',
                    value: memberFees.filter(fee => 
                      (fee.status === 'pending' || fee.status === 'overdue') &&
                      isAfter(new Date(), new Date(fee.due_date))
                    ).length,
                    icon: AlertCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100'
                  }
                ].map((stat, index) => (
                  <div key={index} className="bg-card rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <div className={`p-2 ${stat.bgColor} rounded-full`}>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fees Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Socio</TableHead>
                      <TableHead>Tipo Quota</TableHead>
                      <TableHead>Importo</TableHead>
                      <TableHead>Scadenza</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Data Pagamento</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberFees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">
                          {fee.members.first_name} {fee.members.last_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {fee.fee_type === 'annual' ? 'Quota Annuale' : fee.fee_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(fee.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{format(new Date(fee.due_date), 'dd/MM/yyyy', { locale: it })}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(fee.status, fee.due_date)}
                        </TableCell>
                        <TableCell>
                          {fee.paid_date ? (
                            format(new Date(fee.paid_date), 'dd/MM/yyyy', { locale: it })
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {fee.status === 'pending' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Segna come Pagata
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Conferma Pagamento</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Sei sicuro di voler segnare questa quota come pagata?
                                    Questa azione aggiornerà lo stato della quota.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => markFeeAsPaid(fee.id)}>
                                    Conferma Pagamento
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <FeeSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdate={loadData}
      />
    </>
  );
}