import { useState } from 'react'
import { Youtube, Mail, Lock, User } from 'lucide-react'
import { loginUser, createUser } from '../utils/api'
import toast from 'react-hot-toast'

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (isSignup) {
        const response = await createUser(formData)
        toast.success('Account created successfully!')
        onLogin(response.data)
      } else {
        const response = await loginUser({
          email: formData.email,
          password: formData.password,
        })
        toast.success('Login successful!')
        onLogin(response.data)
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Authentication failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Youtube className="w-16 h-16 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">EduTube Pro</h1>
          <p className="text-gray-600 mt-2">Smart YouTube Study Organizer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your name"
                  required={isSignup}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-3 text-lg">
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {isSignup
              ? 'Already have an account? Login'
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
