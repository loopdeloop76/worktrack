import { useState, useEffect } from 'react';
import { Project, ProjectState } from '../types';
import { TimeFilterOptions } from '../components/TimeFilter';

const API_BASE = 'http://localhost:3001/api';

export function useProjectsAPI(timeFilters?: TimeFilterOptions) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async (filters?: TimeFilterOptions) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const activeFilters = filters || timeFilters;
      
      if (activeFilters?.year) params.append('year', activeFilters.year.toString());
      if (activeFilters?.quarter) params.append('quarter', activeFilters.quarter.toString());
      if (activeFilters?.month) params.append('month', activeFilters.month);
      
      const url = `${API_BASE}/projects${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [timeFilters]);

  const addProject = async (project: Omit<Project, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      const newProject = await response.json();
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Update failed:', response.status, errorData);
        throw new Error(`Failed to update project: ${response.status}`);
      }
      
      const updatedProject = await response.json();
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? updatedProject : project
        )
      );
      
      // Refetch to ensure consistency with filters
      await fetchProjects();
      
      return updatedProject;
    } catch (err) {
      console.error('Update project error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Delete failed:', response.status, errorData);
        throw new Error(`Failed to delete project: ${response.status}`);
      }
      
      setProjects(prev => prev.filter(project => project.id !== id));
      
      // Refetch to ensure consistency
      await fetchProjects();
    } catch (err) {
      console.error('Delete project error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
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
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProjectsByState,
    getTotalAmount,
    refetch: fetchProjects,
  };
}