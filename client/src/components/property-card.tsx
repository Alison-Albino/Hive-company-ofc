import { Badge } from "@/components/ui/badge";
import { type Property } from "@shared/schema";
import { Link } from "wouter";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: string, priceType: string) => {
    const numPrice = parseFloat(price);
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);

    if (priceType === 'rent') return `${formatted}/mês`;
    if (priceType === 'event') return `${formatted}/dia`;
    return formatted;
  };

  const getStatusColor = (priceType: string) => {
    switch (priceType) {
      case 'sale': return 'bg-green-100 text-green-800';
      case 'rent': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusLabel = (priceType: string) => {
    switch (priceType) {
      case 'sale': return 'VENDA';
      case 'rent': return 'ALUGUEL';
      case 'event': return 'EVENTO';
      default: return 'COMERCIAL';
    }
  };

  return (
    <Link href={`/property/${property.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-105">
      <img 
        src={property.imageUrl} 
        alt={property.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(property.priceType)}`}>
            {getStatusLabel(property.priceType)}
          </Badge>
          <span className="text-hive-gold font-bold text-lg">
            {formatPrice(property.price, property.priceType)}
          </span>
        </div>
        
        <h3 className="font-semibold text-hive-black mb-2 line-clamp-1">
          {property.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3">
          <i className="fas fa-map-marker-alt mr-1"></i>
          {property.location}
        </p>
        
        <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
          {property.bedrooms && (
            <span>
              <i className="fas fa-bed mr-1"></i>
              {property.bedrooms} quarto{property.bedrooms > 1 ? 's' : ''}
            </span>
          )}
          {property.bathrooms && (
            <span>
              <i className="fas fa-bath mr-1"></i>
              {property.bathrooms} banheiro{property.bathrooms > 1 ? 's' : ''}
            </span>
          )}
          {property.parkingSpaces && (
            <span>
              <i className="fas fa-car mr-1"></i>
              {property.parkingSpaces} vaga{property.parkingSpaces > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="border-t pt-3">
          <p className="text-xs text-gray-500">{property.agencyName}</p>
        </div>
      </div>
    </div>
    </Link>
  );
}
