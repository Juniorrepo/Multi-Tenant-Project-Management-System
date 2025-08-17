import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { ProjectView } from './pages/ProjectView';
import { Project } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'project'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Initialize default organization
  useEffect(() => {
    if (!localStorage.getItem('currentOrganization')) {
      localStorage.setItem('currentOrganization', 'demo-org');
    }
  }, []);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project');
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setCurrentView('dashboard');
  };

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard onProjectSelect={handleProjectSelect} />
      )}
      {currentView === 'project' && selectedProject && (
        <ProjectView
          projectId={selectedProject.id}
          onBack={handleBackToDashboard}
        />
      )}
    </>
  );
}

export default App;