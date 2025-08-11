import { CheckCircle, Circle, User, FileText, Camera, Building2, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface ProfileStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  isCompleted: boolean;
  isRequired: boolean;
  weight: number; // Para cálculo da porcentagem
}

interface ProfileProgressTrackerProps {
  user: any;
  className?: string;
}

export function ProfileProgressTracker({ user, className = "" }: ProfileProgressTrackerProps) {
  // Definir as etapas baseadas no tipo de plano
  const getProfileSteps = (user: any): ProfileStep[] => {
    const baseSteps: ProfileStep[] = [
      {
        id: 'basic-info',
        title: 'Informações Básicas',
        description: 'Nome, foto de perfil e informações de contato',
        icon: <User className="h-5 w-5" />,
        href: '/profile',
        isCompleted: !!(user?.name && user?.profileImageUrl && user?.email),
        isRequired: true,
        weight: 20
      },
      {
        id: 'address',
        title: 'Endereço Completo',
        description: 'Localização para facilitar encontros com clientes',
        icon: <MapPin className="h-5 w-5" />,
        href: '/profile',
        isCompleted: !!(user?.address && user?.city && user?.state && user?.zipCode),
        isRequired: true,
        weight: 15
      },
      {
        id: 'documents',
        title: 'Documentação',
        description: user?.planType === 'A' ? 'CPF verificado' : 'CNPJ e documentos empresariais',
        icon: <FileText className="h-5 w-5" />,
        href: '/profile',
        isCompleted: !!(user?.documentType && user?.documentNumber && user?.documentsVerified),
        isRequired: true,
        weight: 20
      },
      {
        id: 'categories',
        title: 'Categorias de Serviços',
        description: 'Especialize-se em áreas específicas',
        icon: <Building2 className="h-5 w-5" />,
        href: '/select-categories',
        isCompleted: !!(user?.categories && user?.categories.length > 0),
        isRequired: true,
        weight: 25
      },
      {
        id: 'portfolio',
        title: 'Portfólio e Biografia',
        description: 'Mostre seus trabalhos e conte sua história',
        icon: <Camera className="h-5 w-5" />,
        href: '/profile',
        isCompleted: !!(user?.description && user?.portfolioImages && user?.portfolioImages.length > 0),
        isRequired: false,
        weight: 20
      }
    ];

    // Para imobiliárias, adicionar etapa específica
    if (user?.planType === 'B' && user?.categories?.includes('imobiliaria')) {
      baseSteps.push({
        id: 'properties',
        title: 'Cadastro de Imóveis',
        description: 'Adicione pelo menos 3 imóveis ao seu portfólio',
        icon: <Building2 className="h-5 w-5" />,
        href: '/dashboard',
        isCompleted: (user?.propertiesCount || 0) >= 3,
        isRequired: false,
        weight: 10
      });
    }

    return baseSteps;
  };

  const steps = getProfileSteps(user);
  const completedSteps = steps.filter(step => step.isCompleted);
  const completedWeight = completedSteps.reduce((acc, step) => acc + step.weight, 0);
  const totalWeight = steps.reduce((acc, step) => acc + step.weight, 0);
  const progressPercentage = Math.round((completedWeight / totalWeight) * 100);

  const nextStep = steps.find(step => !step.isCompleted);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-amber-600" />
              </div>
              Progresso do Perfil
            </CardTitle>
            <CardDescription>
              Complete seu perfil para atrair mais clientes
            </CardDescription>
          </div>
          <Badge variant={progressPercentage === 100 ? "default" : "secondary"} className="text-sm">
            {progressPercentage}% concluído
          </Badge>
        </div>
        
        {/* Barra de Progresso Visual */}
        <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
          <div 
            className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              step.isCompleted 
                ? 'bg-green-50 border-green-200' 
                : nextStep?.id === step.id 
                  ? 'bg-amber-50 border-amber-200 border-2' 
                  : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className={`flex-shrink-0 ${step.isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
              {step.isCompleted ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {step.icon}
                <h4 className={`font-medium ${step.isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                  {step.title}
                </h4>
                {step.isRequired && !step.isCompleted && (
                  <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                )}
              </div>
              <p className={`text-sm ${step.isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                {step.description}
              </p>
            </div>
            
            {!step.isCompleted && (
              <Link href={step.href}>
                <Button size="sm" variant={nextStep?.id === step.id ? "default" : "ghost"}>
                  {nextStep?.id === step.id ? 'Continuar' : 'Editar'}
                </Button>
              </Link>
            )}
          </div>
        ))}
        
        {/* Próxima Ação Recomendada */}
        {nextStep && (
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg text-white">
            <h4 className="font-semibold mb-2">📋 Próxima etapa recomendada:</h4>
            <p className="text-sm mb-3">{nextStep.description}</p>
            <Link href={nextStep.href}>
              <Button variant="secondary" size="sm">
                {nextStep.title}
              </Button>
            </Link>
          </div>
        )}
        
        {progressPercentage === 100 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">🎉 Perfil Completo!</h4>
            <p className="text-sm">Você está pronto para receber clientes.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}