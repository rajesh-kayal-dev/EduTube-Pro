import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, BarChart3, LogOut, Youtube } from 'lucide-react'

function Layout({ user, onLogout }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Youtube className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-primary-600">EduTube Pro</h1>
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link
                to="/progress"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/progress')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Progress</span>
              </Link>
              
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600 text-sm">
          <p>&copy; 2024 EduTube Pro - Smart YouTube Study Organizer</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
