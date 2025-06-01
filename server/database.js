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

function getAllProjects(filters = {}) {
  let query = 'SELECT * FROM projects';
  const params = [];
  const conditions = [];

  if (filters.year) {
    conditions.push("strftime('%Y', created_at) = ?");
    params.push(filters.year.toString());
  }

  if (filters.quarter) {
    const quarterMonths = {
      1: ['01', '02', '03'],
      2: ['04', '05', '06'],
      3: ['07', '08', '09'],
      4: ['10', '11', '12']
    };
    const months = quarterMonths[filters.quarter];
    conditions.push(`strftime('%m', created_at) IN (${months.map(() => '?').join(', ')})`);
    params.push(...months);
  }

  if (filters.month) {
    conditions.push("strftime('%Y-%m', created_at) = ?");
    params.push(filters.month);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  return stmt.all(...params);
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

function getProjectsGroupedByMonth(filters = {}) {
  let query = `
    SELECT 
      strftime('%Y-%m', created_at) as month,
      COUNT(*) as count,
      SUM(amount) as total_amount,
      AVG(amount) as avg_amount
    FROM projects
    WHERE state = 'paid'
  `;
  
  const params = [];
  const conditions = ["state = 'paid'"];

  if (filters.year) {
    conditions.push("strftime('%Y', created_at) = ?");
    params.push(filters.year.toString());
  }

  if (filters.quarter) {
    const quarterMonths = {
      1: ['01', '02', '03'],
      2: ['04', '05', '06'],
      3: ['07', '08', '09'],
      4: ['10', '11', '12']
    };
    const months = quarterMonths[filters.quarter];
    conditions.push(`strftime('%m', created_at) IN (${months.map(() => '?').join(', ')})`);
    params.push(...months);
  }

  if (conditions.length > 1) {
    query = query.replace('WHERE state = \'paid\'', `WHERE ${conditions.join(' AND ')}`);
  }

  query += ' GROUP BY strftime(\'%Y-%m\', created_at) ORDER BY month';

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

module.exports = {
  initializeDatabase,
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsGroupedByMonth
};