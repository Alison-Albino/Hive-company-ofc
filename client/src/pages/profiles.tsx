import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useLocation } from 'wouter';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserProfile {
  id: string;
  documentType: 'CPF' | 'CNPJ';
  displayName: string;
  bio?: string;
  profession?: string;
  city?: string;
  state?: string;
  specialties: string[];
  services: string[];
  profileImage?: string;
  rating: string;
  reviewCount: number;
  completedJobs: number;
  responseTime: number;
  verified: boolean;
  available: boolean;
  planType: string;
  companyName?: string;
  tradeName?: string;
}

export default function ProfilesPage() {
  const [documentType, setDocumentType] = useState<string>('all');
  const [city, setCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: profiles, isLoading } = useQuery<UserProfile[]>({
    queryKey: ['/api/profiles', { documentType: documentType === 'all' ? '' : documentType, city, search: searchQuery }],
  });

  const filteredProfiles = profiles?.filter((profile: UserProfile) =>
    profile.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startChatMutation = useMutation({
    mutationFn: async (providerId: string) => {
      return await apiRequest("POST", "/api/chat/conversations", {
        providerId: providerId,
      });
    },
    onSuccess: (conversation: any) => {
      window.location.href = `/chat?conversation=${conversation.id}`;
    },
    onError: (error: any) => {
      if (error.message.includes("401") || error.message.includes("Não autorizado")) {
        toast({
          title: "Acesso Restrito",
          description: "Você precisa fazer login para conversar com prestadores.",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation('/auth');
        }, 1500);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível iniciar a conversa. Tente novamente.",
          variant: "destructive",
        });
      }
    },
  });

  const handleStartChat = (providerId: string, providerName: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Necessário",
        description: `Você precisa fazer login para conversar com ${providerName}.`,
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation('/auth');
      }, 1500);
      return;
    }
    startChatMutation.mutate(providerId);
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-hive-black mb-4">
            Profissionais e Empresas
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encontre prestadores de serviços qualificados e empresas confiáveis em todo o Brasil
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Buscar profissionais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="col-span-2"
              />
              
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="CPF">Pessoa Física (CPF)</SelectItem>
                  <SelectItem value="CNPJ">Empresa (CNPJ)</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-hive-gold mb-2">
                {filteredProfiles?.length || 0}
              </div>
              <div className="text-gray-600">Perfis Encontrados</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {profiles?.filter((p: UserProfile) => p.documentType === 'CPF').length || 0}
              </div>
              <div className="text-gray-600">Profissionais</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {profiles?.filter((p: UserProfile) => p.documentType === 'CNPJ').length || 0}
              </div>
              <div className="text-gray-600">Empresas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {profiles?.filter((p: UserProfile) => p.verified).length || 0}
              </div>
              <div className="text-gray-600">Verificados</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de perfis */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProfiles?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-search text-6xl text-gray-400 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhum perfil encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros de busca para encontrar mais resultados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles?.map((profile: UserProfile) => (
              <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href={`/profile/${profile.id}`} className="block">
                  <div className="p-6">
                    {/* Header do cartão */}
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={profile.profileImage} />
                        <AvatarFallback className="bg-hive-gold text-white text-lg">
                          {profile.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg group-hover:text-hive-gold transition-colors">
                            {profile.displayName}
                          </h3>
                          {profile.verified && (
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                              <i className="fas fa-check-circle mr-1"></i>
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={profile.documentType === 'CNPJ' ? 'default' : 'secondary'}>
                            {profile.documentType === 'CNPJ' ? 'Empresa' : 'Profissional'}
                          </Badge>
                          <Badge variant={profile.available ? "outline" : "secondary"} className="text-xs">
                            {profile.available ? 'Disponível' : 'Ocupado'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Profissão e localização */}
                    {profile.profession && (
                      <p className="text-gray-700 font-medium mb-2">{profile.profession}</p>
                    )}
                    {profile.city && profile.state && (
                      <p className="text-gray-600 text-sm mb-4 flex items-center">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {profile.city}, {profile.state}
                      </p>
                    )}

                    {/* Bio ou nome da empresa */}
                    {profile.documentType === 'CNPJ' && profile.companyName && (
                      <p className="text-gray-700 text-sm mb-4">
                        <strong>Empresa:</strong> {profile.companyName}
                      </p>
                    )}
                    {profile.bio && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    {/* Especialidades */}
                    {profile.specialties.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {profile.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {profile.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{profile.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Estatísticas */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <i className="fas fa-star text-yellow-400 mr-1"></i>
                        <span className="font-medium">{profile.rating}</span>
                        <span className="ml-1">({profile.reviewCount})</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-briefcase mr-1"></i>
                        <span>{profile.completedJobs} trabalhos</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-clock mr-1"></i>
                        <span>{profile.responseTime}min</span>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 bg-hive-gold hover:bg-hive-gold-dark text-white"
                        size="sm"
                      >
                        <i className="fas fa-eye mr-2"></i>
                        Ver Perfil
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="px-3"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleStartChat(profile.id, profile.displayName);
                        }}
                        disabled={startChatMutation.isPending}
                        title={!isAuthenticated ? "Fazer login para conversar" : "Iniciar conversa"}
                      >
                        <i className="fas fa-comment-dots"></i>
                      </Button>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}