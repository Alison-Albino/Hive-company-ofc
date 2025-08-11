import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Home, 
  CreditCard, 
  FileText, 
  Star, 
  MapPin,
  Camera,
  Settings,
  Plus,
  TrendingUp,
  Users,
  Calendar,
  Crown,
  CheckCircle,
  BarChart3
} from "lucide-react";
import { ProfileProgressTracker } from "@/components/ProfileProgressTracker";
import { RealEstateDashboard } from "@/components/RealEstateDashboard";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, canCreateProperty } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Você precisa fazer login para acessar o dashboard</p>
            <Link href="/auth">
              <Button>Fazer Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PRESTADOR ONBOARDING - Guia o primeiro cadastro
  const renderProviderOnboarding = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Crown className="h-10 w-10 text-amber-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo ao {user.planType === "A" ? "BE HIVE" : "HIVE GOLD"}!
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Complete seu cadastro para começar a oferecer seus serviços
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfileProgressTracker user={user} />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>🎯 Dica de Sucesso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Perfis completos recebem até <strong>5x mais contatos</strong> de clientes.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Foto profissional
              </div>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Portfólio com exemplos
              </div>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Biografia detalhada
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {user.planType === "B" && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Crown className="h-5 w-5" />
              Recursos Exclusivos HIVE GOLD
            </CardTitle>
            <CardDescription className="text-amber-700">
              Funcionalidades premium para empresas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800">Cadastro de propriedades (imobiliárias)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800">Relatórios avançados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800">Gerenciamento de equipe</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800">Suporte prioritário</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // PRESTADOR DASHBOARD COMPLETO - Após completar o cadastro
  const renderProviderDashboard = () => {
    const isCompany = user.planType === "B";
    
    return (
      <div className="space-y-6">
        {/* Provider Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plano Ativo</CardTitle>
              <Crown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">
                {user.planType === "A" ? "BE HIVE" : "HIVE GOLD"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.planType === "A" ? "CPF - R$ 29/mês" : "CNPJ - R$ 59/mês"}
              </p>
              <Badge variant={user.planStatus === "active" ? "default" : "secondary"} className="mt-2">
                {user.planStatus === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perfil</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{user.completionPercentage}%</p>
              <p className="text-xs text-muted-foreground">Completo</p>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="mt-2">
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Solicitações</p>
            </CardContent>
          </Card>
        </div>

        {/* Provider Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Gerencie seu perfil e serviços</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/profile">
                <Button className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Editar Perfil Completo
                </Button>
              </Link>
              
              <Button className="w-full justify-start" variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Gerenciar Fotos de Serviços
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <MapPin className="w-4 h-4 mr-2" />
                Atualizar Localização
              </Button>
            </CardContent>
          </Card>

          {user?.categories?.includes('imobiliaria') ? (
            <Card>
              <CardHeader>
                <CardTitle>🏢 Painel Imobiliário</CardTitle>
                <CardDescription>Gerencie seu portfólio de imóveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="#properties-section">
                  <Button className="w-full justify-start">
                    <Home className="w-4 h-4 mr-2" />
                    Gerenciar Imóveis
                  </Button>
                </Link>
                
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Imóvel
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatórios de Vendas
                </Button>
              </CardContent>
            </Card>
          ) : isCompany && (
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades Empresariais</CardTitle>
                <CardDescription>Recursos exclusivos do HIVE GOLD</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatórios Avançados
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Gerenciar Equipe
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Service Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>Meu Portfólio de Serviços</CardTitle>
            <CardDescription>Gerencie seus serviços e categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {user.categories && user.categories.length > 0 ? (
                user.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">Nenhuma categoria selecionada</p>
              )}
            </div>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Gerenciar Categorias
            </Button>
          </CardContent>
        </Card>

        {/* Real Estate Dashboard - Only for Imobiliaria providers */}
        {user?.categories?.includes('imobiliaria') && (
          <div id="properties-section">
            <RealEstateDashboard />
          </div>
        )}
      </div>
    );
  };

  // DASHBOARD USUÁRIO VISUALIZADOR
  const renderViewerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfil</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">👤</p>
            <p className="text-xs text-muted-foreground mb-2">Usuário</p>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Salvos</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Torne-se Prestador</CardTitle>
            <Crown className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-900">🚀</p>
            <p className="text-xs text-amber-700 mb-3">Ofereça seus serviços</p>
            <Link href="/plans">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Ver Planos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>O que você gostaria de fazer hoje?</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/properties">
            <Button variant="outline" className="w-full h-20 flex flex-col">
              <Home className="w-6 h-6 mb-2" />
              Buscar Imóveis
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="outline" className="w-full h-20 flex flex-col">
              <Users className="w-6 h-6 mb-2" />
              Encontrar Prestadores
            </Button>
          </Link>
          <Link href="/upgrade-to-provider">
            <Button variant="outline" className="w-full h-20 flex flex-col border-amber-200 text-amber-700 hover:bg-amber-50">
              <Crown className="w-6 h-6 mb-2" />
              Tornar-se Prestador
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user.name}! 👋
          </h1>
          <p className="text-gray-600">
            {user.userType === "provider" 
              ? `Dashboard do ${user.planType === "A" ? "BE HIVE" : "HIVE GOLD"}`
              : "Bem-vindo ao seu dashboard Hive"
            }
          </p>
        </div>

        {user.userType === "provider" ? (
          user.completionPercentage && user.completionPercentage < 80 ? 
            renderProviderOnboarding() : 
            renderProviderDashboard()
        ) : (
          renderViewerDashboard()
        )}
      </div>
    </div>
  );
}