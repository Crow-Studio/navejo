// components/dashboard/DashboardContent.tsx
'use client';

import React from 'react';
import { Bookmark, Folder, Users, TrendingUp, Clock, Share2, Plus } from 'lucide-react';

interface DashboardContentProps {
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${!trendUp && 'rotate-180'}`} />
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
    </div>
  );
};

interface RecentBookmarkProps {
  title: string;
  url: string;
  collection: string;
  timeAgo: string;
}

const RecentBookmark: React.FC<RecentBookmarkProps> = ({ title, collection, timeAgo }) => {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <Bookmark className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span>{collection}</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

const DashboardContent: React.FC<DashboardContentProps> = ({ className = "" }) => {
  // Mock data - replace with real data from your API
  const stats = {
    totalBookmarks: 247,
    collections: 12,
    sharedBookmarks: 34,
    weeklyBookmarks: 18
  };

  const recentBookmarks = [
    {
      title: "React Server Components Guide",
      url: "https://nextjs.org/docs",
      collection: "React Resources",
      timeAgo: "2 hours ago"
    },
    {
      title: "CSS Grid Complete Guide",
      url: "https://css-tricks.com/snippets/css/complete-guide-grid/",
      collection: "CSS & Design",
      timeAgo: "5 hours ago"
    },
    {
      title: "TypeScript Best Practices",
      url: "https://typescript-guide.com",
      collection: "Development",
      timeAgo: "1 day ago"
    },
    {
      title: "Figma Design System Template",
      url: "https://figma.com/template",
      collection: "Design Tools",
      timeAgo: "2 days ago"
    }
  ];

  const topCollections = [
    { name: "React Resources", count: 45, color: "from-blue-500 to-cyan-500" },
    { name: "CSS & Design", count: 32, color: "from-purple-500 to-pink-500" },
    { name: "Development Tools", count: 28, color: "from-green-500 to-emerald-500" },
    { name: "UI/UX Inspiration", count: 24, color: "from-orange-500 to-red-500" }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookmarks"
          value={stats.totalBookmarks}
          icon={<Bookmark className="w-5 h-5 text-blue-400" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Collections"
          value={stats.collections}
          icon={<Folder className="w-5 h-5 text-purple-400" />}
          trend="+2"
          trendUp={true}
        />
        <StatCard
          title="Shared Bookmarks"
          value={stats.sharedBookmarks}
          icon={<Share2 className="w-5 h-5 text-green-400" />}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="This Week"
          value={stats.weeklyBookmarks}
          icon={<Clock className="w-5 h-5 text-orange-400" />}
          trend="-3%"
          trendUp={false}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookmarks */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Bookmarks</h3>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                View all
              </button>
            </div>
          </div>
          <div className="p-6 space-y-2">
            {recentBookmarks.map((bookmark, index) => (
              <RecentBookmark key={index} {...bookmark} />
            ))}
          </div>
        </div>

        {/* Top Collections */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Top Collections</h3>
          </div>
          <div className="p-6 space-y-4">
            {topCollections.map((collection, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${collection.color} rounded-lg flex items-center justify-center`}>
                  <Folder className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{collection.name}</p>
                  <p className="text-xs text-gray-400">{collection.count} bookmarks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-xl text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105">
          <div className="flex items-center space-x-3">
            <Plus className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold">Create Bookmark</p>
              <p className="text-sm opacity-90">Add a new bookmark</p>
            </div>
          </div>
        </button>

        <button className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl text-white hover:bg-white/10 transition-colors">
          <div className="flex items-center space-x-3">
            <Folder className="w-6 h-6 text-purple-400" />
            <div className="text-left">
              <p className="font-semibold">New Collection</p>
              <p className="text-sm text-gray-400">Organize your bookmarks</p>
            </div>
          </div>
        </button>

        <button className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl text-white hover:bg-white/10 transition-colors">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-green-400" />
            <div className="text-left">
              <p className="font-semibold">Invite Team</p>
              <p className="text-sm text-gray-400">Collaborate together</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DashboardContent;