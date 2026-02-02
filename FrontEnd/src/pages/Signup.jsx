import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Code2, Cpu, Users, Trophy, TrendingUp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { registerUser } from "../slices/authSlice";

// Schema
const signUpSchema = z.object({
  firstName: z.string().min(3, "First name should contain at least 3 characters"),
  lastName: z.string().min(3, "Last name should contain at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const submittedData = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden">
        {/* Enhanced Background Pattern - Fixed */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-20 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl"></div>
          {/* Simple grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, #4a5568 1px, transparent 1px),
                             linear-gradient(to bottom, #4a5568 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            opacity: 0.05
          }}></div>
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 w-full max-w-2xl space-y-8">
          {/* Header Section - Moved up */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Code2 size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">CodeMaster</h1>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-6xl font-bold text-white leading-tight">
                LEARN TO CODE
              </h2>
              <div className="flex items-center gap-4">
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  WITH US.
                </span>
                <div className="h-1 flex-grow bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
            
            <p className="text-gray-300 text-lg mt-4 max-w-2xl">
              Master coding interviews and problem-solving skills with our curated collection of 
              challenges, interactive tutorials, and personalized learning paths.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center">
                  <Cpu size={20} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">500+</div>
                  <div className="text-gray-400 text-sm">Problems</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-900/40 flex items-center justify-center">
                  <Users size={20} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">10K+</div>
                  <div className="text-gray-400 text-sm">Active Users</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-900/40 flex items-center justify-center">
                  <Trophy size={20} className="text-green-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">98%</div>
                  <div className="text-gray-400 text-sm">Success Rate</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-900/40 flex items-center justify-center">
                  <TrendingUp size={20} className="text-yellow-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">24/7</div>
                  <div className="text-gray-400 text-sm">Practice</div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials/Highlights */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Real-time code execution</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Multiple programming languages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Personalized learning paths</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Interview preparation focus</span>
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="mt-10 p-6 bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
            <p className="text-gray-300 text-lg italic text-center">
              "The only way to learn a new programming language is by writing programs in it."
            </p>
            <p className="text-gray-400 text-sm text-center mt-2">- Dennis Ritchie</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Back to Home Link */}
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors mb-8 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>

          <div className="mb-8">
            <h3 className="text-3xl font-bold text-white">Create Account</h3>
            <p className="text-gray-400 mt-2">
              Fill in your details to start your coding journey
            </p>
          </div>

          {/* Display error message if exists */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(submittedData)} className="space-y-5">
            {/* Two-column layout for names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  {...register("firstName")}
                  placeholder="Enter first name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  {...register("lastName")}
                  placeholder="Enter last name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                {...register("email")}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-700 text-white placeholder-gray-500 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 mt-6
                ${loading 
                  ? 'bg-gray-800 cursor-not-allowed text-gray-400' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/20'
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Sign Up"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-700"></div>
              <div className="px-4 text-gray-500 text-sm">Or continue with</div>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                type="button" 
                className="py-3 px-4 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition flex items-center justify-center"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              
              <button 
                type="button" 
                className="py-3 px-4 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              
              <button 
                type="button" 
                className="py-3 px-4 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.344 16.154c-1.858 0-2.664-1.345-2.664-2.253 0-1.121.898-1.538 1.129-1.538.231 0 .925.417.925 1.538 0 .908-.806 2.253-2.664 2.253zm-4.847-4.154l-1.474 4.923h-2.224l1.473-4.923h-1.846l-2.897 9.231h2.224l1.129-3.692 1.129 3.692h2.224l1.129-3.692 1.129 3.692h2.224l-2.897-9.231h-1.846z"/>
                </svg>
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <NavLink 
                to="/login" 
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
              >
                Login
              </NavLink>
            </p>
          </div>

          {/* Footer Text */}
          <div className="mt-12 pt-6 border-t border-gray-800">
            <p className="text-center text-gray-500 text-sm">
              WEATHER YOUR GOAL - WE'LL GET YOU THERE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;