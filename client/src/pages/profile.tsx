import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  Save,
  Eye,
  X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Schema para perfil de visualizador
const viewerProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string().optional(),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().min(2, "Estado obrigatório"),
  zipCode: z.string().min(8, "CEP inválido"),
  documentType: z.enum(["CPF"]),
  documentNumber: z.string().min(11, "CPF inválido"),
});

// Schema para perfil de prestador
const providerProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string().min(10, "Telefone obrigatório"),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().min(2, "Estado obrigatório"),
  zipCode: z.string().min(8, "CEP inválido"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  businessHours: z.string().optional(),
  documentType: z.enum(["CPF", "CNPJ"]),
  documentNumber: z.string().min(11, "Documento inválido"),
});

type ViewerProfileData = z.infer<typeof viewerProfileSchema>;
type ProviderProfileData = z.infer<typeof providerProfileSchema>;

export default function Profile() {
  const { user, isAuthenticated, canCreateProperty } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImage, setProfileImage] = useState(user?.profileImageUrl || "");
  const [portfolioImages, setPortfolioImages] = useState(user?.portfolioImages || []);

  const viewerForm = useForm<ViewerProfileData>({
    resolver: zodResolver(viewerProfileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
      documentType: "CPF",
      documentNumber: user?.documentNumber || "",
    },
  });

  const providerForm = useForm<ProviderProfileData>({
    resolver: zodResolver(providerProfileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
      description: user?.description || user?.bio || "",
      businessHours: user?.businessHours || "",
      documentType: (user?.documentType as "CPF" | "CNPJ") || (user?.planType === "B" ? "CNPJ" : "CPF"),
      documentNumber: user?.documentNumber || "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      providerForm.reset({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        description: user.description || user.bio || "",
        businessHours: user.businessHours || "",
        documentType: (user.documentType as "CPF" | "CNPJ") || (user.planType === "B" ? "CNPJ" : "CPF"),
        documentNumber: user.documentNumber || "",
      });
      setProfileImage(user.profileImageUrl || "");
      setPortfolioImages(user.portfolioImages || []);
    }
  }, [user]);

  // Handle profile image upload
  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        // TODO: Upload to server
        toast({
          title: "Foto de perfil alterada",
          description: "Sua nova foto será salva quando você salvar o perfil",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle portfolio image upload
  const handlePortfolioImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && portfolioImages.length < 10) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPortfolioImages(prev => [...prev, result]);
        toast({
          title: "Foto adicionada ao portfólio",
          description: "A foto será salva quando você salvar o perfil",
        });
      };
      reader.readAsDataURL(file);
    } else if (portfolioImages.length >= 10) {
      toast({
        title: "Limite atingido",
        description: "Você pode adicionar no máximo 10 fotos ao portfólio",
        variant: "destructive",
      });
    }
  };

  // Remove portfolio image
  const removePortfolioImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Foto removida",
      description: "A foto foi removida do seu portfólio",
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Você precisa fazer login para acessar o perfil</p>
            <Link href="/login">
              <Button>Fazer Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onViewerSubmit = async (data: ViewerProfileData) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("PUT", "/api/profile", data);
      const response = await res.json();
      
      if (response.success) {
        toast({
          title: "Perfil Atualizado",
          description: "Suas informações foram salvas com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: response.message || "Erro ao atualizar perfil",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onProviderSubmit = async (data: ProviderProfileData) => {
    setIsLoading(true);
    try {
      const profileData = {
        ...data,
        profileImageUrl: profileImage,
        portfolioImages: portfolioImages,
      };
      
      const res = await apiRequest("PUT", "/api/profile", profileData);
      const response = await res.json();
      
      if (response.success) {
        toast({
          title: "Perfil Atualizado",
          description: "Suas informações foram salvas com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: response.message || "Erro ao atualizar perfil",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderViewerProfile = () => (
    <form onSubmit={viewerForm.handleSubmit(onViewerSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Dados básicos do seu perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              {...viewerForm.register("name")}
              className={viewerForm.formState.errors.name ? "border-red-500" : ""}
            />
            {viewerForm.formState.errors.name && (
              <p className="text-sm text-red-500">{viewerForm.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...viewerForm.register("email")}
              className={viewerForm.formState.errors.email ? "border-red-500" : ""}
            />
            {viewerForm.formState.errors.email && (
              <p className="text-sm text-red-500">{viewerForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Telefone</Label>
            <Input
              id="phoneNumber"
              placeholder="(11) 99999-9999"
              {...viewerForm.register("phoneNumber")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              {...viewerForm.register("address")}
              className={viewerForm.formState.errors.address ? "border-red-500" : ""}
            />
            {viewerForm.formState.errors.address && (
              <p className="text-sm text-red-500">{viewerForm.formState.errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              {...viewerForm.register("city")}
              className={viewerForm.formState.errors.city ? "border-red-500" : ""}
            />
            {viewerForm.formState.errors.city && (
              <p className="text-sm text-red-500">{viewerForm.formState.errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              {...viewerForm.register("state")}
              className={viewerForm.formState.errors.state ? "border-red-500" : ""}
            />
            {viewerForm.formState.errors.state && (
              <p className="text-sm text-red-500">{viewerForm.formState.errors.state.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              placeholder="00000-000"
              {...viewerForm.register("zipCode")}
              className={viewerForm.formState.errors.zipCode ? "border-red-500" : ""}
            />
            {viewerForm.formState.errors.zipCode && (
              <p className="text-sm text-red-500">{viewerForm.formState.errors.zipCode.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentação
          </CardTitle>
          <CardDescription>
            Verificação de identidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentNumber">CPF</Label>
              <Input
                id="documentNumber"
                placeholder="000.000.000-00"
                {...viewerForm.register("documentNumber")}
                className={viewerForm.formState.errors.documentNumber ? "border-red-500" : ""}
              />
              {viewerForm.formState.errors.documentNumber && (
                <p className="text-sm text-red-500">{viewerForm.formState.errors.documentNumber.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.documentsVerified ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Documento Verificado
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="w-3 h-3 mr-1" />
                Aguardando Verificação
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            "Salvando..."
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Perfil
            </>
          )}
        </Button>
      </div>
    </form>
  );

  const renderProviderProfile = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="photos">Fotos</TabsTrigger>
        <TabsTrigger value="categories">Categorias</TabsTrigger>
        <TabsTrigger value="documents">Documentos</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <form onSubmit={providerForm.handleSubmit(onProviderSubmit)} className="space-y-6">
          {/* Plan Status Alert */}
          {user.planStatus !== 'active' && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-amber-700">
                Seu plano está {user.planStatus === 'pending' ? 'pendente de pagamento' : 'inativo'}. 
                <Link href="/plans" className="ml-2 text-amber-800 underline">
                  Ativar plano
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Prestador
              </CardTitle>
              <CardDescription>
                Dados que aparecerão no seu perfil público
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome/Empresa</Label>
                <Input
                  id="name"
                  {...providerForm.register("name")}
                  className={providerForm.formState.errors.name ? "border-red-500" : ""}
                />
                {providerForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{providerForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...providerForm.register("email")}
                  className={providerForm.formState.errors.email ? "border-red-500" : ""}
                />
                {providerForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{providerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Telefone de Contato</Label>
                <Input
                  id="phoneNumber"
                  placeholder="(11) 99999-9999"
                  {...providerForm.register("phoneNumber")}
                  className={providerForm.formState.errors.phoneNumber ? "border-red-500" : ""}
                />
                {providerForm.formState.errors.phoneNumber && (
                  <p className="text-sm text-red-500">{providerForm.formState.errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessHours">Horário de Funcionamento</Label>
                <Input
                  id="businessHours"
                  placeholder="Seg-Sex: 8h-18h"
                  {...providerForm.register("businessHours")}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição dos Serviços</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva seus serviços, experiência e diferenciais..."
                  {...providerForm.register("description")}
                  className={providerForm.formState.errors.description ? "border-red-500" : ""}
                />
                {providerForm.formState.errors.description && (
                  <p className="text-sm text-red-500">{providerForm.formState.errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Área de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço Base</Label>
                <Input
                  id="address"
                  {...providerForm.register("address")}
                  className={providerForm.formState.errors.address ? "border-red-500" : ""}
                />
                {providerForm.formState.errors.address && (
                  <p className="text-sm text-red-500">{providerForm.formState.errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  {...providerForm.register("city")}
                  className={providerForm.formState.errors.city ? "border-red-500" : ""}
                />
                {providerForm.formState.errors.city && (
                  <p className="text-sm text-red-500">{providerForm.formState.errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  {...providerForm.register("state")}
                  className={providerForm.formState.errors.state ? "border-red-500" : ""}
                />
                {providerForm.formState.errors.state && (
                  <p className="text-sm text-red-500">{providerForm.formState.errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  placeholder="00000-000"
                  {...providerForm.register("zipCode")}
                  className={providerForm.formState.errors.zipCode ? "border-red-500" : ""}
                />
                {providerForm.formState.errors.zipCode && (
                  <p className="text-sm text-red-500">{providerForm.formState.errors.zipCode.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Perfil
                </>
              )}
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="photos">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Gerenciar Fotos
            </CardTitle>
            <CardDescription>
              Adicione fotos do seu perfil e portfólio de trabalhos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Foto de Perfil</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Perfil" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label htmlFor="profile-image-upload">
                      <Button variant="outline" asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Alterar Foto
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Portfólio (até 10 fotos) - {portfolioImages.length}/10</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {portfolioImages.map((image, index) => (
                    <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Portfólio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 w-6 h-6 p-0"
                        onClick={() => removePortfolioImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {portfolioImages.length < 10 && (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePortfolioImageUpload}
                        className="hidden"
                        id="portfolio-image-upload"
                      />
                      <label htmlFor="portfolio-image-upload">
                        <Button variant="ghost" size="sm" asChild>
                          <span className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload className="w-4 h-4" />
                            <span className="text-xs">Adicionar</span>
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Adicione fotos dos seus trabalhos para mostrar a qualidade dos seus serviços
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="categories">
        <Card>
          <CardHeader>
            <CardTitle>Categorias e Especialidades</CardTitle>
            <CardDescription>
              Escolha 1 categoria principal e até 3 subcategorias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Categoria Principal</Label>
                <div className="mt-2">
                  {user.categories && user.categories.length > 0 ? (
                    <Badge variant="default">{user.categories[0]}</Badge>
                  ) : (
                    <Badge variant="secondary">Nenhuma categoria selecionada</Badge>
                  )}
                </div>
              </div>

              <div>
                <Label>Subcategorias ({(user.subcategories?.length || 0)}/3)</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.subcategories && user.subcategories.length > 0 ? (
                    user.subcategories.map((sub, index) => (
                      <Badge key={index} variant="outline">{sub}</Badge>
                    ))
                  ) : (
                    <Badge variant="secondary">Nenhuma subcategoria selecionada</Badge>
                  )}
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Para alterar suas categorias, entre em contato com o suporte através do chat.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Verificação de Documentos
            </CardTitle>
            <CardDescription>
              Envie seus documentos para verificação da conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo de Documento</Label>
                <Input
                  id="documentType"
                  value={providerForm.watch("documentType")}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">Número do Documento</Label>
                <Input
                  id="documentNumber"
                  {...providerForm.register("documentNumber")}
                  className={providerForm.formState.errors.documentNumber ? "border-red-500" : ""}
                />
                {providerForm.formState.errors.documentNumber && (
                  <p className="text-sm text-red-500">{providerForm.formState.errors.documentNumber.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Status da Verificação</Label>
                <div className="mt-2">
                  {user.documentsVerified ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Documentos Verificados
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Aguardando Verificação
                    </Badge>
                  )}
                </div>
              </div>

              {!user.documentsVerified && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Envie uma foto clara do seu documento (frente e verso) para verificação da conta.
                    A verificação é obrigatória para prestadores de serviço.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.userType === 'provider' ? 'Meu Perfil Profissional' : 'Meu Perfil'}
              </h1>
              <p className="text-gray-600">
                {user.userType === 'provider' 
                  ? 'Gerencie suas informações profissionais e apareça nas buscas'
                  : 'Mantenha suas informações sempre atualizadas'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Completude do Perfil</p>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${user.completionPercentage || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{user.completionPercentage || 0}%</span>
                </div>
              </div>

              <Link href="/dashboard">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {user.userType === 'provider' ? renderProviderProfile() : renderViewerProfile()}
      </div>
    </div>
  );
}