import { Button } from "@/components/ui/button";
import { type ServiceProvider } from "@shared/schema";

interface ServiceProviderCardProps {
  provider: ServiceProvider;
}

export default function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    
    return (
      <div className="flex items-center text-hive-gold mb-1">
        {Array.from({ length: 5 }, (_, i) => (
          <i
            key={i}
            className={`text-sm ${
              i < fullStars
                ? "fas fa-star"
                : i === fullStars && hasHalfStar
                ? "fas fa-star-half-alt"
                : "far fa-star"
            }`}
          ></i>
        ))}
        <span className="ml-1 text-gray-600 text-sm">{rating}</span>
      </div>
    );
  };

  const handleContract = () => {
    console.log("Contratar prestador:", provider.id);
    alert("Redirecionando para o contato com o prestador...");
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <img 
        src={provider.imageUrl} 
        alt={provider.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-hive-black">{provider.name}</h3>
            <p className="text-gray-600">{provider.speciality}</p>
            <p className="text-sm text-gray-500">
              {provider.documentType}: {provider.documentType === "CPF" ? "***.***.***-**" : "**.***.***/****-**"}
            </p>
          </div>
          <div className="text-right">
            {renderStars(provider.rating || "0.0")}
            <p className="text-xs text-gray-500">{provider.reviewCount} avaliações</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">
          <i className="fas fa-map-marker-alt mr-1"></i>
          {provider.location}
        </p>
        
        {provider.portfolioImages && provider.portfolioImages.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Trabalhos recentes:</p>
            <div className="grid grid-cols-3 gap-2">
              {provider.portfolioImages.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Trabalho ${index + 1} de ${provider.name}`}
                  className="w-full h-16 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleContract}
          className="w-full bg-hive-gold hover:bg-hive-gold-dark text-white font-semibold py-3 rounded-lg transition-colors duration-300"
        >
          Contratar
        </Button>
      </div>
    </div>
  );
}
