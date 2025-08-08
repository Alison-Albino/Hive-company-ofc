import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import HeroSection from "@/components/hero-section";
import PropertyCard from "@/components/property-card";
import ServiceCategory from "@/components/service-category";
import { type Property, type ServiceCategory as ServiceCategoryType } from "@shared/schema";

export default function Home() {
  const { data: featuredProperties, isLoading: loadingProperties } = useQuery({
    queryKey: ["/api/properties/featured"],
  });

  const { data: serviceCategories, isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/service-categories"],
  });

  return (
    <div>
      <HeroSection />
      
      {/* Featured Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-hive-black mb-4">Imóveis em Destaque</h2>
            <p className="text-gray-600 text-lg">Seleção especial dos melhores imóveis disponíveis</p>
          </div>
          
          {loadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(featuredProperties as Property[] || []).map((property: Property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link href="/properties">
              <Button variant="outline" className="bg-white border-2 border-hive-gold text-hive-gold hover:bg-hive-gold hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                Ver todos os imóveis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-hive-black mb-4">Serviços Especializados</h2>
            <p className="text-gray-600 text-lg">Encontre os melhores profissionais para seu imóvel</p>
          </div>
          
          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-hive-gray rounded-xl p-6 text-center">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {(serviceCategories as ServiceCategoryType[] || []).map((category: ServiceCategoryType) => (
                <ServiceCategory key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
