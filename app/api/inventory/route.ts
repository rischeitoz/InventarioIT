import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_DATA, InventoryDatabase } from '@/data/initial-data';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'inventario-data.json');

function ensureDataFile(): InventoryDatabase {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }

    const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContent);
    return parsed;
  } catch (err) {
    console.error('Error reading inventory json file:', err);
    return INITIAL_DATA;
  }
}

function saveDataFile(data: InventoryDatabase): boolean {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving inventory json file:', err);
    return false;
  }
}

export async function GET() {
  const data = ensureDataFile();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentData = ensureDataFile();

    const { action, payload } = body;

    if (action === 'RESET_TO_DEFAULT') {
      saveDataFile(INITIAL_DATA);
      return NextResponse.json({ success: true, data: INITIAL_DATA });
    }

    if (action === 'RESTORE_BACKUP') {
      if (payload && Array.isArray(payload.portatiles)) {
        saveDataFile(payload);
        return NextResponse.json({ success: true, data: payload });
      }
      return NextResponse.json({ success: false, error: 'Formato de backup inválido' }, { status: 400 });
    }

    if (action === 'SAVE_FULL_STATE') {
      saveDataFile(payload);
      return NextResponse.json({ success: true, data: payload });
    }

    // Default: return current data
    return NextResponse.json({ success: true, data: currentData });
  } catch (error) {
    console.error('API Inventory error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
