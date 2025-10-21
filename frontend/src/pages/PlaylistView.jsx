import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Play, Clock, Trash2, CheckCircle, Circle, Target, Gift, Award, TrendingUp } from 'lucide-react'
import { getPlaylist, getVideosByPlaylist, addVideo, deleteVideo, updateVideoStatus } from '../utils/api'
import toast from 'react-hot-toast'

function PlaylistView({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState(null)
  const [videos, setVideos] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    fetchPlaylistData()
  }, [id])

  const fetchPlaylistData = async () => {
    try {
      const [playlistRes, videosRes] = await Promise.all([
        getPlaylist(id),
        getVideosByPlaylist(id)
      ])
      setPlaylist(playlistRes.data)
      setVideos(videosRes.data)
    } catch (error) {
      toast.error('Failed to fetch playlist data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddVideo = async (e) => {
    e.preventDefault()
    try {
      await addVideo({ url: videoUrl, playlistId: id })
      toast.success('Video added successfully!')
      setShowModal(false)
      setVideoUrl('')
      fetchPlaylistData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add video')
    }
  }

  const calculateProgress = () => {
    if (videos.length === 0) return { percentage: 0, completed: 0, total: 0, remaining: 0, totalMinutes: 0, watchedMinutes: 0 }
    
    const completed = videos.filter(v => v.status === 'COMPLETED').length
    const percentage = Math.round((completed / videos.length) * 100)
    const remaining = videos.length - completed
    
    // Calculate total watch time (assuming average 10 min per video, can be updated with actual duration)
    const totalMinutes = videos.reduce((acc, v) => {
      const duration = v.duration || '10:00'
      const [min, sec] = duration.split(':').map(Number)
      return acc + min + (sec / 60)
    }, 0)
    
    const watchedMinutes = videos
      .filter(v => v.status === 'COMPLETED')
      .reduce((acc, v) => {
        const duration = v.duration || '10:00'
        const [min, sec] = duration.split(':').map(Number)
        return acc + min + (sec / 60)
      }, 0)
    
    return { percentage, completed, total: videos.length, remaining, totalMinutes: Math.round(totalMinutes), watchedMinutes: Math.round(watchedMinutes) }
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }


  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteVideo(videoId)
        toast.success('Video deleted successfully!')
        fetchPlaylistData()
      } catch (error) {
        toast.error('Failed to delete video')
      }
    }
  }

  const handleStatusChange = async (videoId, newStatus) => {
    try {
      await updateVideoStatus(videoId, newStatus)
      toast.success('Status updated!')
      fetchPlaylistData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'WATCHING':
        return <Play className="w-5 h-5 text-blue-600" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'WATCHING':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const progress = calculateProgress()

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{playlist?.title}</h2>
            <div className="mt-1">
              {playlist?.description && playlist.description.length > 150 ? (
                <>
                  <p className="text-sm text-gray-600">
                    {showFullDescription 
                      ? playlist.description 
                      : `${playlist.description.substring(0, 150)}...`}
                  </p>
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-1"
                  >
                    {showFullDescription ? 'Read Less' : 'Read More'}
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-600">{playlist?.description}</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{videos.length} videos</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Circular Progress Indicator */}
            {progress.total > 0 && (
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#E5E7EB"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke={progress.percentage === 100 ? '#10B981' : '#3B82F6'}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress.percentage / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-700">{progress.percentage}%</span>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Add Video</span>
            </button>
          </div>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-16">
          <Play className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No videos yet</h3>
          <p className="text-gray-500 mb-6">Add YouTube videos to start learning</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Video</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="card flex items-center space-x-4 group">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-40 h-24 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800 mb-1">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{video.channel}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{video.duration}</span>
                  </div>
                  <select
                    value={video.status}
                    onChange={(e) => handleStatusChange(video.id, e.target.value)}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(video.status)}`}
                  >
                    <option value="TO_WATCH">To Watch</option>
                    <option value="WATCHING">Watching</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link
                  to={`/video/${video.id}`}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Watch</span>
                </Link>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Video Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6">Add YouTube Video</h3>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video URL
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="input-field"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Paste any YouTube video URL
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Add Video
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Tracking Modal - REMOVED */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border-2 border-blue-300 animate-bounce-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                🎯 Track Your Progress!
              </h2>
              <p className="text-gray-600">
                Start tracking your learning journey
              </p>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-inner text-center">
                <div className="flex items-center justify-center mb-2">
                  <Play className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-2xl font-bold text-blue-600">{progress.total}</p>
                </div>
                <p className="text-sm text-gray-600">Total Videos</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-inner text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-2xl font-bold text-green-600">{progress.completed}</p>
                </div>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-inner text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-orange-600 mr-2" />
                  <p className="text-2xl font-bold text-orange-600">{formatTime(progress.totalMinutes)}</p>
                </div>
                <p className="text-sm text-gray-600">Total Watch Time</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-inner text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                  <p className="text-2xl font-bold text-purple-600">{progress.remaining}</p>
                </div>
                <p className="text-sm text-gray-600">Videos Left</p>
              </div>
            </div>

            {/* Time to Certificate */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5 mb-6 border-2 border-yellow-300">
              <div className="flex items-start space-x-3">
                <Award className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800 mb-2 text-lg">⏱️ Time to Certificate</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-blue-600">{formatTime(progress.totalMinutes - progress.watchedMinutes)}</p>
                      <p className="text-xs text-gray-600">Remaining Time</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-green-600">{formatTime(progress.watchedMinutes)}</p>
                      <p className="text-xs text-gray-600">Watched Time</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    Complete all <strong>{progress.remaining}</strong> remaining videos to earn your certificate! 🎓
                  </p>
                </div>
              </div>
            </div>

            {/* Achievement Info */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <Gift className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800 mb-1">🎁 Your Reward Awaits!</p>
                  <p className="text-sm text-gray-700">
                    Track your progress and earn a <strong>certificate of completion</strong> when you finish all videos. 
                    We'll celebrate your achievement with you! 🎉
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-600 mb-6 text-sm">
              Do you want to start tracking your progress?
            </p>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleStartProgress}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                ✅ Yes, Start Tracking Progress!
              </button>
              <button
                onClick={() => setShowProgressModal(false)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default PlaylistView
