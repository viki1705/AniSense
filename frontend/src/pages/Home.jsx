import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Compass, Sparkles } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  const features = [
    { icon: MessageSquare, title: 'Natural Language', desc: 'Ask in your own words' },
    { icon: Sparkles, title: 'AI-Powered', desc: 'Powered by advanced AI' },
    { icon: Compass, title: 'Discover', desc: 'Find your next favorite' },
  ]

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <div className="text-7xl">🎌</div>
          <h1 className="text-5xl md:text-6xl font-bold gradient-text">AniSense</h1>
          <p className="text-xl text-secondary max-w-2xl">
            Your AI-Powered Anime Discovery Assistant
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          <button
            onClick={() => navigate('/chat')}
            className="px-8 py-3 bg-accent-purple hover:bg-accent-cyan text-white font-bold rounded-lg transition"
          >
            Start Exploring →
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="px-8 py-3 border-2 border-accent-purple hover:bg-accent-purple/10 text-white font-bold rounded-lg transition"
          >
            Browse Anime
          </button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="glass-morphism p-6 rounded-xl text-center space-y-3"
            >
              <feature.icon className="mx-auto text-accent-cyan" size={32} />
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-secondary text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
