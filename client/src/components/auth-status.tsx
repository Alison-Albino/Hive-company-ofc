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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href="/login">
            <LogIn className="w-4 h-4 mr-1" />
            Entrar
          </a>
        </Button>
        <Button size="sm" asChild>
          <a href="/register">Cadastrar</a>
        </Button>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="w-4 h-4" />
          {user?.name}
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
          
          <div className="flex items-center gap-2">
            <Badge variant={user?.userType === "provider" ? "default" : "secondary"}>
              {user?.userType === "provider" ? "Prestador" : "Visualizador"}
            </Badge>
            {user?.provider && (
              <Badge variant={user.provider.planActive ? "default" : "secondary"}>
                Plano {user.provider.planType}
              </Badge>
            )}
          </div>

          {user?.provider && (
            <div className="text-sm space-y-1">
              <p className="text-gray-600">Categorias:</p>
              <div className="flex flex-wrap gap-1">
                {user.provider.categories.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Meu Dashboard
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="/auth-test">Status de Autenticação</a>
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