import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useParams } from 'wouter';

interface UserProfile {
  id: string;
  documentType: 'CPF' | 'CNPJ';
  displayName: string;
  bio?: string;
  phone?: string;
  city?: string;
  state?: string;
  profession?: string;
  specialties: string[];
  services: string[];
  profileImage?: string;
  coverImage?: string;
  portfolioImages: string[];
  rating: string;
  reviewCount: number;
  completedJobs: number;
  responseTime: number;
  verified: boolean;
  available: boolean;
  planType: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    whatsapp?: string;
    website?: string;
  };
  // Campos específicos para CNPJ
  companyName?: string;
  tradeName?: string;
  foundedYear?: number;
  employeeCount?: number;
  companyDescription?: string;
  website?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  serviceType: string;
  createdAt: string;
  reviewerId: string;
  reviewerName: string;
}

export default function ProfilePage() {
  const { profileId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profiles', profileId],
    enabled: !!profileId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['/api/profiles', profileId, 'reviews'],
    enabled: !!profileId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updatedProfile: Partial<UserProfile>) =>
      apiRequest(`/api/profiles/${profileId}`, 'PATCH', updatedProfile),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/profiles', profileId]);
      setIsEditing(false);
    },
  });

  const createChatMutation = useMutation({
    mutationFn: (receiverId: string) =>
      apiRequest('/api/chat/conversations', 'POST', { receiverId }),
    onSuccess: (conversation) => {
      // Redirect to chat or open chat dialog
      setIsChatOpen(true);
    },
  });

  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="bg-white rounded-xl h-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl h-48"></div>
                <div className="bg-white rounded-xl h-32"></div>
              </div>
              <div className="bg-white rounded-xl h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl p-12">
            <i className="fas fa-user-slash text-6xl text-gray-400 mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Perfil não encontrado</h1>
            <p className="text-gray-600">O perfil que você está procurando não existe ou foi removido.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header com foto de capa */}
        <Card className="mb-8 overflow-hidden">
          <div 
            className="h-64 bg-gradient-to-r from-hive-gold to-hive-gold-dark relative"
            style={profile.coverImage ? { 
              backgroundImage: `url(${profile.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end space-x-6">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.profileImage} />
                  <AvatarFallback className="text-2xl bg-hive-gold text-white">
                    {profile.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pb-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
                    {profile.verified && (
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        <i className="fas fa-check-circle mr-1"></i>
                        Verificado
                      </Badge>
                    )}
                    <Badge variant={profile.available ? "default" : "secondary"}>
                      <i className={`fas fa-circle mr-1 ${profile.available ? 'text-green-400' : 'text-gray-400'}`}></i>
                      {profile.available ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-white">
                    <div className="flex items-center">
                      <i className="fas fa-star text-yellow-400 mr-1"></i>
                      <span className="font-semibold">{profile.rating}</span>
                      <span className="ml-1">({profile.reviewCount} avaliações)</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-briefcase mr-2"></i>
                      <span>{profile.completedJobs} trabalhos realizados</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-clock mr-2"></i>
                      <span>Responde em {profile.responseTime}min</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => createChatMutation.mutate(profile.id)}
                    className="bg-hive-gold hover:bg-hive-gold-dark text-white px-6 py-2"
                    disabled={createChatMutation.isPending}
                  >
                    <i className="fas fa-comment-dots mr-2"></i>
                    {createChatMutation.isPending ? 'Conectando...' : 'Conversar'}
                  </Button>
                  {/* TODO: Add edit button for own profile */}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="sobre" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sobre">Sobre</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
                <TabsTrigger value="contato">Contato</TabsTrigger>
              </TabsList>

              <TabsContent value="sobre">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {profile.documentType === 'CNPJ' ? 'Sobre a Empresa' : 'Sobre o Profissional'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profile.bio && (
                      <div>
                        <h3 className="font-semibold mb-2">Descrição</h3>
                        <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
                      </div>
                    )}

                    {profile.documentType === 'CNPJ' && (
                      <>
                        {profile.companyDescription && (
                          <div>
                            <h3 className="font-semibold mb-2">Sobre a Empresa</h3>
                            <p className="text-gray-700">{profile.companyDescription}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {profile.companyName && (
                            <div>
                              <h4 className="font-medium text-gray-600">Razão Social</h4>
                              <p className="text-gray-800">{profile.companyName}</p>
                            </div>
                          )}
                          {profile.tradeName && (
                            <div>
                              <h4 className="font-medium text-gray-600">Nome Fantasia</h4>
                              <p className="text-gray-800">{profile.tradeName}</p>
                            </div>
                          )}
                          {profile.foundedYear && (
                            <div>
                              <h4 className="font-medium text-gray-600">Ano de Fundação</h4>
                              <p className="text-gray-800">{profile.foundedYear}</p>
                            </div>
                          )}
                          {profile.employeeCount && (
                            <div>
                              <h4 className="font-medium text-gray-600">Número de Funcionários</h4>
                              <p className="text-gray-800">{profile.employeeCount}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {profile.specialties.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Especialidades</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.services.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Serviços Oferecidos</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.services.map((service, index) => (
                            <Badge key={index} className="bg-hive-gold hover:bg-hive-gold-dark text-white">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {profile.portfolioImages.map((image, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={image} 
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <i className="fas fa-images text-4xl text-gray-400 mb-4"></i>
                        <p className="text-gray-600">Nenhuma imagem de portfolio disponível</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="avaliacoes">
                <Card>
                  <CardHeader>
                    <CardTitle>Avaliações dos Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviews && reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review: Review) => (
                          <div key={review.id} className="border-b pb-6 last:border-b-0">
                            <div className="flex items-start space-x-3">
                              <Avatar>
                                <AvatarFallback>{review.reviewerName?.slice(0, 2) || '??'}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-medium">{review.reviewerName || 'Cliente'}</span>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <i 
                                        key={i}
                                        className={`fas fa-star text-sm ${
                                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {review.serviceType && (
                                  <Badge variant="outline" className="mb-2">
                                    {review.serviceType}
                                  </Badge>
                                )}
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <i className="fas fa-star text-4xl text-gray-400 mb-4"></i>
                        <p className="text-gray-600">Ainda não há avaliações</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contato">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Contato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.phone && (
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-phone text-hive-gold w-5"></i>
                        <span>{profile.phone}</span>
                        <Button size="sm" variant="outline">
                          <i className="fas fa-copy mr-1"></i>
                          Copiar
                        </Button>
                      </div>
                    )}
                    
                    {profile.city && profile.state && (
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-map-marker-alt text-hive-gold w-5"></i>
                        <span>{profile.city}, {profile.state}</span>
                      </div>
                    )}

                    {Object.entries(profile.socialLinks).filter(([_, url]) => url).length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Redes Sociais</h3>
                        <div className="space-y-2">
                          {profile.socialLinks.instagram && (
                            <a 
                              href={profile.socialLinks.instagram} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 text-pink-600 hover:text-pink-700"
                            >
                              <i className="fab fa-instagram w-5"></i>
                              <span>Instagram</span>
                            </a>
                          )}
                          {profile.socialLinks.facebook && (
                            <a 
                              href={profile.socialLinks.facebook} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 text-blue-600 hover:text-blue-700"
                            >
                              <i className="fab fa-facebook w-5"></i>
                              <span>Facebook</span>
                            </a>
                          )}
                          {profile.socialLinks.linkedin && (
                            <a 
                              href={profile.socialLinks.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 text-blue-800 hover:text-blue-900"
                            >
                              <i className="fab fa-linkedin w-5"></i>
                              <span>LinkedIn</span>
                            </a>
                          )}
                          {profile.socialLinks.whatsapp && (
                            <a 
                              href={`https://wa.me/${profile.socialLinks.whatsapp.replace(/[^\d]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 text-green-600 hover:text-green-700"
                            >
                              <i className="fab fa-whatsapp w-5"></i>
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {profile.socialLinks.website && (
                            <a 
                              href={profile.socialLinks.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 text-gray-600 hover:text-gray-700"
                            >
                              <i className="fas fa-globe w-5"></i>
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Card de plano */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-crown text-hive-gold mr-2"></i>
                  Plano {profile.planType}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-hive-gold mb-2">
                    {profile.documentType === 'CNPJ' ? 'EMPRESA' : 'PROFISSIONAL'}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {profile.documentType === 'CNPJ' 
                      ? 'Perfil empresarial com recursos avançados'
                      : 'Perfil individual com recursos básicos'
                    }
                  </p>
                  <Button className="w-full bg-hive-gold hover:bg-hive-gold-dark text-white">
                    <i className="fas fa-star mr-2"></i>
                    Ver Detalhes do Plano
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card de ação rápida */}
            <Card>
              <CardHeader>
                <CardTitle>Contato Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => createChatMutation.mutate(profile.id)}
                  className="w-full bg-hive-gold hover:bg-hive-gold-dark text-white"
                  disabled={createChatMutation.isPending}
                >
                  <i className="fas fa-comment-dots mr-2"></i>
                  Iniciar Conversa
                </Button>
                {profile.phone && (
                  <Button variant="outline" className="w-full">
                    <i className="fas fa-phone mr-2"></i>
                    Ligar Agora
                  </Button>
                )}
                {profile.socialLinks.whatsapp && (
                  <Button variant="outline" className="w-full text-green-600 border-green-600 hover:bg-green-50">
                    <i className="fab fa-whatsapp mr-2"></i>
                    WhatsApp
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Card de estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avaliação média</span>
                  <div className="flex items-center">
                    <i className="fas fa-star text-yellow-400 mr-1"></i>
                    <span className="font-semibold">{profile.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total de avaliações</span>
                  <span className="font-semibold">{profile.reviewCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trabalhos concluídos</span>
                  <span className="font-semibold">{profile.completedJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tempo de resposta</span>
                  <span className="font-semibold">{profile.responseTime} min</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conversa com {profile.displayName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <i className="fas fa-comments text-3xl text-hive-gold mb-2"></i>
              <p className="text-gray-700">Sistema de chat será implementado em breve!</p>
            </div>
            <Button 
              onClick={() => setIsChatOpen(false)}
              className="w-full bg-hive-gold hover:bg-hive-gold-dark text-white"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}