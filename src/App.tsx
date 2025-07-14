import { useState, useEffect, useCallback } from 'react';
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

//app.tsx copy logic
const functionConfigs = [
  {
    name: "text_completion",
    displayName: "Text Completion",
    apiEndpoint: "/api/text-completion",
    inputs: [] // No specific inputs beyond the main prompt
  },
  {
    name: "code_generation",
    displayName: "Code Generation",
    apiEndpoint: "/api/code-generation",
    inputs: [
      { id: "language", label: "Language", type: "text", placeholder: "e.g., Python, JavaScript", tooltip: "Specify the programming language for code generation." },
      { id: "framework", label: "Framework (Optional)", type: "text", placeholder: "e.g., React, Django", tooltip: "Specify a framework if relevant (e.g., React, Django)." }
    ]
  },
  {
    name: "image_description",
    displayName: "Image Description",
    apiEndpoint: "/api/image-description",
    inputs: [
      { id: "imageUpload", label: "Upload Image", type: "file", accept: "image/*", tooltip: "Upload an image for the AI to describe." }
    ]
  },
  {
    name: "sentiment_analysis",
    displayName: "Sentiment Analysis",
    apiEndpoint: "/api/sentiment-analysis",
    inputs: [
      { id: "sentimentTarget", label: "Target Entity (Optional)", type: "text", placeholder: "e.g., 'product', 'service'", tooltip: "Specify a specific entity to analyze sentiment for within the text." }
    ]
  }
];

const getPlatformIcon = (platform) => {
  switch (platform) {
    case 'openai':
      return <i className="fab fa-openid text-blue-500 mr-2"></i>;
    case 'anthropic':
      return <svg className="inline-block w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>;
    case 'cohere':
      return <svg className="inline-block w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-2-10h4v2h-4v-2z" /></svg>;
    case 'google_palm':
      return <svg className="inline-block w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-2v6zm0-8h2V7h-2v2z" /></svg>;
    default:
      return <i className="fas fa-robot mr-2"></i>; // Generic icon
  }
};

const MessageBox = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow time for fade-out transition
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  let bgColor = 'bg-blue-500';
  if (type === 'success') bgColor = 'bg-green-500';
  else if (type === 'error') bgColor = 'bg-red-500';
  else if (type === 'warning') bgColor = 'bg-yellow-500';

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${bgColor}`}>
      {message}
    </div>
  );
};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const [theme, setTheme] = useState('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState(functionConfigs[0].name);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedModels, setSelectedModels] = useState({
    openai: [],
    anthropic: [],
    cohere: [],
    google_palm: []
  });
  const [promptText, setPromptText] = useState('');
  const [dynamicInputs, setDynamicInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [outputs, setOutputs] = useState([]);
  const [messageBox, setMessageBox] = useState(null);

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

  //ai-playGround app.tsx file all this 
  // Define available models for each platform
    const availableModels = {
        openai: [
            { value: "gpt-4o", label: "GPT-4o" },
            { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
            { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
        ],
        anthropic: [
            { value: "claude-3-opus", label: "Claude 3 Opus" },
            { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
            { value: "claude-3-haiku", label: "Claude 3 Haiku" },
        ],
        cohere: [
            { value: "command-r-plus", label: "Command R+" },
            { value: "command", label: "Command" },
            { value: "embed-english-v3.0", label: "Embed English v3.0" },
        ],
        google_palm: [
            { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
            { value: "gemini-1.0-pro", label: "Gemini 1.0 Pro" },
            { value: "palm2", label: "PaLM 2" },
        ],
    };

    // --- Effects ---

    // Load theme from localStorage on mount
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.classList.add(storedTheme);
        } else {
            document.documentElement.classList.add('light');
        }
    }, []);

    // Update dynamic inputs based on selected function
    useEffect(() => {
        const currentFunctionConfig = functionConfigs.find(func => func.name === selectedFunction);
        const newDynamicInputs = {};
        if (currentFunctionConfig && currentFunctionConfig.inputs.length > 0) {
            currentFunctionConfig.inputs.forEach(input => {
                // Preserve existing values if input ID matches, otherwise set to default
                newDynamicInputs[input.id] = dynamicInputs[input.id] || (input.type === 'file' ? null : '');
            });
        }
        setDynamicInputs(newDynamicInputs);
    }, [selectedFunction]); // Only re-run when selectedFunction changes

    // --- Handlers ---

    // Theme Toggle Handler
    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.remove(theme);
        document.documentElement.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Mobile Menu Toggle Handler
    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Platform Checkbox Change Handler
    const handlePlatformChange = (e) => {
        const { value, checked } = e.target;
        setSelectedPlatforms(prev =>
            checked ? [...prev, value] : prev.filter(platform => platform !== value)
        );
    };

    // Model Checkbox Change Handler
    const handleModelChange = (platform, e) => {
        const { value, checked } = e.target;
        setSelectedModels(prev => ({
            ...prev,
            [platform]: checked
                ? [...prev[platform], value]
                : prev[platform].filter(model => model !== value)
        }));
    };

    // Dynamic Input Change Handler
    const handleDynamicInputChange = (e) => {
        const { id, value, type, files } = e.target;
        setDynamicInputs(prev => ({
            ...prev,
            [id]: type === 'file' ? files[0] : value
        }));
    };

    // Show Message Box
    const showMessageBox = useCallback((message, type) => {
        setMessageBox({ message, type });
    }, []);

    // Copy to Clipboard
    const copyToClipboard = useCallback((text) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showMessageBox("Copied to clipboard!", "success");
        } catch (err) {
            console.error('Failed to copy text: ', err);
            showMessageBox("Failed to copy text.", "error");
        }
        document.body.removeChild(textArea);
    }, [showMessageBox]);

    // Simulate API Call (now accepts functionConfig and dynamicInputs)
    const simulateApiCall = useCallback(async (modelInfo, prompt, functionConfig, dynamicInputs) => {
        console.log(`Simulating API call to: ${functionConfig.apiEndpoint}`);
        console.log("Payload (simulated):", {
            model: modelInfo.model,
            prompt: prompt,
            functionInputs: dynamicInputs
        });

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let generatedText = `Response from ${modelInfo.displayName} for "${prompt}".\n\n`;

                if (functionConfig.name === 'text_completion') {
                    generatedText += `This is a sample text completion. The model analyzed your prompt and generated a relevant continuation or answer.`;
                } else if (functionConfig.name === 'code_generation') {
                    const language = dynamicInputs.language || 'Python';
                    const framework = dynamicInputs.framework ? ` (${dynamicInputs.framework})` : '';
                    generatedText += `\`\`\`${language}\n# Sample ${language}${framework} code generated by ${modelInfo.model}\ndef hello_world():\n    print("Hello, AI Playground!")\n\nhello_world()\n\`\`\``;
                } else if (functionConfig.name === 'image_description') {
                    const fileName = dynamicInputs.imageUpload ? dynamicInputs.imageUpload.name : 'no image uploaded';
                    generatedText += `This model would describe the uploaded image (${fileName}), e.g., "A serene landscape with mountains and a clear blue sky." (Image upload functionality is simulated).`;
                } else if (functionConfig.name === 'sentiment_analysis') {
                    const target = dynamicInputs.sentimentTarget;
                    generatedText += `Sentiment: Positive. Confidence: 92%.\n\nAnalysis for ${target ? target : 'the text'}: The model detected a predominantly positive tone in your input.`;
                }

                if (Math.random() < 0.1) { // Simulate occasional errors
                    reject(new Error("API call failed due to a simulated network issue."));
                } else {
                    resolve(generatedText);
                }
            }, 1500 + Math.random() * 1000); // Simulate varying response times
        });
    }, []);

    // Generate Responses Handler
    const handleGenerate = async () => {
        if (!promptText.trim()) {
            showMessageBox("Please enter a prompt to generate responses.", "warning");
            return;
        }

        const currentFunctionConfig = functionConfigs.find(func => func.name === selectedFunction);
        const modelsToGenerate = [];

        selectedPlatforms.forEach(platform => {
            selectedModels[platform].forEach(modelValue => {
                // Find the display label for the model
                const modelData = availableModels[platform]?.find(m => m.value === modelValue);
                modelsToGenerate.push({
                    platform: platform,
                    model: modelValue,
                    displayName: `${modelData ? modelData.label : modelValue} - ${platform.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`
                });
            });
        });

        if (modelsToGenerate.length === 0) {
            showMessageBox("Please select at least one AI platform and model.", "warning");
            return;
        }

        setIsLoading(true);
        setOutputs([]); // Clear previous outputs

        let completedGenerations = 0;
        const newOutputs = [];

        for (const modelInfo of modelsToGenerate) {
            try {
                const response = await simulateApiCall(modelInfo, promptText, currentFunctionConfig, dynamicInputs);
                newOutputs.push({ ...modelInfo, content: response, isError: false });
            } catch (error) {
                console.error(`Error generating for ${modelInfo.displayName}:`, error);
                newOutputs.push({ ...modelInfo, content: `Error: ${error.message || 'Failed to generate response.'}`, isError: true });
            } finally {
                completedGenerations++;
                if (completedGenerations === modelsToGenerate.length) {
                    setOutputs(newOutputs);
                    setIsLoading(false);
                }
            }
        }
    };

    // Regenerate Single Output Handler
    const handleRegenerate = async (modelInfoToRegenerate, index) => {
        const currentFunctionConfig = functionConfigs.find(func => func.name === selectedFunction);

        // Update the specific output block to show loading state
        setOutputs(prevOutputs =>
            prevOutputs.map((output, i) =>
                i === index ? { ...output, content: 'Generating...', isLoading: true } : output
            )
        );

        try {
            const response = await simulateApiCall(modelInfoToRegenerate, promptText, currentFunctionConfig, dynamicInputs);
            setOutputs(prevOutputs =>
                prevOutputs.map((output, i) =>
                    i === index ? { ...output, content: response, isError: false, isLoading: false } : output
                )
            );
        } catch (error) {
            console.error(`Error regenerating for ${modelInfoToRegenerate.displayName}:`, error);
            setOutputs(prevOutputs =>
                prevOutputs.map((output, i) =>
                    i === index ? { ...output, content: `Error: ${error.message || 'Failed to regenerate response.'}`, isError: true, isLoading: false } : output
                )
            );
        }
    };



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
                <h1 className="text-xl font-bold">AI Playground</h1>
                <p className="text-sm text-muted-foreground">Modern AI application</p>
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
        {/* <section className="py-20 px-4">
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
        </section> */}

        {/* Features Section */}
        {/* <section className="py-16 px-4 bg-muted/30">
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
        </section> */}
        {/* app.tsx part */}
        <div className="flex flex-col md:flex-row h-screen font-inter">
            {/* Overlay for mobile menu */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${isMenuOpen ? 'visible' : 'hidden'}`}
                onClick={handleMenuToggle}
            ></div>

            {/* Left Half: User Controls */}
            <div
                id="left-panel"
                className={`w-full md:w-1/3 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg md:rounded-none
                    fixed top-0 left-0 h-full z-50 transform transition-transform duration-300
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:shadow-none shadow-xl`}
            >
                {/* <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">AI Playground</h2>
                    <div className="flex items-center space-x-4">
                        
                        <button
                            id="menuClose"
                            className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                            onClick={handleMenuToggle}
                        >
                            <i className="fas fa-times w-6 h-6"></i>
                        </button>
                       
                        <button
                            id="themeToggle"
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                            onClick={handleThemeToggle}
                        >
                            {theme === 'light' ? (
                                <svg className="w-6 h-6 sun-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.325 5.924l-.707.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            ) : (
                                <svg className="w-6 h-6 moon-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                            )}
                        </button>
                    </div>
                </div> */}

                {/* Function Selector */}
                <div className="mb-5 relative group">
                    <label htmlFor="functionSelector" className="block text-sm font-medium mb-2">
                        Function to Test
                        <span className="ml-1 text-gray-500 dark:text-gray-400 cursor-help" title="Select a predefined function for AI model testing. This will dynamically adjust the input fields.">
                            <i className="fas fa-info-circle"></i>
                        </span>
                    </label>
                    <select
                        id="functionSelector"
                        className="block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 appearance-none transition-all duration-200 ease-in-out"
                        value={selectedFunction}
                        onChange={(e) => setSelectedFunction(e.target.value)}
                    >
                        {functionConfigs.map(func => (
                            <option key={func.name} value={func.name}>{func.displayName}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
                    </div>
                </div>

                {/* AI Platform Selector (Checkboxes) */}
                <div className="mb-5 relative group">
                    <label className="block text-sm font-medium mb-2">
                        AI Platforms
                        <span className="ml-1 text-gray-500 dark:text-gray-400 cursor-help" title="Choose one or more AI platforms to compare their model responses.">
                            <i className="fas fa-info-circle"></i>
                        </span>
                    </label>
                    <div className="flex flex-col space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                        {['openai', 'anthropic', 'cohere', 'google_palm'].map(platform => (
                            <label key={platform} className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    value={platform}
                                    checked={selectedPlatforms.includes(platform)}
                                    onChange={handlePlatformChange}
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-500 dark:checked:border-transparent"
                                />
                                <span className="ml-2 text-gray-700 dark:text-gray-300 flex items-center">
                                    {getPlatformIcon(platform)} {platform.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Conditional Model Selectors (Checkboxes) */}
                {['openai', 'anthropic', 'cohere', 'google_palm'].map(platform => (
                    <div
                        key={platform}
                        id={`${platform}Models`}
                        className={`model-selector-group mb-5 fade-in-transition ${selectedPlatforms.includes(platform) ? '' : 'hidden'}`}
                    >
                        <label className="block text-sm font-medium mb-2">
                            {getPlatformIcon(platform)} {platform.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Models
                        </label>
                        <div className="flex flex-col space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                            {availableModels[platform]?.map(model => (
                                <label key={model.value} className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={model.value}
                                        checked={selectedModels[platform]?.includes(model.value)}
                                        onChange={(e) => handleModelChange(platform, e)}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-500 dark:checked:border-transparent"
                                    />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                                        {model.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                 {/* Dynamic Input Section */}
                <div id="dynamicInputs" className="mb-5">
                    {functionConfigs.find(f => f.name === selectedFunction)?.inputs.map(input => (
                        <div key={input.id} className="input-field mb-4">
                            <label htmlFor={input.id} className="block text-sm font-medium mb-1">
                                {input.label}
                                <span className="ml-1 text-gray-500 dark:text-gray-400 cursor-help" title={input.tooltip}>
                                    <i className="fas fa-info-circle"></i>
                                </span>
                            </label>
                            {input.type === 'text' && (
                                <input
                                    type="text"
                                    id={input.id}
                                    className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
                                    placeholder={input.placeholder || ''}
                                    value={dynamicInputs[input.id] || ''}
                                    onChange={handleDynamicInputChange}
                                />
                            )}
                            {input.type === 'file' && (
                                <input
                                    type="file"
                                    id={input.id}
                                    accept={input.accept || '*'}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    onChange={handleDynamicInputChange}
                                />
                            )}
                            {/* Add more input types (e.g., number, checkbox, textarea) as needed */}
                        </div>
                    ))}
                </div>

                {/* Prompt Text Area */}
                <div className="mb-6">
                    <label htmlFor="promptTextArea" className="block text-sm font-medium mb-2">
                        Prompt Text
                        <span className="ml-1 text-gray-500 dark:text-gray-400 cursor-help" title="Enter your query or instructions for the AI models.">
                            <i className="fas fa-info-circle"></i>
                        </span>
                    </label>
                    <textarea
                        id="promptTextArea"
                        rows={10}
                        className="block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 resize-y"
                        placeholder="Enter your prompt here..."
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                    ></textarea>
                </div>

                {/* Generate Button */}
                <button
                    id="generateButton"
                    className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleGenerate}
                    disabled={isLoading}
                >
                    <span id="buttonText">{isLoading ? 'Generating...' : 'Generate Responses'}</span>
                    {isLoading && <div id="loadingSpinner" className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>}
                </button>
            </div>

            {/* Right Half: Model Outputs */}
            <div id="right-panel" className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div id="outputContainer" className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {outputs.length === 0 && !isLoading && (
                        <div className="model-output-block bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 fade-in-output col-span-full">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold">
                                    {getPlatformIcon('openai')} GPT-4o - OpenAI
                                </h3>
                                <div className="flex space-x-2">
                                    <button className="copy-button text-gray-500 dark:text-gray-400" title="Copy output" disabled>
                                        <i className="fas fa-copy"></i>
                                    </button>
                                    <button className="regenerate-button text-gray-500 dark:text-gray-400" title="Regenerate output" disabled>
                                        <i className="fas fa-redo"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="output-content bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-auto max-h-64 text-sm whitespace-pre-wrap">
                                "Welcome to the AI Playground! Select functions and models on the left, then enter your prompt to see responses here."
                            </div>
                        </div>
                    )}

                    {outputs.map((output, index) => (
                        <div
                            key={`${output.platform}-${output.model}-${index}`}
                            className={`model-output-block bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 fade-in-output ${output.isError ? 'border border-red-500' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold flex items-center">
                                    {getPlatformIcon(output.platform)} {output.displayName}
                                </h3>
                                <div className="flex space-x-2">
                                    <button
                                        className="copy-button text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                                        title="Copy output"
                                        onClick={() => copyToClipboard(output.content)}
                                    >
                                        <i className="fas fa-copy"></i>
                                    </button>
                                    <button
                                        className="regenerate-button text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                                        title="Regenerate output"
                                        onClick={() => handleRegenerate(output, index)}
                                        disabled={output.isLoading}
                                    >
                                        {output.isLoading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-redo"></i>}
                                    </button>
                                </div>
                            </div>
                            <div className="output-content bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-auto max-h-64 text-sm whitespace-pre-wrap">
                                {output.isError ? <p className="text-red-500">{output.content}</p> : output.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {messageBox && (
                <MessageBox
                    message={messageBox.message}
                    type={messageBox.type}
                    onClose={() => setMessageBox(null)}
                />
            )}
        </div>
       
      </div>

      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
};

export default App;