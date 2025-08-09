import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { providerRegistrationSchema, type ProviderRegistrationData } from "@shared/auth-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Building2, Users, Crown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const serviceCategories = [
  "eletricista", "encanador", "pintor", "limpeza", "jardinagem", 
  "marcenaria", "serralheria", "imobiliaria"
];

export default function RegisterProvider() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const form = useForm<ProviderRegistrationData>({
    resolver: zodResolver(providerRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      documentType: "CPF",
      documentNumber: "",
      speciality: "",
      description: "",
      location: "",
      categories: [],
      phone: "",
      planType: "A",
    },
  });

  const planType = form.watch("planType");
  const documentType = form.watch("documentType");

  const onSubmit = async (data: ProviderRegistrationData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiRequest("POST", "/api/auth/register-provider", {
        ...data,
        categories: selectedCategories,
      }) as any;
      
      if (response.success && response.sessionId) {
        // Store session
        localStorage.setItem("hive_session", response.sessionId);
        localStorage.setItem("hive_user", JSON.stringify(response.user));
        
        setSuccess("Cadastro realizado! Agora complete o pagamento do seu plano para ativar a conta.");
        
        setTimeout(() => {
          setLocation("/plans");
        }, 2000);
      } else {
        setError(response.message || "Erro no cadastro");
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Cadastrar como Prestador
          </CardTitle>
          <CardDescription>
            Crie sua conta profissional e comece a receber clientes
          </CardDescription>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Plan Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 border rounded-lg cursor-pointer transition-all ${planType === "A" ? "border-amber-500 bg-amber-50" : "border-gray-200"}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="planA"
                    {...form.register("planType")}
                    value="A"
                    className="text-amber-600"
                  />
                  <Users className="w-5 h-5 text-amber-600" />
                  <div>
                    <Label htmlFor="planA" className="font-semibold cursor-pointer">Plano A - Autônomos</Label>
                    <p className="text-sm text-gray-600">R$ 49/mês - Ideal para CPF</p>
                  </div>
                </div>
              </div>

              <div className={`p-4 border rounded-lg cursor-pointer transition-all ${planType === "B" ? "border-amber-500 bg-amber-50" : "border-gray-200"}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="planB"
                    {...form.register("planType")}
                    value="B"
                    className="text-amber-600"
                  />
                  <Crown className="w-5 h-5 text-amber-600" />
                  <div>
                    <Label htmlFor="planB" className="font-semibold cursor-pointer">Plano B - Empresas</Label>
                    <p className="text-sm text-gray-600">R$ 149/mês - Ideal para CNPJ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome/Razão Social</Label>
                <Input
                  id="name"
                  placeholder={planType === "A" ? "Seu nome completo" : "Razão social da empresa"}
                  {...form.register("name")}
                  className={form.formState.errors.name ? "border-red-500" : ""}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@empresa.com"
                  {...form.register("email")}
                  className={form.formState.errors.email ? "border-red-500" : ""}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  {...form.register("password")}
                  className={form.formState.errors.password ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Document Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo de Documento</Label>
                <Select onValueChange={(value) => form.setValue("documentType", value as "CPF" | "CNPJ")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF (Pessoa Física)</SelectItem>
                    <SelectItem value="CNPJ">CNPJ (Pessoa Jurídica)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">{documentType}</Label>
                <Input
                  id="documentNumber"
                  placeholder={documentType === "CPF" ? "000.000.000-00" : "00.000.000/0001-00"}
                  {...form.register("documentNumber")}
                  className={form.formState.errors.documentNumber ? "border-red-500" : ""}
                />
                {form.formState.errors.documentNumber && (
                  <p className="text-sm text-red-500">{form.formState.errors.documentNumber.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="speciality">Especialidade</Label>
                <Input
                  id="speciality"
                  placeholder="Ex: Instalações elétricas residenciais"
                  {...form.register("speciality")}
                  className={form.formState.errors.speciality ? "border-red-500" : ""}
                />
                {form.formState.errors.speciality && (
                  <p className="text-sm text-red-500">{form.formState.errors.speciality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  {...form.register("phone")}
                  className={form.formState.errors.phone ? "border-red-500" : ""}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                placeholder="Cidade, Estado"
                {...form.register("location")}
                className={form.formState.errors.location ? "border-red-500" : ""}
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Conte sobre sua experiência, serviços oferecidos, diferenciais..."
                {...form.register("description")}
                className={form.formState.errors.description ? "border-red-500" : ""}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>Categorias de Serviços</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {serviceCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                    />
                    <Label htmlFor={category} className="text-sm capitalize cursor-pointer">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-sm text-red-500">Selecione pelo menos uma categoria</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              disabled={isLoading || selectedCategories.length === 0}
            >
              {isLoading ? "Cadastrando..." : "Cadastrar e escolher plano"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
                  Entrar
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Quer apenas navegar?{" "}
                <Link href="/register" className="text-amber-600 hover:text-amber-700 font-medium">
                  Criar conta gratuita
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}