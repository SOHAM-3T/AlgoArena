import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Play, Bug, PanelTop, Maximize, RotateCcw, Send } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { InsertSubmission } from '@shared/schema';

// Mock test cases
const testCases = [
  {
    id: 1,
    input: "6\n1 3 5 7 9 11\n3\n5\n10\n1",
    expectedOutput: "2\n-1\n0"
  },
  {
    id: 2,
    input: "7\n2 4 6 8 10 12 14\n2\n6\n7",
    expectedOutput: "2\n-1"
  }
];

type CodeEditorProps = {
  problemId: number;
  contestId: number;
  initialCode?: string;
  submittedCode?: string;
};

export function CodeEditor({ problemId, contestId, initialCode, submittedCode }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode || '# Write your solution here');
  const [language, setLanguage] = useState('python');
  const [testInput, setTestInput] = useState(testCases[0].input);
  const [testOutput, setTestOutput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async (submissionData: InsertSubmission) => {
      const res = await apiRequest('POST', '/api/submissions', submissionData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/submissions'] });
      toast({
        title: 'Submission successful',
        description: 'Your solution has been submitted for evaluation',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission failed',
        description: error.message || 'There was an error submitting your solution',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = () => {
    submitMutation.mutate({
      userId: 0, // Will be set by the server based on session
      problemId,
      contestId,
      code,
      language,
      status: 'Pending',
      score: 0, // Will be calculated by the server
    });
  };

  const handleTest = () => {
    // In a real implementation, this would send the code to a backend service
    // for execution against test cases
    setTestOutput('Running tests...\n\nTest case #1: Passed\nTest case #2: Passed\n\nAll tests passed!');
    
    toast({
      title: 'Test completed',
      description: 'Your solution passed all test cases!',
    });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    
    // Provide language-specific starter code
    if (value === 'python') {
      setCode('def solution():\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    solution()');
    } else if (value === 'javascript') {
      setCode('function solution() {\n    // Write your solution here\n}\n\nsolution();');
    } else if (value === 'java') {
      setCode('public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}');
    } else if (value === 'cpp') {
      setCode('#include <iostream>\n\nint main() {\n    // Write your solution here\n    return 0;\n}');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    if (submittedCode) {
      setCode(submittedCode);
    }
  }, [submittedCode]);

  useEffect(() => {
    // Clean up escape key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="p-4 bg-slate-800 flex items-center justify-between">
        <div className="flex items-center">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="bg-slate-700 text-white border-none focus:ring-2 focus:ring-primary w-36">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="ml-2 text-slate-300 hover:text-white">
            <PanelTop className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white mr-2" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-slate-900 text-green-400 font-mono text-sm p-4 h-96 overflow-y-auto">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full bg-transparent border-none outline-none resize-none focus:outline-none p-0"
          spellCheck="false"
        />
      </div>
      
      <div className="p-4 bg-slate-800 flex items-center justify-between">
        <div>
          <Button className="mr-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleTest}>
            <Play className="h-4 w-4 mr-1" /> Test
          </Button>
          <Button variant="secondary" className="bg-slate-700 text-white hover:bg-slate-600">
            <Bug className="h-4 w-4 mr-1" /> Debug
          </Button>
        </div>
        <Button 
          className="bg-primary text-white hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
        >
          <Send className="h-4 w-4 mr-1" /> {submitMutation.isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
      
      {/* Test Results Section */}
      {testOutput && (
        <div className="p-4 bg-slate-100 border-t border-slate-200">
          <h3 className="text-sm font-semibold mb-2">Test Results</h3>
          <pre className="bg-white p-3 rounded border border-slate-200 text-sm font-mono whitespace-pre-wrap">
            {testOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
