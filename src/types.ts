export type ProjectState = 'interested' | 'booked' | 'invoiced' | 'paid';

export interface Project {
  id: string;
  name: string;
  client: string;
  amount: number;
  state: ProjectState;
}

export const PROJECT_STATES: ProjectState[] = ['interested', 'booked', 'invoiced', 'paid'];