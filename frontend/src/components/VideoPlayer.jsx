import ReactPlayer from 'react-player/youtube'

function VideoPlayer({ video, onVideoEnd }) {
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

  return (
    <div className="w-full">
      {/* Video Title */}
      <div className="mb-3">
        <h1 className="text-xl font-semibold text-slate-800">{video?.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {video?.channel} • {video?.duration}
        </p>
      </div>

      {/* Video Player */}
      <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <ReactPlayer
          url={video?.url}
          width="100%"
          height="100%"
          controls
          playing={false}
          config={playerConfig}
          onEnded={onVideoEnd}
        />
      </div>
    </div>
  )
}

export default VideoPlayer
