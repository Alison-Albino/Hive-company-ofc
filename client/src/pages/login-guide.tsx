import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Lock, Building, Zap } from "lucide-react";

export default function LoginGuide() {
  const testUsers = [
    {
      email: "admin@hive.com",
      password: "123456",
      name: "Admin Teste",
      type: "Visualizador Admin",
      description: "Acesso completo para administração",
      icon: <User className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-800 border-blue-200"
    },
    {
      email: "viewer@test.com",
      password: "123456", 
      name: "João Silva",
      type: "Visualizador",
      description: "Usuário comum para visualizar propriedades",
      icon: <User className="w-5 h-5" />,
      color: "bg-gray-100 text-gray-800 border-gray-200"
    },
    {
      email: "eletricista@test.com",
      password: "123456",
      name: "Carlos Elétrico", 
      type: "Prestador Eletricista (Plano A)",
      description: "Prestador de serviços com plano CPF ativo",
      icon: <Zap className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200"
    },
    {
      email: "imobiliaria@test.com",
      password: "123456",
      name: "Premium Imóveis RJ",
      type: "Prestador Imobiliária (Plano B)",
      description: "Imobiliária com permissão para cadastrar propriedades",
      icon: <Building className="w-5 h-5" />,
      color: "bg-green-100 text-green-800 border-green-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Usuários de Teste - Hive
          </h1>
          <p className="text-gray-600">
            Use as credenciais abaixo para testar diferentes tipos de usuário
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {testUsers.map((user) => (
            <Card key={user.email} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {user.icon}
                  {user.name}
                </CardTitle>
                <CardDescription>
                  {user.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge className={user.color}>
                  {user.type}
                </Badge>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {user.email}
                    </code>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {user.password}
                    </code>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <a href="/login">Fazer Login</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">
              Como Testar o Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-amber-700">
            <div>
              <h4 className="font-medium">1. Testando Permissões:</h4>
              <p className="text-sm">
                • Apenas a <strong>imobiliaria@test.com</strong> pode cadastrar propriedades
              </p>
              <p className="text-sm">
                • Prestadores precisam de plano ativo para oferecer serviços
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">2. Verificando Status:</h4>
              <p className="text-sm">
                • Acesse <strong>/auth-test</strong> após fazer login para ver todas as informações
              </p>
              <p className="text-sm">
                • O status aparece no canto superior direito da navegação
              </p>
            </div>

            <div>
              <h4 className="font-medium">3. Tipos de Plano:</h4>
              <p className="text-sm">
                • <strong>Plano A (CPF):</strong> Prestadores individuais 
              </p>
              <p className="text-sm">
                • <strong>Plano B (CNPJ):</strong> Empresas e imobiliárias
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="outline" asChild>
            <a href="/">Voltar ao Início</a>
          </Button>
        </div>
      </div>
    </div>
  );
}