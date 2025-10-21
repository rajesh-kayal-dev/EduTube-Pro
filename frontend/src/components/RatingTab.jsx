import { useState } from 'react'
import { Star, Send } from 'lucide-react'
import toast from 'react-hot-toast'

function RatingTab({ videoId, user }) {
  const [classRating, setClassRating] = useState(0)
  const [mentorRating, setMentorRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredClassStar, setHoveredClassStar] = useState(0)
  const [hoveredMentorStar, setHoveredMentorStar] = useState(0)

  const handleSubmitFeedback = async () => {
    if (classRating === 0 && mentorRating === 0 && !comment.trim()) {
      toast.error('Please provide at least one rating or comment')
      return
    }

    // TODO: Implement API call to save feedback
    console.log({
      videoId,
      userId: user.id,
      classRating,
      mentorRating,
      comment
    })

    toast.success('Thank you for your feedback!')
    setClassRating(0)
    setMentorRating(0)
    setComment('')
  }

  const StarRating = ({ rating, setRating, hovered, setHovered, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-800 mb-2">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hovered || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <StarRating
        rating={classRating}
        setRating={setClassRating}
        hovered={hoveredClassStar}
        setHovered={setHoveredClassStar}
        label="Rate your class"
      />

      <StarRating
        rating={mentorRating}
        setRating={setMentorRating}
        hovered={hoveredMentorStar}
        setHovered={setHoveredMentorStar}
        label="Rate your mentor"
      />

      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2">
          Would you like to share any other thoughts? <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
          rows="3"
          placeholder="Tell us how we can improve..."
        />
      </div>

      <button
        onClick={handleSubmitFeedback}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
      >
        <Send className="w-4 h-4" />
        <span>Submit Feedback</span>
      </button>
    </div>
  )
}

export default RatingTab
