import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Trash2, Save, Code2, FileText, Eye, EyeOff, CheckCircle2, Home, 
  RefreshCw, AlertTriangle 
} from 'lucide-react'; 
import { getProblemById, clearCurrentProblem } from '../slices/authSlice1';

// Define Tags to match your Backend & Homepage
const AVAILABLE_TAGS = ['array', 'LinkedList', 'Graph', 'tree', 'two-pointers', 'dp'];

// UPDATED SCHEMA: Strictly lowercase 'javascript'
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  
  tags: z.array(z.string()).min(1, 'Select at least one category tag'),
  
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      // UPDATED: 'javascript' is now all lowercase
      language: z.enum(['cpp', 'java', 'javascript']), 
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      // UPDATED: 'javascript' is now all lowercase
      language: z.enum(['cpp', 'java', 'javascript']), 
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminUpdate() {

  const onError = (errors) => {
    console.log("Form Validation Errors:", errors);
    alert("Validation failed! Check console for details.");
  };
  const { problemId } = useParams(); 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentProblem, loading, error: reduxError } = useSelector((state) => state.problems);
  
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'medium',
      tags: [],
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [
        { language: 'cpp', initialCode: '' },
        { language: 'java', initialCode: '' },
        { language: 'javascript', initialCode: '' } // UPDATED: Lowercase
      ],
      referenceSolution: [
        { language: 'cpp', completeCode: '' },
        { language: 'java', completeCode: '' },
        { language: 'javascript', completeCode: '' } // UPDATED: Lowercase
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const selectedTags = watch('tags');

  // Fetch problem data when component mounts
  useEffect(() => {
    if (problemId) {
      dispatch(getProblemById(problemId));
    }
    
    return () => {
      dispatch(clearCurrentProblem());
    };
  }, [dispatch, problemId]);

 // Reset form with fetched problem data
 useEffect(() => {
  if (currentProblem) {
    console.log('Current Problem Data from backend:', {
      startCode: currentProblem.startCode,
      referenceSolution: currentProblem.referenceSolution
    });
    
    const ensureNotEmpty = (arr) => (arr && arr.length > 0 ? arr : [{ input: '', output: '', explanation: '' }]);
    const ensureHiddenNotEmpty = (arr) => (arr && arr.length > 0 ? arr : [{ input: '', output: '' }]);

    // --- UPDATED NORMALIZATION LOGIC ---
    const normalizeLanguage = (lang) => {
      if (!lang) return 'cpp';
      const langLower = lang.toLowerCase();
      
      if (langLower === 'c++') return 'cpp';
      if (langLower === 'js') return 'javascript'; 
      // Returns 'javascript', 'java', 'cpp' correctly now
      return langLower; 
    };

    // Normalize startCode from backend
    const normalizedStartCode = currentProblem.startCode && currentProblem.startCode.length > 0
      ? currentProblem.startCode.map(item => ({
          language: normalizeLanguage(item.language),
          initialCode: item.initialCode || ''
        }))
      : [
          { language: 'cpp', initialCode: '' },
          { language: 'java', initialCode: '' },
          { language: 'javascript', initialCode: '' }
        ];
    
    // Ensure we have exactly 3 items
    while (normalizedStartCode.length < 3) {
      const languages = ['cpp', 'java', 'javascript']; // UPDATED LIST
      const existingLangs = normalizedStartCode.map(item => item.language);
      const missingLang = languages.find(lang => !existingLangs.includes(lang));
      normalizedStartCode.push({ language: missingLang || 'cpp', initialCode: '' });
    }

    // Normalize referenceSolution from backend
    const normalizedReferenceSolution = currentProblem.referenceSolution && currentProblem.referenceSolution.length > 0
      ? currentProblem.referenceSolution.map(item => ({
          language: normalizeLanguage(item.language),
          completeCode: item.completeCode || ''
        }))
      : [
          { language: 'cpp', completeCode: '' },
          { language: 'java', completeCode: '' },
          { language: 'javascript', completeCode: '' }
        ];
    
    // Ensure we have exactly 3 items
    while (normalizedReferenceSolution.length < 3) {
      const languages = ['cpp', 'java', 'javascript']; // UPDATED LIST
      const existingLangs = normalizedReferenceSolution.map(item => item.language);
      const missingLang = languages.find(lang => !existingLangs.includes(lang));
      normalizedReferenceSolution.push({ language: missingLang || 'cpp', completeCode: '' });
    }

    const formData = {
      title: currentProblem.title || '',
      description: currentProblem.description || '',
      difficulty: currentProblem.difficulty?.toLowerCase() || 'medium',
      tags: currentProblem.tags || [],
      visibleTestCases: ensureNotEmpty(currentProblem.visibleTestCases),
      hiddenTestCases: ensureHiddenNotEmpty(currentProblem.hiddenTestCases),
      startCode: normalizedStartCode,
      referenceSolution: normalizedReferenceSolution
    };
    
    console.log('Form Data after reset:', formData);
    reset(formData);
  }
 }, [currentProblem, reset]);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setValue('tags', selectedTags.filter((t) => t !== tag), { shouldValidate: true });
    } else {
      setValue('tags', [...selectedTags, tag], { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log("Submitting:", data);
      await axiosClient.put(`/problem/update/${problemId}`, data);
      alert('Problem updated successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Update error:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRetry = () => {
    if (problemId) {
      dispatch(getProblemById(problemId));
    }
  };

  const inputStyle = "input input-bordered w-full bg-gray-900/70 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-0 transition-all";
  const selectStyle = "select select-bordered w-full bg-gray-900/70 border-gray-700 text-white focus:bg-gray-800 focus:border-blue-500";
  const textareaStyle = "textarea textarea-bordered w-full bg-gray-900/70 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 h-32 font-mono text-sm";
  const labelStyle = "label-text text-gray-300 font-medium";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 flex justify-center items-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-white"></span>
          <p className="text-gray-400 mt-4">Loading problem data...</p>
        </div>
      </div>
    );
  }

  if (reduxError && !currentProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 flex justify-center items-center">
        <div className="card bg-gray-800/50 backdrop-blur-md border border-red-700/50 shadow-xl p-8 max-w-md">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Problem</h2>
            <p className="text-gray-400 mb-6">{reduxError}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleRetry}
                className="btn bg-red-900/50 border-red-700 text-red-300 hover:bg-red-800 hover:text-white gap-2"
              >
                <RefreshCw size={16} />
                Retry
              </button>
              <button 
                onClick={() => navigate('/admin')}
                className="btn bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Back to Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 p-6 md:p-8">
      {/* Navigation Bar */}
      <nav className="navbar bg-gray-900/80 backdrop-blur-md border-b border-gray-700 px-6 py-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <Code2 size={20} className="text-white" />
            </div>
            <span className="text-white font-bold">CodeChallenge</span>
            <span className="ml-4 px-3 py-1 bg-yellow-900/40 text-yellow-300 text-xs rounded-full">Update Problem</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="btn btn-sm bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white gap-2"
          >
            <Home size={16} />
            Back to Admin
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Code2 className="w-10 h-10 text-yellow-400" />
                Update Problem
              </h1>
              <div className="text-gray-400 flex items-center gap-4">
                <span>Editing: {currentProblem?.title || 'Problem'}</span>
                <span className="text-sm">ID: {problemId?.slice(-8)}</span>
              </div>
            </div>
            
            {reduxError && (
              <div className="alert bg-red-900/30 border-red-700/50 text-red-300">
                <AlertTriangle size={20} />
                <span>{reduxError}</span>
                <button 
                  onClick={handleRetry} 
                  className="btn btn-sm bg-red-900/50 border-red-700 text-red-300 hover:bg-red-800 hover:text-white gap-2 ml-auto"
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
          
          {/* Section 1: Basic Information */}
          <div className="card bg-gray-800/50 backdrop-blur-md border border-gray-700 shadow-xl overflow-hidden">
            <div className="bg-gray-900/60 p-4 border-b border-gray-700 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Basic Information</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className={labelStyle}>Problem Title</span>
                </label>
                <input
                  {...register('title')}
                  placeholder="e.g. Two Sum"
                  className={inputStyle}
                />
                {errors.title && <span className="text-red-400 text-sm mt-1">{errors.title.message}</span>}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className={labelStyle}>Description (Markdown supported)</span>
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Describe the problem statement..."
                  className={textareaStyle}
                />
                {errors.description && <span className="text-red-400 text-sm mt-1">{errors.description.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Difficulty Select */}
                <div className="form-control">
                  <label className="label">
                    <span className={labelStyle}>Difficulty</span>
                  </label>
                  <select {...register('difficulty')} className={selectStyle}>
                    <option value="easy" className="bg-gray-800 text-gray-300">Easy</option>
                    <option value="medium" className="bg-gray-800 text-gray-300">Medium</option>
                    <option value="hard" className="bg-gray-800 text-gray-300">Hard</option>
                  </select>
                  {errors.difficulty && <span className="text-red-400 text-sm mt-1">{errors.difficulty.message}</span>}
                </div>

                {/* Tags Selection */}
                <div className="form-control">
                  <label className="label">
                    <span className={labelStyle}>Category Tags (Select multiple)</span>
                  </label>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {AVAILABLE_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200
                            ${isSelected 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-md' 
                              : 'bg-gray-900/60 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                          {tag}
                          {isSelected && <CheckCircle2 size={14} className="ml-2 inline" />}
                        </button>
                      );
                    })}
                  </div>
                  <input type="hidden" {...register('tags')} />
                  
                  {errors.tags && <span className="text-red-400 text-sm mt-2">{errors.tags.message}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Test Cases */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card bg-gray-800/50 backdrop-blur-md border border-gray-700 shadow-xl">
              <div className="bg-gray-900/60 p-4 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Visible Test Cases</h3>
                </div>
                <button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="btn btn-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 border-none text-white gap-2"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {visibleFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-900/60 rounded-xl p-4 border border-gray-700 relative group">
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Input</span>
                        <input {...register(`visibleTestCases.${index}.input`)} placeholder="nums = [2,7,11,15], target = 9" className={`${inputStyle} h-9 text-sm mt-1`} />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Output</span>
                        <input {...register(`visibleTestCases.${index}.output`)} placeholder="[0,1]" className={`${inputStyle} h-9 text-sm mt-1`} />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Explanation</span>
                        <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Because nums[0] + nums[1] == 9" className={`${textareaStyle} h-16 text-sm mt-1`} />
                      </div>
                    </div>
                  </div>
                ))}
                {errors.visibleTestCases && <p className="text-red-400 text-sm text-center">At least one visible case required</p>}
              </div>
            </div>

            <div className="card bg-gray-800/50 backdrop-blur-md border border-gray-700 shadow-xl">
              <div className="bg-gray-900/60 p-4 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Hidden Test Cases</h3>
                </div>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="btn btn-sm bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 border-none text-white gap-2"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {hiddenFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-900/60 rounded-xl p-4 border border-gray-700 relative group">
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Input</span>
                        <input {...register(`hiddenTestCases.${index}.input`)} className={`${inputStyle} h-9 text-sm mt-1`} />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Output</span>
                        <input {...register(`hiddenTestCases.${index}.output`)} className={`${inputStyle} h-9 text-sm mt-1`} />
                      </div>
                    </div>
                  </div>
                ))}
                {errors.hiddenTestCases && <p className="text-red-400 text-sm text-center">At least one hidden case required</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Code Templates */}
          <div className="card bg-gray-800/50 backdrop-blur-md border border-gray-700 shadow-xl">
            <div className="bg-gray-900/60 p-4 border-b border-gray-700 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Code Templates & Solutions</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {[0, 1, 2].map((index) => {
                  // UPDATED: 'javascript' logic here
                  const lang = index === 0 ? 'cpp' : index === 1 ? 'java' : 'javascript';
                  const color = index === 0 ? 'text-blue-400' : index === 1 ? 'text-orange-400' : 'text-yellow-400';
                  
                  return (
                    <div key={index} className="space-y-4 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
                      <h3 className={`font-bold text-lg ${color} border-b border-gray-700 pb-2`}>{lang}</h3>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-gray-400 text-xs uppercase font-bold">Initial Boilerplate</span>
                        </label>
                        <textarea
                          {...register(`startCode.${index}.initialCode`)}
                          className={`${textareaStyle} font-mono text-xs h-32 bg-gray-900 focus:bg-gray-800`}
                          placeholder={`// Enter ${lang} starter code`}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-gray-400 text-xs uppercase font-bold">Full Solution</span>
                        </label>
                        <textarea
                          {...register(`referenceSolution.${index}.completeCode`)}
                          className={`${textareaStyle} font-mono text-xs h-32 bg-gray-900 focus:bg-gray-800`}
                          placeholder={`// Enter complete ${lang} solution`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-4 pt-4 pb-12">
            <button 
              type="button"
              onClick={() => navigate('/admin')}
              className="btn btn-lg bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white px-8"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white border-none shadow-lg hover:shadow-yellow-500/20 px-8 gap-2 transition-all hover:scale-105 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Problem
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AdminUpdate;