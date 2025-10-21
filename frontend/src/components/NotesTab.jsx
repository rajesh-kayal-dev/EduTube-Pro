import { useState, useEffect } from 'react'
import { Save, Trash2, Edit2, Link, Plus } from 'lucide-react'
import { getNotesByVideo, createNote, updateNote, deleteNote } from '../utils/api'
import toast from 'react-hot-toast'

function NotesTab({ videoId, user }) {
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [attachmentTitle, setAttachmentTitle] = useState('')

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

  const handleAddAttachment = () => {
    if (!attachmentUrl.trim() || !attachmentTitle.trim()) {
      toast.error('Please provide both title and URL')
      return
    }
    
    const attachmentText = `\n\n📎 [${attachmentTitle}](${attachmentUrl})`
    setCurrentNote(prev => prev + attachmentText)
    setAttachmentUrl('')
    setAttachmentTitle('')
    setShowAttachmentModal(false)
    toast.success('Attachment added to note')
  }

  return (
    <div className="space-y-4">
      {/* Note Input */}
      <div>
        <textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
          rows="4"
          placeholder="Take notes while watching..."
        />
        <div className="flex justify-between mt-2">
          <button
            onClick={() => setShowAttachmentModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            <Plus className="w-4 h-4" />
            <span>Attach File</span>
          </button>
          
          <div className="flex space-x-2">
            {editingNote && (
              <button
                onClick={() => {
                  setEditingNote(null)
                  setCurrentNote('')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
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
              <span>{editingNote ? 'Update' : 'Save'}</span>
            </button>
          </div>
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
                  {new Date(note.createdAt).toLocaleDateString()}
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

      {/* Attachment Modal */}
      {showAttachmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Attach External File</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">
                  File Title
                </label>
                <input
                  type="text"
                  value={attachmentTitle}
                  onChange={(e) => setAttachmentTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  placeholder="e.g., Course PDF, Google Drive Link"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              
              <p className="text-xs text-gray-500">
                💡 Tip: You can attach Google Drive links, PDFs, Google Notes, or any web resource
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAttachmentModal(false)
                  setAttachmentUrl('')
                  setAttachmentTitle('')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAttachment}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <Link className="w-4 h-4" />
                <span>Add Attachment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesTab
