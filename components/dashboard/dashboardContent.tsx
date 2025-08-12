// components/dashboard/DashboardContent.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark, Folder, Users, TrendingUp, Clock, Share2, Plus } from 'lucide-react';
import { CreateWorkspaceDrawer } from '@/components/workspace/create-workspace-drawer';
import { useBookmarkCreation } from '@/components/bookmark-creation-provider';
import type { DashboardStats } from '@/app/api/dashboard/stats/route';

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
  const { openBookmarkDialog } = useBookmarkCreation();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data: DashboardStats = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl p-6 border animate-pulse" style={{ backgroundColor: '#080808', borderColor: '#000000' }}>
              <div className="h-20 bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
        <div className="text-center py-8" style={{ color: '#f2f2f2' }}>
          Loading dashboard data...
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !dashboardData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8" style={{ color: '#f2f2f2' }}>
          {error || 'Failed to load dashboard data'}
        </div>
      </div>
    );
  }

  const { totalBookmarks, collections, sharedBookmarks, weeklyBookmarks, recentBookmarks, topCollections } = dashboardData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookmarks"
          value={totalBookmarks}
          icon={<Bookmark className="w-5 h-5" />}
        />
        <StatCard
          title="Collections"
          value={collections}
          icon={<Folder className="w-5 h-5" />}
        />
        <StatCard
          title="Shared Bookmarks"
          value={sharedBookmarks}
          icon={<Share2 className="w-5 h-5" />}
        />
        <StatCard
          title="This Week"
          value={weeklyBookmarks}
          icon={<Clock className="w-5 h-5" />}
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
              <a 
                href="/bookmarks"
                className="text-sm hover:text-white transition-colors"
                style={{ color: '#f2f2f2' }}
              >
                View all
              </a>
            </div>
          </div>
          <div className="p-6 space-y-2">
            {recentBookmarks.length > 0 ? (
              recentBookmarks.map((bookmark) => (
                <RecentBookmark 
                  key={bookmark.id} 
                  title={bookmark.title}
                  url={bookmark.url}
                  collection={bookmark.folder?.name || 'Unsorted'}
                  timeAgo={formatTimeAgo(bookmark.createdAt)}
                />
              ))
            ) : (
              <div className="text-center py-8" style={{ color: '#f2f2f2' }}>
                <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No bookmarks yet</p>
                <p className="text-xs mt-1">Create your first bookmark to get started</p>
              </div>
            )}
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
            {topCollections.length > 0 ? (
              topCollections.map((collection) => (
                <div key={collection.id} className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 border rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#000000', borderColor: '#020202' }}
                  >
                    <Folder className="w-5 h-5" style={{ color: '#ffffff' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{collection.name}</p>
                    <p className="text-xs" style={{ color: '#f2f2f2' }}>{collection.count} bookmark{collection.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8" style={{ color: '#f2f2f2' }}>
                <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No collections yet</p>
                <p className="text-xs mt-1">Organize your bookmarks into collections</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          className="p-6 rounded-xl hover:bg-[#f2f2f2] transition-all duration-200"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
          onClick={() => openBookmarkDialog()}
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