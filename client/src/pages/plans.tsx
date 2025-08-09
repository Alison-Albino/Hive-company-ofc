import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type Plan } from "@shared/schema";

export default function Plans() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["/api/plans"],
  });

  const handleSubscribe = (planType: string) => {
    window.location.href = `/checkout?plan=${planType}`;
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 text-center">
                  <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-8 w-48 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto mb-4" />
                  <Skeleton className="h-10 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
                <div className="p-8">
                  <div className="space-y-4 mb-8">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-hive-black mb-4">Escolha seu Plano</h1>
          <p className="text-gray-600 text-lg">Planos flexíveis para autônomos e empresas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {(plans as Plan[] || []).map((plan: Plan) => (
            <div 
              key={plan.id} 
              className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                plan.popular ? 'border-2 border-hive-gold relative' : 'border-2 border-transparent hover:border-hive-gold'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-hive-gold text-white px-6 py-2 rounded-full text-sm font-semibold">
                  MAIS POPULAR
                </div>
              )}
              
              <div className={`p-8 text-center ${
                plan.popular 
                  ? 'bg-gradient-to-br from-hive-gold to-hive-gold-dark text-white' 
                  : 'bg-gradient-to-br from-gray-50 to-gray-100'
              }`}>
                <div className={`p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center ${
                  plan.popular ? 'bg-white' : 'bg-hive-gold'
                }`}>
                  <i className={`${plan.type === 'A' ? 'fas fa-user' : 'fas fa-building'} text-2xl ${
                    plan.popular ? 'text-hive-gold' : 'text-white'
                  }`}></i>
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-hive-black'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-4 ${plan.popular ? 'text-white/90' : 'text-gray-600'}`}>
                  Para {plan.targetAudience === 'CPF' ? 'profissionais independentes' : 'imobiliárias e construtoras'}
                </p>
                <div className={`text-4xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-hive-gold'}`}>
                  {formatPrice(plan.price)}
                </div>
                <p className={plan.popular ? 'text-white/80' : 'text-gray-500'}>/mês</p>
              </div>
              
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <i className="fas fa-check text-green-500 mr-3"></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSubscribe(plan.type)}
                  className="w-full bg-hive-gold hover:bg-hive-gold-dark text-white font-bold py-4 rounded-lg transition-colors duration-300"
                >
                  Assinar {plan.name}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  * Válido para {plan.targetAudience === 'CPF' ? 'pessoas físicas (CPF)' : 'empresas (CNPJ)'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-hive-black text-center mb-6">Formas de Pagamento Aceitas</h3>
          <div className="flex justify-center items-center space-x-8 flex-wrap gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <i className="fab fa-cc-visa text-2xl text-blue-600"></i>
              <span>Visa</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <i className="fab fa-cc-mastercard text-2xl text-red-600"></i>
              <span>Mastercard</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <i className="fas fa-credit-card text-2xl text-hive-gold"></i>
              <span>Cartão de Crédito</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <i className="fas fa-barcode text-2xl text-gray-600"></i>
              <span>Boleto</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <i className="fab fa-pix text-2xl text-green-600"></i>
              <span>PIX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
