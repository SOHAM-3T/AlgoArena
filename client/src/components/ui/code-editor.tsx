import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, RefreshCw, Check } from 'lucide-react';

interface TestResult {
  status: 'success' | 'error';
  message: string;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
}

interface CodeEditorProps {
  defaultCode: string;
  problemId: number;
  contestId: number;
}

const languageOptions = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' }
];

export function CodeEditor({ defaultCode, problemId, contestId }: CodeEditorProps) {
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState('python');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async ({ code, language }: { code: string; language: string }) => {
      const res = await apiRequest("POST", "/api/submissions", {
        problemId,
        contestId,
        code,
        language
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Submission successful",
        description: `Your solution was ${data.status}`,
        variant: data.status === "Accepted" ? "default" : "destructive",
      });
      
      // Mock test results
      const mockResults = [
        {
          status: 'success',
          message: 'Test case 1 passed',
          input: 'nums = [2,7,11,15], target = 9',
        },
        {
          status: 'success',
          message: 'Test case 2 passed',
          input: 'nums = [3,2,4], target = 6',
        },
        {
          status: 'success',
          message: 'Test case 3 passed',
          input: 'nums = [3,3], target = 6',
        }
      ] as TestResult[];
      
      if (data.status !== "Accepted") {
        mockResults[Math.floor(Math.random() * mockResults.length)].status = 'error';
        mockResults[Math.floor(Math.random() * mockResults.length)].message = 'Test case failed';
      }
      
      setTestResults(mockResults);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleRunTests = () => {
    submitMutation.mutate({ code, language });
  };

  const handleReset = () => {
    setCode(defaultCode);
    setTestResults([]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center">
        <div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReset} disabled={submitMutation.isPending}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="default" onClick={handleRunTests} disabled={submitMutation.isPending}>
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Tests
          </Button>
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700" 
            onClick={handleRunTests} 
            disabled={submitMutation.isPending}
          >
            <Check className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </div>
      </div>

      <div className="h-96 bg-slate-900 text-white font-mono p-4 overflow-auto">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full bg-transparent resize-none focus:outline-none font-mono"
          spellCheck={false}
        />
      </div>

      {testResults.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`rounded-md p-3 flex items-start ${
                  result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {result.status === 'success' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 text-red-500">✖</div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-sm ${
                    result.status === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <strong>{result.message}</strong>
                    {result.input && `: Input: ${result.input}`}
                    {result.expectedOutput && <div>Expected: {result.expectedOutput}</div>}
                    {result.actualOutput && <div>Actual: {result.actualOutput}</div>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
