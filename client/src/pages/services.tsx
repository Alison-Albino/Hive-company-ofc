import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ServiceProviderCard from "@/components/service-provider-card";
import { type ServiceProvider } from "@shared/schema";

export default function Services() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState("");

  // Get category from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, []);

  const { data: serviceProviders, isLoading } = useQuery({
    queryKey: ["/api/service-providers", category ? { category } : {}],
  });

  const handleFilter = () => {
    console.log("Filter providers:", { category, location, rating });
    // TODO: Implement filter logic
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-hive-black mb-4">Profissionais Especializados</h1>
          <p className="text-gray-600 text-lg">Encontre os melhores prestadores de serviço da sua região</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                <SelectItem value="plumber">Encanador</SelectItem>
                <SelectItem value="electrician">Eletricista</SelectItem>
                <SelectItem value="painter">Pintor</SelectItem>
                <SelectItem value="cleaning">Limpeza</SelectItem>
                <SelectItem value="security">Segurança</SelectItem>
                <SelectItem value="gardening">Jardinagem</SelectItem>
              </SelectContent>
            </Select>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold">
                <SelectValue placeholder="Localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rio">Rio de Janeiro</SelectItem>
                <SelectItem value="sp">São Paulo</SelectItem>
                <SelectItem value="bh">Belo Horizonte</SelectItem>
              </SelectContent>
            </Select>

            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold">
                <SelectValue placeholder="Avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4+">4+ estrelas</SelectItem>
                <SelectItem value="3+">3+ estrelas</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleFilter}
              className="bg-hive-gold hover:bg-hive-gold-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              Filtrar
            </Button>
          </div>
        </div>

        {/* Service Providers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-16 w-full rounded" />
                    <Skeleton className="h-16 w-full rounded" />
                    <Skeleton className="h-16 w-full rounded" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceProviders?.map((provider: ServiceProvider) => (
              <ServiceProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
