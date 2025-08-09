import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Ruler,
  Phone,
  Mail,
  MessageCircle,
  Heart,
  Share2,
  Camera,
  Eye,
  Building,
  Shield
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  parkingSpaces?: number;
  area?: number;
  imageUrl: string;
  images: string[];
  amenities: string[];
  agencyName: string;
  agencyId?: string;
  agencyPhone?: string;
  agencyEmail?: string;
  agencyLogo?: string;
  status: string;
  featured: boolean;
  views: number;
}

export default function PropertyDetail() {
  const [match, params] = useRoute("/property/:id");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["/api/properties", params?.id],
    enabled: !!params?.id,
  });

  const updateViewsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/properties/${params?.id}/view`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties", params?.id] });
    },
  });

  const startChatMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/chat/conversations", {
        providerId: property?.agencyId || "agency-" + property?.id,
      });
    },
    onSuccess: (conversation: any) => {
      window.location.href = `/chat?conversation=${conversation.id}`;
    },
    onError: (error: any) => {
      if (error.message.includes("401") || error.message.includes("Não autorizado")) {
        toast({
          title: "Acesso Restrito",
          description: "Você precisa fazer login para conversar com imobiliárias.",
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

  const handleStartChat = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Necessário",
        description: "Você precisa fazer login para conversar com imobiliárias.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation('/auth');
      }, 1500);
      return;
    }
    startChatMutation.mutate();
  };

  useEffect(() => {
    if (property && !updateViewsMutation.data) {
      updateViewsMutation.mutate();
    }
  }, [property]);

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Imóvel não encontrado</h2>
          <p className="text-gray-600 mb-4">O imóvel que você está procurando não existe ou foi removido.</p>
          <Link href="/properties">
            <Button>Voltar aos imóveis</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string, type: string) => {
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(price));
    
    if (type === "rent") return `${formatted}/mês`;
    if (type === "event") return `${formatted}/evento`;
    return formatted;
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      house: "Casa",
      apartment: "Apartamento",
      commercial: "Sala Comercial",
      event_hall: "Salão de Festas",
    };
    return types[type] || type;
  };

  const allImages = [property.imageUrl, ...(property.images || [])];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/properties">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos imóveis
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                     onClick={() => setIsLiked(!isLiked)} />
              Favoritar
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={allImages[selectedImageIndex]}
                    alt={property.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm flex items-center">
                    <Camera className="w-4 h-4 mr-1" />
                    {selectedImageIndex + 1} / {allImages.length}
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                    <Badge variant="secondary">
                      {getPropertyTypeLabel(property.propertyType)}
                    </Badge>
                    {property.featured && (
                      <Badge className="bg-hive-gold">Destaque</Badge>
                    )}
                  </div>
                </div>
                
                {/* Thumbnail Gallery */}
                <div className="p-4 grid grid-cols-6 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-16 rounded overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index ? 'border-hive-gold' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${property.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Property Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{property.title}</CardTitle>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="w-4 h-4 mr-1" />
                      {property.views} visualizações
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-hive-gold">
                      {formatPrice(property.price, property.priceType)}
                    </div>
                    <Badge variant={property.status === "available" ? "default" : "secondary"}>
                      {property.status === "available" ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Property Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="w-5 h-5 text-hive-gold mr-2" />
                      <span className="text-sm">{property.bedrooms} quartos</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="w-5 h-5 text-hive-gold mr-2" />
                      <span className="text-sm">{property.bathrooms} banheiros</span>
                    </div>
                  )}
                  {property.parkingSpaces && (
                    <div className="flex items-center">
                      <Car className="w-5 h-5 text-hive-gold mr-2" />
                      <span className="text-sm">{property.parkingSpaces} vagas</span>
                    </div>
                  )}
                  {property.area && (
                    <div className="flex items-center">
                      <Ruler className="w-5 h-5 text-hive-gold mr-2" />
                      <span className="text-sm">{property.area}m²</span>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Comodidades</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact and Agency Info */}
          <div className="space-y-6">
            {/* Agency Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Imobiliária
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage 
                      src={property.agencyLogo || "/placeholder-agency.png"} 
                      alt={property.agencyName} 
                    />
                    <AvatarFallback>
                      {property.agencyName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{property.agencyName}</h4>
                    <div className="flex items-center text-sm text-green-600">
                      <Shield className="w-3 h-3 mr-1" />
                      Imobiliária verificada
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {property.agencyPhone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-hive-gold" />
                      <span className="text-sm">{property.agencyPhone}</span>
                    </div>
                  )}
                  {property.agencyEmail && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-hive-gold" />
                      <span className="text-sm">{property.agencyEmail}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4">
                  <Button 
                    onClick={handleStartChat}
                    disabled={startChatMutation.isPending}
                    className="bg-hive-gold hover:bg-hive-gold-dark"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {startChatMutation.isPending ? "Iniciando..." : 
                     !isAuthenticated ? "Fazer login para conversar" : "Iniciar conversa"}
                  </Button>
                  
                  {property.agencyPhone && (
                    <Button variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Ligar agora
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações rápidas</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="w-4 h-4 mr-2" />
                  Ver no mapa
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="w-4 h-4 mr-2" />
                  Agendar visita
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar imóvel
                </Button>
              </CardContent>
            </Card>

            {/* Property Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do imóvel</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Código do imóvel:</span>
                    <span className="font-mono text-sm">{property.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visualizações:</span>
                    <span>{property.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={property.status === "available" ? "default" : "secondary"}>
                      {property.status === "available" ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}