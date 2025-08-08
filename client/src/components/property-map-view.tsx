import { useState } from "react";
import { type Property } from "@shared/schema";
import PropertyCard from "./property-card";
import MapSearch from "./map-search";

interface PropertyMapViewProps {
  properties: Property[];
  isLoading: boolean;
}

export default function PropertyMapView({ properties, isLoading }: PropertyMapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="animate-pulse bg-gray-200 h-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden">
              <div className="animate-pulse bg-gray-200 h-48"></div>
              <div className="p-4 space-y-2">
                <div className="animate-pulse bg-gray-200 h-4"></div>
                <div className="animate-pulse bg-gray-200 h-4 w-3/4"></div>
                <div className="animate-pulse bg-gray-200 h-4 w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visualização Desktop: Mapa e Grade lado a lado */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-12 gap-6">
          {/* Mapa */}
          <div className="col-span-7">
            <MapSearch 
              properties={properties} 
              onPropertySelect={setSelectedProperty}
              className="h-full"
            />
          </div>
          
          {/* Lista de Propriedades */}
          <div className="col-span-5">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-bold text-lg mb-4 text-hive-black">
                {properties.length} Propriedades Encontradas
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedProperty?.id === property.id 
                        ? 'border-hive-gold bg-hive-gold bg-opacity-5' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedProperty(property)}
                  >
                    <div className="flex space-x-3">
                      <img 
                        src={property.imageUrl} 
                        alt={property.title}
                        className="w-20 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-hive-black mb-1">
                          {property.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {property.location}
                        </p>
                        <p className="font-bold text-hive-gold">
                          R$ {new Intl.NumberFormat('pt-BR').format(parseFloat(property.price))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualização Mobile/Tablet: Mapa acima, lista abaixo */}
      <div className="lg:hidden space-y-4">
        <MapSearch 
          properties={properties} 
          onPropertySelect={setSelectedProperty}
        />
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="font-bold text-lg mb-4 text-hive-black">
            Propriedades ({properties.length})
          </h3>
          <div className="space-y-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedProperty?.id === property.id 
                    ? 'border-hive-gold bg-hive-gold bg-opacity-5' 
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedProperty(property)}
              >
                <div className="flex space-x-4">
                  <img 
                    src={property.imageUrl} 
                    alt={property.title}
                    className="w-24 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-hive-black mb-2">
                      {property.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {property.location}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        <i className="fas fa-bed mr-1"></i>
                        {property.bedrooms} quartos
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        <i className="fas fa-bath mr-1"></i>
                        {property.bathrooms} banheiros
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        <i className="fas fa-ruler mr-1"></i>
                        {property.area}m²
                      </span>
                    </div>
                    <p className="font-bold text-lg text-hive-gold">
                      R$ {new Intl.NumberFormat('pt-BR').format(parseFloat(property.price))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}