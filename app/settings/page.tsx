import { SettingsComponent } from "@/components/settings/settings"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <SettingsComponent />
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}
