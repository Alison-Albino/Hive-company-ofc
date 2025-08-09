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
        setLocation("/dashboard");
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
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="login" className="text-base">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register-viewer" className="text-base">
                <User className="w-4 h-4 mr-2" />
                Buscar Imóveis
              </TabsTrigger>
              <TabsTrigger value="register-provider" className="text-base">
                <Building2 className="w-4 h-4 mr-2" />
                Oferecer Serviços
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

            <TabsContent value="register-viewer" className="space-y-6">
              <form onSubmit={handleRegisterViewer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="viewer-name">Nome Completo</Label>
                    <Input
                      id="viewer-name"
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="viewer-email">Email</Label>
                    <Input
                      id="viewer-email"
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
                    <Label htmlFor="viewer-password">Senha</Label>
                    <Input
                      id="viewer-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="viewer-confirm">Confirmar Senha</Label>
                    <Input
                      id="viewer-confirm"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar Conta de Visualizador"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register-provider" className="space-y-6">
              <form onSubmit={handleRegisterProvider} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider-name">Nome/Empresa</Label>
                    <Input
                      id="provider-name"
                      value={providerData.name}
                      onChange={(e) => setProviderData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome ou razão social"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provider-email">Email</Label>
                    <Input
                      id="provider-email"
                      type="email"
                      value={providerData.email}
                      onChange={(e) => setProviderData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contato@empresa.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider-password">Senha</Label>
                    <Input
                      id="provider-password"
                      type="password"
                      value={providerData.password}
                      onChange={(e) => setProviderData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provider-confirm">Confirmar Senha</Label>
                    <Input
                      id="provider-confirm"
                      type="password"
                      value={providerData.confirmPassword}
                      onChange={(e) => setProviderData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Documento</Label>
                    <Select
                      value={providerData.documentType}
                      onValueChange={(value: "CPF" | "CNPJ") => 
                        setProviderData(prev => ({ ...prev, documentType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provider-document">
                      {providerData.documentType}
                    </Label>
                    <Input
                      id="provider-document"
                      value={providerData.documentNumber}
                      onChange={(e) => setProviderData(prev => ({ ...prev, documentNumber: e.target.value }))}
                      placeholder={providerData.documentType === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provider-phone">Telefone</Label>
                    <Input
                      id="provider-phone"
                      value={providerData.phone}
                      onChange={(e) => setProviderData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider-speciality">Especialidade Principal</Label>
                    <Input
                      id="provider-speciality"
                      value={providerData.speciality}
                      onChange={(e) => setProviderData(prev => ({ ...prev, speciality: e.target.value }))}
                      placeholder="Ex: Instalações elétricas residenciais"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provider-location">Localização</Label>
                    <Input
                      id="provider-location"
                      value={providerData.location}
                      onChange={(e) => setProviderData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Cidade, Estado"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider-description">Descrição dos Serviços</Label>
                  <Textarea
                    id="provider-description"
                    value={providerData.description}
                    onChange={(e) => setProviderData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva os serviços que você oferece..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categorias de Serviços</Label>
                  <div className="flex flex-wrap gap-2">
                    {serviceCategories.map((category) => (
                      <Badge
                        key={category}
                        variant={providerData.categories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Selecionadas: {providerData.categories.join(", ") || "Nenhuma"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Plano de Assinatura</Label>
                  <Select
                    value={providerData.planType}
                    onValueChange={(value: "A" | "B") => 
                      setProviderData(prev => ({ ...prev, planType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Plano A - CPF Individual (R$ 29/mês)</SelectItem>
                      <SelectItem value="B">Plano B - CNPJ Empresa (R$ 59/mês)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar Conta de Prestador"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}