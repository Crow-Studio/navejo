// components/dashboard/DashboardContent.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark, Folder, Users, TrendingUp, Clock, Share2, Plus } from 'lucide-react';
import { CreateWorkspaceDrawer } from '@/components/workspace/create-workspace-drawer';
import { useBookmarkCreation } from '@/components/bookmark-creation-provider';
import type { DashboardStats } from '@/app/api/dashboard/stats/route';

interface DashboardContentProps {
  className?: string;
  workspaceId?: string;
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
    <div className="rounded-xl p-6 border hover:bg-gray-800 transition-colors bg-gray-900 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 border rounded-lg bg-gray-800 border-gray-600">
          <div className="text-white">{icon}</div>
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
        <p className="text-sm text-gray-300">{title}</p>
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
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
      <div className="w-8 h-8 border rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-800 border-gray-600">
        <Bookmark className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-white">{title}</p>
        <div className="flex items-center space-x-2 text-xs text-gray-300">
          <span>{collection}</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

const DashboardContent: React.FC<DashboardContentProps> = ({ className = "", workspaceId }) => {
  const { openBookmarkDialog } = useBookmarkCreation();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  // Fetch dashboard data with caching
  const fetchDashboardData = React.useCallback(async (_forceRefresh = false) => {
    const now = Date.now();

    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (workspaceId) {
        params.append('workspaceId', workspaceId);
      }
      
      const response = await fetch(`/api/dashboard/stats?${params.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data: DashboardStats = await response.json();
      setDashboardData(data);
      setLastFetch(now);
      
      // Store in localStorage for offline access (with workspace key)
      try {
        const cacheKey = workspaceId ? `dashboard-cache-${workspaceId}` : 'dashboard-cache';
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: now
        }));
      } catch {
        // Ignore localStorage errors
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      
      // Try to load from cache if available
      try {
        const cacheKey = workspaceId ? `dashboard-cache-${workspaceId}` : 'dashboard-cache';
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if ((now - timestamp) < (24 * 60 * 60 * 1000)) { // 24 hours max for offline cache
            setDashboardData(cachedData);
            setError('Using cached data (offline)');
          }
        }
      } catch (e) {
        // Ignore cache errors
      }
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]); // Only depend on workspaceId

  // Load dashboard data on mount and when workspace changes
  useEffect(() => {
    // Reset state when workspace changes
    setDashboardData(null);
    setIsLoading(true);
    setError(null);
    setLastFetch(0);

    // Try to load from cache first for instant display
    try {
      const cacheKey = workspaceId ? `dashboard-cache-${workspaceId}` : 'dashboard-cache';
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if ((now - timestamp) < CACHE_DURATION) {
          setDashboardData(cachedData);
          setLastFetch(timestamp);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Ignore cache errors
    }

    fetchDashboardData();
  }, [workspaceId, CACHE_DURATION, fetchDashboardData]); // Only depend on workspaceId to avoid infinite loops

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

  // Show loading state with skeleton
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl p-6 border animate-pulse bg-gray-900 border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookmarks Skeleton */}
          <div className="lg:col-span-2 rounded-xl border bg-gray-900 border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Collections Skeleton */}
          <div className="rounded-xl border bg-gray-900 border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="h-6 bg-gray-700 rounded w-28 animate-pulse"></div>
            </div>
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 rounded-xl border animate-pulse bg-gray-900 border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-700 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-3 bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
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
        <div className="lg:col-span-2 rounded-xl border bg-gray-900 border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Bookmarks</h3>
              <a 
                href="/bookmarks"
                className="text-sm text-gray-300 hover:text-white transition-colors"
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
              <div className="text-center py-8 text-gray-300">
                <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No bookmarks yet</p>
                <p className="text-xs mt-1 text-gray-400">Create your first bookmark to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Collections */}
        <div className="rounded-xl border bg-gray-900 border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Top Collections</h3>
          </div>
          <div className="p-6 space-y-4">
            {topCollections.length > 0 ? (
              topCollections.map((collection) => (
                <div key={collection.id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 border rounded-lg flex items-center justify-center bg-gray-800 border-gray-600">
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{collection.name}</p>
                    <p className="text-xs text-gray-300">{collection.count} bookmark{collection.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-300">
                <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No collections yet</p>
                <p className="text-xs mt-1 text-gray-400">Organize your bookmarks into collections</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          className="p-6 rounded-xl hover:bg-gray-100 transition-all duration-200 bg-white text-black"
          onClick={() => openBookmarkDialog()}
        >
          <div className="flex items-center space-x-3">
            <Plus className="w-6 h-6 text-black" />
            <div className="text-left">
              <p className="font-semibold text-black">Create Bookmark</p>
              <p className="text-sm text-gray-600">Add a new bookmark</p>
            </div>
          </div>
        </button>

        <button 
          className="border p-6 rounded-xl hover:bg-gray-800 transition-colors bg-gray-900 border-gray-700 text-white"
          onClick={() => window.location.href = '/collections/new'}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Folder className="w-6 h-6 text-white" />
              <Plus className="w-3 h-3 text-white absolute -top-1 -right-1 bg-gray-900 rounded-full" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">New Collection</p>
              <p className="text-sm text-gray-300">Organize your bookmarks</p>
            </div>
          </div>
        </button>

        <CreateWorkspaceDrawer>
          <button 
            className="border p-6 rounded-xl hover:bg-gray-800 transition-colors w-full bg-gray-900 border-gray-700 text-white"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-white" />
              <div className="text-left">
                <p className="font-semibold text-white">Create Organization</p>
                <p className="text-sm text-gray-300">Start collaborating</p>
              </div>
            </div>
          </button>
        </CreateWorkspaceDrawer>
      </div>


    </div>
  );
};

export default DashboardContent;