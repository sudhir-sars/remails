import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

interface SessionData {
  [key: string]: any;
}

const DB_FILE_PATH = './db.json';
let db: { tempSessions: { [sessionId: string]: SessionData }, userSessions: { [sessionId: string]: SessionData } };

// Initialize database
try {
  const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
  db = JSON.parse(data);
} catch (err) {
  db = { tempSessions: {}, userSessions: {} };
}

// Save database to file
function saveDB(): void {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2));
}

// Temp session functions
export async function createTempSession(): Promise<string> {
  const sessionId = uuidv4();
  db.tempSessions[sessionId] = {};
  saveDB();
  console.log(`Created temp session: ${sessionId}`);
  return sessionId;
}

export async function getTempSession(sessionId: string): Promise<SessionData | null> {
  return db.tempSessions[sessionId] || null;
}

export async function setTempSession(sessionId: string, data: SessionData): Promise<void> {
  db.tempSessions[sessionId] = data;
  saveDB();
  console.log(`Set temp session: ${sessionId}`);
}

export async function deleteTempSession(sessionId: string): Promise<void> {
  delete db.tempSessions[sessionId];
  saveDB();
  console.log(`Deleted temp session: ${sessionId}`);
}

// User session functions
export async function createUserSession(): Promise<string> {
  const sessionId = uuidv4();
  db.userSessions[sessionId] = {};
  saveDB();
  console.log(`Created user session: ${sessionId}`);
  return sessionId;
}

export async function getUserSession(sessionId: string): Promise<SessionData | null> {
  return db.userSessions[sessionId] || null;
}

export async function setUserSession(sessionId: string, data: SessionData): Promise<void> {
  db.userSessions[sessionId] = data;
  saveDB();
  console.log(`Set user session: ${sessionId}`);
}

export async function deleteUserSession(sessionId: string): Promise<void> {
  delete db.userSessions[sessionId];
  saveDB();
  console.log(`Deleted user session: ${sessionId}`);
}