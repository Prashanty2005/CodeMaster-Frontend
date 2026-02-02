import { useParams, useNavigate } from 'react-router';
import  { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  FileVideo, 
  Clock, 
  File, 
  Home, 
  RefreshCw,
  Video,
  Trash2
} from 'lucide-react';

function AdminUpload() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [existingVideo, setExistingVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [problemInfo, setProblemInfo] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError: setFormError,
    clearErrors
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  // Fetch existing video and problem info
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch problem info
        const problemResponse = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblemInfo(problemResponse.data);
        
        // Check if video already exists
        const videoResponse = await axiosClient.get(`/video/getVideo/${problemId}`);
        if (videoResponse.data.videoSolution) {
          setExistingVideo(videoResponse.data.videoSolution);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        // Don't set error if video doesn't exist (404)
        if (err.response?.status !== 404) {
          setError({
            type: 'error',
            message: err.response?.data?.message || 'Failed to load problem information',
            details: null
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [problemId]);

  // Upload video to Cloudinary - CORRECTED VERSION
  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // Step 1: Get upload signature from backend
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      // Step 2: Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      // Step 3: Upload directly to Cloudinary
      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      // Step 4: Save video metadata to backend
      const metadataResponse = await axiosClient.post('/video/save', {
        problemId:problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      setExistingVideo(metadataResponse.data.videoSolution);
      setSuccess(true);
      reset();
      
    } catch (err) {
      console.error('Upload error:', err);
      
      // Simplified error handling like the second code
      let errorMessage = 'Upload failed. Please try again.';
      
      if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError({
        type: 'error',
        message: errorMessage,
        details: null
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;
    
    try {
      setError(null);
      await axiosClient.delete(`/video/delete/${problemId}`);
      setExistingVideo(null);
      setUploadedVideo(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete video',
        details: null
      });
    }
  };

  const handleReset = () => {
    reset();
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get video resolution
  const getResolution = (video) => {
    if (video?.width && video?.height) {
      return `${video.width}×${video.height}`;
    }
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 flex justify-center items-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-white"></span>
          <p className="text-gray-400 mt-4">Loading problem information...</p>
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
              <Video size={20} className="text-white" />
            </div>
            <span className="text-white font-bold">CodeChallenge</span>
            <span className="ml-4 px-3 py-1 bg-blue-900/40 text-blue-300 text-xs rounded-full">Video Upload</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/video')}
            className="btn btn-sm bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white gap-2"
          >
            <Home size={16} />
            Back to Problems
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
        {/* Problem Info Card */}
        <div className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl mb-8">
          <div className="bg-gray-900/60 p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileVideo size={18} className="text-blue-400" />
              <h2 className="text-lg font-bold text-white">Problem Information</h2>
            </div>
          </div>
          <div className="p-6">
            {problemInfo ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{problemInfo.title}</h3>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      problemInfo.difficulty?.toLowerCase() === 'easy' 
                        ? 'text-green-400 bg-green-900/30 border-green-800/50'
                        : problemInfo.difficulty?.toLowerCase() === 'medium'
                        ? 'text-yellow-400 bg-yellow-900/30 border-yellow-800/50'
                        : 'text-red-400 bg-red-900/30 border-red-800/50'
                    }`}>
                      {problemInfo.difficulty || 'Unknown'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(problemInfo.tags) && problemInfo.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-900/70 text-gray-300 text-xs rounded-full border border-gray-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  Problem ID: {problemId}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400">Problem information not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Existing Video Section */}
        {existingVideo && (
          <div className="card bg-gray-800/50 backdrop-blur-sm border border-blue-700/30 shadow-xl mb-8">
            <div className="bg-blue-900/20 p-4 border-b border-blue-700/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" />
                <h2 className="text-lg font-bold text-white">Existing Solution Video</h2>
              </div>
              <button
                onClick={handleDeleteVideo}
                className="btn btn-sm bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 border-none text-white gap-2"
              >
                <Trash2 size={14} />
                Delete Video
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  {/* Video Player */}
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      className="w-full h-auto max-h-[400px]"
                      controls
                      src={existingVideo.secureUrl}
                      poster={`https://res.cloudinary.com/${existingVideo.cloudName || 'demo'}/video/upload/w_300,h_200,c_fill/${existingVideo.cloudinaryPublicId}.jpg`}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-blue-400" />
                      <div>
                        <div className="text-sm text-gray-400">Duration</div>
                        <div className="text-white font-medium">{formatDuration(existingVideo.duration)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <File size={16} className="text-blue-400" />
                      <div>
                        <div className="text-sm text-gray-400">File Size</div>
                        <div className="text-white font-medium">{formatFileSize(existingVideo.bytes)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Video size={16} className="text-blue-400" />
                      <div>
                        <div className="text-sm text-gray-400">Resolution</div>
                        <div className="text-white font-medium">{getResolution(existingVideo)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400">Uploaded</div>
                    <div className="text-white text-sm">
                      {existingVideo.uploadedAt ? new Date(existingVideo.uploadedAt).toLocaleString() : 'Unknown date'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl">
          <div className="bg-gray-900/60 p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Upload size={18} className="text-blue-400" />
              <h2 className="text-lg font-bold text-white">Upload New Solution Video</h2>
            </div>
          </div>
          
          <div className="p-6">
            {/* Error Alert */}
            {error && (
              <div className={`alert ${error.type === 'error' ? 'bg-red-900/30 border-red-700/50 text-red-300' : 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300'} mb-6`}>
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-bold">{error.type === 'error' ? 'Error' : 'Warning'}</h4>
                    <p className="text-sm">{error.message}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="btn btn-sm bg-transparent border-current text-current hover:bg-white/10"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && !error && (
              <div className="alert bg-green-900/30 border-green-700/50 text-green-300 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-bold">Success!</h4>
                    <p className="text-sm">Video uploaded successfully!</p>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="btn btn-sm bg-transparent border-current text-current hover:bg-white/10"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* File Input Area */}
              <div className="form-control">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Video File
                </label>
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  errors.videoFile 
                    ? 'border-red-500 bg-red-900/10' 
                    : selectedFile 
                    ? 'border-blue-500 bg-blue-900/10' 
                    : 'border-gray-600 hover:border-gray-500 bg-gray-900/30 hover:bg-gray-900/50'
                }`}>
                  <input
                    type="file"
                    accept="video/*"
                    {...register('videoFile', {
                      required: 'Please select a video file',
                      validate: {
                        isVideo: (files) => {
                          if (!files || !files[0]) return 'Please select a video file';
                          const file = files[0];
                          return file.type.startsWith('video/') || 'Please select a valid video file';
                        },
                        fileSize: (files) => {
                          if (!files || !files[0]) return true;
                          const file = files[0];
                          const maxSize = 500 * 1024 * 1024; // 500MB
                          return file.size <= maxSize || 'File size must be less than 500MB';
                        }
                      }
                    })}
                    className="hidden"
                    id="video-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                        <Upload size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Click to browse or drag & drop</p>
                        <p className="text-gray-400 text-sm mt-1">MP4, MOV, AVI, WMV up to 500MB</p>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.videoFile && (
                  <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    <span>{errors.videoFile.message}</span>
                  </div>
                )}
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="card bg-gray-900/50 border border-gray-700">
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                      <FileVideo size={20} className="text-blue-400" />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{selectedFile.name}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <File size={14} />
                            {formatFileSize(selectedFile.size)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            Type: {selectedFile.type.split('/')[1]?.toUpperCase() || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Uploading...</span>
                    <span className="text-blue-400 font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    Please wait while we upload your video. This may take a few minutes...
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={uploading}
                  className="btn bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300 hover:text-white gap-2"
                >
                  <RefreshCw size={16} />
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className={`btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none text-white gap-2 shadow-lg shadow-blue-500/20 ${
                    uploading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Video
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-blue-900/20 border border-blue-800/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-300 mb-2">Upload Guidelines</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Upload solution videos that explain the problem approach and implementation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Recommended video duration: 5-15 minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Supported formats: MP4, MOV, AVI, WMV (Max 500MB)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Ensure good audio quality and clear visuals for better learning experience</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUpload;