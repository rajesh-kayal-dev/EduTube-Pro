import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Video, Trash2, CheckCircle, XCircle, Loader, ChevronDown, ChevronUp, Target, Gift } from 'lucide-react'
import { getPlaylists, createPlaylist, deletePlaylist, previewPlaylist, importPlaylist } from '../utils/api'
import toast from 'react-hot-toast'

function DashboardEnhanced({ user }) {
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [mode, setMode] = useState('create') // 'create' or 'import'
  const [newPlaylist, setNewPlaylist] = useState({ title: '', description: '' })
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [playlistPreview, setPlaylistPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewing, setPreviewing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [expandedDescriptions, setExpandedDescriptions] = useState({})

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      const response = await getPlaylists(user.id)
      setPlaylists(response.data)
    } catch (error) {
      toast.error('Failed to fetch playlists')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async (e) => {
    e.preventDefault()
    try {
      await createPlaylist({ ...newPlaylist, userId: user.id })
      toast.success('Playlist created successfully!')
      setShowModal(false)
      setNewPlaylist({ title: '', description: '' })
      fetchPlaylists()
    } catch (error) {
      toast.error('Failed to create playlist')
    }
  }

  const handlePreviewPlaylist = async (e) => {
    e.preventDefault()
    setPreviewing(true)
    try {
      const response = await previewPlaylist(playlistUrl)
      setPlaylistPreview(response.data)
      toast.success('Playlist found!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch playlist details')
      setPlaylistPreview(null)
    } finally {
      setPreviewing(false)
    }
  }

  const handleConfirmImport = async () => {
    setImporting(true)
    setImportProgress(0)
    
    try {
      // First create the playlist
      setImportProgress(10)
      const createResponse = await createPlaylist({
        title: playlistPreview.title,
        description: playlistPreview.description || 'Imported from YouTube',
        userId: user.id
      })
      
      const newPlaylistId = createResponse.data.id
      setImportProgress(30)
      
      // Simulate progress during import
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev < 90) return prev + 5
          return prev
        })
      }, 500)
      
      // Then import videos
      const importResponse = await importPlaylist({
        playlistUrl,
        playlistId: newPlaylistId
      })
      
      clearInterval(progressInterval)
      setImportProgress(100)
      
      toast.success(`Successfully imported ${importResponse.data.importedVideos} videos!`)
      
      setTimeout(async () => {
        setShowModal(false)
        setPlaylistUrl('')
        setPlaylistPreview(null)
        setImportProgress(0)
        await fetchPlaylists()
      }, 1000)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to import playlist')
      setImportProgress(0)
    } finally {
      setImporting(false)
    }
  }

  const handleDeletePlaylist = async (id) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await deletePlaylist(id)
        toast.success('Playlist deleted successfully!')
        fetchPlaylists()
      } catch (error) {
        toast.error('Failed to delete playlist')
      }
    }
  }

  const resetModal = () => {
    setMode('create')
    setNewPlaylist({ title: '', description: '' })
    setPlaylistUrl('')
    setPlaylistPreview(null)
    setImportProgress(0)
    setShowModal(false)
  }

  const toggleDescription = (playlistId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [playlistId]: !prev[playlistId]
    }))
  }

  const calculateProgress = (playlist) => {
    if (!playlist.videos || playlist.videos.length === 0) return 0
    const completedCount = playlist.videos.filter(v => v.status === 'COMPLETED').length
    return Math.round((completedCount / playlist.videos.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">My Study Playlists</h2>
          <p className="text-gray-600 mt-2">Organize your learning journey</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Create Playlist</span>
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No playlists yet</h3>
          <p className="text-gray-500 mb-6">Create your first playlist or import from YouTube</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Get Started</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => {
            const progress = calculateProgress(playlist)
            const isExpanded = expandedDescriptions[playlist.id]
            const description = playlist.description || 'No description'
            const shouldTruncate = description.length > 100
            
            return (
              <div key={playlist.id} className="card group hover:shadow-xl transition-shadow relative">
                {/* Circular Progress Indicator */}
                {progress > 0 && (
                  <div className="absolute -top-3 -right-3 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-white z-10">
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
                        stroke={progress === 100 ? '#10B981' : '#3B82F6'}
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">{progress}%</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FolderOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{playlist.title}</h3>
                      <p className="text-sm text-gray-500">
                        {playlist.videos?.length || 0} videos
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePlaylist(playlist.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-gray-600 text-sm mb-4">
                  <p className={!isExpanded && shouldTruncate ? 'line-clamp-2' : ''}>
                    {description}
                  </p>
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleDescription(playlist.id)}
                      className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-1 flex items-center space-x-1"
                    >
                      <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                
                <Link
                  to={`/playlist/${playlist.id}`}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors w-full text-center flex items-center justify-center space-x-2"
                >
                  <Video className="w-4 h-4" />
                  <span>View Playlist</span>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Import Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Add Playlist</h3>
            
            {/* Radio Buttons */}
            <div className="flex space-x-6 mb-6 pb-6 border-b">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="create"
                  checked={mode === 'create'}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-lg font-medium text-gray-700">Create New Playlist</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="import"
                  checked={mode === 'import'}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-lg font-medium text-gray-700">Import from YouTube</span>
              </label>
            </div>

            {/* Create Mode */}
            {mode === 'create' && (
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Playlist Title
                  </label>
                  <input
                    type="text"
                    value={newPlaylist.title}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Data Structures & Algorithms"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    className="textarea-field"
                    rows="3"
                    placeholder="Brief description of this playlist"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Create Playlist
                  </button>
                  <button
                    type="button"
                    onClick={resetModal}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Import Mode */}
            {mode === 'import' && (
              <div className="space-y-6">
                {!playlistPreview ? (
                  <form onSubmit={handlePreviewPlaylist} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube Playlist URL
                      </label>
                      <input
                        type="url"
                        value={playlistUrl}
                        onChange={(e) => setPlaylistUrl(e.target.value)}
                        className="input-field"
                        placeholder="https://www.youtube.com/playlist?list=..."
                        required
                        disabled={previewing}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Paste a YouTube playlist URL to preview details
                      </p>
                    </div>
                    
                    {previewing && (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                        <span className="ml-3 text-gray-600">Fetching playlist details...</span>
                      </div>
                    )}
                    
                    <div className="flex space-x-3 pt-4">
                      <button 
                        type="submit" 
                        className="btn-primary flex-1"
                        disabled={previewing}
                      >
                        {previewing ? 'Loading...' : 'Preview Playlist'}
                      </button>
                      <button
                        type="button"
                        onClick={resetModal}
                        className="btn-secondary flex-1"
                        disabled={previewing}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Playlist Preview */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        {playlistPreview.thumbnail && (
                          <img 
                            src={playlistPreview.thumbnail} 
                            alt={playlistPreview.title}
                            className="w-32 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-800 mb-2">
                            {playlistPreview.title}
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Channel:</strong> {playlistPreview.channelTitle}</p>
                            <p><strong>Videos:</strong> {playlistPreview.videoCount}</p>
                          </div>
                        </div>
                      </div>
                      
                      {playlistPreview.description && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <p className="text-sm text-gray-700 line-clamp-3">
                            <strong>Description:</strong> {playlistPreview.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Import Progress */}
                    {importing && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-medium">Importing videos...</span>
                          <span className="text-blue-600 font-bold">{importProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${importProgress}%` }}
                          >
                            <div className="w-full h-full bg-white opacity-20 animate-pulse"></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Please wait while we import {playlistPreview.videoCount} videos...
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={handleConfirmImport}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex-1 flex items-center justify-center space-x-2"
                        disabled={importing}
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>{importing ? 'Importing...' : 'Confirm & Import'}</span>
                      </button>
                      <button
                        onClick={() => setPlaylistPreview(null)}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex-1 flex items-center justify-center space-x-2"
                        disabled={importing}
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Notification Modal - REMOVED */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border-2 border-blue-300 animate-bounce-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                🎯 Start Your Learning Journey!
              </h2>
              <p className="text-gray-600">
                {newlyImportedPlaylist.title}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 mb-6 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center flex-1">
                  <p className="text-3xl font-bold text-blue-600">{newlyImportedPlaylist.videoCount}</p>
                  <p className="text-sm text-gray-600">Videos to Watch</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-3xl font-bold text-purple-600">0%</p>
                  <p className="text-sm text-gray-600">Progress</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6 border border-yellow-200">
              <div className="flex items-start space-x-3">
                <Gift className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800 mb-1">🎁 Complete & Earn Rewards!</p>
                  <p className="text-sm text-gray-700">
                    Track your progress and earn a certificate when you complete all videos in this playlist!
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-600 mb-6 text-sm">
              Do you want to track your progress and earn achievements?
            </p>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  setShowProgressNotification(false)
                  navigate(`/playlist/${newlyImportedPlaylist.id}`)
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                ✅ Yes, Start Learning!
              </button>
              <button
                onClick={() => setShowProgressNotification(false)}
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

export default DashboardEnhanced
