import React from 'react';

export default function APIDocumentation() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">API Documentation</h1>
      <p className="text-slate-300">
        Detailed API docs are available in the project repository and via the
        <a
          href="/AI_API_DOCUMENTATION.md"
          className="text-violet-400 hover:underline ml-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          API guide
        </a>.
      </p>
      <p className="text-slate-400 mt-2">
        This page will be enhanced with an embedded viewer or Swagger UI in a
        future update.
      </p>
    </div>
  );
}
