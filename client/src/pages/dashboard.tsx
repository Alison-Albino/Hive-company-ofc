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

  const renderViewerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meu Perfil</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user.completionPercentage || 0}%</p>
            <p className="text-xs text-muted-foreground">Perfil completo</p>
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
            <CardTitle className="text-sm font-medium">Propriedades Favoritas</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Imóveis salvos</p>
            <Link href="/properties">
              <Button variant="outline" size="sm" className="mt-2">
                <Home className="w-4 h-4 mr-2" />
                Explorar Imóveis
              </Button>
            </Link>
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

  const renderProviderDashboard = () => (
    <div className="space-y-6">
      {/* Plan Status Alert */}
      {user.planStatus !== 'active' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">⚠️ Plano Inativo</CardTitle>
            <CardDescription className="text-amber-700">
              Seu plano está {user.planStatus === 'pending' ? 'pendente de pagamento' : 'inativo'}. 
              Ative seu plano para acessar todas as funcionalidades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/plans">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <CreditCard className="w-4 h-4 mr-2" />
                {user.planStatus === 'pending' ? 'Completar Pagamento' : 'Escolher Plano'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfil</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user.completionPercentage || 0}%</p>
            <p className="text-xs text-muted-foreground">Completo</p>
            <Badge variant={user.isVerified ? "default" : "secondary"} className="mt-2">
              {user.isVerified ? "Verificado" : "Não Verificado"}
            </Badge>
            <Link href="/profile">
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <Settings className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user.rating || 0}</p>
            <p className="text-xs text-muted-foreground">⭐ de 5.0</p>
            <p className="text-xs text-muted-foreground mt-1">
              {user.reviewCount || 0} avaliações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Este mês</p>
            <p className="text-xs text-green-600 mt-1">+0% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Novos este mês</p>
            <Button variant="outline" size="sm" className="mt-2 w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Ver Agenda
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Properties Section for Real Estate */}
      {canCreateProperty && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Meus Imóveis
            </CardTitle>
            <CardDescription>
              Gerencie suas propriedades cadastradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Propriedades ativas</p>
              </div>
              <Link href="/properties/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Imóvel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerencie seu negócio</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/profile">
            <Button variant="outline" className="w-full h-20 flex flex-col">
              <Camera className="w-6 h-6 mb-2" />
              Atualizar Fotos
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-20 flex flex-col">
            <FileText className="w-6 h-6 mb-2" />
            Ver Relatórios
          </Button>
          <Button variant="outline" className="w-full h-20 flex flex-col">
            <Star className="w-6 h-6 mb-2" />
            Gerenciar Reviews
          </Button>
          </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user.name || user.email}! 👋
          </h1>
          <p className="text-gray-600">
            {user.userType === 'provider' 
              ? `Bem-vindo ao seu dashboard de ${user.categories?.[0] || 'prestador'}`
              : 'Bem-vindo ao seu dashboard Hive'
            }
          </p>
          {user.planType && (
            <Badge variant="outline" className="mt-2">
              Plano {user.planType}
            </Badge>
          )}
        </div>

        {user.userType === 'provider' ? renderProviderDashboard() : renderViewerDashboard()}
      </div>
    </div>
  );
}