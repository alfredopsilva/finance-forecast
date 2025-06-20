import {pipeline} from 'node:stream/promises'
import {
    createRequestHandler,
    defaultStreamHandler,
} from '@tanstack/react-start/server'
import {createRouter} from './router'
import type express from 'express'

export async function render({
                                 req,
                                 res,
                                 head,
                             }: {
    head: string
    req: express.Request
    res: express.Response
}) {
    // Convert the express request to a fetch request
    const url = new URL(req.originalUrl || req.url, 'https://localhost:3000').href
    const request = new Request(url, {
        method: req.method,
        headers: (() => {
            const headers = new Headers()
            for (const [key, value] of Object.entries(req.headers)) {
                if (typeof value === 'string' || Array.isArray(value)) {
                    headers.set(key, Array.isArray(value) ? value.join(', ') : value)
                }
            }
            return headers
        })(),
    })

    // Create a request handler
    const handler = createRequestHandler({
        request,
        createRouter: () => {
            const router = createRouter()

            // Update each router instance with the head info from vite
            router.update({
                context: {
                    ...router.options.context,
                    head: head,
                },
            })
            return router
        },
    })

    // Let's use the default stream handler to create the response
    const response = await handler(defaultStreamHandler)

    // Convert the fetch response back to an express response
    res.statusMessage = response.statusText
    res.status(response.status)
    response.headers.forEach((value: string, name: string) => {
        res.setHeader(name, value)
    })

    // Stream the response body
    return pipeline(response.body as any, res)
}
