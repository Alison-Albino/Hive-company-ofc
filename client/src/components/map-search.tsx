import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Property } from "@shared/schema";

interface MapSearchProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  className?: string;
}

interface Location {
  id: string;
  name: string;
  type: string;
  distance: string;
  coordinates: [number, number];
}

export default function MapSearch({ properties, onPropertySelect, className = "" }: MapSearchProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-22.9068, -43.1729]); // Rio de Janeiro
  const [nearbyPlaces, setNearbyPlaces] = useState<Location[]>([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);

  // Carregar Google Maps API (por enquanto usar fallback customizado)
  useEffect(() => {
    // Para demonstração, vamos usar um mapa customizado estilizado
    setIsGoogleMapsLoaded(false); // Forçar uso do mapa customizado
  }, []);

  const getPropertyCoords = (property: Property): [number, number] => {
    // Coordenadas baseadas na localização
    if (property.location.includes("Copacabana")) return [-22.9711, -43.1822];
    if (property.location.includes("Ipanema")) return [-22.9838, -43.2056];
    if (property.location.includes("Barra")) return [-23.0175, -43.3212];
    if (property.location.includes("Centro")) return [-22.9035, -43.2096];
    return [-22.9068, -43.1729];
  };

  // Simulando locais próximos baseado na propriedade selecionada
  const generateNearbyPlaces = (property: Property): Location[] => {
    const places = [
      { type: "hospital", name: "Hospital São Lucas", distance: "800m" },
      { type: "school", name: "Colégio Pedro II", distance: "1.2km" },
      { type: "supermarket", name: "Extra Supermercado", distance: "500m" },
      { type: "pharmacy", name: "Farmácia Pacheco", distance: "300m" },
      { type: "bank", name: "Banco do Brasil", distance: "600m" },
      { type: "restaurant", name: "Restaurante Dois Irmãos", distance: "400m" },
      { type: "gym", name: "Academia Smart Fit", distance: "900m" },
      { type: "park", name: "Parque Lage", distance: "1.5km" }
    ];

    return places.map((place, index) => ({
      id: `${property.id}-${index}`,
      ...place,
      coordinates: [
        mapCenter[0] + (Math.random() - 0.5) * 0.01,
        mapCenter[1] + (Math.random() - 0.5) * 0.01
      ] as [number, number]
    }));
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect(property);
    
    const coords = getPropertyCoords(property);
    setMapCenter(coords);
    setNearbyPlaces(generateNearbyPlaces(property));
  };

  const getPlaceIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      hospital: "fas fa-hospital",
      school: "fas fa-school",
      supermarket: "fas fa-shopping-cart",
      pharmacy: "fas fa-pills",
      bank: "fas fa-university",
      restaurant: "fas fa-utensils",
      gym: "fas fa-dumbbell",
      park: "fas fa-tree"
    };
    return icons[type] || "fas fa-map-marker-alt";
  };

  const getPlaceColor = (type: string) => {
    const colors: { [key: string]: string } = {
      hospital: "bg-red-100 text-red-800",
      school: "bg-blue-100 text-blue-800", 
      supermarket: "bg-green-100 text-green-800",
      pharmacy: "bg-purple-100 text-purple-800",
      bank: "bg-yellow-100 text-yellow-800",
      restaurant: "bg-orange-100 text-orange-800",
      gym: "bg-gray-100 text-gray-800",
      park: "bg-emerald-100 text-emerald-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Mapa */}
        <div className="flex-1 relative">
          <div className="h-96 relative overflow-hidden">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 h-full flex items-center justify-center relative overflow-hidden">
            {/* Simulação de mapa com grid */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            {/* Marcadores das propriedades */}
            {properties.slice(0, 4).map((property, index) => (
              <div
                key={property.id}
                className={`absolute cursor-pointer transform transition-all duration-300 hover:scale-110 z-10 ${
                  selectedProperty?.id === property.id ? 'scale-125' : ''
                }`}
                style={{
                  left: `${20 + index * 20}%`,
                  top: `${30 + index * 15}%`
                }}
                onClick={() => handlePropertyClick(property)}
              >
                <div className={`bg-hive-gold text-white p-2 rounded-full shadow-lg border-2 border-white ${
                  selectedProperty?.id === property.id ? 'ring-2 ring-hive-gold' : ''
                }`}>
                  <i className="fas fa-home text-lg"></i>
                </div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white p-1 rounded shadow-md text-xs whitespace-nowrap">
                  R$ {new Intl.NumberFormat('pt-BR').format(parseFloat(property.price))}
                </div>
              </div>
            ))}

            {/* Marcadores dos locais próximos */}
            {nearbyPlaces.map((place, index) => (
              <div
                key={place.id}
                className="absolute transform transition-all duration-500 animate-pulse z-5"
                style={{
                  left: `${30 + index * 10}%`,
                  top: `${40 + index * 8}%`
                }}
              >
                <div className="bg-white text-gray-600 p-1 rounded-full shadow-md border">
                  <i className={`${getPlaceIcon(place.type)} text-sm`}></i>
                </div>
              </div>
            ))}

            <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-md text-xs">
              <i className="fas fa-map-marker-alt text-hive-gold mr-1"></i>
              Rio de Janeiro, RJ
            </div>
            
            {/* Indicação para API do Google Maps */}
            <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md text-xs">
              <i className="fas fa-info-circle text-blue-500 mr-1"></i>
              Mapa customizado (Google Maps API disponível)
            </div>
          </div>
          </div>
        </div>

        {/* Painel lateral com locais próximos */}
        <div className="w-full lg:w-80 bg-gray-50 p-4">
          <h3 className="font-bold text-lg mb-4">
            {selectedProperty ? 'Locais Próximos' : 'Selecione uma Propriedade'}
          </h3>
          
          {selectedProperty ? (
            <>
              <div className="bg-white p-3 rounded-lg mb-4 shadow-sm">
                <h4 className="font-semibold text-sm text-hive-black mb-1">
                  {selectedProperty.title}
                </h4>
                <p className="text-xs text-gray-600">
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  {selectedProperty.location}
                </p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {nearbyPlaces.map((place) => (
                  <div key={place.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <i className={`${getPlaceIcon(place.type)} text-gray-600 text-sm`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{place.name}</p>
                        <Badge className={`text-xs ${getPlaceColor(place.type)}`}>
                          {place.type}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {place.distance}
                    </span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full mt-4 bg-hive-gold hover:bg-hive-gold-dark text-white"
                onClick={() => alert("Função de navegação será implementada!")}
              >
                <i className="fas fa-route mr-2"></i>
                Ver Rotas
              </Button>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <i className="fas fa-map-marked-alt text-4xl mb-4"></i>
              <p>Clique em um marcador no mapa para ver os locais próximos e comodidades da região.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}