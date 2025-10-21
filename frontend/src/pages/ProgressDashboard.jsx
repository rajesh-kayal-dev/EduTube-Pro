import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { TrendingUp, Video, CheckCircle, Clock, FolderOpen } from 'lucide-react'
import { getProgressStats } from '../utils/api'
import toast from 'react-hot-toast'

function ProgressDashboard({ user }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await getProgressStats(user.id)
      setStats(response.data)
    } catch (error) {
      toast.error('Failed to fetch progress stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const pieData = [
    { name: 'Completed', value: stats?.completedVideos || 0, color: '#10b981' },
    { name: 'Watching', value: stats?.watchingVideos || 0, color: '#3b82f6' },
    { name: 'To Watch', value: stats?.toWatchVideos || 0, color: '#6b7280' },
  ]

  const barData = [
    { name: 'Total', value: stats?.totalVideos || 0 },
    { name: 'Completed', value: stats?.completedVideos || 0 },
    { name: 'Watching', value: stats?.watchingVideos || 0 },
    { name: 'To Watch', value: stats?.toWatchVideos || 0 },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Learning Progress</h2>
        <p className="text-gray-600 mt-2">Track your study journey and achievements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <Video className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats?.totalVideos || 0}</span>
          </div>
          <h3 className="text-lg font-semibold">Total Videos</h3>
          <p className="text-blue-100 text-sm">In all playlists</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats?.completedVideos || 0}</span>
          </div>
          <h3 className="text-lg font-semibold">Completed</h3>
          <p className="text-green-100 text-sm">{stats?.completionPercentage || 0}% done</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats?.watchingVideos || 0}</span>
          </div>
          <h3 className="text-lg font-semibold">Watching</h3>
          <p className="text-purple-100 text-sm">In progress</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <FolderOpen className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats?.totalPlaylists || 0}</span>
          </div>
          <h3 className="text-lg font-semibold">Playlists</h3>
          <p className="text-orange-100 text-sm">Study collections</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Video Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Video Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="card mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Progress Summary</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">Overall Completion</span>
              <span className="text-gray-900 font-bold">{stats?.completionPercentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${stats?.completionPercentage || 0}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">
                <span className="font-bold">{stats?.completedVideos || 0}</span> Completed
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">
                <span className="font-bold">{stats?.watchingVideos || 0}</span> Watching
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
              <span className="text-gray-700">
                <span className="font-bold">{stats?.toWatchVideos || 0}</span> To Watch
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {stats?.completionPercentage >= 50 && (
        <div className="card mt-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center space-x-4">
            <TrendingUp className="w-12 h-12" />
            <div>
              <h3 className="text-xl font-bold mb-1">Great Progress! 🎉</h3>
              <p className="text-primary-100">
                You've completed more than half of your videos. Keep up the excellent work!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressDashboard
