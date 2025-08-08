export default function Footer() {
  return (
    <footer className="bg-hive-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-hive-gold p-2 rounded-lg">
                <i className="fas fa-th-large text-white text-xl"></i>
              </div>
              <span className="text-2xl font-bold">Hive</span>
            </div>
            <p className="text-gray-300 mb-4">
              Conectando imóveis a quem realmente precisa. A plataforma completa para encontrar imóveis e serviços especializados.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Imóveis</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Casas</a></li>
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Apartamentos</a></li>
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Comerciais</a></li>
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Salões de Festa</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Serviços</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Encanador</a></li>
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Eletricista</a></li>
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Pintor</a></li>
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Limpeza</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Central de Ajuda</a></li>
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Contato</a></li>
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Termos de Uso</a></li>
              <li><a href="#" className="text-gray-300 hover:text-hive-gold transition-colors duration-300">Privacidade</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-300">© Hive 2025 - Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
}
