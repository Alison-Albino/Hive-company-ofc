import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Plus, Home, TrendingUp, Eye, MapPin, Edit, Trash2, Camera, DollarSign } from "lucide-react";

interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  priceType: string;
  propertyType: string;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  imageUrl: string;
  status: string;
  views: number;
  featured: boolean;
}

export function RealEstateDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [newProperty, setNewProperty] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'sale',
    propertyType: 'apartment',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    imageUrl: '',
  });

  // Buscar propriedades da imobiliária
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/my-properties'],
    enabled: !!user && user.categories?.includes('imobiliaria'),
  });

  // Estatísticas
  const stats = {
    totalProperties: properties?.length || 0,
    activeProperties: properties?.filter(p => p.status === 'available').length || 0,
    totalViews: properties?.reduce((sum, p) => sum + p.views, 0) || 0,
    featuredProperties: properties?.filter(p => p.featured).length || 0,
  };

  const createPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      const response = await apiRequest('POST', '/api/properties', propertyData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Imóvel Cadastrado",
        description: "Propriedade adicionada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-properties'] });
      setIsAddDialogOpen(false);
      setNewProperty({
        title: '',
        description: '',
        price: '',
        priceType: 'sale',
        propertyType: 'apartment',
        location: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        imageUrl: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar imóvel",
        variant: "destructive",
      });
    },
  });

  const handleSubmitProperty = (e: React.FormEvent) => {
    e.preventDefault();
    
    const propertyData = {
      ...newProperty,
      bedrooms: newProperty.bedrooms ? parseInt(newProperty.bedrooms) : undefined,
      bathrooms: newProperty.bathrooms ? parseInt(newProperty.bathrooms) : undefined,
      area: newProperty.area ? parseInt(newProperty.area) : undefined,
      agencyName: user?.name || 'Imobiliária',
      agencyId: user?.provider?.id,
      agencyLogo: user?.profileImage,
    };

    createPropertyMutation.mutate(propertyData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Painel Imobiliário</h2>
          <p className="text-gray-600">Gerencie seu portfólio de imóveis</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Imóvel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Imóvel</DialogTitle>
              <DialogDescription>
                Adicione um novo imóvel ao seu portfólio
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitProperty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Título do Imóvel *</Label>
                  <Input
                    id="title"
                    value={newProperty.title}
                    onChange={(e) => setNewProperty({...newProperty, title: e.target.value})}
                    placeholder="Ex: Apartamento 3 quartos na Copacabana"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProperty.price}
                    onChange={(e) => setNewProperty({...newProperty, price: e.target.value})}
                    placeholder="450000.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="priceType">Tipo de Negócio *</Label>
                  <Select value={newProperty.priceType} onValueChange={(value) => setNewProperty({...newProperty, priceType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Venda</SelectItem>
                      <SelectItem value="rent">Aluguel</SelectItem>
                      <SelectItem value="event">Eventos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="propertyType">Tipo de Imóvel *</Label>
                  <Select value={newProperty.propertyType} onValueChange={(value) => setNewProperty({...newProperty, propertyType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartamento</SelectItem>
                      <SelectItem value="house">Casa</SelectItem>
                      <SelectItem value="commercial">Comercial</SelectItem>
                      <SelectItem value="event_hall">Salão de Eventos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="location">Localização *</Label>
                  <Input
                    id="location"
                    value={newProperty.location}
                    onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                    placeholder="Bairro, Cidade - Estado"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={newProperty.bedrooms}
                    onChange={(e) => setNewProperty({...newProperty, bedrooms: e.target.value})}
                    placeholder="3"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bathrooms">Banheiros</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    value={newProperty.bathrooms}
                    onChange={(e) => setNewProperty({...newProperty, bathrooms: e.target.value})}
                    placeholder="2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    min="0"
                    value={newProperty.area}
                    onChange={(e) => setNewProperty({...newProperty, area: e.target.value})}
                    placeholder="120"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="imageUrl">URL da Imagem Principal *</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={newProperty.imageUrl}
                    onChange={(e) => setNewProperty({...newProperty, imageUrl: e.target.value})}
                    placeholder="https://exemplo.com/imagem.jpg"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={newProperty.description}
                    onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                    placeholder="Descreva as características e diferenciais do imóvel..."
                    rows={3}
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPropertyMutation.isPending}>
                  {createPropertyMutation.isPending ? 'Salvando...' : 'Cadastrar Imóvel'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Imóveis</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeProperties}</p>
              </div>
              <Home className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold text-amber-600">{stats.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Destaque</p>
                <p className="text-2xl font-bold text-purple-600">{stats.featuredProperties}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Propriedades */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Imóveis</CardTitle>
          <CardDescription>
            Gerencie todas as suas propriedades cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-gray-100">
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/400/200';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                        {property.status === 'available' ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location}
                    </p>
                    <p className="text-2xl font-bold text-amber-600 mb-2">
                      R$ {parseFloat(property.price).toLocaleString('pt-BR')}
                      <span className="text-sm text-gray-500 font-normal">
                        {property.priceType === 'sale' ? '' : '/mês'}
                      </span>
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      {property.bedrooms && (
                        <span>{property.bedrooms} quartos</span>
                      )}
                      {property.bathrooms && (
                        <span>{property.bathrooms} banheiros</span>
                      )}
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {property.views}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum imóvel cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece adicionando seu primeiro imóvel ao portfólio
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Imóvel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}