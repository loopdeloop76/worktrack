import React, { useState } from 'react';
import { Project, ProjectState, PROJECT_STATES } from '../types';

interface ProjectFormProps {
  onSubmit: (project: Omit<Project, 'id'>) => void;
  initialData?: Project;
  onCancel?: () => void;
}

export function ProjectForm({ onSubmit, initialData, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [client, setClient] = useState(initialData?.client || '');
  const [amount, setAmount] = useState(initialData?.amount || 0);
  const [state, setState] = useState<ProjectState>(initialData?.state || 'interested');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, client, amount, state });
    if (!initialData) {
      setName('');
      setClient('');
      setAmount(0);
      setState('interested');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div className="form-group">
        <label htmlFor="name">Project Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="client">Client:</label>
        <input
          type="text"
          id="client"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="amount">Amount ($):</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="state">State:</label>
        <select
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value as ProjectState)}
        >
          {PROJECT_STATES.map(stateOption => (
            <option key={stateOption} value={stateOption}>
              {stateOption.charAt(0).toUpperCase() + stateOption.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-actions">
        <button type="submit">
          {initialData ? 'Update' : 'Add'} Project
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}