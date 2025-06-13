// server.ts - Complete TypeScript SSR Server
import path from 'node:path';
import express, { type Request, type Response, type NextFunction } from 'express';
import getPort, { portNumbers } from 'get-port';
import type { ViteDevServer } from 'vite';
import {createProductionErrorPage} from "@/components/ProductionErrorPage.tsx";
import {createDevelopmentErrorPage} from "@/components/DevelopmentErrorPage.tsx";

// Environment Switch
const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;

interface ServerConfig {
    root: string;
    isProd: boolean;
    hmrPort: number;
}

interface CreateServerResult {
    app: express.Application;
    vite?: ViteDevServer;
}

interface SSREntry {
    render: (options: { req: Request; res: Response; head?: string }) => Promise<void> | void;
}

// Error class for SSR error
export class SSRError extends Error {
    public statusCode: number;
    public isSSRError = true;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'SSRError';
    }
}

// Async handler wrapper for Express routes
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export async function createServer(
    root: string = process.cwd(),
    isProd = environment === 'production',
    hmrPort = 3000
): Promise<CreateServerResult> {
    const app = express();
    let vite: ViteDevServer | undefined;

    // Request Logging Middleware
    app.use((request: Request, response: Response, next: NextFunction) => {
        const start = Date.now();
        response.on('finish', () => {
            const duration = Date.now() - start;
            const status = response.statusCode;
            const statusColor = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m';
            console.log(`${statusColor}${status}\x1b[0m ${request.method} ${request.url} - ${duration}ms`);
        });
        next();
    });

    if (!isProd) {
        // Development Mode: Use Vite Server
        console.log('🛠️  Starting development server with Vite...');

        vite = await (
            await import('vite')
        ).createServer({
            root,
            logLevel: 'info',
            server: {
                middlewareMode: true,
                watch: {
                    usePolling: true,
                    interval: 100,
                },
                hmr: {
                    port: hmrPort,
                },
            },
            appType: 'custom',
            css: {
                devSourcemap: true,
            }
        });

        app.use(vite.middlewares);
        console.log('✅ Vite development server configured');
    } else {
        // Production Mode
        console.log('🚀 Starting production server...');

        // Add compression middleware
        const compression = (await import('compression')).default;
        app.use(compression());

        // Serve static files in production
        app.use(
            express.static('dist/client', {
                maxAge: '1y',
                etag: true,
                lastModified: true,
                setHeaders: (res, path) => {
                    if (path.endsWith('.css')) {
                        res.setHeader('Content-Type', 'text/css');
                        res.setHeader('Cache-Control', 'public, max-age=31536000');
                    }
                }
            })
        );

        console.log('✅ Production optimizations enabled');
    }

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: environment,
            uptime: process.uptime(),
        });
    });

    // Main SSR handler - FIXED: Better asset detection
    app.use(
        '*',
        asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
            const url = req.originalUrl;
            const startTime = Date.now();

            try {
                // FIXED: Better validation for static assets vs routes
                const fileExtension = path.extname(url);

                // In development, let Vite handle assets
                if (!isProd && fileExtension !== '') {
                    // For development, if it's a static asset and we get here,
                    // it means Vite didn't handle it, so it's a 404
                    return res.status(404).end();
                }

                // In production, static assets should be served by express.static
                // If we get here with an extension, it's a missing asset
                if (isProd && fileExtension !== '') {
                    console.warn(`⚠️  Static asset not found: ${url}`);
                    return res.status(404).end();
                }

                // Get Vite-transformed head for development
                let viteHead = '';
                if (!isProd && vite) {
                    try {
                        const transformedHtml = await vite.transformIndexHtml(
                            url,
                            `<html><head></head><body></body></html>`
                        );
                        viteHead = transformedHtml.substring(
                            transformedHtml.indexOf('<head>') + 6,
                            transformedHtml.indexOf('</head>')
                        );
                    } catch (error) {
                        console.warn('⚠️  Failed to transform HTML with Vite:', error);
                    }
                }

                // Load the SSR entry point
                const entry: SSREntry = await (async () => {
                    if (!isProd && vite) {
                        // Development: Load module dynamically with Vite
                        return await vite.ssrLoadModule('/src/entry-server.tsx');
                    } else {
                        // Production: Load pre-built module
                        return await import('./dist/server/entry-server.js');
                    }
                })();

                // Validate that the entry has a render function
                if (typeof entry.render !== 'function') {
                    throw new SSRError('SSR entry point does not have a render function', 500);
                }

                console.log(`📄 Rendering: ${url}...`);

                // Call the render function from your entry-server.tsx
                await entry.render({
                    req,
                    res,
                    head: viteHead,
                });

                // Log successful render
                const duration = Date.now() - startTime;
                console.log(`✅ Rendered ${url} in ${duration}ms`);
            } catch (error) {
                // Enhanced error handling
                if (!isProd && vite) {
                    // Fix stack trace in development
                    vite.ssrFixStacktrace(error as Error);
                }

                const ssrError =
                    error instanceof SSRError
                        ? error
                        : new SSRError(error instanceof Error ? error.message : 'Unknown SSR error');

                console.error('❌ SSR Error:', {
                    url,
                    message: ssrError.message,
                    statusCode: ssrError.statusCode,
                    stack: isProd ? undefined : ssrError.stack,
                    timestamp: new Date().toISOString(),
                });

                // Send error response
                if (!res.headersSent) {
                    res.status(ssrError.statusCode);

                    if (isProd) {
                        // Production: Clean error page
                        res.end(createProductionErrorPage(ssrError.statusCode));
                    } else {
                        // Development: Detailed error info
                        res.end(createDevelopmentErrorPage(ssrError, url));
                    }
                }
            }
        })
    );

    return { app, vite };
}

// Server startup logic - this is what actually starts your server
if (!isTest) {
    createServer()
        .then(async ({ app, vite }) => {
            // Get an available port (starts at 3000, tries up to 3100)
            const port = await getPort({ port: portNumbers(3000, 3100) });

            // Start listening for requests
            const server = app.listen(port, () => {
                console.log(`🚀 Server running at http://localhost:${port}`);
                console.log(`📁 Root directory: ${process.cwd()}`);
                console.log(`🛠️  Environment: ${environment}`);

                if (vite) {
                    console.log(`🔥 Hot Module Replacement enabled`);
                }

                console.log(`\n📖 Available endpoints:`);
                console.log(`   • Health check: http://localhost:${port}/health`);
                console.log(`   • Your app: http://localhost:${port}/`);
            });

            // Graceful shutdown handling
            const gracefulShutdown = (signal: string) => {
                console.log(`\n📄 Received ${signal}, shutting down gracefully...`);

                server.close(async err => {
                    if (err) {
                        console.error('❌ Error during server shutdown:', err);
                        process.exit(1);
                    }

                    // Close Vite dev server if it exists
                    if (vite) {
                        await vite.close();
                        console.log('✅ Vite dev server closed');
                    }

                    console.log('✅ Server shut down successfully');
                    process.exit(0);
                });

                // Force exit after 10 seconds
                setTimeout(() => {
                    console.error('❌ Forced shutdown after timeout');
                    process.exit(1);
                }, 10000);
            };

            // Handle different shutdown signals
            process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
            process.on('SIGINT', () => gracefulShutdown('SIGINT'));

            // Handle uncaught exceptions
            process.on('uncaughtException', error => {
                console.error('❌ Uncaught Exception:', error);
                gracefulShutdown('UNCAUGHT_EXCEPTION');
            });

            process.on('unhandledRejection', (reason, promise) => {
                console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
                gracefulShutdown('UNHANDLED_REJECTION');
            });
        })
        .catch(error => {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        });
}

// Export for testing and programmatic use
export type { ServerConfig, CreateServerResult, SSREntry };
