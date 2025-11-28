const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

// 不需要菜单
function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
  });
  // 不需要菜单
  win.setMenu(null);
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // In production, load from dist
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function getStoreFile() {
  return path.join(app.getPath('userData'), 'work-log-store.json');
}
async function readStore() {
  try {
    const data = await fsp.readFile(getStoreFile(), 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}
async function writeStore(obj) {
  try {
    await fsp.writeFile(getStoreFile(), JSON.stringify(obj), 'utf-8');
  } catch {}
}

ipcMain.handle('storage:get', async (_e, key) => {
  const obj = await readStore();
  return obj[key] ?? null;
});
ipcMain.handle('storage:set', async (_e, key, value) => {
  const obj = await readStore();
  obj[key] = value;
  await writeStore(obj);
});
ipcMain.handle('storage:remove', async (_e, key) => {
  const obj = await readStore();
  delete obj[key];
  await writeStore(obj);
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
