// dummyHistoryHelper.ts
export const dummyHistory = [
  {
    id: "1",
    prompt: "Explain quantum computing in simple terms",
    timestamp: "2025-07-20T12:34:00Z",
    type: "Text Completion",
  },
  {
    id: "2",
    prompt: "Generate a UI layout for a fitness app",
    timestamp: "2025-07-19T16:20:00Z",
    type: "Code Generation",
  },
  {
    id: "3",
    prompt: "Write a Python function to sort an array",
    timestamp: "2025-07-19T14:15:00Z",
    type: "Code Generation",
  },
  {
    id: "4",
    prompt: "Create a business plan for a coffee shop",
    timestamp: "2025-07-18T10:30:00Z",
    type: "Text Completion",
  },
  {
    id: "5",
    prompt: "Analyze sentiment of customer reviews",
    timestamp: "2025-07-17T13:45:00Z",
    type: "Sentiment Analysis",
  }
];

export interface HistoryEntry {
  id: string;
  prompt: string;
  timestamp: string;
  type: string;
  response?: any;
}