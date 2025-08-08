// components/dashboard/DashboardContent.tsx
'use client';

import React from 'react';
import { Bookmark, Folder, Users, TrendingUp, Clock, Share2, Plus } from 'lucide-react';
import { CreateWorkspaceDrawer } from '@/components/workspace/create-workspace-drawer';

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
    <div 
      className="rounded-xl p-6 border hover:bg-[#020202] transition-colors"
      style={{ backgroundColor: '#080808', borderColor: '#000000' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="p-2 border rounded-lg"
          style={{ backgroundColor: '#000000', borderColor: '#020202' }}
        >
          <div style={{ color: '#ffffff' }}>{icon}</div>
        </div>
        {trend && (
          <div className="flex items-center text-xs" style={{ color: trendUp ? '#ffffff' : '#f2f2f2' }}>
            <TrendingUp className={`w-3 h-3 mr-1 ${!trendUp && 'rotate-180'}`} />
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-semibold" style={{ color: '#ffffff' }}>{value}</p>
        <p className="text-sm" style={{ color: '#f2f2f2' }}>{title}</p>
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
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#020202] transition-colors">
      <div 
        className="w-8 h-8 border rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#000000', borderColor: '#020202' }}
      >
        <Bookmark className="w-4 h-4" style={{ color: '#ffffff' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: '#ffffff' }}>{title}</p>
        <div className="flex items-center space-x-2 text-xs" style={{ color: '#f2f2f2' }}>
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
    { name: "React Resources", count: 45 },
    { name: "CSS & Design", count: 32 },
    { name: "Development Tools", count: 28 },
    { name: "UI/UX Inspiration", count: 24 }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookmarks"
          value={stats.totalBookmarks}
          icon={<Bookmark className="w-5 h-5" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Collections"
          value={stats.collections}
          icon={<Folder className="w-5 h-5" />}
          trend="+2"
          trendUp={true}
        />
        <StatCard
          title="Shared Bookmarks"
          value={stats.sharedBookmarks}
          icon={<Share2 className="w-5 h-5" />}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="This Week"
          value={stats.weeklyBookmarks}
          icon={<Clock className="w-5 h-5" />}
          trend="-3%"
          trendUp={false}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookmarks */}
        <div 
          className="lg:col-span-2 rounded-xl border"
          style={{ backgroundColor: '#080808', borderColor: '#000000' }}
        >
          <div className="p-6 border-b" style={{ borderColor: '#000000' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Recent Bookmarks</h3>
              <button 
                className="text-sm hover:text-white transition-colors"
                style={{ color: '#f2f2f2' }}
              >
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
        <div 
          className="rounded-xl border"
          style={{ backgroundColor: '#080808', borderColor: '#000000' }}
        >
          <div className="p-6 border-b" style={{ borderColor: '#000000' }}>
            <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Top Collections</h3>
          </div>
          <div className="p-6 space-y-4">
            {topCollections.map((collection, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 border rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#000000', borderColor: '#020202' }}
                >
                  <Folder className="w-5 h-5" style={{ color: '#ffffff' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{collection.name}</p>
                  <p className="text-xs" style={{ color: '#f2f2f2' }}>{collection.count} bookmarks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          className="p-6 rounded-xl hover:bg-[#f2f2f2] transition-all duration-200"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
        >
          <div className="flex items-center space-x-3">
            <Plus className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold">Create Bookmark</p>
              <p className="text-sm opacity-70">Add a new bookmark</p>
            </div>
          </div>
        </button>

        <button 
          className="border p-6 rounded-xl hover:bg-[#020202] transition-colors"
          style={{ backgroundColor: '#080808', borderColor: '#000000', color: '#ffffff' }}
        >
          <div className="flex items-center space-x-3">
            <Folder className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold">New Collection</p>
              <p className="text-sm" style={{ color: '#f2f2f2' }}>Organize your bookmarks</p>
            </div>
          </div>
        </button>

        <CreateWorkspaceDrawer>
          <button 
            className="border p-6 rounded-xl hover:bg-[#020202] transition-colors w-full"
            style={{ backgroundColor: '#080808', borderColor: '#000000', color: '#ffffff' }}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6" />
              <div className="text-left">
                <p className="font-semibold">Create Organization</p>
                <p className="text-sm" style={{ color: '#f2f2f2' }}>Start collaborating</p>
              </div>
            </div>
          </button>
        </CreateWorkspaceDrawer>
      </div>
    </div>
  );
};

export default DashboardContent;