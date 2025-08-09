import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logoPath from "@assets/logo hive_1754700716189.png";
import hiveBackground from "@assets/hero-hive-background.svg";

export default function HeroSection() {
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleSearch = () => {
    console.log("Busca:", { location, propertyType, priceRange });
    alert("Funcionalidade de busca será implementada em breve!");
  };

  return (
    <section className="relative py-20 lg:py-32" style={{
        backgroundImage: `url(${hiveBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
      <div className="absolute inset-0 bg-gradient-to-br from-hive-gold/10 to-transparent"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center mb-8">
          <img 
            src={logoPath}
            alt="Hive Company Logo" 
            className="h-16 w-auto mb-4 opacity-90"
          />
          <h1 className="text-4xl md:text-6xl font-bold text-hive-black mb-6 leading-tight">
            Conectando imóveis a<br />quem realmente precisa
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            A plataforma completa para encontrar imóveis e serviços especializados em um só lugar
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <i className="fas fa-map-marker-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"></i>
              <input
                type="text"
                placeholder="Onde você está?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <i className="fas fa-home absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"></i>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold focus:border-transparent">
                  <SelectValue placeholder="Tipo de imóvel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="commercial">Sala comercial</SelectItem>
                  <SelectItem value="event_hall">Salão de festas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <i className="fas fa-dollar-sign absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"></i>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold focus:border-transparent">
                  <SelectValue placeholder="Faixa de preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-500000">Até R$ 500.000</SelectItem>
                  <SelectItem value="500000-1000000">R$ 500.000 - R$ 1.000.000</SelectItem>
                  <SelectItem value="1000000+">R$ 1.000.000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleSearch}
              className="bg-hive-gold hover:bg-hive-gold-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
            >
              <i className="fas fa-search mr-2"></i>
              Buscar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
