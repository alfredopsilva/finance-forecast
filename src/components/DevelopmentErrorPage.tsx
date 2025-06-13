
// Create a development error page with detailed information

import type {SSRError} from "@/server.ts";

export function createDevelopmentErrorPage(error: SSRError, url: string): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Development Error</title>
    <style>
      body {
        margin: 0;
        font-family: 'Courier New', monospace;
        background: #1a1a1a;
        color: #f8f8f2;
        padding: 20px;
        line-height: 1.6;
      }
      .error-header {
        background: #dc3545;
        color: white;
        padding: 20px;
        border-radius: 4px;
        margin-bottom: 20px;
      }
      .error-details {
        background: #2d2d2d;
        padding: 20px;
        border-radius: 4px;
        white-space: pre-wrap;
        overflow-x: auto;
      }
      .url {
        color: #61dafb;
      }
      .stack {
        color: #ff7875;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="error-header">
      <h1>SSR Development Error</h1>
      <p>URL: <span class="url">${url}</span></p>
      <p>Message: ${error.message}</p>
    </div>
    <div class="error-details">
      <div class="stack">${error.stack || 'No stack trace available'}</div>
    </div>
  </body>
</html>`
}
