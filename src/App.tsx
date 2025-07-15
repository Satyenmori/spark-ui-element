import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSun,
  faMoon,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Menu, X, ChevronDown, Bot, Zap, Palette, Code, FileText, Image, BarChart3, Copy, RotateCcw } from 'lucide-react';

// Dynamic JSON structure for Function -> Platform -> Models
const dynamicPlatformModels = {
  "Text Completion": {
    "OpenAI": ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
    "Anthropic": ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    "Google": ["gemini-1.5-pro", "gemini-1.0-pro", "palm2"],
    "Cohere": ["command-r-plus", "command", "embed-english-v3.0"]
  },
  "Code Generation": {
    "OpenAI": ["gpt-4o", "gpt-4-turbo"],
    "Anthropic": ["claude-3-opus", "claude-3-sonnet"],
    "Google": ["gemini-1.5-pro"]
  },
  "Image Generation": {
    "OpenAI": ["dall-e-3", "dall-e-2"],
    "Stability": ["stable-diffusion-xl", "stable-diffusion-v2"]
  },
  "Image Description": {
    "OpenAI": ["gpt-4o", "gpt-4-turbo"],
    "Anthropic": ["claude-3-opus", "claude-3-sonnet"],
    "Google": ["gemini-1.5-pro"]
  },
  "Sentiment Analysis": {
    "OpenAI": ["gpt-4o", "gpt-3.5-turbo"],
    "Anthropic": ["claude-3-haiku"],
    "Google": ["gemini-1.0-pro"],
    "Cohere": ["command-r-plus", "command"]
  }
};

const functionConfigs = [
  {
    name: "Text Completion",
    apiEndpoint: "/api/text-completion",
    inputs: []
  },
  {
    name: "Code Generation", 
    apiEndpoint: "/api/code-generation",
    inputs: [
      { id: "language", label: "Language", type: "text", placeholder: "e.g., Python, JavaScript", tooltip: "Specify the programming language for code generation." },
      { id: "framework", label: "Framework (Optional)", type: "text", placeholder: "e.g., React, Django", tooltip: "Specify a framework if relevant (e.g., React, Django)." }
    ]
  },
  {
    name: "Image Generation",
    apiEndpoint: "/api/image-generation", 
    inputs: [
      { id: "style", label: "Art Style", type: "text", placeholder: "e.g., photorealistic, cartoon", tooltip: "Specify the desired art style for image generation." }
    ]
  },
  {
    name: "Image Description",
    apiEndpoint: "/api/image-description",
    inputs: [
      { id: "imageUpload", label: "Upload Image", type: "file", accept: "image/*", tooltip: "Upload an image for the AI to describe." }
    ]
  },
  {
    name: "Sentiment Analysis",
    apiEndpoint: "/api/sentiment-analysis",
    inputs: [
      { id: "sentimentTarget", label: "Target Entity (Optional)", type: "text", placeholder: "e.g., 'product', 'service'", tooltip: "Specify a specific entity to analyze sentiment for within the text." }
    ]
  }
];

const getPlatformIcon = (platform) => {
  switch (platform.toLowerCase()) {
    case 'openai':
      return <Bot className="w-4 h-4 mr-2 text-green-500" />;
    case 'anthropic':
      return <Zap className="w-4 h-4 mr-2 text-orange-500" />;
    case 'cohere':
      return <Palette className="w-4 h-4 mr-2 text-purple-500" />;
    case 'google':
      return <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />;
    case 'stability':
      return <Image className="w-4 h-4 mr-2 text-pink-500" />;
    default:
      return <Bot className="w-4 h-4 mr-2 text-gray-500" />;
  }
};

const getFunctionIcon = (functionName) => {
  switch (functionName) {
    case 'Text Completion':
      return <FileText className="w-4 h-4 mr-2" />;
    case 'Code Generation':
      return <Code className="w-4 h-4 mr-2" />;
    case 'Image Generation':
      return <Image className="w-4 h-4 mr-2" />;
    case 'Image Description':
      return <Image className="w-4 h-4 mr-2" />;
    case 'Sentiment Analysis':
      return <BarChart3 className="w-4 h-4 mr-2" />;
    default:
      return <Bot className="w-4 h-4 mr-2" />;
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
  const [selectedFunction, setSelectedFunction] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [promptText, setPromptText] = useState('');
  const [dynamicInputs, setDynamicInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [outputs, setOutputs] = useState([]);
  const [messageBox, setMessageBox] = useState(null);
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);

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

    // Get available platforms for selected function
    const getAvailablePlatforms = () => {
        if (!selectedFunction || !dynamicPlatformModels[selectedFunction]) return [];
        return Object.keys(dynamicPlatformModels[selectedFunction]);
    };

    // Get available models for selected platform and function
    const getAvailableModels = () => {
        if (!selectedFunction || !selectedPlatform || !dynamicPlatformModels[selectedFunction]?.[selectedPlatform]) return [];
        return dynamicPlatformModels[selectedFunction][selectedPlatform];
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
    }, [selectedFunction]);

    // Reset platform and model when function changes
    useEffect(() => {
        setSelectedPlatform('');
        setSelectedModel('');
    }, [selectedFunction]);

    // Reset model when platform changes
    useEffect(() => {
        setSelectedModel('');
    }, [selectedPlatform]);

    // --- Handlers ---

    // Theme Toggle Handler
    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.remove(theme);
        document.documentElement.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Toggle Left Panel Handler
    const toggleLeftPanel = () => {
        setIsLeftPanelVisible(!isLeftPanelVisible);
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

        if (!selectedFunction || !selectedPlatform || !selectedModel) {
            showMessageBox("Please select a function, platform, and model.", "warning");
            return;
        }

        const currentFunctionConfig = functionConfigs.find(func => func.name === selectedFunction);
        const modelInfo = {
            platform: selectedPlatform,
            model: selectedModel,
            displayName: `${selectedModel} - ${selectedPlatform}`
        };

        setIsLoading(true);
        setOutputs([]); // Clear previous outputs

        try {
            const response = await simulateApiCall(modelInfo, promptText, currentFunctionConfig, dynamicInputs);
            setOutputs([{ ...modelInfo, content: response, isError: false }]);
        } catch (error) {
            console.error(`Error generating for ${modelInfo.displayName}:`, error);
            setOutputs([{ ...modelInfo, content: `Error: ${error.message || 'Failed to generate response.'}`, isError: true }]);
        } finally {
            setIsLoading(false);
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
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLeftPanel}
                className="mr-2"
              >
                {isLeftPanelVisible ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
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
       
        {/* Main Content */}
        <div className="flex min-h-[calc(100vh-5rem)]">
            {/* Left Panel: User Controls */}
            <div className={`${isLeftPanelVisible ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-border bg-card`}>
                <div className="p-6 h-full overflow-y-auto">
                    <div className="space-y-6">
                        {/* Function Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Function Test</label>
                            <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                                <SelectTrigger className="w-full">
                                    <div className="flex items-center">
                                        {selectedFunction && getFunctionIcon(selectedFunction)}
                                        <SelectValue placeholder="Select a function" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {functionConfigs.map(func => (
                                        <SelectItem key={func.name} value={func.name}>
                                            <div className="flex items-center">
                                                {getFunctionIcon(func.name)}
                                                {func.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* AI Platform Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">AI Platforms</label>
                            <Select 
                                value={selectedPlatform} 
                                onValueChange={setSelectedPlatform}
                                disabled={!selectedFunction}
                            >
                                <SelectTrigger className="w-full">
                                    <div className="flex items-center">
                                        {selectedPlatform && getPlatformIcon(selectedPlatform)}
                                        <SelectValue placeholder={selectedFunction ? "Select a platform" : "Select function first"} />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {getAvailablePlatforms().map(platform => (
                                        <SelectItem key={platform} value={platform}>
                                            <div className="flex items-center">
                                                {getPlatformIcon(platform)}
                                                {platform}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Model Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Models</label>
                            <Select 
                                value={selectedModel} 
                                onValueChange={setSelectedModel}
                                disabled={!selectedPlatform}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={selectedPlatform ? "Select a model" : "Select platform first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {getAvailableModels().map(model => (
                                        <SelectItem key={model} value={model}>
                                            {model}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dynamic Input Section */}
                        {selectedFunction && functionConfigs.find(f => f.name === selectedFunction)?.inputs.length > 0 && (
                            <div className="space-y-4">
                                <label className="text-sm font-medium">Additional Parameters</label>
                                {functionConfigs.find(f => f.name === selectedFunction)?.inputs.map(input => (
                                    <div key={input.id} className="space-y-2">
                                        <label htmlFor={input.id} className="text-sm text-muted-foreground">
                                            {input.label}
                                        </label>
                                        {input.type === 'text' && (
                                            <input
                                                type="text"
                                                id={input.id}
                                                className="w-full px-3 py-2 border border-input rounded-md bg-background"
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
                                                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground"
                                                onChange={handleDynamicInputChange}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Prompt Text Area */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prompt Text</label>
                            <textarea
                                rows={8}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background resize-y"
                                placeholder="Enter your prompt here..."
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                            />
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading || !selectedFunction || !selectedPlatform || !selectedModel}
                            className="w-full"
                        >
                            {isLoading ? 'Generating...' : 'Generate Response'}
                            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Panel: Model Outputs */}
            <div className="flex-1 p-6">
                <div className="h-full">
                    {outputs.length === 0 && !isLoading ? (
                        <Card className="h-full flex items-center justify-center">
                            <CardContent className="text-center">
                                <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">Welcome to AI Playground!</h3>
                                <p className="text-muted-foreground">
                                    Select a function, platform, and model on the left, then enter your prompt to see responses here.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4 h-full overflow-y-auto">
                            {outputs.map((output, index) => (
                                <Card key={`${output.platform}-${output.model}-${index}`} className={output.isError ? 'border-destructive' : ''}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center text-base">
                                                {getPlatformIcon(output.platform)}
                                                {output.displayName}
                                            </CardTitle>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(output.content)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRegenerate(output, index)}
                                                    disabled={output.isLoading}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <RotateCcw className={`w-4 h-4 ${output.isLoading ? 'animate-spin' : ''}`} />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-muted p-3 rounded-md max-h-96 overflow-auto">
                                            <pre className="text-sm whitespace-pre-wrap font-mono">
                                                {output.isError ? (
                                                    <span className="text-destructive">{output.content}</span>
                                                ) : (
                                                    output.content
                                                )}
                                            </pre>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
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