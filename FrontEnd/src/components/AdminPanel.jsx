import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { Plus, Trash2, Save, Code2, FileText, Eye, EyeOff, CheckCircle2, Home } from 'lucide-react'; 

// Define Tags to match your Backend & Homepage
const AVAILABLE_TAGS = ['array', 'LinkedList', 'Graph', 'tree', 'two-pointers', 'dp'];

// 1. UPDATED SCHEMA: 'tags' is now an Array of Strings
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  
  // CHANGED: Expect an array of strings, at least one required
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
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      tags: [],
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
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

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setValue('tags', selectedTags.filter((t) => t !== tag), { shouldValidate: true });
    } else {
      setValue('tags', [...selectedTags, tag], { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const inputStyle = "input input-bordered w-full bg-gray-900/70 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-0 transition-all";
  const selectStyle = "select select-bordered w-full bg-gray-900/70 border-gray-700 text-white focus:bg-gray-800 focus:border-blue-500";
  const textareaStyle = "textarea textarea-bordered w-full bg-gray-900/70 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 h-32 font-mono text-sm";
  const labelStyle = "label-text text-gray-300 font-medium";

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
            <span className="ml-4 px-3 py-1 bg-blue-900/40 text-blue-300 text-xs rounded-full">Admin</span>
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
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
            <Code2 className="w-10 h-10 text-blue-400" />
            Create New Problem
          </h1>
          <p className="text-gray-400">Add a new challenge to the platform</p>
        </div>
        
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
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
                  const lang = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
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
          <div className="flex justify-end pt-4 pb-12">
            <button 
              type="submit" 
              className="btn btn-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none shadow-lg hover:shadow-blue-500/20 px-8 gap-2 transition-all hover:scale-105"
            >
              <Save size={20} />
              Create Problem
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AdminPanel;