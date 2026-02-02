import { useEffect, useState } from 'react';
import { Trash2, Home, AlertTriangle, RefreshCw, Code2 } from 'lucide-react';
import axiosClient from '../utils/axiosClient'
import { useNavigate } from 'react-router';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) return;
    
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems(problems.filter(problem => problem._id !== id));
    } catch (err) {
      setError('Failed to delete problem');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 flex justify-center items-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-white"></span>
          <p className="text-gray-400 mt-4">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950">
      {/* Navigation Bar */}
      <nav className="navbar bg-gray-900/80 backdrop-blur-md border-b border-gray-700 px-6 py-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <Code2 size={20} className="text-white" />
            </div>
            <span className="text-white font-bold">CodeChallenge</span>
            <span className="ml-4 px-3 py-1 bg-red-900/40 text-red-300 text-xs rounded-full">Admin - Delete</span>
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

      <div className="container mx-auto p-4 lg:p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center">
              <Trash2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Delete Problems</h1>
              <p className="text-gray-400">Remove problems from the platform</p>
            </div>
          </div>
          
          {error && (
            <div className="alert bg-red-900/30 border-red-700/50 text-red-300 mt-4">
              <AlertTriangle size={20} />
              <span>{error}</span>
              <button 
                onClick={fetchProblems} 
                className="btn btn-sm bg-red-900/50 border-red-700 text-red-300 hover:bg-red-800 hover:text-white gap-2 ml-auto"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Problems Table */}
        <div className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl overflow-hidden">
          <div className="bg-gray-900/60 p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Trash2 size={18} className="text-red-400" />
              <h2 className="text-lg font-bold text-white">Problem List ({problems.length})</h2>
            </div>
            <div className="text-sm text-gray-400">
              Click delete to remove permanently
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table w-full">
              {/* Head */}
              <thead className="bg-gray-900/60 border-b border-gray-700">
                <tr>
                  <th className="text-gray-300 font-medium px-6 py-4">#</th>
                  <th className="text-gray-300 font-medium px-6 py-4">Title</th>
                  <th className="text-gray-300 font-medium px-6 py-4">Difficulty</th>
                  <th className="text-gray-300 font-medium px-6 py-4">Tags</th>
                  <th className="text-gray-300 font-medium px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, index) => {
                  const difficultyColor = problem.difficulty?.toLowerCase() === 'easy' 
                    ? 'text-green-400 bg-green-900/30 border-green-800/50'
                    : problem.difficulty?.toLowerCase() === 'medium'
                    ? 'text-yellow-400 bg-yellow-900/30 border-yellow-800/50'
                    : 'text-red-400 bg-red-900/30 border-red-800/50';
                  
                  return (
                    <tr key={problem._id} className="hover:bg-gray-800/30 border-b border-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-gray-400 font-mono">{index + 1}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{problem.title}</div>
                        <div className="text-gray-500 text-sm mt-1">ID: {problem._id?.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColor}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(problem.tags) 
                            ? problem.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-900/70 text-gray-300 text-xs rounded-full border border-gray-700">
                                  {tag}
                                </span>
                              ))
                            : <span className="px-3 py-1 bg-gray-900/70 text-gray-300 text-xs rounded-full border border-gray-700">
                                {problem.tags}
                              </span>
                          }
                          {Array.isArray(problem.tags) && problem.tags.length > 2 && (
                            <span className="px-3 py-1 bg-gray-900/50 text-gray-400 text-xs rounded-full">
                              +{problem.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(problem._id)}
                          className="btn btn-sm bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 border-none text-white gap-2 shadow-lg shadow-red-500/20"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {problems.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Problems Found</h3>
                <p className="text-gray-500">There are no problems available to delete.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Warning */}
        <div className="mt-8 p-4 bg-red-900/20 border border-red-800/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-400 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-300 mb-1">Warning</h4>
              <p className="text-gray-400 text-sm">
                Deleting a problem is permanent and cannot be undone. This will remove the problem,
                all associated test cases, solutions, and user submissions. Please proceed with caution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDelete;