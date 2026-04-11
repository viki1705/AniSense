import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useUser } from '../contexts/UserContext'

// Import step components
import WelcomeStep from '../components/onboarding/WelcomeStep'
import GenreStep from '../components/onboarding/GenreStep'
import ThemeStep from '../components/onboarding/ThemeStep'
import CompletionStep from '../components/onboarding/CompletionStep'

const STEPS = [
  { component: WelcomeStep, title: 'Welcome to AniSense', showProgress: false },
  { component: GenreStep, title: 'Choose Your Favorite Genres', showProgress: true },
  { component: ThemeStep, title: 'Select Themes You Enjoy', showProgress: true },
  { component: CompletionStep, title: 'All Set!', showProgress: true },
]

function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState({
    user_id: null,
    username: '',
    genres: [],
    themes: [],
  })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { completeOnboarding } = useUser()

  // Generate unique user ID on first load
  useEffect(() => {
    if (!userData.user_id) {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setUserData((prev) => ({ ...prev, user_id: userId }))
    }
  }, [userData.user_id])

  const handleStepChange = async (newData) => {
    setSaving(true)
    try {
      // Save step data to backend
      if (currentStep === 0) {
        // Welcome step - create user
        await axios.post('http://localhost:8000/api/users/onboarding/start', {
          user_id: newData.user_id,
          username: newData.username,
        })
      } else if (currentStep === 1) {
        // Genre step
        await axios.post('http://localhost:8000/api/users/onboarding/genres', {
          user_id: newData.user_id,
          genres: newData.genres,
        })
      } else if (currentStep === 2) {
        // Theme step
        await axios.post('http://localhost:8000/api/users/onboarding/themes', {
          user_id: newData.user_id,
          themes: newData.themes,
        })
      }

      setUserData(newData)
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    } catch (error) {
      console.error('Error saving step:', error)
      alert('Failed to save your preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    completeOnboarding(userData.user_id, userData.username)
    navigate('/dashboard')
  }

  const CurrentStepComponent = STEPS[currentStep].component
  const progress = ((currentStep) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4 py-8">
      {/* Progress Bar */}
      {STEPS[currentStep].showProgress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 h-1 bg-primary-800 z-10"
        >
          <motion.div
            layoutId="progress"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-accent-purple to-accent-pink"
          />
        </motion.div>
      )}

      {/* Step Indicators */}
      {STEPS[currentStep].showProgress && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-8 left-0 right-0 flex justify-center z-20"
        >
          <div className="flex gap-2">
            {STEPS.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8 }}
                animate={{
                  scale: index === currentStep ? 1.2 : 1,
                  backgroundColor:
                    index < currentStep
                      ? '#10b981'
                      : index === currentStep
                        ? '#a78bfa'
                        : '#374151',
                }}
                className="h-2 w-2 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl w-full mt-12">
        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {STEPS[currentStep].title}
            </h1>
            {STEPS[currentStep].showProgress && (
              <p className="text-gray-400">
                Step {currentStep} of {STEPS.length - 1}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepComponent
              data={userData}
              onNext={handleStepChange}
              onBack={handleBack}
              onComplete={handleComplete}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === STEPS.length - 1}
            />
          </motion.div>
        </AnimatePresence>

        {/* Loading Indicator */}
        {saving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-4xl"
            >
              ⏳
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Onboarding

