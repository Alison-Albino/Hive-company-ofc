import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const navLinks = [
    { path: "/", label: "Início" },
    { path: "/properties", label: "Imóveis" },
    { path: "/services", label: "Serviços" },
    { path: "/plans", label: "Planos" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-hive-gold p-2 rounded-lg group-hover:bg-hive-gold-dark transition-colors duration-300">
              <i className="fas fa-th-large text-white text-xl"></i>
            </div>
            <span className="text-2xl font-bold text-hive-black">Hive</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`transition-colors duration-300 hover:text-hive-gold ${
                  isActive(link.path) ? "text-hive-black font-medium" : "text-gray-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button className="bg-hive-gold hover:bg-hive-gold-dark text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300">
              Entrar
            </Button>
          </div>
          
          <button
            className="md:hidden text-hive-black"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block transition-colors duration-300 hover:text-hive-gold ${
                  isActive(link.path) ? "text-hive-black font-medium" : "text-gray-600"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button className="w-full bg-hive-gold hover:bg-hive-gold-dark text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300">
              Entrar
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
