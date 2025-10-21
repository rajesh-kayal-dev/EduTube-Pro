import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import PlaylistSidebar from '../components/PlaylistSidebar'
import VideoPlayer from '../components/VideoPlayer'
import NotesSection from '../components/NotesSection'
import RatingSection from '../components/RatingSection'
import { getPlaylist, getVideosByPlaylist, getVideo, updateVideoStatus } from '../utils/api'
import toast from 'react-hot-toast'

function PlaylistViewPage({ user }) {
  const { playlistId, videoId } = useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState(null)
  const [videos, setVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('notes') // 'notes' or 'rating'

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
    navigate(`/playlist/${playlistId}/video/${video.id}`)
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
        toast.success('🎉 Playlist completed!')
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      const prevVideo = videos[currentVideoIndex - 1]
      navigate(`/playlist/${playlistId}/video/${prevVideo.id}`)
    }
  }

  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      const nextVideo = videos[currentVideoIndex + 1]
      navigate(`/playlist/${playlistId}/video/${nextVideo.id}`)
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
      {/* Left Sidebar */}
      <PlaylistSidebar
        playlist={playlist}
        videos={videos}
        currentVideoId={parseInt(videoId)}
        onVideoSelect={handleVideoSelect}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Close Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
            <span className="text-sm">Close</span>
          </button>

          {/* Video Player */}
          {currentVideo && (
            <VideoPlayer video={currentVideo} onVideoEnd={handleVideoEnd} />
          )}

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
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
          <div className="mt-6">
            {activeTab === 'notes' ? (
              <NotesSection videoId={parseInt(videoId)} user={user} />
            ) : (
              <RatingSection videoId={parseInt(videoId)} user={user} />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pb-8">
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
    </div>
  )
}

export default PlaylistViewPage
