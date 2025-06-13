import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className={"text-orange-600 bg-yellow-100"}>Hello "/about"!</div>
}
