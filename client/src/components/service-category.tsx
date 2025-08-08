import { useLocation } from "wouter";
import { type ServiceCategory } from "@shared/schema";

interface ServiceCategoryProps {
  category: ServiceCategory;
}

export default function ServiceCategory({ category }: ServiceCategoryProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate(`/services?category=${category.slug}`);
  };

  return (
    <div 
      className="bg-hive-gray hover:bg-hive-gold group cursor-pointer rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105"
      onClick={handleClick}
    >
      <div className="bg-white group-hover:bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
        <i className={`${category.icon} text-hive-gold group-hover:text-white text-2xl`}></i>
      </div>
      <h3 className="font-semibold text-hive-black group-hover:text-white transition-colors duration-300">
        {category.name}
      </h3>
      <p className="text-xs text-gray-600 group-hover:text-white/80 mt-1 transition-colors duration-300">
        {category.providerCount} profissionais
      </p>
    </div>
  );
}
