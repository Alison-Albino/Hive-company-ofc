import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type Plan } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Plans() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: plans, isLoading } = useQuery({
    queryKey: ["/api/plans"],
  });

  const handleSubscribe = (planType: string) => {
    console.log('Handle subscribe called with planType:', planType);
    
    // Se não estiver autenticado, redireciona para cadastro
    if (!isAuthenticated) {
      setLocation('/register');
      return;
    }
    
    // Se já for prestador, não permite contratar novamente
    if (user?.userType === "provider") {
      alert("Você já é um prestador Hive!");
      setLocation('/dashboard');
      return;
    }
    
    // Redireciona para checkout com parâmetro correto
    const checkoutUrl = `/checkout?plan=${planType}`;
    console.log('Redirecting to:', checkoutUrl);
    setLocation(checkoutUrl);
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

  if (isLoading || authLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 to-yellow-500 py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Torne-se um <span className="text-yellow-200">Prestador Hive</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Conecte-se com milhares de clientes e faça seu negócio crescer com a plataforma líder em serviços
          </p>
          {!isAuthenticated && (
            <div className="max-w-lg mx-auto p-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl">
              <p className="text-white text-lg font-medium">
                🚀 <strong>Novo por aqui?</strong> Crie sua conta e comece hoje mesmo!
              </p>
            </div>
          )}
          {user?.userType === "provider" && (
            <div className="max-w-lg mx-auto p-6 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-2xl">
              <p className="text-white text-lg font-medium">
                ✨ <strong>Bem-vindo de volta!</strong> Gerencie seu plano no dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">

        {/* Plans Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {(plans as Plan[] || []).map((plan: Plan) => (
            <div 
              key={plan.id} 
              className={`group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl ${
                plan.popular 
                  ? 'shadow-2xl border-4 border-gradient-to-r from-amber-400 to-yellow-500' 
                  : 'shadow-xl border border-gray-200 hover:border-amber-300'
              }`}
            >
              {plan.popular && (
                <>
                  {/* Popular Badge */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg mt-[18px] mb-[18px] pt-[8px] pb-[8px]">
                      ⭐ MAIS ESCOLHIDO
                    </div>
                  </div>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                </>
              )}
              
              {/* Header */}
              <div className={`relative p-10 text-center ${
                plan.popular 
                  ? 'bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-white' 
                  : 'bg-gradient-to-br from-gray-50 to-white'
              }`}>
                <div className={`inline-flex p-6 rounded-2xl mb-6 ${
                  plan.popular ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-amber-100 to-yellow-100'
                }`}>
                  <div className={`text-4xl ${plan.popular ? 'text-white' : 'text-amber-600'}`}>
                    {plan.type === 'A' ? '👨‍💼' : '🏢'}
                  </div>
                </div>
                
                <h3 className={`text-3xl font-bold mb-3 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                
                <p className={`text-lg mb-6 ${plan.popular ? 'text-white/90' : 'text-gray-600'}`}>
                  {plan.targetAudience === 'CPF' ? '🔥 Ideal para profissionais autônomos' : '🚀 Perfeito para empresas e imobiliárias'}
                </p>
                
                <div className="flex items-center justify-center mb-4">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-amber-600'}`}>
                    {formatPrice(plan.price)}
                  </span>
                  <span className={`text-lg ml-2 ${plan.popular ? 'text-white/80' : 'text-gray-500'}`}>
                    /mês
                  </span>
                </div>
                
                {plan.popular && (
                  <div className="text-white/90 text-sm font-medium">
                    💳 Primeira semana grátis!
                  </div>
                )}
              </div>
              
              {/* Features */}
              <div className="p-10">
                <div className="space-y-5 mb-10">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start group/feature">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4 group-hover/feature:bg-green-200 transition-colors">
                        <div className="w-3 h-3 bg-green-500 rounded-full group-hover/feature:scale-125 transition-transform"></div>
                      </div>
                      <span className="text-gray-700 font-medium group-hover/feature:text-gray-900 transition-colors">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => handleSubscribe(plan.type)}
                  className={`w-full h-14 text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-amber-500 hover:to-yellow-500 text-white shadow-lg'
                  }`}
                  disabled={user?.userType === "provider"}
                >
                  {!isAuthenticated ? '✨ Criar Conta e Começar' : 
                   user?.userType === "provider" ? '✅ Plano Ativo' : 
                   `🚀 Escolher ${plan.name}`}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-6 font-medium">
                  {plan.targetAudience === 'CPF' 
                    ? '📋 Documentação: CPF e dados pessoais' 
                    : '📋 Documentação: CNPJ e dados empresariais'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Por que escolher o Hive?
          </h3>
          <p className="text-gray-600 text-center mb-12 text-lg">
            Mais de 10.000 prestadores já confiam na nossa plataforma
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📈</span>
              </div>
              <h4 className="font-bold text-xl mb-2 text-gray-900">Mais Clientes</h4>
              <p className="text-gray-600">Conecte-se com milhares de pessoas que precisam dos seus serviços</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💳</span>
              </div>
              <h4 className="font-bold text-xl mb-2 text-gray-900">Pagamento Fácil</h4>
              <p className="text-gray-600">Receba pagamentos direto na sua conta, sem complicações</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🛡️</span>
              </div>
              <h4 className="font-bold text-xl mb-2 text-gray-900">100% Seguro</h4>
              <p className="text-gray-600">Plataforma segura e confiável, dados protegidos</p>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">
            O que nossos prestadores dizem
          </h3>
          <p className="text-gray-600 text-center mb-12 text-lg">
            Histórias reais de sucesso na plataforma Hive
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Maria Silva</h4>
                  <p className="text-gray-600 text-sm">Faxineira - BE HIVE</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Triplicou minha clientela em 2 meses! Super recomendo o Hive para quem quer crescer profissionalmente."
              </p>
              <div className="flex text-yellow-500 mt-4">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">João Santos</h4>
                  <p className="text-gray-600 text-sm">Eletricista - BE HIVE</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Finalmente uma plataforma que valoriza o prestador. Pagamento rápido e clientes de qualidade!"
              </p>
              <div className="flex text-yellow-500 mt-4">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  I
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Imobiliária Prime</h4>
                  <p className="text-gray-600 text-sm">Empresa - HIVE GOLD</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Os recursos empresariais do GOLD são incríveis. Relatórios detalhados e gestão completa!"
              </p>
              <div className="flex text-yellow-500 mt-4">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl p-12 shadow-2xl mb-16 text-center text-white">
            <h3 className="text-4xl font-bold mb-4">
              Pronto para começar?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a milhares de prestadores que já transformaram seus negócios
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation('/register')}
                className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all"
              >
                🚀 Criar Conta Grátis
              </Button>
              <Button
                onClick={() => setLocation('/services')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-amber-600 px-8 py-4 text-lg font-bold rounded-2xl border-2"
              >
                📋 Ver Como Funciona
              </Button>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-12 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            💳 Formas de Pagamento Seguras
          </h3>
          <div className="flex justify-center items-center flex-wrap gap-8">
            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">VISA</div>
              <span className="font-medium text-gray-700">Visa</span>
            </div>
            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">MC</div>
              <span className="font-medium text-gray-700">Mastercard</span>
            </div>
            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-lg">₿</div>
              <span className="font-medium text-gray-700">PIX</span>
            </div>
            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-white text-sm">💳</div>
              <span className="font-medium text-gray-700">Cartão</span>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            🔒 Pagamentos processados com segurança SSL 256-bit
          </p>
        </div>
      </div>
    </div>
  );
}
