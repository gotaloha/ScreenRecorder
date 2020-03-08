const { app, BrowserWindow } = require('electron');

const path = require('path');


if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    center: true,
    frame: false,
    height: 768,
    minHeight: 240,
    minWidth: 320,
    resizable: true,
    titleBarStyle: 'default',
    transparent: true,
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
    },
    width: 1024,
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
