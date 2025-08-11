import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Badge component inline since it may not exist
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

// Alert Dialog components inline
const AlertDialog = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const AlertDialogTrigger = ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) => <div>{children}</div>;
const AlertDialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">{children}</div>
  </div>
);
const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => <div className="mb-4">{children}</div>;
const AlertDialogTitle = ({ children }: { children: React.ReactNode }) => <h2 className="text-lg font-semibold">{children}</h2>;
const AlertDialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={`text-sm text-gray-600 mt-2 ${className}`}>{children}</div>;
const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => <div className="flex justify-end gap-2 mt-6">{children}</div>;
const AlertDialogCancel = ({ children }: { children: React.ReactNode }) => <Button variant="outline">{children}</Button>;
const AlertDialogAction = ({ children, onClick, className, disabled }: { children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) => <Button onClick={onClick} className={className} disabled={disabled}>{children}</Button>;

import { Crown, Calendar, CreditCard, AlertTriangle, CheckCircle, X, Clock, Shield } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Subscription {
  id: string;
  userId: string;
  planType: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  cancellationDeadline: string;
  price: string;
  autoRenew: boolean;
  cancelledAt?: string;
}

export default function SubscriptionDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("hive_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Get subscription status
  const { data: subscriptionStatus, isLoading } = useQuery({
    queryKey: ['/api/subscriptions/status', user?.id],
    enabled: !!user?.id,
  });

  // Get subscription history
  const { data: subscriptionHistory } = useQuery({
    queryKey: ['/api/subscriptions/history', user?.id],
    enabled: !!user?.id,
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await apiRequest("POST", `/api/subscriptions/${subscriptionId}/cancel`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Assinatura Cancelada",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/status'] });
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/history'] });
      } else {
        toast({
          title: "Erro no Cancelamento",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Cancellation error:', error);
      toast({
        title: "Erro no Cancelamento",
        description: "Houve um erro ao cancelar a assinatura",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!subscriptionStatus || !subscriptionStatus.valid) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma Assinatura Ativa</h1>
          <p className="text-gray-600 mb-6">Você não possui uma assinatura ativa no momento.</p>
          <Button onClick={() => window.location.href = '/plans'}>
            Ver Planos Disponíveis
          </Button>
        </div>
      </div>
    );
  }

  const subscription = subscriptionStatus.subscription as Subscription;
  const startDate = new Date(subscription.startDate);
  const endDate = new Date(subscription.endDate);
  const cancellationDeadline = new Date(subscription.cancellationDeadline);
  const now = new Date();
  
  const daysRemaining = differenceInDays(endDate, now);
  const canCancel = subscriptionStatus.canCancel && now <= cancellationDeadline;
  const daysToCancel = canCancel ? differenceInDays(cancellationDeadline, now) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'cancellation_pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Cancelamento Pendente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>;
    }
  };

  const planInfo = subscription.planType === 'A' 
    ? { name: 'BE HIVE', color: 'amber', icon: Crown }
    : { name: 'HIVE GOLD', color: 'yellow', icon: Crown };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Minha Assinatura</h1>

        {/* Current Subscription Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-${planInfo.color}-100 rounded-full flex items-center justify-center`}>
                  <planInfo.icon className={`h-6 w-6 text-${planInfo.color}-600`} />
                </div>
                <div>
                  <CardTitle className="text-xl">{subscription.planName}</CardTitle>
                  <CardDescription>Plano {subscription.planType === 'A' ? 'CPF' : 'CNPJ'}</CardDescription>
                </div>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Valor Mensal</p>
                  <p className="font-semibold">R$ {subscription.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Vigência</p>
                  <p className="font-semibold">{daysRemaining} dias restantes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Renovação</p>
                  <p className="font-semibold">
                    {format(endDate, 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>

            {/* Cancellation Information */}
            {canCancel && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Cancelamento Gratuito</h3>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  Você ainda pode cancelar sua assinatura gratuitamente por mais {daysToCancel} dias 
                  (até {format(cancellationDeadline, 'dd/MM/yyyy', { locale: ptBR })}).
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                      <X className="h-4 w-4 mr-2" />
                      Cancelar Assinatura
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>Tem certeza que deseja cancelar sua assinatura {subscription.planName}?</p>
                        <p className="text-sm text-gray-600">
                          • O cancelamento é gratuito dentro do período de 7 dias<br/>
                          • Sua assinatura permanecerá ativa até {format(endDate, 'dd/MM/yyyy', { locale: ptBR })}<br/>
                          • Após o cancelamento, você perderá acesso às funcionalidades do plano
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => cancelMutation.mutate(subscription.id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {!canCancel && subscription.status === 'active' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">Período de Cancelamento Expirado</h3>
                </div>
                <p className="text-sm text-gray-600">
                  O período gratuito de cancelamento de 7 dias já expirou. Sua assinatura será renovada automaticamente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription History */}
        {subscriptionHistory && subscriptionHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Assinaturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionHistory.map((sub: Subscription) => (
                  <div key={sub.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{sub.planName}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(sub.startDate), 'dd/MM/yyyy', { locale: ptBR })} - {' '}
                        {format(new Date(sub.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">R$ {sub.price}</span>
                      {getStatusBadge(sub.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}