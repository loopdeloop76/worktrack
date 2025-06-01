import React, { useState } from 'react';
import { ProjectState, PROJECT_STATES } from '../types';
import { TimeFilter, TimeFilterOptions } from './TimeFilter';
import { ProjectChart } from './ProjectChart';

interface DashboardProps {
  getTotalAmount: (state?: ProjectState) => number;
  getProjectsByState: (state: ProjectState) => any[];
  timeFilters?: TimeFilterOptions;
  onTimeFiltersChange?: (filters: TimeFilterOptions) => void;
}

export function Dashboard({ getTotalAmount, getProjectsByState, timeFilters, onTimeFiltersChange }: DashboardProps) {
  const [localFilters, setLocalFilters] = useState<TimeFilterOptions>(timeFilters || {});

  const handleFiltersChange = (filters: TimeFilterOptions) => {
    setLocalFilters(filters);
    if (onTimeFiltersChange) {
      onTimeFiltersChange(filters);
    }
  };

  const activeFilters = timeFilters || localFilters;
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <TimeFilter 
        filters={activeFilters}
        onFiltersChange={handleFiltersChange}
      />
      
      <div className="stats-grid">
        <div className="stat-card total">
          <h3>Total Value</h3>
          <p className="stat-value">{formatAmount(getTotalAmount())}</p>
        </div>
        
        {PROJECT_STATES.map(state => {
          const count = getProjectsByState(state).length;
          const total = getTotalAmount(state);
          
          return (
            <div key={state} className={`stat-card state-${state}`}>
              <h3>{state.charAt(0).toUpperCase() + state.slice(1)}</h3>
              <p className="stat-count">{count} projects</p>
              <p className="stat-value">{formatAmount(total)}</p>
            </div>
          );
        })}
      </div>

      <ProjectChart filters={activeFilters} />
    </div>
  );
}