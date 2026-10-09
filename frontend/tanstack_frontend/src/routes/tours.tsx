import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tours')({ component: ToursLayout })

function ToursLayout() {
  return <Outlet />
}