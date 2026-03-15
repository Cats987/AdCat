const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DiscordRPC = require('discord-rpc');

// Real Client ID from Discord Developer Portal
const clientId = '1482543668102697043'; 

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 900,
        minHeight: 600,
        title: 'AdCat: Infinite Purr-fits',
        icon: path.join(__dirname, 'icon.png'),
        backgroundColor: '#130f1a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true,
    });

    win.loadFile('index.html');
}

// --- Discord RPC ---
let rpc = null;
const startTimestamp = Date.now();

function setActivity(data) {
    if (!rpc) {
        console.warn('Cannot set activity: RPC not connected');
        return;
    }

    const activity = {
        details: `Catnip: ${data.catnip}`,
        state: `${data.cps} per second | ${data.ascensions} Ascensions`,
        startTimestamp,
        largeImageKey: 'adcat_large', // Must be uploaded to Discord Dev Portal
        largeImageText: 'AdCat: Infinite Purr-fits',
        instance: false,
    };

    rpc.setActivity(activity).catch(err => {
        console.error('Error setting RPC activity:', err);
    });
}

function initRPC() {
    rpc = new DiscordRPC.Client({ transport: 'ipc' });

    rpc.on('ready', () => {
        console.log('✅ Discord RPC connected!');
        setActivity({
            catnip: '0',
            cps: '0',
            ascensions: '0'
        });
    });

    rpc.login({ clientId }).catch(err => {
        console.error('❌ Discord RPC Connection Failed:', err.message || err);
        console.log('Note: This usually happens if Discord is closed or if the Client ID is invalid.');
        rpc = null;
    });
}

ipcMain.on('update-rpc', (event, data) => {
    setActivity(data);
});

app.whenReady().then(() => {
    createWindow();
    initRPC();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
