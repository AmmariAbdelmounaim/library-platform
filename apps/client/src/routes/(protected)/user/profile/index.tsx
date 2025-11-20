import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/user/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/user/profile/"!</div>
}
