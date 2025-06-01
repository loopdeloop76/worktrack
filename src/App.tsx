import React, { useState } from 'react';
import { useProjectsAPI } from './hooks/useProjectsAPI';
import { ProjectForm } from './components/ProjectForm';
import { ProjectList } from './components/ProjectList';
import { Dashboard } from './components/Dashboard';
import { ProjectState, PROJECT_STATES } from './types';
import './App.css';

function App() {
  const {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProjectsByState,
    getTotalAmount,
  } = useProjectsAPI();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'all' | ProjectState>('dashboard');

  return (
    <div className="app">
      <header className="app-header">
        <h1>WorkTrack</h1>
        <nav className="app-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'add' ? 'active' : ''}
            onClick={() => setActiveTab('add')}
          >
            Add Project
          </button>
          <button 
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            All Projects
          </button>
          {PROJECT_STATES.map(state => (
            <button 
              key={state}
              className={activeTab === state ? 'active' : ''}
              onClick={() => setActiveTab(state)}
            >
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
        
        {loading && (
          <div className="loading-message">
            Loading...
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            getTotalAmount={getTotalAmount}
            getProjectsByState={getProjectsByState}
          />
        )}

        {activeTab === 'add' && (
          <div>
            <h2>Add New Project</h2>
            <ProjectForm onSubmit={addProject} />
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            <h2>All Projects ({projects.length})</h2>
            <ProjectList
              projects={projects}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
            />
          </div>
        )}

        {PROJECT_STATES.includes(activeTab as ProjectState) && (
          <div>
            <h2>
              {(activeTab as string).charAt(0).toUpperCase() + (activeTab as string).slice(1)} Projects
              ({getProjectsByState(activeTab as ProjectState).length})
            </h2>
            <ProjectList
              projects={projects}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              filterState={activeTab as ProjectState}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;