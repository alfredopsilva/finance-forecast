// app/routes/__root.tsx
import {createRootRoute, Outlet, HeadContent, Scripts} from '@tanstack/react-router'
import appCss from '@/styles/app.css?url' // Important: use ?url import

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {charSet: 'utf-8'},
            {name: 'viewport', content: 'width=device-width, initial-scale=1'},
        ],
        links: [
            {rel: 'stylesheet', href: appCss}, // This ensures CSS loads in SSR
        ],
    }),
    component: RootComponent,
})

function RootComponent() {
    return (
        <RootDocument>
            <Outlet/>
        </RootDocument>
    )
}

function RootDocument({children}: { children: React.ReactNode }) {
    return (
        <html>
        <head>
            <title>Finance Forecast</title>
            <HeadContent/>
        </head>
        <body>
        {children}
        <Scripts/>
        </body>
        </html>
    )
}
