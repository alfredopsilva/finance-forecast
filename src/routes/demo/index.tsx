// src/routes/demo/index.tsx
import {createFileRoute} from '@tanstack/react-router'
import {useState, useEffect} from 'react'

// This runs on BOTH server and client
console.log('🔵 Top-level: This runs during module import')

export const Route = createFileRoute('/demo/')({
    // LOADER: Only runs on server during SSR
    loader: async () => {
        console.log('🖥️ LOADER: Running on server only')
        console.log('🖥️ LOADER: window is:', typeof window) // 'undefined'

        // Fetch data on server
        const serverTime = new Date().toISOString()
        return {
            serverTime,
            message: 'Data from server loader'
        }
    },
    component: DemoComponent,
})

function DemoComponent() {
    // This function runs on BOTH server and client
    console.log('🟣 Component function executing')
    console.log('🟣 typeof window:', typeof window)

    const loaderData = Route.useLoaderData()
    const [isClient, setIsClient] = useState(false)
    const [clientTime, setClientTime] = useState<string>('')
    const [counter, setCounter] = useState(0)

    // METHOD 1: useEffect - ONLY runs on client
    useEffect(() => {
        console.log('🟢 useEffect: This ONLY runs on client!')
        console.log('🟢 window.location:', window.location.href)
        setIsClient(true)
        setClientTime(new Date().toISOString())
    }, [])

    // METHOD 2: Conditional code based on environment
    const getBrowserInfo = () => {
        if (typeof window !== 'undefined') {
            return {
                userAgent: navigator.userAgent.substring(0, 50) + '...',
                screenSize: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language,
            }
        }
        return null
    }

    // METHOD 3: Event handlers - only execute on client
    const handleClick = () => {
        console.log('🟡 Click handler: This runs on client only')
        setCounter(prev => prev + 1)

        // Safe to use browser APIs in event handlers
        alert(`Button clicked! Count: ${counter + 1}`)
    }

    // This JSX renders on BOTH server and client
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">SSR + Client Demo</h1>

            {/* Section 1: Always visible (SSR + Client) */}
            <div className="bg-gray-100 p-4 rounded mb-6">
                <h2 className="text-xl font-semibold mb-2">📦 Always Rendered (SSR + Client)</h2>
                <p>Loader Data: {loaderData.message}</p>
                <p>Server Time: {loaderData.serverTime}</p>
                <p>This content appears in the initial HTML</p>
            </div>

            {/* Section 2: Client-only content */}
            {isClient ? (
                <div className="bg-blue-100 p-4 rounded mb-6">
                    <h2 className="text-xl font-semibold mb-2">🌐 Client-Only Content</h2>
                    <p>Client Time: {clientTime}</p>
                    <p>Browser: {getBrowserInfo()?.userAgent}</p>
                    <p>Screen: {getBrowserInfo()?.screenSize}</p>
                    <p>Language: {getBrowserInfo()?.language}</p>
                    <p className="mt-2 text-sm text-blue-600">
                        This section only appears after hydration
                    </p>
                </div>
            ) : (
                <div className="bg-yellow-100 p-4 rounded mb-6">
                    <h2 className="text-xl font-semibold mb-2">⏳ Waiting for Client</h2>
                    <p>This shows during SSR and before hydration...</p>
                </div>
            )}

            {/* Section 3: Interactive elements */}
            <div className="bg-green-100 p-4 rounded mb-6">
                <h2 className="text-xl font-semibold mb-2">🎮 Interactive (Client-Only)</h2>
                <button
                    onClick={handleClick}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Click Counter: {counter}
                </button>
                <p className="mt-2 text-sm text-gray-600">
                    Button renders on server but only works after hydration
                </p>
            </div>

            {/* Section 4: Execution timeline */}
            <div className="bg-purple-100 p-4 rounded">
                <h2 className="text-xl font-semibold mb-2">📊 Execution Timeline</h2>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Server: Loader runs (fetches data)</li>
                    <li>Server: Component renders (no useEffect)</li>
                    <li>Server: HTML sent to browser</li>
                    <li>Client: HTML displayed (no interactivity)</li>
                    <li>Client: React hydrates</li>
                    <li>Client: useEffect runs</li>
                    <li>Client: Full interactivity</li>
                </ol>
                <div className="mt-4 p-2 bg-white rounded">
                    <p className="text-sm">
                        Environment: {typeof window === 'undefined' ? '🖥️ Server' : '🌐 Client'}
                    </p>
                </div>
            </div>
        </div>
    )
}
