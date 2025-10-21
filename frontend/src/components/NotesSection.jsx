import { useState, useEffect } from 'react'
import { Save, Trash2, Edit2 } from 'lucide-react'
import { getNotesByVideo, createNote, updateNote, deleteNote } from '../utils/api'
import toast from 'react-hot-toast'

function NotesSection({ videoId, user }) {
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (videoId) {
      fetchNotes()
    }
  }, [videoId])

  const fetchNotes = async () => {
    try {
      const response = await getNotesByVideo(videoId)
      setNotes(response.data)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    }
  }

  const handleSaveNote = async () => {
    if (!currentNote.trim()) return
    
    setLoading(true)
    try {
      if (editingNote) {
        await updateNote(editingNote.id, { 
          content: currentNote, 
          userId: user.id, 
          videoId 
        })
        toast.success('Note updated!')
        setEditingNote(null)
      } else {
        await createNote({ 
          content: currentNote, 
          userId: user.id, 
          videoId 
        })
        toast.success('Note saved!')
      }
      setCurrentNote('')
      fetchNotes()
    } catch (error) {
      toast.error('Failed to save note')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId)
      toast.success('Note deleted!')
      fetchNotes()
    } catch (error) {
      toast.error('Failed to delete note')
    }
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setCurrentNote(note.content)
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Notes</h3>
      
      {/* Note Input */}
      <div className="mb-6">
        <textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
          rows="4"
          placeholder="Take notes while watching..."
        />
        <div className="flex justify-end mt-2">
          {editingNote && (
            <button
              onClick={() => {
                setEditingNote(null)
                setCurrentNote('')
              }}
              className="mr-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSaveNote}
            disabled={loading || !currentNote.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{editingNote ? 'Update Note' : 'Save Note'}</span>
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No notes yet. Start taking notes!</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotesSection
