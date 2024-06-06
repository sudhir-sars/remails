import fs from 'fs-extra';
import path from 'path';

interface UserData {
  [key: string]: any;
}

const dbFilePath = path.resolve('./db.json');

export function readData(): UserData {
  try {
    const data = fs.readJsonSync(dbFilePath);
    return data;
  } catch (error) {
    console.error('Error reading data from db.json:', error);
    return {};
  }
}

export function writeData(data: UserData): void {
  try {
    fs.writeJsonSync(dbFilePath, data, { spaces: 2 });
    console.log('Data written to db.json');
  } catch (error) {
    console.error('Error writing data to db.json:', error);
  }
}
