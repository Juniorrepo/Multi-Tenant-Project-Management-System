import React from 'react';
import { Folders, Building2, Plus } from 'lucide-react';
import { Button } from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
  onCreateProject?: () => void;
  currentView?: 'dashboard' | 'project';
}

export function Layout({ children, onCreateProject, currentView = 'dashboard' }: LayoutProps) {
  const currentOrg = localStorage.getItem('currentOrganization') || 'demo-org';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Folders className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">ProjectFlow</h1>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Building2 className="h-4 w-4" />
                <span>{currentOrg}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentView === 'dashboard' && onCreateProject && (
                <Button 
                  onClick={onCreateProject}
                  icon={Plus}
                  size="sm"
                >
                  New Project
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}