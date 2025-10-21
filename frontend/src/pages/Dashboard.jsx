import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FolderOpen, Video, Trash2, Edit2 } from 'lucide-react'
import { getPlaylists, createPlaylist, deletePlaylist } from '../utils/api'
import toast from 'react-hot-toast'

function Dashboard({ user }) {
  const [playlists, setPlaylists] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newPlaylist, setNewPlaylist] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Playlist</span>
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No playlists yet</h3>
          <p className="text-gray-500 mb-6">Create your first playlist to start organizing your study videos</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Playlist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="card group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-primary-600" />
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
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {playlist.description || 'No description'}
              </p>
              
              <Link
                to={`/playlist/${playlist.id}`}
                className="btn-primary w-full text-center flex items-center justify-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>View Playlist</span>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6">Create New Playlist</h3>
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
                  Create
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
    </div>
  )
}

export default Dashboard
