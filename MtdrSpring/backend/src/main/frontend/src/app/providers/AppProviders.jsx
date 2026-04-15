import { AuthProvider } from './AuthProvider'
import { DataProvider } from './DataProvider'

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <DataProvider>{children}</DataProvider>
    </AuthProvider>
  )
}
