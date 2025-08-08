import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Property } from "@shared/schema";

interface MapSearchProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  className?: string;
  onLocationSearch?: (location: string, coordinates: [number, number]) => void;
}

interface Location {
  id: string;
  name: string;
  type: string;
  distance: string;
  coordinates: [number, number];
}

export default function MapSearch({ properties, onPropertySelect, className = "", onLocationSearch }: MapSearchProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-22.9068, -43.1729]); // Rio de Janeiro
  const [nearbyPlaces, setNearbyPlaces] = useState<Location[]>([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<[number, number] | null>(null);
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);

  // Carregar Google Maps API (por enquanto usar fallback customizado)
  useEffect(() => {
    // Para demonstração, vamos usar um mapa customizado estilizado
    setIsGoogleMapsLoaded(false); // Forçar uso do mapa customizado
  }, []);

  // Buscar localizações baseado na query
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulação de busca de locais (normalmente seria uma API como Google Places)
    const mockResults = [
      { name: `${query} - Centro, Rio de Janeiro`, coords: [-22.9035, -43.2096] },
      { name: `${query} - Copacabana, Rio de Janeiro`, coords: [-22.9711, -43.1822] },
      { name: `${query} - Ipanema, Rio de Janeiro`, coords: [-22.9838, -43.2056] },
      { name: `${query} - Barra da Tijuca, Rio de Janeiro`, coords: [-23.0175, -43.3212] },
      { name: `${query} - Zona Norte, Rio de Janeiro`, coords: [-22.8747, -43.2436] }
    ].filter(result => 
      result.name.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes("centro") ||
      query.toLowerCase().includes("copacabana") ||
      query.toLowerCase().includes("ipanema") ||
      query.toLowerCase().includes("barra") ||
      query.toLowerCase().includes("zona")
    );

    setTimeout(() => {
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  // Buscar propriedades próximas a um ponto clicado
  const findNearbyProperties = (coords: [number, number]) => {
    const nearby = properties.filter(property => {
      const propCoords = getPropertyCoords(property);
      const distance = Math.sqrt(
        Math.pow(propCoords[0] - coords[0], 2) + Math.pow(propCoords[1] - coords[1], 2)
      );
      return distance < 0.05; // Raio aproximado
    });
    setNearbyProperties(nearby);
  };

  // Handle map click
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Converter posição do clique em coordenadas aproximadas
    const coords: [number, number] = [
      mapCenter[0] + (y - rect.height/2) / rect.height * 0.05,
      mapCenter[1] + (x - rect.width/2) / rect.width * 0.05
    ];
    
    setClickedLocation(coords);
    findNearbyProperties(coords);
    setSelectedProperty(null);
  };

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    searchLocation(value);
  };

  // Handle search result selection
  const handleSearchSelect = (result: any) => {
    setMapCenter(result.coords);
    setSearchQuery(result.name);
    setSearchResults([]);
    setClickedLocation(result.coords);
    findNearbyProperties(result.coords);
    onLocationSearch?.(result.name, result.coords);
  };

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
      {/* Campo de Busca */}
      <div className="p-4 border-b bg-gray-50">
        <div className="relative">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar localização (ex: Copacabana, Centro, Ipanema...)"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-hive-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <Button
              onClick={() => handleSearchChange(searchQuery)}
              className="bg-hive-gold hover:bg-hive-gold-dark text-white"
              disabled={isSearching}
            >
              <i className="fas fa-search"></i>
            </Button>
          </div>
          
          {/* Resultados da busca */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSearchSelect(result)}
                >
                  <i className="fas fa-map-marker-alt text-hive-gold mr-3"></i>
                  <span className="text-sm text-gray-700">{result.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Mapa */}
        <div className="flex-1 relative">
          <div className="h-96 relative overflow-hidden">
            <div 
              className="bg-gradient-to-br from-blue-50 to-green-50 h-full flex items-center justify-center relative overflow-hidden cursor-pointer"
              onClick={handleMapClick}
            >
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

            {/* Marcador do local clicado/buscado */}
            {clickedLocation && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  left: '50%',
                  top: '50%'
                }}
              >
                <div className="bg-red-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                  <i className="fas fa-map-pin text-lg"></i>
                </div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md text-xs whitespace-nowrap">
                  Local selecionado
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-md text-xs">
              <i className="fas fa-map-marker-alt text-hive-gold mr-1"></i>
              {searchQuery || "Rio de Janeiro, RJ"}
            </div>
            
            {/* Indicações de interação */}
            <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md text-xs max-w-xs">
              <div className="flex items-center mb-1">
                <i className="fas fa-info-circle text-blue-500 mr-1"></i>
                <span>Clique no mapa para encontrar propriedades próximas</span>
              </div>
              <div className="text-xs text-gray-500">
                Use a busca acima para navegar para qualquer local
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Painel lateral com informações */}
        <div className="w-full lg:w-80 bg-gray-50 p-4">
          <h3 className="font-bold text-lg mb-4">
            {selectedProperty ? 'Locais Próximos' : clickedLocation ? 'Área Selecionada' : 'Buscar ou Clicar no Mapa'}
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
          ) : clickedLocation && nearbyProperties.length > 0 ? (
            <>
              <div className="bg-white p-3 rounded-lg mb-4 shadow-sm">
                <h4 className="font-semibold text-sm text-hive-black mb-1">
                  Propriedades Próximas
                </h4>
                <p className="text-xs text-gray-600">
                  {nearbyProperties.length} propriedades encontradas na região
                </p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {nearbyProperties.map((property) => (
                  <div 
                    key={property.id} 
                    className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePropertyClick(property)}
                  >
                    <h5 className="font-medium text-sm text-hive-black mb-1">{property.title}</h5>
                    <p className="text-xs text-gray-600 mb-2">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {property.location}
                    </p>
                    <p className="font-bold text-hive-gold text-sm">
                      R$ {new Intl.NumberFormat('pt-BR').format(parseFloat(property.price))}
                    </p>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full mt-4 bg-hive-gold hover:bg-hive-gold-dark text-white"
                onClick={() => {
                  const places = generateNearbyPlaces(nearbyProperties[0]);
                  setNearbyPlaces(places);
                }}
              >
                <i className="fas fa-map-marked-alt mr-2"></i>
                Ver Locais de Interesse
              </Button>
            </>
          ) : clickedLocation ? (
            <div className="text-center text-gray-500">
              <i className="fas fa-home text-4xl mb-4 text-gray-400"></i>
              <p className="mb-2">Nenhuma propriedade encontrada nesta área.</p>
              <p className="text-xs">Tente buscar ou clicar em outra região do mapa.</p>
              <Button 
                className="mt-4 bg-hive-gold hover:bg-hive-gold-dark text-white text-xs"
                onClick={() => {
                  // Simular locais de interesse na área clicada
                  const mockProperty = {
                    id: 'temp',
                    title: 'Área Selecionada',
                    location: searchQuery || 'Local no mapa',
                    price: '0',
                    imageUrl: '',
                    bedrooms: 0,
                    bathrooms: 0,
                    area: '0',
                    businessType: 'residential' as const,
                    propertyType: 'house' as const,
                    agency: { name: '', phone: '', email: '' },
                    amenities: []
                  };
                  const places = generateNearbyPlaces(mockProperty);
                  setNearbyPlaces(places);
                }}
              >
                <i className="fas fa-search mr-1"></i>
                Ver Locais de Interesse Próximos
              </Button>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <i className="fas fa-search-location text-4xl mb-4"></i>
              <div className="space-y-2">
                <p className="font-medium">Como usar:</p>
                <div className="text-left text-sm space-y-1">
                  <p><i className="fas fa-search text-hive-gold mr-2"></i>Digite um local na busca acima</p>
                  <p><i className="fas fa-mouse-pointer text-hive-gold mr-2"></i>Clique em qualquer ponto do mapa</p>
                  <p><i className="fas fa-home text-hive-gold mr-2"></i>Clique nos marcadores das propriedades</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}