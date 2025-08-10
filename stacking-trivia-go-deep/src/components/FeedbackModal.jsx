import { useState, useEffect } from 'react'

const FeedbackModal = ({ isOpen, onClose, stackTitle, onSubmitFeedback }) => {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [category, setCategory] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmitFeedback({ 
      stackTitle, 
      rating, 
      feedback, 
      category,
      timestamp: new Date().toISOString()
    })
    setRating(0)
    setFeedback('')
    setCategory('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            🎉 You completed "{stackTitle}"!
          </h3>
          <p className="text-gray-600">Help us improve the experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How was this trivia stack?
            </label>
            <div className="flex justify-center space-x-1">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= rating ? 'text-yellow-500' : 'text-gray-300'
                  } hover:text-yellow-400`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What should we focus on? (optional)
            </label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select focus area...</option>
              <option value="questions-too-easy">Questions too easy</option>
              <option value="questions-too-hard">Questions too hard</option>
              <option value="more-questions">Need more questions</option>
              <option value="better-explanations">Better explanations</option>
              <option value="different-topics">Different topics</option>
              <option value="technical-issues">Technical issues</option>
            </select>
          </div>

          {/* Open Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any other thoughts? (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did you love? What could be better?"
              className="w-full p-2 border rounded-md h-20 resize-none"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{feedback.length}/200</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FeedbackModal
