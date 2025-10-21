import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Circle, Clock, Play, Pause, RotateCcw } from 'lucide-react'
import ReactPlayer from 'react-player/youtube'
import { getVideo, getNotesByVideo, createNote, updateNote, deleteNote, updateVideoStatus, getVideosByPlaylist } from '../utils/api'
import toast from 'react-hot-toast'

function VideoPlayerSimple({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [video, setVideo] = useState(null)
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playlistVideos, setPlaylistVideos] = useState([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  
  // Pomodoro Timer
  const [showTimer, setShowTimer] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    fetchVideoData()
  }, [id])

  // Timer countdown
  useEffect(() => {
    let interval = null
    if (timerActive && (timerMinutes > 0 || timerSeconds > 0)) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            setTimerActive(false)
            toast.success('Timer completed! ⏰')
          } else {
            setTimerMinutes(timerMinutes - 1)
            setTimerSeconds(59)
          }
        } else {
          setTimerSeconds(timerSeconds - 1)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, timerMinutes, timerSeconds])

  const fetchVideoData = async () => {
    try {
      const [videoRes, notesRes] = await Promise.all([
        getVideo(id),
        getNotesByVideo(id)
      ])
      setVideo(videoRes.data)
      setNotes(notesRes.data)
      
      if (videoRes.data.playlist?.id) {
        const playlistVideosRes = await getVideosByPlaylist(videoRes.data.playlist.id)
        setPlaylistVideos(playlistVideosRes.data)
        const index = playlistVideosRes.data.findIndex(v => v.id === parseInt(id))
        setCurrentVideoIndex(index)
      }
      
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
    if (!currentNote.trim()) return
    try {
      if (editingNote) {
        await updateNote(editingNote.id, { content: currentNote, userId: user.id, videoId: id })
        toast.success('Note updated!')
        setEditingNote(null)
      } else {
        await createNote({ content: currentNote, userId: user.id, videoId: id })
        toast.success('Note saved!')
      }
      setCurrentNote('')
      fetchVideoData()
    } catch (error) {
      toast.error('Failed to save note')
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId)
      toast.success('Note deleted!')
      fetchVideoData()
    } catch (error) {
      toast.error('Failed to delete note')
    }
  }

  const handleMarkComplete = async () => {
    try {
      await updateVideoStatus(id, 'COMPLETED')
      toast.success('Video completed!')
      fetchVideoData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleVideoEnd = async () => {
    await handleMarkComplete()
    
    if (currentVideoIndex >= playlistVideos.length - 1) {
      // Last video completed
      toast.success('🎉 Course completed! Great job!')
      setTimeout(() => {
        navigate(`/playlist/${video.playlist.id}`)
      }, 2000)
    } else {
      // Auto-play next video
      toast.success('Next video starting...')
      setTimeout(() => {
        const nextVideo = playlistVideos[currentVideoIndex + 1]
        navigate(`/video/${nextVideo.id}`)
      }, 1500)
    }
  }

  const startTimer = (minutes) => {
    setTimerMinutes(minutes)
    setTimerSeconds(0)
    setTimerActive(true)
    setShowTimer(true)
  }

  const calculateProgress = () => {
    if (playlistVideos.length === 0) return 0
    const completed = playlistVideos.filter(v => v.status === 'COMPLETED').length
    return Math.round((completed / playlistVideos.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => navigate(`/playlist/${video.playlist?.id}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{video.playlist?.title}</span>
          </button>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Progress:</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar - Playlist */}
        <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Course Content</h3>
            <div className="space-y-2">
              {playlistVideos.map((v, index) => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/video/${v.id}`)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    v.id === parseInt(id)
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {v.status === 'COMPLETED' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : v.id === parseInt(id) ? (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">
                        {index + 1}. {v.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{v.duration}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 p-6">
          <div className="bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
            <ReactPlayer
              url={video?.url}
              width="100%"
              height="100%"
              controls
              playing={false}
              config={{
                youtube: {
                  playerVars: {
                    controls: 1,
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3
                  }
                }
              }}
              onEnded={handleVideoEnd}
            />
          </div>

          <div className="bg-white rounded-lg p-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{video?.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{video?.channel}</span>
              <span>•</span>
              <span>{video?.duration}</span>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My Notes</h3>
            
            <div className="mb-4">
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows="3"
                placeholder="Add a note..."
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSaveNote}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">{note.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingNote(note)
                          setCurrentNote(note.content)
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pomodoro Timer - Bottom Left */}
      {showTimer && (
        <div className="fixed bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-500">Pomodoro</div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimerActive(!timerActive)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setTimerMinutes(25)
                  setTimerSeconds(0)
                  setTimerActive(false)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => startTimer(25)}
              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
            >
              25m
            </button>
            <button
              onClick={() => startTimer(15)}
              className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
            >
              15m
            </button>
            <button
              onClick={() => startTimer(5)}
              className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200"
            >
              5m
            </button>
          </div>
        </div>
      )}

      {/* Pomodoro Button */}
      {!showTimer && (
        <button
          onClick={() => setShowTimer(true)}
          className="fixed bottom-6 left-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Clock className="w-6 h-6" />
        </button>
      )}

    </div>
  )
}

export default VideoPlayerSimple
