const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("appInfo", {
  name: "BMI Studio",
  platform: process.platform
});
