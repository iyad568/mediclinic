const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let pythonProcess = null;

function startPythonBackend() {
  const isDev = !app.isPackaged;

  const exePath = isDev
    ? path.join(__dirname, '..', 'MediClinic-official-backend', 'dist', 'backend.exe')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'backendd', 'backend.exe');

  console.log('Starting backend from:', exePath);

  pythonProcess = spawn(exePath);

  pythonProcess.stdout.on('data', (data) => {
    console.log('Backend:', data.toString());
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error('Python Backend Error:', data.toString());
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python backend exited with code ${code}`);
  });

  pythonProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });
}

function waitForBackend(callback) {
  const maxAttempts = 30;
  let attempts = 0;

  const checkBackend = () => {
    http.get('http://127.0.0.1:8000/', (res) => {
      if (res.statusCode === 200) {
        console.log('Backend is ready!');
        callback();
      } else {
        retry();
      }
    }).on('error', () => {
      retry();
    });
  };

  const retry = () => {
    attempts++;
    if (attempts < maxAttempts) {
      console.log(`Waiting for backend... (${attempts}/${maxAttempts})`);
      setTimeout(checkBackend, 1000);
    } else {
      console.error('Backend failed to start');
      callback(); // Proceed anyway
    }
  };

  checkBackend();
}

function createWindow() {
  // Configure session for proper cookie handling
  const mainWindowSession = session.fromPartition('persist:session');
  
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false, // Allow CORS requests in development
      allowRunningInsecureContent: true, // Allow mixed content
      session: mainWindowSession // Use configured session
    },
    show: false, // Don't show until ready-to-show
  });

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  // Load your app - use proper Electron dev detection
  const isDev = !app.isPackaged;
  const devURL = 'http://localhost:5173';

  if (isDev) {
    const loadDev = () => {
      mainWindow.loadURL(devURL);
    };

    loadDev();

    // retry until Vite is ready
    const interval = setInterval(() => {
      mainWindow.webContents
        .executeJavaScript("window.location.href")
        .catch(() => {
          console.log("Retrying Vite connection...");
          loadDev();
        });
    }, 2000);

    mainWindow.webContents.once('did-finish-load', () => {
      clearInterval(interval);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    app.quit();
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  if (!app.isPackaged) {
    // In development, assume backend is already running
    createWindow();
  } else {
    // In production, start the Python backend
    startPythonBackend();
    waitForBackend(() => {
      createWindow();
    });
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (pythonProcess) {
      pythonProcess.kill();
    }
    app.quit();
  }
});

// For macOS
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Cleanup on quit
app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});
