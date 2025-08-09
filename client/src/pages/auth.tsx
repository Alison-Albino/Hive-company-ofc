import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Building2, User } from "lucide-react";
import logoPath from "@assets/logo hive_1754700716189.png";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Login form
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  
  // Register form
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "viewer" as "viewer" | "provider",
  });
  
  // Provider registration form
  const [providerData, setProviderData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    documentType: "CPF" as "CPF" | "CNPJ",
    documentNumber: "",
    phone: "",
    speciality: "",
    description: "",
    location: "",
    categories: [] as string[],
    planType: "A" as "A" | "B",
  });
  
  const serviceCategories = [
    "eletricista", "encanador", "pintor", "marceneiro", "pedreiro",
    "jardineiro", "faxineiro", "chaveiro", "vidraceiro", "soldador",
    "imobiliaria", "corretor", "arquiteto", "engenheiro"
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (result.success && result.user) {
        login(result.user, result.sessionId);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo(a), ${result.user.name}!`,
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Erro no login",
          description: result.message || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterViewer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          userType: "viewer",
        }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        login(result.user, result.sessionId);
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Bem-vindo ao Hive!",
        });
        // Force page refresh to ensure auth state is updated
        window.location.href = "/dashboard";
      } else {
        toast({
          title: "Erro no cadastro",
          description: result.message || "Erro ao criar conta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (providerData.password !== providerData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    if (providerData.categories.length === 0) {
      toast({
        title: "Erro no cadastro",
        description: "Selecione pelo menos uma categoria",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(providerData),
      });

      const result = await response.json();

      if (result.success && result.user) {
        login(result.user, result.sessionId);
        toast({
          title: "Cadastro de prestador realizado!",
          description: "Bem-vindo ao Hive! Complete seu perfil para começar.",
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Erro no cadastro",
          description: result.message || "Erro ao criar conta de prestador",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setProviderData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <img src={logoPath} alt="Hive" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Bem-vindo ao Hive
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            A plataforma que conecta propriedades e serviços
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="text-base">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="text-base">
                <User className="w-4 h-4 mr-2" />
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
              
              <div className="text-center text-sm text-gray-600">
                <p>Contas de teste disponíveis:</p>
                <div className="mt-2 space-y-1">
                  <p><strong>Visualizador:</strong> viewer@test.com (senha: 123456)</p>
                  <p><strong>Prestador:</strong> eletricista@test.com (senha: 123456)</p>
                  <p><strong>Imobiliária:</strong> imobiliaria@test.com (senha: 123456)</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Crie sua conta no Hive
                </h3>
                <p className="text-gray-600">
                  Comece como cliente e depois você pode se tornar prestador de serviços
                </p>
              </div>
              
              <form onSubmit={handleRegisterViewer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Nome Completo</Label>
                    <Input
                      id="user-name"
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Senha</Label>
                    <Input
                      id="user-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-confirm">Confirmar Senha</Label>
                    <Input
                      id="user-confirm"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Sua conta será criada como cliente
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        Após o cadastro, você poderá assinar um plano para se tornar prestador de serviços
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar Minha Conta"}
                </Button>
              </form>
            </TabsContent>



          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}