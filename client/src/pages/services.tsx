import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Phone, Users, Clock, CheckCircle, Search, Zap, Wrench, Paintbrush, TreePine, HardHat, Wind, Monitor, Hammer, Sparkles, Leaf, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  providerCount: number;
  averageRating: string;
  featured?: boolean;
}

interface UserProfile {
  id: string;
  documentType: string;
  displayName: string;
  bio: string;
  profession: string;
  city: string;
  state: string;
  specialties: string[];
  services: string[];
  profileImage: string;
  rating: string;
  reviewCount: number;
  completedJobs: number;
  responseTime: number;
  verified: boolean;
  available: boolean;
  planType: string;
  phone: string;
  socialLinks?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    website?: string;
    linkedin?: string;
  };
  portfolioImages: string[];
  companyName?: string;
  tradeName?: string;
  foundedYear?: number;
  employeeCount?: number;
  companyDescription?: string;
  website?: string;
}

export default function ServicesPage() {
  // Função para mapear ícones das categorias
  const getCategoryIcon = (slug: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'eletricista': <Zap className="w-8 h-8" />,
      'encanador': <Wrench className="w-8 h-8" />,
      'pintor': <Paintbrush className="w-8 h-8" />,
      'paisagista': <TreePine className="w-8 h-8" />,
      'construcao': <HardHat className="w-8 h-8" />,
      'ar-condicionado': <Wind className="w-8 h-8" />,
      'assistencia-tecnica': <Monitor className="w-8 h-8" />,
      'marceneiro': <Hammer className="w-8 h-8" />,
      'limpeza': <Sparkles className="w-8 h-8" />,
      'jardinagem': <Leaf className="w-8 h-8" />,
      'seguranca': <Shield className="w-8 h-8" />
    };
    return iconMap[slug] || <Wrench className="w-8 h-8" />;
  };
  const params = useParams();
  const categoryParam = params.category;
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');

  // Buscar categorias de serviço
  const { data: categories, isLoading: categoriesLoading } = useQuery<ServiceCategory[]>({
    queryKey: ['/api/service-categories'],
  });

  // Buscar profissionais (perfis integrados)
  const { data: profiles, isLoading: profilesLoading } = useQuery<UserProfile[]>({
    queryKey: ['/api/profiles'],
  });

  // Filtrar e ranquear profissionais
  const filteredAndRankedProfiles = profiles?.filter((profile: UserProfile) => {
    const matchesSearch = !searchQuery || 
      profile.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || profile.profession === selectedCategory;
    
    const matchesCity = selectedCity === 'all' || profile.city.toLowerCase().includes(selectedCity.toLowerCase());
    
    const matchesRating = selectedRating === 'all' || parseFloat(profile.rating) >= parseFloat(selectedRating);
    
    return matchesSearch && matchesCategory && matchesCity && matchesRating;
  }).sort((a, b) => {
    // Primeiro por verificação, depois por rating, depois por trabalhos concluídos
    if (a.verified !== b.verified) return b.verified ? 1 : -1;
    if (parseFloat(b.rating) !== parseFloat(a.rating)) return parseFloat(b.rating) - parseFloat(a.rating);
    return b.completedJobs - a.completedJobs;
  });

  // Agrupar por profissão/categoria
  const groupedProfiles = filteredAndRankedProfiles?.reduce((acc, profile) => {
    const profession = profile.profession || 'Outros';
    if (!acc[profession]) {
      acc[profession] = [];
    }
    acc[profession].push(profile);
    return acc;
  }, {} as Record<string, UserProfile[]>) || {};

  const isLoading = categoriesLoading || profilesLoading;

  // Debug - verificar dados carregados
  console.log('Profiles loaded:', profiles?.length, profiles);
  console.log('Filtered profiles:', filteredAndRankedProfiles?.length);
  console.log('Grouped profiles:', Object.keys(groupedProfiles));

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-hive-black mb-4">
            Profissionais Especializados
          </h1>
          <p className="text-gray-600 text-lg">
            Encontre os melhores prestadores de serviço da sua região, ranqueados por qualidade e experiência
          </p>
        </div>

        {/* Categorias em Destaque */}
        {!categoryParam && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-hive-black mb-6">Categorias Populares</h2>
            {categoriesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories?.slice(0, 6).map((category) => (
                  <Link key={category.id} href={`/services/${category.slug}`}>
                    <Card className="h-32 hover:shadow-md transition-all cursor-pointer group bg-white">
                      <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform text-hive-gold">
                          {getCategoryIcon(category.slug)}
                        </div>
                        <h3 className="font-semibold text-sm text-hive-black mb-1">{category.name}</h3>
                        <p className="text-xs text-gray-500">{category.providerCount} profissionais</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar profissionais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="Eletricista">Eletricista</SelectItem>
                <SelectItem value="Encanador">Encanador</SelectItem>
                <SelectItem value="Pintor">Pintor</SelectItem>
                <SelectItem value="Paisagista">Paisagista</SelectItem>
                <SelectItem value="Construção Civil">Construção Civil</SelectItem>
                <SelectItem value="Ar Condicionado">Ar Condicionado</SelectItem>
                <SelectItem value="Assistência Técnica">Assistência Técnica</SelectItem>
                <SelectItem value="Marceneiro">Marceneiro</SelectItem>
                <SelectItem value="Limpeza">Limpeza</SelectItem>
                <SelectItem value="Jardinagem">Jardinagem</SelectItem>
                <SelectItem value="Serralheiro">Serralheiro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                <SelectItem value="são paulo">São Paulo</SelectItem>
                <SelectItem value="rio de janeiro">Rio de Janeiro</SelectItem>
                <SelectItem value="belo horizonte">Belo Horizonte</SelectItem>
                <SelectItem value="brasília">Brasília</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger>
                <SelectValue placeholder="Avaliação mínima" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer avaliação</SelectItem>
                <SelectItem value="4.5">4.5+ estrelas</SelectItem>
                <SelectItem value="4.0">4.0+ estrelas</SelectItem>
                <SelectItem value="3.5">3.5+ estrelas</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-hive-gold hover:bg-hive-gold-dark text-white">
              Filtrar
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        {!isLoading && filteredAndRankedProfiles && filteredAndRankedProfiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">{filteredAndRankedProfiles.length}</div>
                <div className="text-blue-100">Profissionais Encontrados</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">
                  {filteredAndRankedProfiles.filter(p => p.verified).length}
                </div>
                <div className="text-green-100">Verificados</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">
                  {(filteredAndRankedProfiles.reduce((sum, p) => sum + parseFloat(p.rating), 0) / filteredAndRankedProfiles.length).toFixed(1)}⭐
                </div>
                <div className="text-yellow-100">Avaliação Média</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">
                  {Object.keys(groupedProfiles).length}
                </div>
                <div className="text-purple-100">Categorias</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Profissionais por Categoria */}
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-80 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedProfiles).map(([profession, profileList]) => (
              <div key={profession}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-hive-black">{profession}</h2>
                  <Badge variant="secondary" className="text-sm">
                    {profileList.length} {profileList.length === 1 ? 'profissional' : 'profissionais'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profileList.map((profile) => (
                    <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={profile.profileImage}
                          alt={profile.displayName}
                          className="w-full h-48 object-cover"
                        />
                        {profile.verified && (
                          <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                        {!profile.available && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <Badge variant="secondary" className="text-white bg-red-500">
                              Indisponível
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-hive-black mb-1">{profile.displayName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {profile.documentType === 'CPF' ? 'Profissional' : 'Empresa'}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-gray-600">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="font-semibold">{profile.rating}</span>
                              <span className="text-gray-400 ml-1">({profile.reviewCount})</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{profile.bio}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {profile.city}, {profile.state}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            {profile.completedJobs} trabalhos concluídos
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            Responde em {profile.responseTime} min
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {profile.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {profile.specialties.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{profile.specialties.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-hive-gold hover:bg-hive-gold-dark text-white"
                            onClick={() => window.location.href = `/profile/${profile.id}`}
                          >
                            Ver Perfil
                          </Button>
                          {profile.socialLinks?.whatsapp && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://wa.me/${profile.socialLinks?.whatsapp}`, '_blank')}
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(groupedProfiles).length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Users className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum profissional encontrado</h3>
                <p className="text-gray-500">
                  {profiles?.length ? 'Tente ajustar os filtros para encontrar mais profissionais.' : 'Carregando profissionais...'}
                </p>
                <div className="mt-4 text-sm text-gray-400">
                  Debug: {profiles?.length || 0} perfis carregados, {filteredAndRankedProfiles?.length || 0} após filtros
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}