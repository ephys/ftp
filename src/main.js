const { app, BrowserWindow, Menu, ipcMain } = require('electron');

const windows = [];

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (process.env.DEV_APP_PORT) {
    await loadDevApp(win);
  }

  // Open the DevTools.
  win.webContents.openDevTools();

  windows.push(win);
}

async function loadDevApp(win) {
  try {
    await win.loadURL('http://localhost:' + process.env.DEV_APP_PORT);
  } catch (e) {
    // rjs takes a minute to build
    if (e.code === 'ERR_CONNECTION_REFUSED') {
      await sleep(1000);
      return loadDevApp(win);
    } else {
      throw e;
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function dispatchMenuClick(menuKey) {
  return () => {
    for (const window of windows) {
      window.webContents.send('menu-click', menuKey);
    }
  };
}

const isMac = process.platform === 'darwin';

const template = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' },
      {
        label: 'View logs',
        click: dispatchMenuClick('view-logs'),
      },
    ],
  },
  { role: 'editMenu' },
  { role: 'viewMenu' },
  { role: 'windowMenu' },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron');
          await shell.openExternal('https://electronjs.org');
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
