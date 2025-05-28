import { UserProfile } from "@/components/profile/user-profile"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <UserProfile />
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}
