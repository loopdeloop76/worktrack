import { useState } from 'react';
import { Project, ProjectState } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const getProjectsByState = (state: ProjectState) => {
    return projects.filter(project => project.state === state);
  };

  const getTotalAmount = (state?: ProjectState) => {
    const filteredProjects = state ? getProjectsByState(state) : projects;
    return filteredProjects.reduce((total, project) => total + project.amount, 0);
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    getProjectsByState,
    getTotalAmount,
  };
}