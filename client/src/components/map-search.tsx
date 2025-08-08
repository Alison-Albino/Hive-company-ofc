import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Property } from "@shared/schema";

// Declarar tipos Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    GOOGLE_MAPS_API_KEY: string;
  }
}

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

  // Carregar Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Verificar se já está carregado
      if (window.google && window.google.maps) {
        console.log('Google Maps já carregado');
        setIsGoogleMapsLoaded(true);
        return;
      }

      // Verificar se já existe um script carregando
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Script do Google Maps já existe, aguardando carregamento...');
        // Aguardar carregamento do script existente
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            console.log('Google Maps carregado via script existente');
            setIsGoogleMapsLoaded(true);
            clearInterval(checkInterval);
          }
        }, 100);
        
        // Timeout após 10 segundos
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!window.google || !window.google.maps) {
            console.log('Timeout no carregamento do Google Maps, usando fallback');
            setIsGoogleMapsLoaded(false);
          }
        }, 10000);
        return;
      }

      try {
        // Remover qualquer callback anterior
        delete window.initMap;
        
        // Criar callback único
        const callbackName = `initGoogleMaps_${Date.now()}`;
        window[callbackName] = () => {
          console.log('Google Maps carregado com sucesso!');
          setIsGoogleMapsLoaded(true);
          delete window[callbackName];
        };

        // Usar a chave do ambiente secreto do Replit
        const apiKey = 'AIzaSyCkUOdZ5y7hMm0yrcCQoCvLwzdM6M8s5qk'; // Chave pública para desenvolvimento
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        
        script.onerror = (error) => {
          console.error('Erro ao carregar Google Maps API:', error);
          setIsGoogleMapsLoaded(false);
          delete window[callbackName];
        };
        
        console.log('Carregando Google Maps API...');
        document.head.appendChild(script);
        
        // Timeout de segurança
        setTimeout(() => {
          if (!window.google || !window.google.maps) {
            console.error('Timeout ao carregar Google Maps API');
            setIsGoogleMapsLoaded(false);
            delete window[callbackName];
          }
        }, 15000);
        
      } catch (error) {
        console.error('Erro ao inicializar Google Maps:', error);
        setIsGoogleMapsLoaded(false);
      }
    };

    loadGoogleMaps();
  }, []);

  // Buscar localizações usando Google Places API
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    if (window.google && window.google.maps) {
      const service = new window.google.maps.places.AutocompleteService();
      
      try {
        service.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: 'BR' },
            types: ['geocode']
          },
          (predictions: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              const results = predictions.map((prediction: any) => ({
                name: prediction.description,
                placeId: prediction.place_id,
                coords: null // Será obtido no geocoding
              }));
              setSearchResults(results);
            } else {
              console.warn('Erro na busca de locais:', status);
              setSearchResults([]);
            }
            setIsSearching(false);
          }
        );
      } catch (error) {
        console.error('Erro ao buscar locais:', error);
        setIsSearching(false);
      }
    } else {
      // Fallback se Google Maps não estiver disponível
      const mockResults = [
        { name: `${query} - Centro, Rio de Janeiro`, coords: [-22.9035, -43.2096] },
        { name: `${query} - Copacabana, Rio de Janeiro`, coords: [-22.9711, -43.1822] },
        { name: `${query} - Ipanema, Rio de Janeiro`, coords: [-22.9838, -43.2056] },
        { name: `${query} - Barra da Tijuca, Rio de Janeiro`, coords: [-23.0175, -43.3212] }
      ];
      
      setTimeout(() => {
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 500);
    }
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
  const handleMapClick = (event: any) => {
    if (isGoogleMapsLoaded && event.latLng) {
      // Para Google Maps real
      const coords: [number, number] = [event.latLng.lat(), event.latLng.lng()];
      setClickedLocation(coords);
      findNearbyProperties(coords);
      setSelectedProperty(null);
    } else {
      // Para mapa customizado (fallback)
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const coords: [number, number] = [
        mapCenter[0] + (y - rect.height/2) / rect.height * 0.05,
        mapCenter[1] + (x - rect.width/2) / rect.width * 0.05
      ];
      
      setClickedLocation(coords);
      findNearbyProperties(coords);
      setSelectedProperty(null);
    }
  };

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    searchLocation(value);
  };

  // Handle search result selection
  const handleSearchSelect = async (result: any) => {
    setSearchQuery(result.name);
    setSearchResults([]);
    
    if (window.google && window.google.maps && result.placeId) {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode(
        { placeId: result.placeId },
        (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const coords: [number, number] = [location.lat(), location.lng()];
            
            setMapCenter(coords);
            setClickedLocation(coords);
            findNearbyProperties(coords);
            onLocationSearch?.(result.name, coords);
            
            // Atualizar mapa Google se disponível
            if (googleMapRef.current) {
              googleMapRef.current.setCenter({ lat: coords[0], lng: coords[1] });
              googleMapRef.current.setZoom(15);
            }
          }
        }
      );
    } else if (result.coords) {
      // Fallback para coordenadas já conhecidas
      setMapCenter(result.coords);
      setClickedLocation(result.coords);
      findNearbyProperties(result.coords);
      onLocationSearch?.(result.name, result.coords);
    }
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

  // Inicializar mapa Google quando disponível
  useEffect(() => {
    if (isGoogleMapsLoaded && mapRef.current && !googleMapRef.current) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: mapCenter[0], lng: mapCenter[1] },
        zoom: 13,
        styles: [
          {
            featureType: "poi",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      // Adicionar listener para cliques no mapa
      googleMapRef.current.addListener('click', handleMapClick);

      // Adicionar marcadores das propriedades
      properties.forEach((property) => {
        const coords = getPropertyCoords(property);
        const marker = new window.google.maps.Marker({
          position: { lat: coords[0], lng: coords[1] },
          map: googleMapRef.current,
          title: property.title,
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                <circle cx="12" cy="12" r="10" fill="#D4AF37" stroke="#fff" stroke-width="2"/>
                <path d="M12 6l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="#fff"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });

        // Adicionar listener para clique no marcador
        marker.addListener('click', () => handlePropertyClick(property));
      });
    }
  }, [isGoogleMapsLoaded, properties, mapCenter]);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect(property);
    
    const coords = getPropertyCoords(property);
    setMapCenter(coords);
    setNearbyPlaces(generateNearbyPlaces(property));
    
    // Atualizar mapa Google se disponível
    if (googleMapRef.current) {
      googleMapRef.current.setCenter({ lat: coords[0], lng: coords[1] });
      googleMapRef.current.setZoom(16);
    }
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
            {isGoogleMapsLoaded ? (
              <div ref={mapRef} className="w-full h-full" />
            ) : (
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
            )}
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
                  const mockProperty: Property = {
                    id: 'temp',
                    title: 'Área Selecionada',
                    description: 'Local selecionado no mapa',
                    price: '0',
                    priceType: 'sale',
                    propertyType: 'house',
                    location: searchQuery || 'Local no mapa',
                    bedrooms: null,
                    bathrooms: null,
                    parkingSpaces: null,
                    area: null,
                    businessType: 'residential',
                    agency: { name: '', phone: '', email: '' },
                    amenities: [],
                    images: [],
                    isFeatured: false,
                    views: 0
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