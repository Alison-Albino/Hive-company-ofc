import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast, useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Building2, ArrowRight, Camera, Upload, User, FileText } from "lucide-react";
import type { ServiceCategory } from "@shared/schema";

export default function SelectCategories() {
  const authState = useAuth();
  const { user, isAuthenticated, refresh } = authState;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [biography, setBiography] = useState("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refresh auth data on component mount
  useEffect(() => {
    const refreshData = async () => {
      await refresh();
    };
    refreshData();
  }, [refresh]);

  // Verificar se o usuário é empresarial - aguardar loading terminar
  useEffect(() => {
    // Aguardar até loading terminar
    if (authState.isLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to auth');
      setLocation('/auth');
      return;
    }
    
    if (user?.userType !== "provider" || (!user?.planType && !user?.providerPlan)) {
      console.log('User access check:', { 
        userType: user?.userType, 
        planType: user?.planType, 
        providerPlan: user?.providerPlan,
        isLoading: authState.isLoading
      });
      
      // Aguardar um pouco mais para permitir atualização dos dados
      setTimeout(() => {
        toast({
          title: "Acesso Negado",
          description: "Esta página é apenas para prestadores com plano ativo.",
          variant: "destructive",
        });
        setLocation('/dashboard');
      }, 2000);
      return;
    }
  }, [user, isAuthenticated, authState.isLoading, setLocation, toast]);

  const { data: categories, isLoading: categoriesLoading } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/service-categories"],
  });

  const completeMutation = useMutation({
    mutationFn: async (data: {
      categoryId: string;
      subcategories: string[];
      biography: string;
      profileImage?: string;
      portfolioImages: string[];
    }) => {
      const response = await apiRequest("POST", "/api/complete-provider-setup", data);
      if (!response.ok) {
        throw new Error("Falha ao salvar configurações");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuração Concluída!",
        description: "Seu perfil de prestador foi configurado com sucesso.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      setTimeout(() => {
        setLocation('/dashboard');
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategories([]);
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategory)) {
        return prev.filter(s => s !== subcategory);
      } else if (prev.length < 3) {
        return [...prev, subcategory];
      } else {
        toast({
          title: "Limite Atingido",
          description: "Você pode selecionar no máximo 3 subcategorias.",
          variant: "destructive",
        });
        return prev;
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'portfolio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulação de upload - em produção seria um upload real
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      
      if (type === 'profile') {
        setProfileImage(imageData);
      } else {
        if (portfolioImages.length < 5) {
          setPortfolioImages(prev => [...prev, imageData]);
        } else {
          toast({
            title: "Limite de Imagens",
            description: "Você pode adicionar no máximo 5 imagens ao portfólio.",
            variant: "destructive",
          });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedCategory) {
      toast({
        title: "Categoria Obrigatória",
        description: "Selecione uma categoria principal.",
        variant: "destructive",
      });
      return;
    }

    if (selectedSubcategories.length === 0) {
      toast({
        title: "Subcategoria Obrigatória", 
        description: "Selecione pelo menos uma subcategoria.",
        variant: "destructive",
      });
      return;
    }

    if (!biography.trim()) {
      toast({
        title: "Biografia Obrigatória",
        description: "Escreva uma breve biografia sobre seus serviços.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    completeMutation.mutate({
      categoryId: selectedCategory.id,
      subcategories: selectedSubcategories,
      biography: biography.trim(),
      profileImage,
      portfolioImages,
    });
  };

  if (authState.isLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isBusinessPlan = user?.planType === 'B' || user?.providerPlan === 'B';
  const availableCategories = categories?.filter(category => {
    // Para planos CNPJ, mostrar todas as categorias
    // Para planos CPF, filtrar categorias básicas
    if (isBusinessPlan) {
      return true;
    } else {
      // CPF só vê categorias de serviços básicos (exclui apenas a categoria imobiliária)
      return category.slug !== 'imobiliaria';
    }
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configure seu Perfil Profissional
          </h1>
          <p className="text-gray-600">
            Escolha sua categoria principal e até 3 subcategorias de especialização
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {isBusinessPlan ? 'HIVE GOLD (CNPJ) - Inclui categoria Imobiliária' : 'BE HIVE (CPF) - Categorias de serviços'}
            </Badge>
          </div>
        </div>

        {!selectedCategory ? (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">
              Escolha sua Categoria Principal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCategories.map((category) => (
                <Card 
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-amber-300"
                  onClick={() => handleCategorySelect(category)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <i className={`${category.icon} text-amber-600 text-xl`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {category.providerCount} prestadores
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.slice(0, 3).map((sub) => (
                        <Badge key={sub} variant="secondary" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                      {category.subcategories.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{category.subcategories.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <i className={`${selectedCategory.icon} text-amber-600 text-xl`} />
                    </div>
                    <div>
                      <CardTitle>{selectedCategory.name}</CardTitle>
                      <CardDescription>Selecione de 1 a 3 subcategorias</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCategory(null)}
                  >
                    Trocar Categoria
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Seleção de Subcategorias */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    Subcategorias de Especialização
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedCategory.subcategories.map((subcategory) => (
                      <div
                        key={subcategory}
                        className={`
                          p-3 border-2 rounded-lg cursor-pointer transition-all
                          ${selectedSubcategories.includes(subcategory)
                            ? 'border-amber-500 bg-amber-50 text-amber-900'
                            : 'border-gray-200 hover:border-amber-300'
                          }
                        `}
                        onClick={() => handleSubcategoryToggle(subcategory)}
                      >
                        <div className="flex items-center gap-2">
                          {selectedSubcategories.includes(subcategory) && (
                            <CheckCircle className="h-5 w-5 text-amber-600" />
                          )}
                          <span className="text-sm font-medium">{subcategory}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Selecionadas: {selectedSubcategories.length}/3
                  </p>
                </div>

                {/* Biografia */}
                <div>
                  <Label htmlFor="biography" className="text-lg font-semibold mb-4 block">
                    <FileText className="inline h-5 w-5 mr-2" />
                    Biografia Profissional
                  </Label>
                  <Textarea
                    id="biography"
                    placeholder="Conte sobre sua experiência, especialidades e diferenciais. Exemplo: 'Sou eletricista com mais de 10 anos de experiência em instalações residenciais e comerciais. Especializado em sistemas de automação e energia solar...'"
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {biography.length}/500 caracteres
                  </p>
                </div>

                {/* Upload de Imagem de Perfil */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    <User className="inline h-5 w-5 mr-2" />
                    Foto de Perfil (Opcional)
                  </Label>
                  <div className="flex items-center gap-4">
                    {profileImage ? (
                      <div className="relative">
                        <img 
                          src={profileImage} 
                          alt="Perfil" 
                          className="w-20 h-20 rounded-full object-cover border-4 border-amber-200"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                          onClick={() => setProfileImage("")}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'profile')}
                        className="hidden"
                        id="profile-upload"
                      />
                      <Label htmlFor="profile-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Escolher Foto
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Upload de Imagens do Portfólio */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    <Camera className="inline h-5 w-5 mr-2" />
                    Portfólio de Trabalhos (Opcional)
                  </Label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {portfolioImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePortfolioImage(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      {portfolioImages.length < 5 && (
                        <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-amber-300">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'portfolio')}
                            className="hidden"
                            id={`portfolio-upload-${portfolioImages.length}`}
                          />
                          <Label htmlFor={`portfolio-upload-${portfolioImages.length}`} className="cursor-pointer flex flex-col items-center">
                            <Upload className="h-6 w-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Adicionar</span>
                          </Label>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Imagens: {portfolioImages.length}/5 • Mostre seus melhores trabalhos
                    </p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || selectedSubcategories.length === 0 || !biography.trim()}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    Finalizar Configuração
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}