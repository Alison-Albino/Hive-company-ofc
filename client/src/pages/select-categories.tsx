import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Building2, ArrowRight } from "lucide-react";
import type { ServiceCategory } from "@shared/schema";

export default function SelectCategories() {
  const authState = useAuth();
  const { user, isAuthenticated, refresh } = authState;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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

  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/service-categories"],
  });

  const updateCategoriesMutation = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      const response = await apiRequest("PUT", "/api/user/categories", {
        categoryIds
      });
      if (!response.ok) {
        throw new Error('Falha ao atualizar categorias');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Categorias Salvas!",
        description: "Seu perfil empresarial foi configurado com sucesso.",
      });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar categorias",
        variant: "destructive",
      });
    },
  });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "Selecione pelo menos uma categoria",
        description: "É necessário escolher ao menos uma categoria de serviço.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCategoriesMutation.mutateAsync(selectedCategories);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4">
                <Skeleton className="h-12 w-12 rounded-lg mb-3" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete seu Perfil de Prestador
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecione as categorias de serviços que você oferece. Isso ajudará os clientes a encontrarem você mais facilmente na plataforma Hive.
          </p>
          
          <div className="mt-6">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-4 w-4 mr-1" />
              {user?.planType === 'A' || user?.providerPlan === 'A' ? 'Plano BE HIVE Ativado' : 'Plano HIVE GOLD Ativado'}
            </Badge>
          </div>
        </div>

        {/* Categories Grid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">
              Escolha as Categorias de Serviço
              {selectedCategories.length > 0 && (
                <Badge className="ml-3 bg-amber-100 text-amber-700">
                  {selectedCategories.length} selecionada{selectedCategories.length > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories?.map((category: ServiceCategory) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedCategories.includes(category.id)
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 bg-white hover:border-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`text-2xl p-2 rounded-lg ${
                          selectedCategories.includes(category.id)
                            ? 'bg-amber-100'
                            : 'bg-gray-100'
                        }`}>
                          {category.icon}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {category.providerCount} prestadores
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedCategories.includes(category.id) && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/dashboard')}
            disabled={isSubmitting}
            className="px-8"
          >
            Pular por Agora
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={selectedCategories.length === 0 || isSubmitting}
            className="px-8 bg-amber-500 hover:bg-amber-600"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Finalizar Cadastro
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            💡 Você pode alterar essas categorias a qualquer momento no seu dashboard
          </p>
        </div>
      </div>
    </div>
  );
}