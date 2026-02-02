import React, { useState } from 'react';
import { Plus, Edit, Trash2, Home, Code2 ,Video} from 'lucide-react';
import { NavLink } from 'react-router';

function Admin() {
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-900/20',
      iconColor: 'text-emerald-400',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-900/20',
      iconColor: 'text-blue-400',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-900/20',
      iconColor: 'text-red-400',
      route: '/admin/delete'
    },
    {
    id: 'video',
    title: 'Manage Videos',
    description: 'Upload and manage solution videos',
    icon: Video,
    color: 'from-purple-500 to-violet-600',  // Purple/Violet
    bgColor: 'bg-purple-900/20',
    iconColor: 'text-purple-400',
    route: '/admin/video'
  }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950">
      {/* Navigation Bar */}
      <nav className="navbar bg-gray-900/80 backdrop-blur-md border-b border-gray-700 px-6 py-4">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl font-bold tracking-wide">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <Code2 size={20} className="text-white" />
              </div>
              <span className="text-white">CodeChallenge</span>
              <span className="ml-4 px-3 py-1 bg-blue-900/40 text-blue-300 text-xs rounded-full">Admin</span>
            </div>
          </NavLink>
        </div>
        <div className="flex items-center gap-4">
          <NavLink 
            to="/" 
            className="btn btn-sm bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white gap-2"
          >
            <Home size={16} />
            Dashboard
          </NavLink>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Admin Panel
          </h1>
          <p className="text-gray-400 text-lg">
            Manage coding problems on your platform
          </p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="card-body items-center text-center p-8">
                  {/* Icon */}
                  <div className={`${option.bgColor} p-4 rounded-xl mb-4 border border-gray-700`}>
                    <IconComponent size={32} className={option.iconColor} />
                  </div>
                  
                  {/* Title */}
                  <h2 className="card-title text-xl font-semibold text-white mb-2">
                    {option.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-gray-400 mb-6">
                    {option.description}
                  </p>
                  
                  {/* Action Button */}
                  <div className="card-actions">
                    <NavLink 
                      to={option.route}
                      className={`w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r ${option.color} hover:opacity-90 transition-all duration-200 shadow-lg`}
                    >
                      {option.title}
                    </NavLink>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Admin;