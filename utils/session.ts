import { v4 as uuidv4 } from 'uuid';
interface SessionData {
  [key: string]: any;
}

const TEMP_SESSION_EXPIRATION=60 * 60 * 24 * 7;
const TEMP_SESSION_PREFIX = 'temp_session_';

export async function createTempSession(): Promise<string> {
  const sessionId = uuidv4();
  // const sessionData: SessionData = { auth: "pending" };
  // await setTempSession(sessionId, sessionData);

  setTimeout(async () => {
    await deleteTempSession(sessionId);
  }, TEMP_SESSION_EXPIRATION);
  return sessionId;
}

export async function getTempSession(sessionId: string): Promise<SessionData | null> {
  const sessionDataString = localStorage.getItem(TEMP_SESSION_PREFIX + sessionId);
  
  if (!sessionDataString) {
    return null;
  }
  try {
    return JSON.parse(sessionDataString);
  } catch (error) {
    console.error(`Error parsing session data for ${sessionId}: ${error}`);
    return null;
  }
}

export async function setTempSession(sessionId: string, newData: SessionData): Promise<void> {
  try {
    localStorage.setItem(TEMP_SESSION_PREFIX + sessionId, JSON.stringify(newData));
    console.log(`Set temp session: ${sessionId}`);
  } catch (error) {
    console.error(`Error setting temp session: ${error}`);
    throw error;
  }
}

export async function deleteTempSession(sessionId: string): Promise<void> {
  try {
    localStorage.removeItem(TEMP_SESSION_PREFIX + sessionId);
    console.log(`Deleted temp session: ${sessionId}`);
  } catch (error) {
    console.error(`Error deleting temp session: ${error}`);
    throw error;
  }
}

export async function verifySessionId(sessionId: string): Promise<boolean> {
  try {
    const tempSession = await getTempSession(sessionId);
    return tempSession !== null;
  } catch (error) {
    console.error(`Error verifying session ID: ${error}`);
    return false;
  }
}
