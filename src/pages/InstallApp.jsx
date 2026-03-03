import React from 'react';

export default function InstallApp() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Install App</h1>
      <p className="text-slate-300">
        This web application is a Progressive Web App (PWA). You can install it
        on your device for a native-like experience.
      </p>
      <ul className="list-disc list-inside mt-4 text-slate-300">
        <li>Open the app in Chrome or Edge on desktop/mobile.</li>
        <li>Click the "Install" icon in the address bar or browser menu.</li>
        <li>Confirm the installation prompt.</li>
      </ul>
      <p className="text-slate-400 mt-4">
        After installing, launch the app from your home screen or applications
        menu. Offline caching and notifications will work once installed.
      </p>
    </div>
  );
}
