"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface BookmarkParams {
  url?: string
  title?: string
  description?: string
  workspace?: string
  tags?: string
  folder?: string
  private?: string
}

export function useBookmarkUrlParams() {
  const searchParams = useSearchParams()
  const [bookmarkParams, setBookmarkParams] = useState<BookmarkParams>({})
  const [hasParams, setHasParams] = useState(false)

  useEffect(() => {
    const url = searchParams.get('url')
    const title = searchParams.get('title')
    const description = searchParams.get('description')
    const workspace = searchParams.get('workspace')
    const tags = searchParams.get('tags')
    const folder = searchParams.get('folder')
    const privateParam = searchParams.get('private')

    const params: BookmarkParams = {}
    let hasAnyParams = false

    if (url) {
      params.url = decodeURIComponent(url)
      hasAnyParams = true
    }
    if (title) {
      params.title = decodeURIComponent(title)
      hasAnyParams = true
    }
    if (description) {
      params.description = decodeURIComponent(description)
      hasAnyParams = true
    }
    if (workspace) {
      params.workspace = workspace
      hasAnyParams = true
    }
    if (tags) {
      params.tags = decodeURIComponent(tags)
      hasAnyParams = true
    }
    if (folder) {
      params.folder = folder
      hasAnyParams = true
    }
    if (privateParam) {
      params.private = privateParam
      hasAnyParams = true
    }

    setBookmarkParams(params)
    setHasParams(hasAnyParams)
  }, [searchParams])

  const clearParams = () => {
    setBookmarkParams({})
    setHasParams(false)
    // Clear URL parameters without page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('url')
      url.searchParams.delete('title')
      url.searchParams.delete('description')
      url.searchParams.delete('workspace')
      url.searchParams.delete('tags')
      url.searchParams.delete('folder')
      url.searchParams.delete('private')
      window.history.replaceState({}, '', url.toString())
    }
  }

  return {
    bookmarkParams,
    hasParams,
    clearParams
  }
}