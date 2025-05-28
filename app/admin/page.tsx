import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <AdminDashboard />
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}
