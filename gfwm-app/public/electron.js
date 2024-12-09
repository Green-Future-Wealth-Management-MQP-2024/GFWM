// main.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

// Create the Electron window
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

win.loadFile(path.join(__dirname,  'index.html'));
win.webContents.openDevTools();
}

// This will be called once Electron is ready
app.whenReady().then(() => {
  createWindow();

  // Handle macOS app behavior (keep the app open when no windows are open)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});