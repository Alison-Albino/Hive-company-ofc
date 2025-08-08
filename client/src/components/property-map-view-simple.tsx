import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PropertyCard from './property-card';
import { SimpleMap } from './simple-map';
import { type Property } from '@shared/schema';

interface PropertyMapViewProps {
  properties: Property[];
  isLoading?: boolean;
}

export default function PropertyMapView({ properties, isLoading }: PropertyMapViewProps) {
  const [selectedLocation, setSelectedLocation] = useState('');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const filteredProperties = selectedLocation 
    ? properties.filter(property => 
        property.location.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    : properties;

  return (
    <div>
      {/* Mobile: Stack vertically */}
      <div className="lg:hidden space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-map-marked-alt text-hive-gold mr-2"></i>
              Busca por Localização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleMap 
              onLocationSelect={(location) => {
                setSelectedLocation(location);
              }}
            />
          </CardContent>
        </Card>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-hive-black">
              Propriedades Encontradas
              {selectedLocation && (
                <span className="text-sm text-gray-500 font-normal ml-2">
                  em {selectedLocation}
                </span>
              )}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'propriedade' : 'propriedades'}
            </span>
          </div>
          <div className="space-y-4">
            {filteredProperties.map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Side by side */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-hive-black">
              Propriedades Encontradas
              {selectedLocation && (
                <span className="text-sm text-gray-500 font-normal ml-2">
                  em {selectedLocation}
                </span>
              )}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'propriedade' : 'propriedades'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProperties.map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-map-marked-alt text-hive-gold mr-2"></i>
                  Busca por Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleMap 
                  onLocationSelect={(location) => {
                    setSelectedLocation(location);
                  }}
                />
              </CardContent>
            </Card>

            {selectedLocation && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Filtro ativo:</p>
                      <p className="font-medium text-hive-black">{selectedLocation}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLocation('')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <i className="fas fa-times mr-1"></i>
                      Limpar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="text-center">
                  <i className="fas fa-chart-pie text-3xl text-hive-gold mb-3"></i>
                  <h3 className="font-semibold text-hive-black mb-2">Estatísticas da Busca</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total de propriedades:</span>
                      <span className="font-medium">{properties.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Propriedades exibidas:</span>
                      <span className="font-medium">{filteredProperties.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Residenciais:</span>
                      <span className="font-medium">
                        {filteredProperties.filter(p => p.businessType === 'residential').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comerciais:</span>
                      <span className="font-medium">
                        {filteredProperties.filter(p => p.businessType === 'commercial').length}
                      </span>
                    </div>
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