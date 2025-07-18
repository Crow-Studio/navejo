import Link from "next/link"
import { ArrowUpRight, Bookmark, Search, Folder, Share2, Tag, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import GrainOverlay from "@/components/shared/GrainOverlay"

export default function FeaturesComponent() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <GrainOverlay />
      
      {/* Header Section */}
      <div className="max-w-6xl w-full mb-16 px-4 md:px-0 relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-3xl font-bold leading-tight mb-4">
              Powerful Features for Creative Minds.
            </h1>
            <p className="text-2xl md:text-xl font-medium text-gray-300">
              Everything you need to organize, discover, and share your best links.
            </p>
          </div>
          <Link
            href="#"
            className="flex items-center text-lg text-gray-300 hover:text-white hover:underline transition-colors mt-8 md:mt-0"
          >
            Create Bookmarks
            <ArrowUpRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 w-full max-w-6xl">
          {/* Card 1: Smart Organization (left, tall) */}
          <Card className="relative overflow-hidden rounded-xl border border-[#282420] bg-gray-800/50 p-6 flex flex-col justify-between aspect-[3/4] md:aspect-auto md:h-[500px] md:col-start-1 md:row-start-1 md:row-end-3">
            {/* Background gradient */}
            <div
              className="absolute inset-0 z-0 opacity-70"
              style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)" }}
            ></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center mb-4">
                <Folder className="h-8 w-8 text-gray-400 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-200">Smart Organization</h2>
              </div>
              <p className="text-lg text-gray-300 mb-auto">
                Automatically categorize your bookmarks with AI-powered tags and folders. 
                Never lose track of your valuable links again.
              </p>
              <div className="mt-auto space-y-2">
                <div className="flex items-center text-sm text-gray-400">
                  <Tag className="h-4 w-4 mr-2" />
                  <span>Auto-tagging</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Folder className="h-4 w-4 mr-2" />
                  <span>Smart folders</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Search className="h-4 w-4 mr-2" />
                  <span>Instant search</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Navejo Brand (top middle) */}
          <Card className="relative overflow-hidden rounded-xl border border-[#282420] bg-gray-800/50 p-6 flex flex-col justify-between aspect-[3/4] md:aspect-auto md:h-[238px] md:col-start-2 md:row-start-1">
            <div
              className="absolute inset-0 z-0 opacity-70"
              style={{ background: "linear-gradient(135deg, #080808ff 0%, #000000 50%, #b0a090 100%)" }}
            ></div>
            <div className="relative z-10 flex flex-col h-full justify-end">
              <div className="flex items-center mb-2">
                <Bookmark className="h-8 w-8 text-white mr-3" />
                <h2 className="text-3xl font-bold text-gray-50">Navejo</h2>
              </div>
              <p className="text-lg text-gray-300">BOOKMARKING REIMAGINED</p>
            </div>
          </Card>

          {/* Card 3: Lightning Fast (bottom middle) */}
          <Card className="relative overflow-hidden rounded-xl border border-[#282420] bg-gray-800/50 p-6 flex flex-col justify-between aspect-[3/4] md:aspect-auto md:h-[238px] md:col-start-2 md:row-start-2">
            <div
              className="absolute inset-0 z-0 opacity-70"
              style={{ background: "linear-gradient(135deg, #010407ff 0%, #080808ff 50%, #505252ff 100%)" }}
            ></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-auto">
                <div className="flex items-center">
                  <Zap className="h-6 w-6 text-gray-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-200">Lightning Fast</h2>
                </div>
                <ArrowUpRight className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-lg text-gray-300 mt-auto">
                Save bookmarks in seconds with our browser extension and keyboard shortcuts.
              </p>
            </div>
          </Card>

          {/* Card 4: Collaboration (right, tall) */}
          <Card className="relative overflow-hidden rounded-xl border border-[#282420] bg-gray-800/50 p-6 flex flex-col justify-between aspect-[3/4] md:aspect-auto md:h-[500px] md:col-start-3 md:row-start-1 md:row-end-3">
            <div
              className="absolute inset-0 z-0 opacity-70"
              style={{ background: "linear-gradient(135deg, #010407ff 0%, #080808ff 50%, #0e0f0fff 100%)" }}
            ></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center mb-4">
                <Share2 className="h-6 w-6 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-200">Team Collaboration</h2>
              </div>
              <p className="text-lg font-medium mb-auto text-gray-300">
                Share collections with your team, collaborate on research projects, and 
                discover new resources together. Perfect for design teams and developers.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <span>Shared workspaces</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <span>Real-time sync</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <span>Permission controls</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-auto  text-white border-gray-400 hover:bg-white/10 hover:text-white bg-transparent"
              >
                Start Collaborating
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}