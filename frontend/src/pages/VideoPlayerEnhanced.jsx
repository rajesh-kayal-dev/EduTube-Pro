import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Edit2, CheckCircle, Circle, Clock, Trophy, Award, Download } from 'lucide-react'
import ReactPlayer from 'react-player/youtube'
import { getVideo, getNotesByVideo, createNote, updateNote, deleteNote, updateVideoStatus, getVideosByPlaylist, createAchievement } from '../utils/api'
import toast from 'react-hot-toast'

function VideoPlayerEnhanced({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [video, setVideo] = useState(null)
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [videoEnded, setVideoEnded] = useState(false)
  const [playlistVideos, setPlaylistVideos] = useState([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [showCongrats, setShowCongrats] = useState(false)
  const [canWatchVideo, setCanWatchVideo] = useState(false)
  const [achievement, setAchievement] = useState(null)
  const [showTimer, setShowTimer] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    fetchVideoData()
  }, [id])

  // Pomodoro Timer
  useEffect(() => {
    let interval = null
    if (timerActive && (timerMinutes > 0 || timerSeconds > 0)) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            setTimerActive(false)
            toast.success('Timer completed! Take a break! ⏰')
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
      
      // Fetch playlist videos for navigation
      if (videoRes.data.playlist?.id) {
        const playlistVideosRes = await getVideosByPlaylist(videoRes.data.playlist.id)
        setPlaylistVideos(playlistVideosRes.data)
        const index = playlistVideosRes.data.findIndex(v => v.id === parseInt(id))
        setCurrentVideoIndex(index)
        
        // Check if user can watch this video (sequential watching)
        if (index === 0) {
          setCanWatchVideo(true)
        } else {
          const previousVideo = playlistVideosRes.data[index - 1]
          setCanWatchVideo(previousVideo.status === 'COMPLETED')
        }
      } else {
        setCanWatchVideo(true)
      }
      
      // Auto-update status to WATCHING if it's TO_WATCH and user can watch
      if (videoRes.data.status === 'TO_WATCH' && canWatchVideo) {
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

  const handleVideoEnd = async () => {
    setVideoEnded(true)
    await handleMarkComplete()
    
    // Check if playlist is complete
    if (currentVideoIndex >= playlistVideos.length - 1) {
      // Create achievement
      try {
        const achievementRes = await createAchievement({
          userId: user.id,
          playlistId: video.playlist.id
        })
        setAchievement(achievementRes.data)
      } catch (error) {
        console.error('Failed to create achievement:', error)
      }
      setShowCongrats(true)
    } else {
      // Auto-play next video immediately
      toast.success('Next video starting...')
      setTimeout(() => {
        handleNextVideo()
      }, 1500)
    }
  }

  const handleNextVideo = () => {
    if (currentVideoIndex < playlistVideos.length - 1) {
      const nextVideo = playlistVideos[currentVideoIndex + 1]
      navigate(`/video/${nextVideo.id}`)
      setVideoEnded(false)
    } else {
      setShowCongrats(true)
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

  const playerConfig = {
    youtube: {
      playerVars: {
        controls: 1,
        rel: 0,
        modestbranding: 1,
        autoplay: 0,
        fs: 1,
        iv_load_policy: 3
      }
    }
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => navigate(`/playlist/${video.playlist?.id}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
            <span>Exit Focus Mode</span>
          </button>
        </div>
      )}

      <div className={`${focusMode ? 'relative z-10 h-full overflow-y-auto' : ''}`}>
        {!focusMode && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Playlist</span>
          </button>
        )}

        {/* Focus Mode Toggle */}
        {!focusMode && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={toggleFocusMode}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span>Enable Focus Mode</span>
            </button>
          </div>
        )}

        <div className={`grid grid-cols-1 ${focusMode ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6 ${focusMode ? 'max-w-7xl mx-auto p-6' : ''}`}>
          {/* Video Player Section */}
          <div className={`${focusMode ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-4`}>
            <div className="bg-black rounded-xl overflow-hidden aspect-video relative">
              {!canWatchVideo ? (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">🔒 Video Locked</h3>
                    <p className="text-gray-300 mb-4">
                      Complete the previous video to unlock this one!
                    </p>
                    <button
                      onClick={() => navigate(`/playlist/${video.playlist.id}`)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Playlist
                    </button>
                  </div>
                </div>
              ) : (
                <ReactPlayer
                  url={video?.url}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                  config={playerConfig}
                  onEnded={handleVideoEnd}
                />
              )}
              
              {/* Video Ended Overlay */}
              {videoEnded && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Video Completed! 🎉</h3>
                    <p className="text-gray-300 mb-6">Great job! Ready for the next one?</p>
                    {currentVideoIndex < playlistVideos.length - 1 ? (
                      <button
                        onClick={handleNextVideo}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                      >
                        <SkipForward className="w-5 h-5" />
                        <span>Next Video</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(-1)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Back to Playlist
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className={`card ${focusMode ? 'bg-gray-800 text-white' : ''}`}>
              <h2 className={`text-2xl font-bold mb-2 ${focusMode ? 'text-white' : 'text-gray-800'}`}>
                {video?.title}
              </h2>
              <p className={`mb-4 ${focusMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {video?.channel}
              </p>
              
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

          {/* Notes & Pomodoro Section */}
          <div className="space-y-4">
            {/* Pomodoro Timer (Focus Mode) */}
            {focusMode && (
              <PomodoroTimer onSessionComplete={() => toast.success('Session complete! Take a break.')} />
            )}
            
            {/* Notes Section */}
            <div className={`card ${focusMode ? 'bg-gray-800' : ''}`}>
              <h3 className={`text-xl font-bold mb-4 ${focusMode ? 'text-white' : 'text-gray-800'}`}>
                {editingNote ? 'Edit Note' : 'Take Notes'}
              </h3>
              
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                className={`textarea-field mb-4 ${focusMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
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
            <div className={`card ${focusMode ? 'bg-gray-800' : ''}`}>
              <h3 className={`text-xl font-bold mb-4 ${focusMode ? 'text-white' : 'text-gray-800'}`}>
                Saved Notes ({notes.length})
              </h3>
              
              {notes.length === 0 ? (
                <p className={`text-sm text-center py-4 ${focusMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No notes yet. Start taking notes!
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className={`p-4 rounded-lg group ${focusMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm mb-2 whitespace-pre-wrap ${focusMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${focusMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditNote(note)}
                            className={`p-1 rounded ${focusMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-blue-50'}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className={`p-1 rounded ${focusMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-red-50'}`}
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

      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border-4 border-green-400 animate-bounce-in">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 animate-pulse">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <PartyPopper className="w-8 h-8 text-purple-500 inline-block ml-2 animate-bounce" />
            </div>
            
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-4">
              🎉 Congratulations! 🎉
            </h2>
            
            <p className="text-xl text-gray-700 mb-2 font-semibold">
              You've completed the entire playlist!
            </p>
            
            <p className="text-gray-600 mb-6">
              {video?.playlist?.title}
            </p>
            
            <div className="bg-white rounded-lg p-4 mb-4 shadow-inner">
              <p className="text-3xl font-bold text-green-600 mb-1">
                {playlistVideos.length}
              </p>
              <p className="text-sm text-gray-600">Videos Completed</p>
            </div>

            {/* Certificate Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6 border-2 border-yellow-300">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Award className="w-6 h-6 text-orange-600" />
                <p className="font-bold text-gray-800">🎁 Your Reward!</p>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                You've earned a certificate of completion!
              </p>
              <button
                onClick={() => window.open(achievement?.certificateUrl || '#', '_blank')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 font-semibold shadow-md flex items-center justify-center space-x-2 w-full"
              >
                <Download className="w-5 h-5" />
                <span>Download Certificate</span>
              </button>
            </div>
            
            <p className="text-gray-700 mb-6 italic text-sm">
              "Great job on your learning journey! Keep up the excellent work! 🚀"
            </p>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => navigate(`/playlist/${video.playlist.id}`)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                Back to Playlist
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoPlayerEnhanced
