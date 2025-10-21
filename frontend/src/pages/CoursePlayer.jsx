import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { 
  ChevronLeft, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Plus, 
  Star, 
  Check, 
  Clock,
  Play
} from 'lucide-react';

const CoursePlayer = () => {
  // State management
  const [isWideMode, setIsWideMode] = useState(false);
  const [videoScale, setVideoScale] = useState(1);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'rating'
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [externalLinks, setExternalLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  
  const playerRef = useRef(null);

  // Sample course data (replace with API data)
  const courseData = {
    title: "Complete Angular 19 Course",
    videos: [
      {
        id: 1,
        title: "Angular 19 tutorial in Hindi # 1 Introduction | Why learn angular | #angular19",
        duration: "7:30",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        completed: true
      },
      {
        id: 2,
        title: "Angular Setup and Installation",
        duration: "12:45",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        completed: false
      },
      {
        id: 3,
        title: "Components and Templates",
        duration: "18:20",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        completed: false
      },
      {
        id: 4,
        title: "Data Binding and Directives",
        duration: "15:30",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        completed: false
      },
      {
        id: 5,
        title: "Services and Dependency Injection",
        duration: "20:15",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        completed: false
      },
      {
        id: 6,
        title: "Routing and Navigation",
        duration: "16:40",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        completed: false
      }
    ]
  };

  const currentVideo = courseData.videos[currentVideoIndex];

  // Handlers
  const handleZoomIn = () => {
    setVideoScale(prev => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setVideoScale(prev => Math.max(prev - 0.1, 0.7));
  };

  const handleVideoSelect = (index) => {
    setCurrentVideoIndex(index);
  };

  const handleSaveNotes = async () => {
    try {
      // API call to save notes
      // await axios.post('/api/notes', { videoId: currentVideo.id, notes, links: externalLinks });
      alert('Notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      setExternalLinks([...externalLinks, { url: newLink, name: `Link ${externalLinks.length + 1}` }]);
      setNewLink('');
    }
  };

  const handleSubmitRating = async () => {
    try {
      // API call to submit rating
      // await axios.post('/api/ratings', { videoId: currentVideo.id, rating, comment });
      alert('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const calculateProgress = () => {
    const completed = courseData.videos.filter(v => v.completed).length;
    return Math.round((completed / courseData.videos.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{courseData.title}</h1>
              <p className="text-sm text-gray-500">Course Progress</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Progress:</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-blue-600">{calculateProgress()}%</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="flex gap-6">
          {/* Left Section - Video Player & Notes */}
          <div className={`transition-all duration-300 ${isWideMode ? 'w-full' : 'w-[70%]'}`}>
            {/* Video Player Container */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Video Controls Bar */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWideMode(!isWideMode)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    {isWideMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    {isWideMode ? 'Normal Mode' : 'Wide Mode'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 mr-2">Zoom:</span>
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    disabled={videoScale <= 0.7}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[45px] text-center">
                    {Math.round(videoScale * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    disabled={videoScale >= 1.5}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="bg-black flex items-center justify-center p-4">
                <div 
                  style={{ 
                    transform: `scale(${videoScale})`,
                    transition: 'transform 0.3s ease'
                  }}
                  className="w-full"
                >
                  <ReactPlayer
                    ref={playerRef}
                    url={currentVideo.url}
                    width="100%"
                    height="500px"
                    controls
                    config={{
                      youtube: {
                        playerVars: {
                          autoplay: 0,
                          modestbranding: 1,
                          rel: 0,
                          showinfo: 0
                        }
                      }
                    }}
                    progressInterval={1000}
                  />
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {currentVideo.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {currentVideo.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    <span>Lesson {currentVideoIndex + 1} of {courseData.videos.length}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'notes'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    My Notes
                  </button>
                  <button
                    onClick={() => setActiveTab('rating')}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'rating'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Rating
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Write your notes here..."
                        className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* External Links */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        External Resources
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newLink}
                          onChange={(e) => setNewLink(e.target.value)}
                          placeholder="Add Google Drive link, PDF, or Notes URL..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleAddLink}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                      
                      {externalLinks.length > 0 && (
                        <div className="space-y-2">
                          {externalLinks.map((link, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-700 flex-1 truncate">{link.url}</span>
                              <button
                                onClick={() => setExternalLinks(externalLinks.filter((_, i) => i !== index))}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleSaveNotes}
                      className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Notes
                    </button>
                  </div>
                )}

                {activeTab === 'rating' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Rate this class
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= (hoverRating || rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        {rating > 0 && (
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {rating} out of 5
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Share your thoughts (optional)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you think about this lesson?"
                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSubmitRating}
                      disabled={rating === 0}
                      className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Submit Rating
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Playlist */}
          {!isWideMode && (
            <div className="w-[30%]">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                  <h3 className="text-white font-semibold">Course Content</h3>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {courseData.videos.length} lessons
                  </p>
                </div>

                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  {courseData.videos.map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoSelect(index)}
                      className={`w-full text-left p-4 border-b border-gray-100 transition-colors ${
                        index === currentVideoIndex
                          ? 'bg-blue-50 border-l-4 border-l-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          video.completed
                            ? 'bg-green-100'
                            : index === currentVideoIndex
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                        }`}>
                          {video.completed ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium mb-1 line-clamp-2 ${
                            index === currentVideoIndex ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{video.duration}</span>
                            {video.completed && (
                              <span className="ml-auto text-green-600 font-medium">Completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
