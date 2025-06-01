import React, { useState } from 'react';
import { Project, ProjectState } from '../types';
import { ProjectForm } from './ProjectForm';

interface ProjectListProps {
  projects: Project[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  filterState?: ProjectState;
}

export function ProjectList({ projects, onUpdateProject, onDeleteProject, filterState }: ProjectListProps) {
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filteredProjects = filterState 
    ? projects.filter(project => project.state === filterState)
    : projects;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleUpdate = (updatedProject: Omit<Project, 'id'>) => {
    if (editingProject) {
      onUpdateProject(editingProject.id, updatedProject);
      setEditingProject(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
  };

  if (editingProject) {
    return (
      <div>
        <h3>Edit Project</h3>
        <ProjectForm
          onSubmit={handleUpdate}
          initialData={editingProject}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="project-list">
      {filteredProjects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map(project => (
            <div key={project.id} className="project-card">
              <h3>{project.name}</h3>
              <p><strong>Client:</strong> {project.client}</p>
              <p><strong>Amount:</strong> {formatAmount(project.amount)}</p>
              <p><strong>State:</strong> 
                <span className={`state state-${project.state}`}>
                  {project.state.charAt(0).toUpperCase() + project.state.slice(1)}
                </span>
              </p>
              <div className="project-actions">
                <button onClick={() => handleEdit(project)}>Edit</button>
                <button 
                  onClick={() => onDeleteProject(project.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}