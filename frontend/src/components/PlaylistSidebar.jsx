import { useState } from 'react'
import { CheckCircle, Circle, ChevronDown, ChevronRight, Play } from 'lucide-react'

function PlaylistSidebar({ playlist, videos, currentVideoId, onVideoSelect }) {
  const [expandedModules, setExpandedModules] = useState({})

  // Group videos by module (you can customize this logic)
  const groupVideosByModule = () => {
    const modules = {}
    videos.forEach((video, index) => {
      const moduleNum = Math.floor(index / 5) + 1 // 5 videos per module
      const moduleName = `Module ${String(moduleNum).padStart(2, '0')}`
      if (!modules[moduleName]) {
        modules[moduleName] = []
      }
      modules[moduleName].push(video)
    })
    return modules
  }

  const modules = groupVideosByModule()

  const toggleModule = (moduleName) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }))
  }

  const getStatusIcon = (video) => {
    if (video.status === 'COMPLETED') {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    } else if (video.id === currentVideoId) {
      return <Play className="w-4 h-4 text-blue-600" />
    } else {
      return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-slate-800 text-sm">{playlist?.title}</h2>
        <p className="text-xs text-gray-500 mt-1">{videos.length} lectures</p>
      </div>

      {/* Modules List */}
      <div className="py-2">
        {Object.entries(modules).map(([moduleName, moduleVideos], moduleIndex) => (
          <div key={moduleName} className="border-b border-gray-100">
            {/* Module Header */}
            <button
              onClick={() => toggleModule(moduleName)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                {expandedModules[moduleName] ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-sm font-medium text-slate-800">{moduleName}</span>
              </div>
              <span className="text-xs text-gray-500">
                {moduleVideos.filter(v => v.status === 'COMPLETED').length}/{moduleVideos.length}
              </span>
            </button>

            {/* Module Videos */}
            {expandedModules[moduleName] && (
              <div className="bg-gray-50">
                {moduleVideos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => onVideoSelect(video)}
                    className={`w-full px-4 py-3 pl-10 flex items-start space-x-3 hover:bg-gray-100 transition-colors border-l-4 ${
                      video.id === currentVideoId
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(video)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm ${
                        video.id === currentVideoId
                          ? 'font-semibold text-blue-600'
                          : video.status === 'COMPLETED'
                          ? 'text-gray-500'
                          : 'text-slate-800'
                      }`}>
                        {video.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{video.duration || '5:30'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlaylistSidebar
