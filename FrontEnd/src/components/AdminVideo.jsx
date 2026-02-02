import { useEffect, useState } from 'react';
import { Trash2, Home, AlertTriangle, RefreshCw, Code2, Upload, Eye, XCircle } from 'lucide-react';
import axiosClient from '../utils/axiosClient'
import { useNavigate } from 'react-router';

const AdminVideo = () => {
  const [problems, setProblems] = useState([]);
  const [videoStatus, setVideoStatus] = useState({}); // Track which problems have videos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  const clearError = () => {
    setError(null);
    setDeleteError(null);
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      clearError();
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
      
      // Check video status for each problem
      // const status = {};
      // for (const problem of data) {
      //   try {
      //     const videoResponse = await axiosClient.get(`/video/getVideo/${problem._id}`);
      //     // If video exists, mark it as true
      //     if (videoResponse.data.videoSolution) {
      //       status[problem._id] = true;
      //     } else {
      //       status[problem._id] = false;
      //     }
      //   } catch (videoErr) {
      //     // If 404, no video exists
      //     status[problem._id] = false;
      //   }
      // }
      // setVideoStatus(status);
    } catch (err) {
      console.error('Fetch problems error:', err);
      setError({
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to fetch problems',
        details: err.response?.data?.details || null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this video solution? This action cannot be undone.')) return;
    
    try {
      clearError();
      setDeleteLoading(true);
      
      await axiosClient.delete(`/video/delete/${problemId}`);
      
      // Update video status
      setVideoStatus(prev => ({
        ...prev,
        [problemId]: false
      }));
      
      // Show success message
      const deletedProblem = problems.find(p => p._id === problemId);
      setDeleteError({
        type: 'success',
        message: `Video solution for "${deletedProblem?.title || 'Unknown'}" deleted successfully`,
      });
      
      setTimeout(() => {
        setDeleteError(null);
      }, 3000);
      
    } catch (err) {
      console.error('Delete video error:', err);
      setDeleteError({
        type: 'error',
        message: err.response?.data?.error || err.response?.data?.message || 'no video solution present',
        details: err.response?.data?.details || null
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpload = (id) => {
    navigate(`/admin/upload/${id}`);
  };

  const handleView = (id) => {
    navigate(`/problem/${id}`);
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
            <span className="ml-4 px-3 py-1 bg-blue-900/40 text-blue-300 text-xs rounded-full">Admin Panel</span>
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <Upload size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Problem Management</h1>
              <p className="text-gray-400">Manage video uploads and problem deletion</p>
            </div>
          </div>
          
          {/* Error Alert for fetch */}
          {error && (
            <div className="alert bg-red-900/30 border-red-700/50 text-red-300 mt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold">Error Loading Problems</h4>
                  <p className="text-sm">{error.message}</p>
                  {error.details && (
                    <p className="text-xs mt-1 opacity-75">{JSON.stringify(error.details)}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={fetchProblems} 
                    className="btn btn-sm bg-red-900/50 border-red-700 text-red-300 hover:bg-red-800 hover:text-white gap-2"
                  >
                    <RefreshCw size={14} />
                    Retry
                  </button>
                  <button 
                    onClick={() => setError(null)}
                    className="btn btn-sm bg-transparent border-red-700 text-red-300 hover:bg-red-800/30 hover:text-white"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success/Error Alert for delete */}
          {deleteError && (
            <div className={`alert ${deleteError.type === 'success' 
                ? 'bg-green-900/30 border-green-700/50 text-green-300' 
                : 'bg-red-900/30 border-red-700/50 text-red-300'
              } mt-4`}
            >
              <div className="flex items-start gap-3">
                {deleteError.type === 'success' ? (
                  <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className="font-bold">
                    {deleteError.type === 'success' ? 'Success' : 'Error'}
                  </h4>
                  <p className="text-sm">{deleteError.message}</p>
                  {deleteError.details && (
                    <p className="text-xs mt-1 opacity-75">{JSON.stringify(deleteError.details)}</p>
                  )}
                </div>
                <button 
                  onClick={() => setDeleteError(null)}
                  className="btn btn-sm bg-transparent border-current text-current hover:bg-white/10"
                >
                  <XCircle size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Total Problems</div>
            <div className="text-2xl font-bold text-white mt-2">{problems.length}</div>
          </div>
          <div className="card bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Easy Problems</div>
            <div className="text-2xl font-bold text-green-400 mt-2">
              {problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length}
            </div>
          </div>
          <div className="card bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Unique Tags</div>
            <div className="text-2xl font-bold text-blue-400 mt-2">
              {new Set(problems.flatMap(p => Array.isArray(p.tags) ? p.tags : [p.tags])).size}
            </div>
          </div>
        </div>

        {/* Problems Table */}
        <div className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl overflow-hidden">
          <div className="bg-gray-900/60 p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Code2 size={18} className="text-blue-400" />
              <h2 className="text-lg font-bold text-white">Available Problems ({problems.length})</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">
                Manage video uploads and deletions
              </div>
              <button 
                onClick={fetchProblems}
                className="btn btn-sm bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white gap-2"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
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
                        <div 
                          className="text-white font-medium hover:text-blue-400 cursor-pointer transition-colors"
                          onClick={() => handleView(problem._id)}
                        >
                          {problem.title}
                        </div>
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
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* View Button */}
                          <button 
                            onClick={() => handleView(problem._id)}
                            className="btn btn-sm bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300 hover:text-white gap-2"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          
                          {/* Upload Button */}
                          <button 
                            onClick={() => handleUpload(problem._id)}
                            className="btn btn-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none text-white gap-2 shadow-lg shadow-blue-500/20"
                          >
                            <Upload size={14} />
                            Upload
                          </button>
                          
                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDelete(problem._id)}
                            disabled={deleteLoading}
                            className="btn btn-sm bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 border-none text-white gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteLoading ? (
                              <>
                                <span className="loading loading-spinner loading-xs"></span>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                Delete
                              </>
                            )}
                          </button>
                        </div>
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
                <p className="text-gray-500">There are no problems available to manage.</p>
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

        {/* Upload Instructions */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Upload size={20} className="text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-300 mb-1">Upload Instructions</h4>
              <p className="text-gray-400 text-sm mb-2">
                Use the "Upload" button to add solution videos for each problem. Videos should explain:
              </p>
              <ul className="text-gray-400 text-sm list-disc pl-5 space-y-1">
                <li>Problem understanding and approach</li>
                <li>Step-by-step solution walkthrough</li>
                <li>Code implementation in different languages</li>
                <li>Time and space complexity analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVideo;