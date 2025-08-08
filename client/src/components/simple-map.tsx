import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface SimpleMapProps {
  onLocationSelect?: (location: string) => void;
}

export function SimpleMap({ onLocationSelect }: SimpleMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSelectedLocation(searchQuery);
      onLocationSelect?.(searchQuery);
    }
  };

  const popularCities = [
    'São Paulo, SP',
    'Rio de Janeiro, RJ', 
    'Belo Horizonte, MG',
    'Brasília, DF',
    'Salvador, BA',
    'Fortaleza, CE',
    'Recife, PE',
    'Porto Alegre, RS'
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Digite uma cidade ou endereço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              className="bg-hive-gold hover:bg-hive-gold-dark text-white px-6"
            >
              <i className="fas fa-search mr-2"></i>
              Buscar
            </Button>
          </div>

          {selectedLocation && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 rounded">
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt text-green-600 mr-2"></i>
                <span className="text-green-800">Localização selecionada: <strong>{selectedLocation}</strong></span>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              <i className="fas fa-star text-hive-gold mr-2"></i>
              Cidades Populares
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {popularCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchQuery(city);
                    setSelectedLocation(city);
                    onLocationSelect?.(city);
                  }}
                  className="text-left p-2 text-sm text-hive-gold hover:bg-hive-gold hover:text-white rounded transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-500 mr-2 mt-1"></i>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Como usar:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Digite o nome de uma cidade ou endereço completo</li>
                  <li>• Clique em uma das cidades populares</li>
                  <li>• Use a busca para encontrar propriedades na região</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}