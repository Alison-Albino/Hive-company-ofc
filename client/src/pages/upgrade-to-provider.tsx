import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, Crown, CheckCircle, Star } from "lucide-react";

export default function UpgradeToProviderPage() {
  const [, setLocation] = useLocation();
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [providerData, setProviderData] = useState({
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

  const handleUpgradeToProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (providerData.categories.length === 0) {
      toast({
        title: "Erro no upgrade",
        description: "Selecione pelo menos uma categoria",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("/api/auth/upgrade-to-provider", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("hive_session")}`,
        },
        body: JSON.stringify({
          ...providerData,
          name: user?.name,
          email: user?.email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        refresh();
        toast({
          title: "Upgrade realizado com sucesso!",
          description: "Agora você é um prestador de serviços!",
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Erro no upgrade",
          description: result.message || "Erro ao fazer upgrade para prestador",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no upgrade",
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

  if (!user) {
    window.location.href = "/auth";
    return null;
  }

  if (user.userType === "provider") {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
            <div className="flex justify-center mb-4">
              <Crown className="h-16 w-16" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Torne-se um Prestador de Serviços
            </CardTitle>
            <CardDescription className="text-amber-100 text-lg">
              Expanda seu negócio e alcance mais clientes no Hive
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Escolha seu plano
                  </h3>
                  <p className="text-gray-600">
                    Selecione o plano que melhor se adequa ao seu perfil profissional
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Plano A */}
                  <Card 
                    className={`cursor-pointer border-2 transition-all ${
                      providerData.planType === "A" 
                        ? "border-amber-500 bg-amber-50" 
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                    onClick={() => setProviderData(prev => ({ ...prev, planType: "A" }))}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Plano A - Individual</CardTitle>
                        {providerData.planType === "A" && (
                          <CheckCircle className="h-6 w-6 text-amber-600" />
                        )}
                      </div>
                      <CardDescription>Para profissionais autônomos (CPF)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-amber-600 mb-4">
                        R$ 29<span className="text-lg text-gray-500">/mês</span>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Perfil profissional completo
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Até 3 categorias de serviços
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Galeria de fotos dos trabalhos
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Chat direto com clientes
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Sistema de avaliações
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Plano B */}
                  <Card 
                    className={`cursor-pointer border-2 transition-all relative ${
                      providerData.planType === "B" 
                        ? "border-amber-500 bg-amber-50" 
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                    onClick={() => setProviderData(prev => ({ ...prev, planType: "B" }))}
                  >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                        <Star className="h-3 w-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Plano B - Empresarial</CardTitle>
                        {providerData.planType === "B" && (
                          <CheckCircle className="h-6 w-6 text-amber-600" />
                        )}
                      </div>
                      <CardDescription>Para empresas e imobiliárias (CNPJ)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-amber-600 mb-4">
                        R$ 59<span className="text-lg text-gray-500">/mês</span>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Todos os benefícios do Plano A
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Categorias ilimitadas
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Cadastro de propriedades (imobiliárias)
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Destaque na busca
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Analytics e relatórios
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Suporte prioritário
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={() => setStep(2)} 
                    size="lg"
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8"
                  >
                    Continuar com Plano {providerData.planType}
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleUpgradeToProvider} className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    Complete seu perfil profissional
                  </h3>
                  <p className="text-gray-600">
                    Preencha os dados para finalizar seu upgrade para Plano {providerData.planType}
                  </p>
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
                    <Label htmlFor="document">
                      {providerData.documentType}
                    </Label>
                    <Input
                      id="document"
                      value={providerData.documentNumber}
                      onChange={(e) => setProviderData(prev => ({ ...prev, documentNumber: e.target.value }))}
                      placeholder={providerData.documentType === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={providerData.phone}
                      onChange={(e) => setProviderData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="speciality">Especialidade Principal</Label>
                    <Input
                      id="speciality"
                      value={providerData.speciality}
                      onChange={(e) => setProviderData(prev => ({ ...prev, speciality: e.target.value }))}
                      placeholder="Ex: Instalações elétricas residenciais"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={providerData.location}
                      onChange={(e) => setProviderData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Cidade, Estado"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição dos Serviços</Label>
                  <Textarea
                    id="description"
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

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(1)}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Processando..." : `Finalizar Upgrade - Plano ${providerData.planType}`}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}