import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Building, CheckCircle, XCircle } from "lucide-react";

export default function AuthTest() {
  const { user, isLoading, isAuthenticated, logout, canCreateProperty } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Status de Autenticação
          </h1>
          <p className="text-gray-600">
            Verifique seu status de login e permissões
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Status do Usuário
            </CardTitle>
            <CardDescription>
              Informações sobre seu login atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Autenticado:</span>
              {isAuthenticated ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Sim
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Não
                </Badge>
              )}
            </div>

            {user && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Nome:</span>
                    <p className="text-gray-700">{user.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-gray-700">{user.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tipo de Usuário:</span>
                    <Badge variant={user.userType === "provider" ? "default" : "secondary"}>
                      {user.userType === "provider" ? "Prestador" : "Visualizador"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>

                {user.provider && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Informações do Prestador
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Categorias:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.provider.categories.map((cat) => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Plano:</span>
                          <Badge variant="secondary">
                            Plano {user.provider.planType}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Plano Ativo:</span>
                          <Badge variant={user.provider.planActive ? "default" : "destructive"}>
                            {user.provider.planActive ? "Sim" : "Não"}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Verificado:</span>
                          <Badge variant={user.provider.verified ? "default" : "secondary"}>
                            {user.provider.verified ? "Sim" : "Não"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Permissões
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Pode cadastrar propriedades:</span>
                        <Badge variant={canCreateProperty() ? "default" : "secondary"}>
                          {canCreateProperty() ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      {!canCreateProperty() && user.userType === "provider" && (
                        <p className="text-sm text-gray-600">
                          Apenas imobiliárias com plano ativo podem cadastrar propriedades.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    variant="outline"
                  >
                    {isLoggingOut ? "Saindo..." : "Sair"}
                  </Button>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="text-center space-y-4">
                <p className="text-gray-600">Você não está logado.</p>
                <div className="flex justify-center gap-2">
                  <Button asChild>
                    <a href="/login">Entrar</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/register">Cadastrar</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}