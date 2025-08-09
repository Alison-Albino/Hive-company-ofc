import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User, LogOut, LogIn, Home } from "lucide-react";
import { Link } from "wouter";

export function AuthStatus() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 text-white">
        <Link href="/auth">
          <LogIn className="w-4 h-4 mr-2" />
          Entrar
        </Link>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-amber-600 border-amber-600 hover:bg-amber-50">
          <User className="w-4 h-4" />
          Perfil
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div>
            <Link href="/dashboard" className="hover:text-amber-600 transition-colors">
              <p className="font-medium cursor-pointer">{user?.name}</p>
            </Link>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={user?.userType === "provider" ? "default" : "secondary"}>
                {user?.userType === "provider" ? "Prestador" : "Visualizador"}
              </Badge>
              {user?.planType && (
                <Badge variant={user.planStatus === "active" ? "default" : "secondary"}>
                  Plano {user.planType} - {user.planStatus === "active" ? "Ativo" : "Inativo"}
                </Badge>
              )}
            </div>
            
            {user?.userType === "provider" && (
              <div className="text-sm">
                <p className="text-gray-600 mb-1">Status da Conta:</p>
                <div className="flex items-center gap-2">
                  <Badge variant={user.isVerified ? "default" : "outline"}>
                    {user.isVerified ? "Verificada" : "Pendente"}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {user.completionPercentage}% completo
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Acessar Painel
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}