export function createProductionErrorPage(statusCode: number ): string {
    const title = statusCode === 404 ? 'Page Not Found' : 'Server Error'
    const message = statusCode === 404
        ? 'The page you are looking for does not exist.'
        : 'We encountered an error while processing your request.'

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Finance Forecast</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #f8f9fa;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        color: #333;
      }
      .error-container {
        text-align: center;
        max-width: 500px;
        padding: 40px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .error-code {
        font-size: 72px;
        font-weight: bold;
        color: #dc3545;
        margin: 0;
      }
      .error-title {
        font-size: 24px;
        margin: 20px 0 10px;
        color: #495057;
      }
      .error-message {
        color: #6c757d;
        margin-bottom: 30px;
        line-height: 1.5;
      }
      .back-button {
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        text-decoration: none;
        display: inline-block;
      }
      .back-button:hover {
        background: #0056b3;
      }
    </style>
  </head>
  <body>
    <div class="error-container">
      <h1 class="error-code">${statusCode}</h1>
      <h2 class="error-title">${title}</h2>
      <p class="error-message">${message}</p>
      <a href="/" class="back-button">Go Home</a>
    </div>
  </body>
</html>`
}
