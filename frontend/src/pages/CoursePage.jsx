import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn, ZoomOut, CheckCircle, Circle, Play } from 'lucide-react'
import ReactPlayer from 'react-player/youtube'
import NotesTab from '../components/NotesTab'
import RatingTab from '../components/RatingTab'
import { getPlaylist, getVideosByPlaylist, getVideo, updateVideoStatus } from '../utils/api'
import toast from 'react-hot-toast'

function CoursePage({ user }) {
  const { playlistId, videoId } = useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState(null)
  const [videos, setVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('notes') // 'notes' or 'rating'
  const [wideMode, setWideMode] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100) // 100 = normal, 125 = zoomed in, 75 = zoomed out

  useEffect(() => {
    fetchPlaylistData()
  }, [playlistId])

  useEffect(() => {
    if (videoId && videos.length > 0) {
      fetchCurrentVideo()
    }
  }, [videoId, videos])

  const fetchPlaylistData = async () => {
    try {
      const [playlistRes, videosRes] = await Promise.all([
        getPlaylist(playlistId),
        getVideosByPlaylist(playlistId)
      ])
      setPlaylist(playlistRes.data)
      setVideos(videosRes.data)
    } catch (error) {
      toast.error('Failed to fetch playlist data')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentVideo = async () => {
    try {
      const response = await getVideo(videoId)
      setCurrentVideo(response.data)
      
      const index = videos.findIndex(v => v.id === parseInt(videoId))
      setCurrentVideoIndex(index)

      // Auto-update status to WATCHING
      if (response.data.status === 'TO_WATCH') {
        await updateVideoStatus(videoId, 'WATCHING')
      }
    } catch (error) {
      toast.error('Failed to fetch video data')
    }
  }

  const handleVideoSelect = (video) => {
    navigate(`/course/${playlistId}/video/${video.id}`)
  }

  const handleVideoEnd = async () => {
    try {
      await updateVideoStatus(videoId, 'COMPLETED')
      toast.success('Video completed!')
      
      // Auto-play next video
      if (currentVideoIndex < videos.length - 1) {
        setTimeout(() => {
          handleNextVideo()
        }, 1500)
      } else {
        toast.success('🎉 Course completed!')
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      const prevVideo = videos[currentVideoIndex - 1]
      navigate(`/course/${playlistId}/video/${prevVideo.id}`)
    }
  }

  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      const nextVideo = videos[currentVideoIndex + 1]
      navigate(`/course/${playlistId}/video/${nextVideo.id}`)
    }
  }

  const toggleWideMode = () => {
    setWideMode(!wideMode)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 150))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 75))
  }

  const getStatusIcon = (video) => {
    if (video.status === 'COMPLETED') {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    } else if (video.id === parseInt(videoId)) {
      return <Play className="w-4 h-4 text-blue-600" />
    } else {
      return <Circle className="w-4 h-4 text-gray-400" />
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content Area - 70% (or 100% in wide mode) */}
      <div className={`${wideMode ? 'w-full' : 'w-[70%]'} overflow-y-auto transition-all duration-300`}>
        <div className="max-w-6xl mx-auto p-6">
          {/* Video Player */}
          {currentVideo && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-800">{currentVideo.title}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentVideo.channel} • {currentVideo.duration}
                  </p>
                </div>
                
                {/* Video Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 75}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">{zoomLevel}%</span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 150}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleWideMode}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-2"
                    title={wideMode ? 'Exit Wide Mode' : 'Wide Mode'}
                  >
                    {wideMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div 
                className="bg-black rounded-lg overflow-hidden transition-all duration-300" 
                style={{ 
                  aspectRatio: '16/9',
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                  width: `${100 / (zoomLevel / 100)}%`
                }}
              >
                <ReactPlayer
                  url={currentVideo.url}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                  config={playerConfig}
                  onEnded={handleVideoEnd}
                />
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'notes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveTab('rating')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'rating'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Rating
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            {activeTab === 'notes' ? (
              <NotesTab videoId={parseInt(videoId)} user={user} />
            ) : (
              <RatingTab videoId={parseInt(videoId)} user={user} />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pb-8">
            <button
              onClick={handlePreviousVideo}
              disabled={currentVideoIndex === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Previous</span>
            </button>

            <div className="text-sm text-gray-600">
              {currentVideoIndex + 1} / {videos.length}
            </div>

            <button
              onClick={handleNextVideo}
              disabled={currentVideoIndex === videos.length - 1}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Playlist (30%) - Hidden in wide mode */}
      {!wideMode && (
        <div className="w-[30%] bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="font-semibold text-slate-800">Course Content</h2>
            <p className="text-xs text-gray-500 mt-1">{playlist?.title}</p>
            <p className="text-xs text-gray-500">{videos.length} lectures</p>
          </div>

          {/* Video List */}
          <div className="p-2">
            {videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => handleVideoSelect(video)}
                className={`w-full p-3 mb-2 rounded-lg text-left transition-colors border-l-4 ${
                  video.id === parseInt(videoId)
                    ? 'bg-blue-50 border-blue-600'
                    : 'bg-white border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(video)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      video.id === parseInt(videoId)
                        ? 'text-blue-600'
                        : video.status === 'COMPLETED'
                        ? 'text-gray-500'
                        : 'text-slate-800'
                    }`}>
                      {index + 1}. {video.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{video.duration || '5:30'}</p>
                    {video.status === 'COMPLETED' && (
                      <span className="text-xs text-green-600 font-medium">Completed</span>
                    )}
                    {video.status === 'WATCHING' && video.id !== parseInt(videoId) && (
                      <span className="text-xs text-blue-600 font-medium">In Progress</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CoursePage
