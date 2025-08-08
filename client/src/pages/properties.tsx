import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyCard from "@/components/property-card";
import PropertyMapView from "@/components/property-map-view-simple";
import { type Property } from "@shared/schema";

export default function Properties() {
  const [businessType, setBusinessType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'mixed'>('mixed');

  const { data: properties, isLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  const handleSearch = () => {
    console.log("Filtrar propriedades:", { businessType, propertyType, neighborhood, bedrooms });
    alert("Sistema de filtros será implementado em breve!");
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-hive-black mb-2">Todos os Imóveis</h1>
              <p className="text-gray-600 text-lg">Encontre o imóvel perfeito para você</p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                className={`${viewMode === 'grid' ? 'bg-hive-gold hover:bg-hive-gold-dark text-white' : 'border-hive-gold text-hive-gold hover:bg-hive-gold hover:text-white'}`}
              >
                <i className="fas fa-th-large mr-2"></i>
                Grade
              </Button>
              <Button
                onClick={() => setViewMode('mixed')}
                variant={viewMode === 'mixed' ? 'default' : 'outline'}
                className={`${viewMode === 'mixed' ? 'bg-hive-gold hover:bg-hive-gold-dark text-white' : 'border-hive-gold text-hive-gold hover:bg-hive-gold hover:text-white'}`}
              >
                <i className="fas fa-map-marked-alt mr-2"></i>
                Mapa + Lista
              </Button>
            </div>
          </div>
        </div>

        {/* Extended Search Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold">
                <SelectValue placeholder="Tipo de negócio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">Venda</SelectItem>
                <SelectItem value="rent">Aluguel</SelectItem>
                <SelectItem value="event">Temporada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold">
                <SelectValue placeholder="Tipo de imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">Casa</SelectItem>
                <SelectItem value="apartment">Apartamento</SelectItem>
                <SelectItem value="commercial">Sala comercial</SelectItem>
                <SelectItem value="event_hall">Salão de festas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={neighborhood} onValueChange={setNeighborhood}>
              <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold">
                <SelectValue placeholder="Bairro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="copacabana">Copacabana</SelectItem>
                <SelectItem value="ipanema">Ipanema</SelectItem>
                <SelectItem value="barra">Barra da Tijuca</SelectItem>
                <SelectItem value="centro">Centro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold">
                <SelectValue placeholder="Quartos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 quarto</SelectItem>
                <SelectItem value="2">2 quartos</SelectItem>
                <SelectItem value="3">3 quartos</SelectItem>
                <SelectItem value="4+">4+ quartos</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleSearch}
              className="bg-hive-gold hover:bg-hive-gold-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'grid' ? (
          /* Properties Grid */
          isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(properties as Property[] || []).map((property: Property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )
        ) : (
          /* Mixed Map + List View */
          <PropertyMapView 
            properties={(properties as Property[] || [])}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
