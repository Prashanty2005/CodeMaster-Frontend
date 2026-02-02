import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit, Home, AlertTriangle, RefreshCw, Code2, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getAllProblems } from '../slices/authSlice1'; // Make sure this path is correct

const Update = () => {
  const dispatch = useDispatch();
  const { problems, loading, error } = useSelector((state) => state.problems); // Make sure your slice is named 'problems' in store
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllProblems());
  }, [dispatch]);

  // Filter and search problems
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.tags?.some(tag => 
                           typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesDifficulty = filterDifficulty === 'all' || 
                             problem.difficulty?.toLowerCase() === filterDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = (id) => {
    navigate(`/admin/update/${id}`);
  };

  // Handle retry for fetching problems
  const handleRetry = () => {
    dispatch(getAllProblems());
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
            <span className="ml-4 px-3 py-1 bg-yellow-900/40 text-yellow-300 text-xs rounded-full">Admin - Update</span>
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

      <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center">
                <Edit size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Update Problems</h1>
                <p className="text-gray-400">Edit problem details and configurations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search by title, ID or tags..."
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white w-64 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              <select
                className="select select-bordered bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={filterDifficulty}
                onChange={(e) => {
                  setFilterDifficulty(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          
          {error && (
            <div className="alert bg-red-900/30 border-red-700/50 text-red-300">
              <AlertTriangle size={20} />
              <span>{error}</span>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Problems</p>
                <p className="text-2xl font-bold text-white">{problems.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
                <Code2 size={20} className="text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="card bg-gray-800/50 backdrop-blur-sm border border-green-700/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Easy Problems</p>
                <p className="text-2xl font-bold text-white">
                  {problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center">
                <span className="text-green-400 font-bold">E</span>
              </div>
            </div>
          </div>
          
          <div className="card bg-gray-800/50 backdrop-blur-sm border border-yellow-700/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Medium Problems</p>
                <p className="text-2xl font-bold text-white">
                  {problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-900/30 flex items-center justify-center">
                <span className="text-yellow-400 font-bold">M</span>
              </div>
            </div>
          </div>
          
          <div className="card bg-gray-800/50 backdrop-blur-sm border border-red-700/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Hard Problems</p>
                <p className="text-2xl font-bold text-white">
                  {problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center">
                <span className="text-red-400 font-bold">H</span>
              </div>
            </div>
          </div>
        </div>

        {/* Problems Table */}
        <div className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl overflow-hidden mb-8">
          <div className="bg-gray-900/60 p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Edit size={18} className="text-yellow-400" />
              <h2 className="text-lg font-bold text-white">
                Problem List <span className="text-gray-400">({filteredProblems.length} results)</span>
              </h2>
            </div>
            <div className="text-sm text-gray-400">
              Click update to modify problem details
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-900/60 border-b border-gray-700">
                <tr>
                  <th className="text-gray-300 font-medium px-6 py-4">#</th>
                  <th className="text-gray-300 font-medium px-6 py-4">Title</th>
                  <th className="text-gray-300 font-medium px-6 py-4">Difficulty</th>
                  <th className="text-gray-300 font-medium px-6 py-4">Tags</th>
                  <th className="text-gray-300 font-medium px-6 py-4">Last Updated</th>
                  <th className="text-gray-300 font-medium px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProblems.map((problem, index) => {
                  const globalIndex = indexOfFirstItem + index + 1;
                  const difficultyColor = problem.difficulty?.toLowerCase() === 'easy' 
                    ? 'text-green-400 bg-green-900/30 border-green-800/50'
                    : problem.difficulty?.toLowerCase() === 'medium'
                    ? 'text-yellow-400 bg-yellow-900/30 border-yellow-800/50'
                    : 'text-red-400 bg-red-900/30 border-red-800/50';
                  
                  return (
                    <tr key={problem._id} className="hover:bg-gray-800/30 border-b border-gray-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-gray-400 font-mono">{globalIndex}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium group-hover:text-yellow-300 transition-colors">
                          {problem.title}
                        </div>
                        <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                          <span>ID: {problem._id?.slice(-8)}</span>
                          {problem.isPublished ? (
                            <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded-full">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
                              Draft
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColor}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2 max-w-xs">
                          {Array.isArray(problem.tags) 
                            ? problem.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-900/70 text-gray-300 text-xs rounded-full border border-gray-700">
                                  {tag}
                                </span>
                              ))
                            : <span className="px-2 py-1 bg-gray-900/70 text-gray-300 text-xs rounded-full border border-gray-700">
                                {problem.tags}
                              </span>
                          }
                          {Array.isArray(problem.tags) && problem.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-900/50 text-gray-400 text-xs rounded-full">
                              +{problem.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-400 text-sm">
                          {problem.updatedAt 
                            ? new Date(problem.updatedAt).toLocaleDateString()
                            : problem.createdAt
                            ? new Date(problem.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleUpdate(problem._id)}
                          className="btn btn-sm bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 border-none text-white gap-2 shadow-lg shadow-yellow-500/20 group-hover:shadow-yellow-500/40 transition-all"
                        >
                          <Edit size={14} />
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredProblems.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                  <Filter size={24} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Problems Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterDifficulty !== 'all' 
                    ? 'Try changing your search or filter criteria'
                    : 'There are no problems available to update.'}
                </p>
                {(searchTerm || filterDifficulty !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterDifficulty('all');
                    }}
                    className="btn btn-sm bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-900/60 p-4 border-t border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-gray-400 text-sm">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProblems.length)} of {filteredProblems.length} problems
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn btn-sm bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`btn btn-sm ${currentPage === pageNum 
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 border-none text-white' 
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn btn-sm bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-yellow-900/20 border border-yellow-800/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-bold text-yellow-300 mb-2">Update Guidelines</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <Edit size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>You can update problem title, description, difficulty, tags, and test cases</span>
                </li>
                <li className="flex items-start gap-2">
                  <Edit size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>Changing test cases will affect all existing submissions - use with caution</span>
                </li>
                <li className="flex items-start gap-2">
                  <Edit size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>Consider creating a new version if major changes are needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <Edit size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>Always test the problem after updating to ensure it works correctly</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Update;