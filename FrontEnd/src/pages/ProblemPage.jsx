import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from '../components/SubmissionHistory';
import { 
  Play, Send, Code2, FileText, CheckCircle, AlertCircle, 
  Terminal, Cpu, Database, List, Clock, XCircle,
  Copy, ChevronRight,Sparkles
} from 'lucide-react';
import ChatAi from '../components/ChatAI';
import Editorial from '../components/Editorials';

// 1. Language Mapping Configuration
const langMap = {
  cpp: 'cpp',
  java: 'java',
  javascript: 'javascript'
};

// 2. Status Color Helper (Using your specific Hex Codes)
const getStatusStyles = (statusId, statusDescription) => {
  let desc = '';
  
  if (typeof statusDescription === 'string') {
    desc = statusDescription.toLowerCase();
  } else if (statusDescription && typeof statusDescription === 'object') {
    desc = statusDescription.description?.toLowerCase() || '';
  }

  // Accepted (AC) - Green #28a745
  if (statusId === 3 || desc.includes('accepted')) {
    return {
      text: 'text-[#28a745]',
      bg: 'bg-[#28a745]/10',
      border: 'border-[#28a745]/30',
      iconColor: '#28a745'
    };
  }

  // Wrong Answer (WA) - Red #dc3545
  if (statusId === 4 || desc.includes('wrong')) {
    return {
      text: 'text-[#dc3545]',
      bg: 'bg-[#dc3545]/10',
      border: 'border-[#dc3545]/30',
      iconColor: '#dc3545'
    };
  }

  // Time Limit Exceeded (TLE) - Yellow #ffc107
  if (statusId === 5 || desc.includes('time limit')) {
    return {
      text: 'text-[#ffc107]',
      bg: 'bg-[#ffc107]/10',
      border: 'border-[#ffc107]/30',
      iconColor: '#ffc107'
    };
  }

  // Compilation Error (CE) - Gray #6c757d
  if (statusId === 6 || desc.includes('compilation')) {
    return {
      text: 'text-[#6c757d]',
      bg: 'bg-[#6c757d]/10',
      border: 'border-[#6c757d]/30',
      iconColor: '#6c757d'
    };
  }

  // Runtime Error (RE) - Orange/Red #ff4500
  if (statusId > 6 || desc.includes('runtime') || desc.includes('error')) {
    return {
      text: 'text-[#ff4500]',
      bg: 'bg-[#ff4500]/10',
      border: 'border-[#ff4500]/30',
      iconColor: '#ff4500'
    };
  }

  // Default Fallback
  return {
    text: 'text-gray-400',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    iconColor: '#9ca3af'
  };
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [copiedInput, setCopiedInput] = useState(null);
  const [copiedOutput, setCopiedOutput] = useState(null);
  const editorRef = useRef(null);
  let { problemId } = useParams();

  // Copy to clipboard functions
  const copyToClipboard = (text, type, index) => {
    navigator.clipboard.writeText(text);
    if (type === 'input') {
      setCopiedInput(index);
      setTimeout(() => setCopiedInput(null), 2000);
    } else {
      setCopiedOutput(index);
      setTimeout(() => setCopiedOutput(null), 2000);
    }
  };

  // --- Effects ---
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(response.data);

        const backendLang = langMap[selectedLanguage];
        const initialCode = response.data.startCode.find(
          (sc) => sc.language === backendLang
        )?.initialCode || '// Start coding here';

        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const backendLang = langMap[selectedLanguage];
      const initialCode = problem.startCode.find(
        (sc) => sc.language === backendLang
      )?.initialCode || '';
      
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  // --- Handlers ---
  const handleEditorChange = (value) => setCode(value || '');
  const handleEditorDidMount = (editor) => { editorRef.current = editor; };
  const handleLanguageChange = (language) => setSelectedLanguage(language);

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           'Execution failed';
      setRunResult({
        success: false,
        error: errorMessage,
        message: errorMessage,
        testCases: [] 
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-[#28a745]/20 text-[#28a745] border-[#28a745]/50';
      case 'medium': return 'bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]/50';
      case 'hard': return 'bg-[#dc3545]/20 text-[#dc3545] border-[#dc3545]/50';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // Helper for Tabs
  const TabButton = ({ active, label, icon: Icon, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
        ${active 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950">
        <span className="loading loading-spinner loading-lg text-white"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 overflow-hidden text-white">
      
      {/* --- LEFT PANEL --- */}
      <div className="w-1/2 flex flex-col border-r border-gray-700 bg-gray-800/50 backdrop-blur-md">
        
        {/* Left Tabs */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-700 bg-gray-900/80 overflow-x-auto no-scrollbar">
          <TabButton active={activeLeftTab === 'description'} label="Description" icon={FileText} onClick={() => setActiveLeftTab('description')} />
          <TabButton active={activeLeftTab === 'editorial'} label="Editorial" icon={List} onClick={() => setActiveLeftTab('editorial')} />
          <TabButton active={activeLeftTab === 'solutions'} label="Solutions" icon={Code2} onClick={() => setActiveLeftTab('solutions')} />
          <TabButton active={activeLeftTab === 'submissions'} label="Submissions" icon={Clock} onClick={() => setActiveLeftTab('submissions')} />
          <TabButton active={activeLeftTab === 'chatAI'} label='chatAI' icon={Clock} onClick={() => setActiveLeftTab('chatAI')} />
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="animate-fade-in">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <h1 className="text-3xl font-bold text-white tracking-wide mr-2">{problem.title}</h1>
                    <div className={`badge ${getDifficultyColor(problem.difficulty)} border px-3 py-3 font-semibold`}>
                      {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                    </div>
                    {problem.tags && problem.tags.map((tag, i) => (
                         <div key={i} className="badge bg-blue-900/40 text-blue-300 border-blue-700/50 px-3 py-3">{tag}</div>
                    ))}
                  </div>

                  <div className="prose prose-invert max-w-none mb-8">
                    <div className="whitespace-pre-wrap text-gray-300 text-base leading-relaxed font-sans">
                      {problem.description}
                    </div>
                  </div>

                  {/* ENHANCED EXAMPLES SECTION (ONLY ONE INSTANCE) */}
                  {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <ChevronRight size={24} className="text-blue-400 mr-2" />
                        Examples
                      </h3>
                      
                      <div className="space-y-4">
                        {problem.visibleTestCases.map((example, index) => (
                          <div key={index} className="bg-gray-900/70 border border-gray-700 rounded-lg overflow-hidden">
                            {/* Example Header */}
                            <div className="bg-gray-800/80 px-4 py-3 border-b border-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                                  {index + 1}
                                </div>
                                <span className="font-semibold text-gray-200">Example {index + 1}</span>
                              </div>
                            </div>
                            
                            {/* Example Content */}
                            <div className="p-4 space-y-4">
                              {/* Input Section */}
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-400">Input</span>
                                  <button
                                    onClick={() => copyToClipboard(example.input, 'input', index)}
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                  >
                                    <Copy size={12} />
                                    {copiedInput === index ? 'Copied!' : 'Copy'}
                                  </button>
                                </div>
                                <div className="bg-gray-950 border border-gray-700 rounded p-3 font-mono text-sm text-gray-200 whitespace-pre-wrap overflow-x-auto">
                                  {example.input}
                                </div>
                              </div>

                              {/* Output Section */}
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-400">Output</span>
                                  <button
                                    onClick={() => copyToClipboard(example.output, 'output', index)}
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                  >
                                    <Copy size={12} />
                                    {copiedOutput === index ? 'Copied!' : 'Copy'}
                                  </button>
                                </div>
                                <div className="bg-gray-950 border border-gray-700 rounded p-3 font-mono text-sm text-gray-200 whitespace-pre-wrap overflow-x-auto">
                                  {example.output}
                                </div>
                              </div>

                              {/* Explanation Section */}
                              {example.explanation && (
                                <div className="pt-3 border-t border-gray-700/50">
                                  <span className="text-sm font-medium text-gray-400 block mb-2">Explanation</span>
                                  <div className="text-gray-300 text-sm leading-relaxed bg-gray-900/40 p-3 rounded border border-gray-700/30">
                                    {example.explanation}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Constraints Section (if available) */}
                  {problem.constraints && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <ChevronRight size={24} className="text-yellow-400 mr-2" />
                        Constraints
                      </h3>
                      <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-4">
                        <ul className="space-y-2 text-gray-300">
                          {Array.isArray(problem.constraints) ? 
                            problem.constraints.map((constraint, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                <span className="text-sm">{constraint}</span>
                              </li>
                            )) : 
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                              <span className="text-sm">{problem.constraints}</span>
                            </li>
                          }
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Follow-up Section (if available) */}
                  {problem.followUp && (
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-5">
                      <h4 className="text-lg font-bold text-blue-300 mb-2 flex items-center gap-2">
                        <span className="bg-blue-700/30 p-1 rounded">
                          <ChevronRight size={20} className="text-blue-400" />
                        </span>
                        Follow-up
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {problem.followUp}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="prose prose-invert max-w-none p-4">
                  <h2 className="text-2xl font-bold mb-4 text-white">Editorial</h2>
                  <div className="whitespace-pre-wrap text-gray-300 leading-relaxed bg-gray-900/60 p-6 rounded-xl border border-gray-700">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} ></Editorial>
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4 text-white">Official Solutions</h2>
                  {problem.referenceSolution?.map((solution, index) => (
                    <div key={index} className="border border-gray-700 rounded-xl overflow-hidden shadow-lg">
                      <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                        <Code2 size={16} className="text-blue-400"/>
                        <h3 className="font-semibold text-blue-300">{problem?.title} - {solution?.language}</h3>
                      </div>
                      <div className="p-0">
                        <Editor 
                          height="200px"
                          language={getLanguageForMonaco(solution.language)}
                          value={solution.completeCode}
                          theme="vs-dark"
                          options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                        />
                      </div>
                    </div>
                  )) || <p className="text-gray-500 text-center py-10">Solutions will be available after you solve the problem.</p>}
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div className="p-2">
                  <h2 className="text-2xl font-bold mb-4 text-white">Submission History</h2>
                  <div className="bg-gray-900/60 rounded-xl border border-gray-700 p-4 min-h-[200px]">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}
              {activeLeftTab === 'chatAI' && (
                <div className="animate-fade-in h-full flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles size={20} className="text-blue-400" />
                        AI Coding Assistant
                    </h3>
                    <div className="flex-1 bg-gray-900/60 rounded-xl border border-gray-700 overflow-hidden">
                        <ChatAi problem={problem} />
                    </div>
                </div>
            )}
            </>
          )}
        </div>
      </div>

      {/* --- RIGHT PANEL --- */}
      <div className="w-1/2 flex flex-col bg-gray-900/70 backdrop-blur-xl">
        
        {/* Right Tabs */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-700 bg-gray-900/90">
          <TabButton active={activeRightTab === 'code'} label="Code" icon={Code2} onClick={() => setActiveRightTab('code')} />
          <TabButton active={activeRightTab === 'testcase'} label="Output" icon={Terminal} onClick={() => setActiveRightTab('testcase')} />
          <TabButton active={activeRightTab === 'result'} label="Result" icon={CheckCircle} onClick={() => setActiveRightTab('result')} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* 1. CODE EDITOR TAB */}
          {activeRightTab === 'code' && (
            <>
              {/* Language Bar */}
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700 bg-gray-900/50">
                <div className="flex gap-2">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 border
                        ${selectedLanguage === lang 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-md' 
                          : 'bg-transparent border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 relative">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 16 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                  }}
                />
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t border-gray-700 bg-gray-900/80 flex justify-between items-center backdrop-blur-md">
                <button 
                  className="btn btn-ghost btn-sm text-gray-400 hover:text-white gap-2"
                  onClick={() => setActiveRightTab('testcase')}
                >
                  <Terminal size={16} /> Console
                </button>
                <div className="flex gap-3">
                  <button
                    className={`btn btn-sm border-none bg-gray-800 hover:bg-gray-700 text-white gap-2 px-4 ${loading ? 'loading' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                   {!loading && <Play size={16} className="text-[#28a745] fill-current" />} Run
                  </button>
                  <button
                    className={`btn btn-sm border-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white gap-2 px-6 shadow-lg shadow-blue-500/20 ${loading ? 'loading' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    {!loading && <Send size={16} />} Submit
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 2. TEST RESULTS TAB */}
          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-900/60">
              
              {/* --- HEADER WITH SUBMIT BUTTON --- */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Terminal size={20} className="text-blue-400" /> Test Execution
                </h3>
                
                {/* Added Submit Button Here */}
                <button
                  className={`btn btn-sm border-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white gap-2 px-6 shadow-lg shadow-blue-500/20 ${loading ? 'loading' : ''}`}
                  onClick={handleSubmitCode}
                  disabled={loading}
                >
                  {!loading && <Send size={16} />} Submit
                </button>
              </div>

              {runResult ? (
                <div className={`rounded-xl border p-5 transition-all duration-300 animate-fade-in ${runResult.success ? 'bg-[#28a745]/5 border-[#28a745]/20' : 'bg-[#dc3545]/5 border-[#dc3545]/20'}`}>
                   {runResult.success ? (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-[#28a745]/20 p-2 rounded-full">
                                <CheckCircle className="text-[#28a745]" size={24} />
                            </div>
                            <h4 className="font-bold text-[#28a745] text-lg">All Test Cases Passed!</h4>
                        </div>
                        
                        <div className="flex gap-4 mb-6">
                            <div className="badge bg-gray-900 text-gray-300 border border-gray-700 p-3 gap-2 h-auto">
                                <Cpu size={14} className="text-blue-400"/> {runResult.runtime || 0}s
                            </div>
                            <div className="badge bg-gray-900 text-gray-300 border border-gray-700 p-3 gap-2 h-auto">
                                <Database size={14} className="text-purple-400"/> {runResult.memory || 0}KB
                            </div>
                        </div>

                        <div className="space-y-4">
                            {runResult.testCases && runResult.testCases.map((tc, i) => {
                                const style = getStatusStyles(tc.status_id, tc.status);
                                return (
                                  <div key={i} className={`bg-gray-900/80 rounded-lg p-4 border-l-4 ${style.border.replace('border', 'border-l')} font-mono text-sm shadow-md`}>
                                      <div className="grid grid-cols-[80px_1fr] gap-3">
                                          <span className="text-gray-500 font-semibold uppercase text-xs">Input</span> 
                                          <span className="text-gray-300 bg-gray-900 p-1 rounded px-2">{tc.stdin}</span>
                                          
                                          <span className="text-gray-500 font-semibold uppercase text-xs">Expected</span> 
                                          <span className="text-gray-300 bg-gray-900 p-1 rounded px-2">{tc.expected_output}</span>
                                          
                                          <span className="text-gray-500 font-semibold uppercase text-xs">Output</span> 
                                          <span className="text-white bg-gray-900 p-1 rounded px-2">{tc.stdout}</span>

                                          <span className="text-gray-500 font-semibold uppercase text-xs">Status</span> 
                                          <span className={`font-bold ${style.text}`}>
                                              {tc.status_id === 3 ? 'Accepted' : (tc.status?.description || tc.status || 'Failed')}
                                          </span>
                                      </div>
                                  </div>
                                );
                            })}
                        </div>
                    </div>
                   ) : (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-[#dc3545]/20 p-2 rounded-full">
                                <AlertCircle className="text-[#dc3545]" size={24} />
                            </div>
                            <h4 className="font-bold text-[#dc3545] text-lg">Execution Failed</h4>
                        </div>
                        
                        {(runResult.message || runResult.error) && (
                            <div className="bg-red-900/20 text-[#dc3545] p-4 rounded-lg mb-6 text-sm font-mono border border-[#dc3545]/30 shadow-inner">
                                {runResult.message || runResult.error}
                            </div>
                        )}

                        {runResult.testCases && runResult.testCases.length > 0 ? (
                            <div className="space-y-4">
                                {runResult.testCases.map((tc, i) => {
                                    const style = getStatusStyles(tc.status_id, tc.status);
                                    return (
                                      <div key={i} className={`bg-gray-900/80 rounded-lg p-4 border-l-4 ${style.border.replace('border', 'border-l')} font-mono text-sm shadow-md`}>
                                          <div className="grid grid-cols-[80px_1fr] gap-3">
                                              <span className="text-gray-500 font-semibold uppercase text-xs">Input</span> 
                                              <span className="text-gray-300">{tc.stdin}</span>
                                              
                                              <span className="text-gray-500 font-semibold uppercase text-xs">Output</span> 
                                              <span className="text-white bg-gray-900 p-1 rounded px-2">{tc.stdout || tc.stderr || tc.compile_output || 'No output'}</span>
                                              
                                              <span className="text-gray-500 font-semibold uppercase text-xs">Status</span> 
                                              <span className={`font-bold ${style.text}`}>
                                                  {tc.status_id === 3 ? 'Accepted' : `Failed (${tc.status?.description || tc.status})`}
                                              </span>
                                          </div>
                                      </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mockup-code bg-gray-900 text-white text-xs border border-gray-700 shadow-xl">
                                <pre className="p-4 whitespace-pre-wrap text-[#ffc107] font-mono">
                                    {runResult.compile_output || runResult.stderr || runResult.error || "Unknown Error"}
                                </pre>
                            </div>
                        )}
                    </div>
                   )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-600 gap-4 border border-gray-700 rounded-xl bg-gray-900/50">
                   <Play size={48} className="opacity-20" />
                   <p className="text-gray-500">Run your code to see test results here.</p>
                </div>
              )}
            </div>
          )}

          {/* 3. SUBMISSION RESULTS TAB */}
          {activeRightTab === 'result' && (
             <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-900/60">
              <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                <Send size={20} className="text-blue-400" /> Submission Result
              </h3>
              
              {submitResult ? (
                 <div className={`rounded-xl border p-8 text-center animate-fade-in ${
                    submitResult.accepted 
                    ? 'bg-[#28a745]/10 border-[#28a745]/30' 
                    : 'bg-[#dc3545]/10 border-[#dc3545]/30'
                 }`}>
                    {submitResult.accepted ? (
                        <>
                            <div className="w-20 h-20 bg-[#28a745] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#28a745]/40">
                                <CheckCircle size={40} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Accepted</h2>
                            <p className="text-[#28a745] mb-8 text-lg font-medium">Congratulations! You solved the problem.</p>
                            
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700">
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tests</div>
                                    <div className="text-xl font-mono font-bold text-white">{submitResult.passedTestCases}/{submitResult.totalTestCases}</div>
                                </div>
                                <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700">
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Runtime</div>
                                    <div className="text-xl font-mono font-bold text-white">{submitResult.runtime}s</div>
                                </div>
                                <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700">
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Memory</div>
                                    <div className="text-xl font-mono font-bold text-white">{submitResult.memory}KB</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Dynamic Icon Color based on Error */}
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg 
                                ${submitResult.error?.includes('Time') ? 'bg-[#ffc107] shadow-[#ffc107]/40' : 'bg-[#dc3545] shadow-[#dc3545]/40'}`}>
                                
                                {submitResult.error?.includes('Time') ? (
                                    <Clock size={40} className="text-white" />
                                ) : (
                                    <AlertCircle size={40} className="text-white" />
                                )}
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">
                                {submitResult.error || "Wrong Answer"}
                            </h2>
                            
                            {/* Error Pill */}
                            <p className={`mb-8 text-lg inline-block px-6 py-2 rounded-lg border font-medium 
                                ${submitResult.error?.includes('Time') 
                                    ? 'text-[#ffc107] bg-[#ffc107]/10 border-[#ffc107]/30' 
                                    : 'text-[#dc3545] bg-[#dc3545]/10 border-[#dc3545]/30'}`}>
                                {submitResult.error}
                            </p>

                            <div className="bg-gray-900/80 p-4 rounded-xl inline-block px-10 border border-gray-700">
                                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tests Passed</div>
                                <div className="text-2xl font-mono font-bold text-white">{submitResult.passedTestCases}/{submitResult.totalTestCases}</div>
                            </div>
                        </>
                    )}
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-600 gap-4 border border-gray-700 rounded-xl bg-gray-900/50">
                   <Send size={48} className="opacity-20" />
                   <p className="text-gray-500">Submit your code to see full evaluation.</p>
                </div>
              )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProblemPage;