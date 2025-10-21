import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Edit2 } from 'lucide-react'
import ReactPlayer from 'react-player/youtube'
import { getVideo, getNotesByVideo, createNote, updateNote, deleteNote, updateVideoStatus } from '../utils/api'
import toast from 'react-hot-toast'

function VideoPlayer({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [video, setVideo] = useState(null)
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideoData()
  }, [id])

  const fetchVideoData = async () => {
    try {
      const [videoRes, notesRes] = await Promise.all([
        getVideo(id),
        getNotesByVideo(id)
      ])
      setVideo(videoRes.data)
      setNotes(notesRes.data)
      
      // Auto-update status to WATCHING if it's TO_WATCH
      if (videoRes.data.status === 'TO_WATCH') {
        await updateVideoStatus(id, 'WATCHING')
      }
    } catch (error) {
      toast.error('Failed to fetch video data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNote = async () => {
    if (!currentNote.trim()) {
      toast.error('Note cannot be empty')
      return
    }

    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          content: currentNote,
          videoId: id,
          userId: user.id
        })
        toast.success('Note updated!')
        setEditingNote(null)
      } else {
        await createNote({
          content: currentNote,
          videoId: id,
          userId: user.id
        })
        toast.success('Note saved!')
      }
      setCurrentNote('')
      fetchVideoData()
    } catch (error) {
      toast.error('Failed to save note')
    }
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setCurrentNote(note.content)
  }

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteId)
        toast.success('Note deleted!')
        fetchVideoData()
      } catch (error) {
        toast.error('Failed to delete note')
      }
    }
  }

  const handleMarkComplete = async () => {
    try {
      await updateVideoStatus(id, 'COMPLETED')
      toast.success('Video marked as completed!')
      fetchVideoData()
    } catch (error) {
      toast.error('Failed to update status')
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
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Playlist</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-xl overflow-hidden aspect-video">
            <ReactPlayer
              url={video?.url}
              width="100%"
              height="100%"
              controls
              playing
            />
          </div>
          
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{video?.title}</h2>
            <p className="text-gray-600 mb-4">{video?.channel}</p>
            
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                video?.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-700'
                  : video?.status === 'WATCHING'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {video?.status?.replace('_', ' ')}
              </span>
              
              {video?.status !== 'COMPLETED' && (
                <button
                  onClick={handleMarkComplete}
                  className="btn-primary"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingNote ? 'Edit Note' : 'Take Notes'}
            </h3>
            
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="textarea-field mb-4"
              rows="6"
              placeholder="Write your notes here..."
            />
            
            <div className="flex space-x-2">
              <button
                onClick={handleSaveNote}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingNote ? 'Update' : 'Save'} Note</span>
              </button>
              
              {editingNote && (
                <button
                  onClick={() => {
                    setEditingNote(null)
                    setCurrentNote('')
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Saved Notes */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Saved Notes ({notes.length})
            </h3>
            
            {notes.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No notes yet. Start taking notes!
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-4 rounded-lg group">
                    <p className="text-gray-700 text-sm mb-2 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
