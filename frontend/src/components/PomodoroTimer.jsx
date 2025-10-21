import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

function PomodoroTimer({ onSessionComplete }) {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [studyTime, setStudyTime] = useState(25)
  const [breakTime, setBreakTime] = useState(5)
  
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    // Create audio element for notification
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGGS57OihUBELTKXh8bllHgU2jdXvyXkpBSh+zPDajz0JE1y06+qnVBIKRp/g8r5sIQUrgs/y2Yk2BxhkuezooVARC0yl4fG5ZR4FNo3V78l5KQUofszw2o89CRNctOvqp1QSCkaf4PK+bCEFK4LO8tmJNgcYZLns6KFQEQtMpeHxuWUeBTaN1e/JeSkFKH7M8NqPPQkTXLTr6qdUEgpGn+DyvmwhBSuCzvLZiTYHGGS57OihUBELTKXh8bllHgU2jdXvyXkpBSh+zPDajz0JE1y06+qnVBIKRp/g8r5sIQUrgs7y2Yk2Bxhkuezoo')
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleSessionEnd()
          } else {
            setMinutes(minutes - 1)
            setSeconds(59)
          }
        } else {
          setSeconds(seconds - 1)
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, minutes, seconds])

  const handleSessionEnd = () => {
    setIsActive(false)
    
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
    
    if (isBreak) {
      toast.success('Break time over! Ready to study?', { duration: 5000 })
      setIsBreak(false)
      setMinutes(studyTime)
      setSeconds(0)
    } else {
      toast.success('Study session complete! Take a break.', { duration: 5000 })
      setIsBreak(true)
      setMinutes(breakTime)
      setSeconds(0)
      if (onSessionComplete) {
        onSessionComplete()
      }
    }
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsBreak(false)
    setMinutes(studyTime)
    setSeconds(0)
  }

  const applySettings = () => {
    setMinutes(isBreak ? breakTime : studyTime)
    setSeconds(0)
    setIsActive(false)
    setShowSettings(false)
    toast.success('Timer settings updated!')
  }

  const formatTime = (mins, secs) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = isBreak
    ? ((breakTime * 60 - (minutes * 60 + seconds)) / (breakTime * 60)) * 100
    : ((studyTime * 60 - (minutes * 60 + seconds)) / (studyTime * 60)) * 100

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-blue-900">
          {isBreak ? '☕ Break Time' : '📚 Study Session'}
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-blue-700" />
        </button>
      </div>

      {showSettings ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Study Time (minutes)
            </label>
            <input
              type="number"
              value={studyTime}
              onChange={(e) => setStudyTime(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Break Time (minutes)
            </label>
            <input
              type="number"
              value={breakTime}
              onChange={(e) => setBreakTime(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="60"
            />
          </div>
          <button
            onClick={applySettings}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply Settings
          </button>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-blue-900 mb-2">
              {formatTime(minutes, seconds)}
            </div>
            <div className="text-sm text-blue-700">
              {isActive ? 'In Progress' : 'Paused'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-blue-200 rounded-full h-3 mb-6 overflow-hidden">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleTimer}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start</span>
                </>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center space-x-2 bg-blue-200 text-blue-900 px-6 py-3 rounded-lg hover:bg-blue-300 transition-colors font-medium"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 text-center text-sm text-blue-700">
            <p>Study: {studyTime} min • Break: {breakTime} min</p>
          </div>
        </>
      )}
    </div>
  )
}

export default PomodoroTimer
