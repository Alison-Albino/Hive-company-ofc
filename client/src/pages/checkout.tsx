import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, CreditCard, Shield, CheckCircle } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ planType }: { planType: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      toast({
        title: "Erro no Pagamento",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      // Process the successful payment
      try {
        const response = await apiRequest("POST", "/api/process-payment-success", {
          paymentIntentId: result.paymentIntent.id,
          planType,
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Update local user data to avoid auth check failure
          if (data.user) {
            console.log('Updating localStorage with user data:', data.user);
            localStorage.setItem("hive_user", JSON.stringify(data.user));
          }
          
          toast({
            title: "Pagamento Realizado com Sucesso!",
            description: "Agora complete seu cadastro escolhendo suas categorias de atuação.",
          });
          
          console.log('Redirecting to select-categories in 2 seconds...');
          setTimeout(() => {
            // AMBOS os planos devem ir para seleção de categorias
            console.log('Now redirecting to select-categories');
            setLocation('/select-categories');
          }, 2000);
        } else {
          throw new Error(data.message || 'Payment processing failed');
        }
      } catch (error) {
        console.error('Error processing payment success:', error);
        toast({
          title: "Pagamento Processado",
          description: "Seu pagamento foi processado. Redirecionando para o dashboard...",
        });
        setTimeout(() => {
          // AMBOS os planos devem ir para seleção de categorias
          setLocation('/select-categories');
        }, 2000);
      }
    }

    setIsProcessing(false);
  };

  const planInfo = planType === 'A' 
    ? { name: 'BE HIVE', price: 'R$ 29', description: 'Prestador Pessoa Física (CPF)' }
    : { name: 'HIVE GOLD', price: 'R$ 59', description: 'Prestador Empresarial (CNPJ)' };

  return (
    <div className="max-w-md mx-auto">
      <Card className="mb-6">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">{planInfo.name}</CardTitle>
          <CardDescription className="text-gray-600">{planInfo.description}</CardDescription>
          <div className="text-3xl font-bold text-amber-600 mt-2">
            {planInfo.price}
            <span className="text-sm text-gray-500 font-normal">/mês</span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement 
              options={{
                layout: 'tabs'
              }}
            />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Pagamento seguro processado pelo Stripe</span>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600" 
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                `Assinar ${planInfo.name}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Checkout() {
  const [location] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();
  
  // Usar window.location.search para capturar os parâmetros corretamente
  const searchParams = new URLSearchParams(window.location.search);
  const planType = searchParams.get('plan') || 'A';
  
  // Debug para verificar o parâmetro do plano
  console.log('URL atual:', location);
  console.log('window.location.search:', window.location.search);
  console.log('Parâmetros da URL:', searchParams);
  console.log('Tipo de plano extraído:', planType);

  useEffect(() => {
    console.log('Creating subscription for plan type:', planType);
    
    // Create subscription intent with specific plan type
    apiRequest("POST", "/api/create-subscription", { planType })
      .then(async (response) => {
        const data = await response.json();
        console.log('Subscription response:', data);
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('Failed to create subscription - no client secret');
        }
      })
      .catch((error) => {
        console.error('Error creating subscription:', error);
        
        // Verificar se é um erro específico do Stripe
        if (error.message && error.message.includes('401')) {
          toast({
            title: "Login Necessário",
            description: "Você precisa fazer login para assinar um plano.",
            variant: "destructive",
          });
          // Redirecionar para login
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
        } else {
          toast({
            title: "Erro na Assinatura",
            description: "Não foi possível processar sua assinatura. Verifique se você está logado e tente novamente.",
            variant: "destructive",
          });
        }
      });
  }, [planType, toast]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Preparando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Assinatura</h1>
          <p className="text-gray-600">Complete seu pagamento para se tornar um prestador Hive</p>
        </div>
        
        {/* Make SURE to wrap the form in <Elements> which provides the stripe context. */}
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm planType={planType} />
        </Elements>
      </div>
    </div>
  );
}