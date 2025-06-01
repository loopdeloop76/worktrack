import React from 'react';

export interface TimeFilterOptions {
  year?: number;
  quarter?: number;
  month?: string;
}

interface TimeFilterProps {
  filters: TimeFilterOptions;
  onFiltersChange: (filters: TimeFilterOptions) => void;
}

export function TimeFilter({ filters, onFiltersChange }: TimeFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const quarters = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' },
  ];

  const generateMonthOptions = () => {
    const months = [];
    const baseYear = filters.year || currentYear;
    
    for (let i = 0; i < 12; i++) {
      const month = (i + 1).toString().padStart(2, '0');
      const monthValue = `${baseYear}-${month}`;
      const monthName = new Date(baseYear, i, 1).toLocaleDateString('en-US', { month: 'long' });
      months.push({ value: monthValue, label: `${monthName} ${baseYear}` });
    }
    
    return months;
  };

  const handleYearChange = (year: string) => {
    const newFilters: TimeFilterOptions = {};
    if (year) {
      newFilters.year = parseInt(year);
    }
    onFiltersChange(newFilters);
  };

  const handleQuarterChange = (quarter: string) => {
    const newFilters: TimeFilterOptions = { ...filters };
    if (quarter) {
      newFilters.quarter = parseInt(quarter);
    } else {
      delete newFilters.quarter;
    }
    delete newFilters.month; // Clear month when quarter is selected
    onFiltersChange(newFilters);
  };

  const handleMonthChange = (month: string) => {
    const newFilters: TimeFilterOptions = { ...filters };
    if (month) {
      newFilters.month = month;
    } else {
      delete newFilters.month;
    }
    delete newFilters.quarter; // Clear quarter when month is selected
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="time-filter">
      <h3>Time Filter</h3>
      
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="year-filter">Year:</label>
          <select
            id="year-filter"
            value={filters.year || ''}
            onChange={(e) => handleYearChange(e.target.value)}
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="quarter-filter">Quarter:</label>
          <select
            id="quarter-filter"
            value={filters.quarter || ''}
            onChange={(e) => handleQuarterChange(e.target.value)}
            disabled={!!filters.month}
          >
            <option value="">All Quarters</option>
            {quarters.map(quarter => (
              <option key={quarter.value} value={quarter.value}>
                {quarter.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="month-filter">Month:</label>
          <select
            id="month-filter"
            value={filters.month || ''}
            onChange={(e) => handleMonthChange(e.target.value)}
            disabled={!!filters.quarter}
          >
            <option value="">All Months</option>
            {generateMonthOptions().map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <button 
          className="clear-filters-btn"
          onClick={clearFilters}
          disabled={!filters.year && !filters.quarter && !filters.month}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}