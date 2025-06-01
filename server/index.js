const express = require('express');
const cors = require('cors');
const { 
  initializeDatabase,
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsGroupedByMonth
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.get('/api/projects', (req, res) => {
  try {
    const { year, quarter, month } = req.query;
    const filters = {};
    
    if (year) filters.year = parseInt(year);
    if (quarter) filters.quarter = parseInt(quarter);
    if (month) filters.month = month;
    
    const projects = getAllProjects(filters);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/api/projects/stats/monthly', (req, res) => {
  try {
    const { year, quarter } = req.query;
    const filters = {};
    
    if (year) filters.year = parseInt(year);
    if (quarter) filters.quarter = parseInt(quarter);
    
    const monthlyStats = getProjectsGroupedByMonth(filters);
    res.json(monthlyStats);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const { name, client, amount, state } = req.body;
    
    if (!name || !client || amount === undefined || !state) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const validStates = ['interested', 'booked', 'invoiced', 'paid'];
    if (!validStates.includes(state)) {
      return res.status(400).json({ error: 'Invalid state' });
    }
    
    const newProject = {
      id: Date.now().toString(),
      name,
      client,
      amount: parseFloat(amount),
      state
    };
    
    const project = createProject(newProject);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const existingProject = getProjectById(id);
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (updates.state) {
      const validStates = ['interested', 'booked', 'invoiced', 'paid'];
      if (!validStates.includes(updates.state)) {
        return res.status(400).json({ error: 'Invalid state' });
      }
    }
    
    if (updates.amount !== undefined) {
      updates.amount = parseFloat(updates.amount);
    }
    
    const updatedProject = updateProject(id, updates);
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const existingProject = getProjectById(id);
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const result = deleteProject(id);
    if (result.deleted) {
      res.status(204).send();
    } else {
      res.status(500).json({ error: 'Failed to delete project' });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});