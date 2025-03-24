'use strict';

var electron = require('electron');
var path = require('node:path');

function createWindow() {
    const window = new electron.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });
    window.loadFile("index.html");
}
electron.app.whenReady().then(() => {
    createWindow();
    electron.app.on("activate", () => {
        if (electron.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron.app.quit();
    }
});
