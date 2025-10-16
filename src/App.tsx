import { useOrgData } from './hooks/useOrgData'
import { OrgVisualizer } from './components/OrgVisualizer'

function App() {
  const { data, isLoading, error } = useOrgData()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Processing Apple's organizational data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h1>
          <p className="text-gray-600">Failed to load the organizational structure data.</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">No data available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OrgVisualizer
        teams={data.teams}
        topLevelTeams={data.topLevelTeams}
        categories={data.categories}
        metadata={data.metadata}
      />
    </div>
  )
}

export default App
