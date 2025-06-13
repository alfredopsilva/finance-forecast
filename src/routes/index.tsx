import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: App,
})

function App() {
    return (
        <div className="text-center">
            <div
                className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
                <p className={"text-orange-600 bg-yellow-100"}>Hello Vite + React!</p>
                <p> Edit <code>src/routes/index.tsx</code> and save to reload</p>
            </div>
        </div>
    )
}
