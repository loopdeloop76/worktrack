const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'worktrack.db'));

function initializeDatabase() {
  const createProjectsTable = `
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      client TEXT NOT NULL,
      amount REAL NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('interested', 'booked', 'invoiced', 'paid')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createUpdateTrigger = `
    CREATE TRIGGER IF NOT EXISTS update_projects_timestamp 
    AFTER UPDATE ON projects
    BEGIN
      UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `;

  db.exec(createProjectsTable);
  db.exec(createUpdateTrigger);
}

function getAllProjects() {
  const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
  return stmt.all();
}

function getProjectById(id) {
  const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  return stmt.get(id);
}

function createProject(project) {
  const stmt = db.prepare(`
    INSERT INTO projects (id, name, client, amount, state)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    project.id,
    project.name,
    project.client,
    project.amount,
    project.state
  );
  
  return getProjectById(project.id);
}

function updateProject(id, updates) {
  const fields = [];
  const values = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (fields.length === 0) {
    return getProjectById(id);
  }
  
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE projects 
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  stmt.run(...values);
  return getProjectById(id);
}

function deleteProject(id) {
  const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
  const result = stmt.run(id);
  return { deleted: result.changes > 0 };
}

module.exports = {
  initializeDatabase,
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};