export default function FranchiseGraph({ franchiseData }) {
  if (!franchiseData) {
    return null
  }

  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-bold gradient-text">{franchiseData.franchise_name}</h2>

      <div className="glass-morphism p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Watch Order</h3>
        <div className="text-secondary whitespace-pre-wrap text-sm">
          {franchiseData.recommended_order}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {franchiseData.anime_list?.slice(0, 10).map((anime, idx) => (
          <div key={idx} className="glass-morphism p-4 rounded-lg">
            <p className="font-semibold text-white">{anime.title}</p>
            <p className="text-sm text-secondary">{anime.genres}</p>
            <p className="text-xs text-secondary mt-2">Rating: {anime.rating?.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
