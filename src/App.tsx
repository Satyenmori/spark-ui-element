import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSun, 
  faMoon, 
  faCode, 
  faRocket, 
  faPalette, 
  faCog,
  faHeart,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    toast({
      title: `Switched to ${newTheme ? 'dark' : 'light'} mode`,
      description: "Theme preference saved",
    });
  };

  const features = [
    {
      icon: faCode,
      title: "React + TypeScript",
      description: "Modern development with type safety and excellent DX"
    },
    {
      icon: faRocket,
      title: "Vite",
      description: "Lightning fast build tool and development server"
    },
    {
      icon: faPalette,
      title: "Tailwind CSS",
      description: "Beautiful, responsive design with utility-first CSS"
    },
    {
      icon: faCog,
      title: "Font Awesome",
      description: "Rich icon library for enhanced user interface"
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <FontAwesomeIcon icon={faLightbulb} className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold">React App</h1>
                <p className="text-sm text-muted-foreground">Modern web application</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="transition-all duration-300 hover:shadow-glow"
            >
              <FontAwesomeIcon 
                icon={isDarkMode ? faSun : faMoon} 
                className="mr-2"
              />
              {isDarkMode ? 'Light' : 'Dark'}
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="inline-block p-1 bg-gradient-primary rounded-full shadow-elegant mb-8">
              <div className="bg-background rounded-full px-6 py-12">
                <FontAwesomeIcon 
                  icon={faRocket} 
                  className="text-6xl text-primary mb-4"
                />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Beautiful
              </span>{' '}
              <span className="text-foreground">React App</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A stunning single-page application built with modern tools and beautiful design. 
              Experience the perfect blend of performance and aesthetics.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <FontAwesomeIcon icon={faCode} className="mr-2" />
                TypeScript
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <FontAwesomeIcon icon={faRocket} className="mr-2" />
                Vite
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <FontAwesomeIcon icon={faPalette} className="mr-2" />
                Tailwind CSS
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                onClick={() => toast({
                  title: "🚀 Getting Started",
                  description: "This is your beautiful React app in action!",
                })}
              >
                <FontAwesomeIcon icon={faRocket} className="mr-2" />
                Get Started
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="transition-all duration-300 hover:shadow-elegant"
                onClick={() => toast({
                  title: "💡 Learn More",
                  description: "Explore the features and capabilities of this app",
                })}
              >
                <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built with Modern Tools
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                This application showcases the power of modern web development technologies
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="text-center hover:shadow-elegant transition-all duration-300 group cursor-pointer"
                  onClick={() => toast({
                    title: feature.title,
                    description: feature.description,
                  })}
                >
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-glow transition-all duration-300">
                      <FontAwesomeIcon 
                        icon={feature.icon} 
                        className="text-2xl text-accent-foreground"
                      />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-muted-foreground">Made with</span>
              <FontAwesomeIcon icon={faHeart} className="text-red-500" />
              <span className="text-muted-foreground">using React + Vite + TypeScript</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A beautiful, modern web application template
            </p>
          </div>
        </footer>
      </div>
      
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
};

export default App;