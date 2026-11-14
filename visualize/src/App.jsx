'use client';

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, MapPin, Building2, GraduationCap, HeartPulse,
  Landmark, ShieldAlert, FileText, ChevronRight, Filter,
  Phone, Mail, Globe, CheckCircle2, AlertCircle, Copy, ExternalLink,
  Layers, Database, Compass, ArrowLeft, RefreshCw, Sun, Moon,
  Folder, HardDrive
} from 'lucide-react'

export default function App() {
  const [overview, setOverview] = useState(null)
  const [searchIndex, setSearchIndex] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('explorer')
  const [categoryQuery, setCategoryQuery] = useState('')
  const [expandedCat, setExpandedCat] = useState(null)
  const [selectedDiv, setSelectedDiv] = useState('')
  const [selectedDist, setSelectedDist] = useState('')
  const [selectedUpz, setSelectedUpz] = useState('')
  const [upzData, setUpzData] = useState(null)
  const [upzLoading, setUpzLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('education')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCategory, setSearchCategory] = useState('All')
  const [activeModalItem, setActiveModalItem] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Dark / Light Mode state (SSR-safe for Next.js static export)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('bd_theme') : null
    if (saved) setIsDark(saved === 'dark')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isDark) {
      document.documentElement.classList.add('dark')
      window.localStorage.setItem('bd_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      window.localStorage.setItem('bd_theme', 'light')
    }
  }, [isDark])

  // Load initial metadata
  useEffect(() => {
    async function loadInitial() {
      try {
        const ovRes = await fetch('/data/overview.json')
        const ovData = await ovRes.json()
        setOverview(ovData)

        // Default to first division > district > upazila (or Dhaka > Dhaka > Savar)
        const firstDiv = ovData.hierarchy['Dhaka'] ? 'Dhaka' : Object.keys(ovData.hierarchy)[0]
        const firstDist = ovData.hierarchy[firstDiv]?.districts['Dhaka'] ? 'Dhaka' : Object.keys(ovData.hierarchy[firstDiv]?.districts || {})[0]
        const firstUpz = ovData.hierarchy[firstDiv]?.districts[firstDist]?.upazilas[0] || 'Savar'
        setSelectedDiv(firstDiv)
        setSelectedDist(firstDist)
        setSelectedUpz(firstUpz)

        // Fetch search index in background
        fetch('/data/search_index.json')
          .then(res => res.json())
          .then(data => setSearchIndex(data))
          .catch(err => console.error("Search index load error:", err))

        setLoading(false)
      } catch (err) {
        console.error("Failed to load overview data:", err)
        setLoading(false)
      }
    }
    loadInitial()
  }, [])

  // Load selected upazila data
  useEffect(() => {
    if (!selectedDiv || !selectedDist || !selectedUpz) return

    async function loadUpz() {
      setUpzLoading(true)
      const slug = `${slugify(selectedDiv)}__${slugify(selectedDist)}__${slugify(selectedUpz)}`
      try {
        const res = await fetch(`/data/upazilas/${slug}.json`)
        if (res.ok) {
          const data = await res.json()
          setUpzData(data)
        } else {
          setUpzData(null)
        }
      } catch (e) {
        console.error("Error loading upazila details:", e)
        setUpzData(null)
      } finally {
        setUpzLoading(false)
      }
    }
    loadUpz()
  }, [selectedDiv, selectedDist, selectedUpz])

  function slugify(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  }

  function handleCopy(text, id) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter search results
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return []
    const q = searchQuery.toLowerCase().trim()
    return searchIndex
      .filter(item => {
        if (searchCategory !== 'All' && item.category !== searchCategory) return false
        return (
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.bn_name && item.bn_name.includes(q)) ||
          (item.upazila && item.upazila.toLowerCase().includes(q)) ||
          (item.district && item.district.toLowerCase().includes(q)) ||
          (item.details && item.details.toLowerCase().includes(q)) ||
          (item.meta && item.meta.toLowerCase().includes(q))
        )
      })
      .slice(0, 50)
  }, [searchQuery, searchCategory, searchIndex])

  if (loading || !overview) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center text-slate-700 dark:text-zinc-300">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400 mb-4" />
        <h2 className="text-xl font-bold">Loading Bangladesh Public Database...</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">Indexing 50,000+ public records across 64 districts</p>
      </div>
    )
  }

  const { hierarchy } = overview
  const currentDivData = hierarchy[selectedDiv] || {}
  const districtList = currentDivData.districts ? Object.keys(currentDivData.districts) : []
  const currentDistData = currentDivData.districts ? currentDivData.districts[selectedDist] : null
  const upazilaList = currentDistData ? currentDistData.upazilas : []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl drop-shadow">🇧🇩</span>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                  Bangladesh Public Database
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/50">
                  Division &gt; District &gt; Upazila
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Searchable open repository for Education, Healthcare, Banking, Emergency, and Land
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Metrics */}
            <div className="hidden xl:flex items-center space-x-3 text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong>8</strong> Divisions</span>
              </div>
              <div><strong>64</strong> Districts</div>
              <div><strong>494</strong> Upazilas</div>
              <div><strong>{overview?.stats?.total_categories || 22}</strong> Categories</div>
              <div><strong>{(overview?.stats?.total_land_khatians || 93953).toLocaleString()}</strong> Khatians</div>
              <div><strong>{((overview?.stats?.total_mouza_maps || 226157) / 1000).toFixed(0)}K+</strong> Mouza Maps (2.33 TB)</div>
            </div>

            {/* External Mirror & Repo Links */}
            <div className="flex items-center gap-2">
              <a
                href={overview?.stats?.drive_root_url || 'https://drive.google.com/drive/folders/1ObOiGGQXl9B4bodcnDkx7g5yU_dc-Gol'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 transition-all"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Drive Mirror</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://github.com/salman-anik/Bangladesh-Biggest-Public-Database"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 transition-all"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 transition-all shadow-sm"
              title="Toggle Dark / Light Mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mode Switcher Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2.5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('explorer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'explorer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Location Explorer (494 Upazilas)
          </button>
          <button
            onClick={() => setViewMode('categories')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'categories'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            Dataset Categories ({overview?.categories?.length || 22} Folders)
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col gap-6">

        {viewMode === 'categories' ? (
          <div className="space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    All {overview?.categories?.length || 22} Categorized Dataset Folders
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Every category is structured into subfolders with specific JSONs, per-folder <code className="font-mono">README.md</code> indexes on GitHub, and uncompressed folders in Google Drive.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href={overview?.stats?.maps_drive_root_url || 'https://drive.google.com/drive/folders/1sPrrrWXaAsWByTms7Kwcnq230QkZFW4u'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800/50 font-bold"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    2.33 TB Mouza Maps Drive Archive ({(overview?.stats?.total_mouza_maps || 226157).toLocaleString()} files)
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="relative mt-4">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter categories or topics (e.g. governance, agriculture, land, climate, medicine, quran)..."
                  value={categoryQuery}
                  onChange={(e) => setCategoryQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(overview?.categories || [])
                .filter((cat) => {
                  const q = categoryQuery.trim().toLowerCase()
                  if (!q) return true
                  return (
                    cat.name.toLowerCase().includes(q) ||
                    cat.title.toLowerCase().includes(q) ||
                    cat.description.toLowerCase().includes(q) ||
                    (cat.subfolders || []).some((s) => s.name.toLowerCase().includes(q))
                  )
                })
                .map((cat) => {
                  const isExpanded = expandedCat === cat.name
                  return (
                    <div
                      key={cat.name}
                      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-emerald-500/60 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                              /{cat.name}
                            </span>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                              {cat.title}
                            </h3>
                          </div>
                          <div className="text-right text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                            <div><strong className="text-slate-800 dark:text-zinc-200">{cat.total_files.toLocaleString()}</strong> files</div>
                            <div>{cat.total_size_mb} MB</div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                          {cat.description}
                        </p>

                        {/* Subfolders */}
                        {cat.subfolders && cat.subfolders.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                                Subfolders ({cat.total_subfolders})
                              </span>
                              {(cat.subfolders.length > 6 || (cat.root_files && cat.root_files.length > 0)) && (
                                <button
                                  onClick={() => setExpandedCat(isExpanded ? null : cat.name)}
                                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                                >
                                  {isExpanded ? 'Show less' : 'Expand files'}
                                </button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {(isExpanded ? cat.subfolders : cat.subfolders.slice(0, 6)).map((sf) => (
                                <a
                                  key={sf.name}
                                  href={sf.github_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 dark:bg-black dark:hover:bg-emerald-950/60 dark:text-zinc-300 dark:hover:text-emerald-300 border border-slate-200 dark:border-zinc-800 font-mono transition-colors"
                                  title={`${sf.file_count} files in ${cat.name}/${sf.name}`}
                                >
                                  {sf.name}/ ({sf.file_count})
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {isExpanded && cat.root_files && cat.root_files.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 block mb-1.5">
                              JSON Catalogs &amp; Indexes
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.root_files.map((rf) => (
                                <a
                                  key={rf.name}
                                  href={rf.github_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 font-mono"
                                >
                                  {rf.name} ({rf.size_kb} KB)
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                        <a
                          href={cat.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-bold transition-colors"
                        >
                          <Database className="w-3.5 h-3.5" />
                          GitHub Folder
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {cat.drive_folder_url && (
                          <a
                            href={cat.drive_folder_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            Google Drive
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        ) : (
          <>
        {/* Search Bar & Categories */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm dark:shadow-2xl transition-colors">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search anything: School name, EIIN, Hospital, Bank Routing Number, Police station, Postcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-xl pl-11 pr-24 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-md font-medium"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 font-semibold mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['All', 'Education', 'Healthcare', 'Banking', 'Emergency', 'Postal'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  searchCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* If Active Search Results */}
        {searchQuery.trim().length >= 2 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Search Results ({searchResults.length})
              </h2>
              <span className="text-xs text-slate-500 dark:text-zinc-400">Showing top matches for "{searchQuery}"</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-zinc-400">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-400 dark:text-zinc-600 mb-2" />
                <p>No results found for "{searchQuery}".</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Try another keyword, EIIN code, bank name, or district.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveModalItem(item)}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-black dark:hover:bg-zinc-900 border border-slate-200 hover:border-emerald-500 dark:border-zinc-800 hover:dark:border-emerald-500/60 rounded-xl cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-500 truncate max-w-[150px]">
                          {item.district} {item.upazila ? `> ${item.upazila}` : ''}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 line-clamp-1">{item.name}</h4>
                      {item.bn_name && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-['Noto_Sans_Bengali'] line-clamp-1">{item.bn_name}</p>
                      )}
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 line-clamp-1 font-mono">{item.details}</p>
                    </div>
                    {item.meta && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-2 truncate pt-2 border-t border-slate-200 dark:border-zinc-800/80">
                        {item.meta}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Normal Hierarchy Navigation & Details View */
          <>
            {/* Cascading Hierarchy Selector */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm dark:shadow-2xl transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">Select Administrative Location</h2>
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400">
                  Folder Path: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{selectedDiv} &gt; {selectedDist} &gt; {selectedUpz}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Division */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                    1. Division
                  </label>
                  <select
                    value={selectedDiv}
                    onChange={(e) => {
                      const newDiv = e.target.value
                      setSelectedDiv(newDiv)
                      const dists = Object.keys(hierarchy[newDiv]?.districts || {})
                      const firstDist = dists[0] || ''
                      setSelectedDist(firstDist)
                      const firstUpz = hierarchy[newDiv]?.districts[firstDist]?.upazilas[0] || ''
                      setSelectedUpz(firstUpz)
                    }}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                  >
                    {Object.keys(hierarchy).map((div) => (
                      <option key={div} value={div}>
                        {div} ({hierarchy[div].bn_name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                    2. District
                  </label>
                  <select
                    value={selectedDist}
                    onChange={(e) => {
                      const newDist = e.target.value
                      setSelectedDist(newDist)
                      const firstUpz = hierarchy[selectedDiv]?.districts[newDist]?.upazilas[0] || ''
                      setSelectedUpz(firstUpz)
                    }}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                  >
                    {districtList.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist} ({hierarchy[selectedDiv]?.districts[dist]?.bn_name || ''})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upazila */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                    3. Upazila (Upozilla)
                  </label>
                  <select
                    value={selectedUpz}
                    onChange={(e) => setSelectedUpz(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                  >
                    {upazilaList.map((upz) => (
                      <option key={upz} value={upz}>
                        {upz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Upazila Overview Card & Stats */}
            {upzLoading ? (
              <div className="py-12 text-center text-slate-500 dark:text-zinc-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
                <p>Loading records for {selectedUpz}...</p>
              </div>
            ) : upzData ? (
              <div className="space-y-6">
                {/* Header Banner for Upazila */}
                <div className="bg-gradient-to-r from-emerald-50 via-white to-slate-50 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-black border border-emerald-300 dark:border-emerald-500/30 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-wrap items-center justify-between gap-4 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                      <span>{selectedDiv}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
                      <span>{selectedDist}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
                      <span className="font-bold">{selectedUpz}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {selectedUpz} Upazila
                      {upzData.geography?.upazila_bn && (
                        <span className="ml-2 font-['Noto_Sans_Bengali'] text-emerald-700 dark:text-emerald-400 font-normal text-xl">
                          ({upzData.geography.upazila_bn})
                        </span>
                      )}
                    </h2>
                    {upzData.geography?.official_url && (
                      <a
                        href={`http://${upzData.geography.official_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 inline-flex items-center gap-1 mt-1 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        http://{upzData.geography.official_url}
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 shadow-sm">
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{upzData.stats.education_count}</div>
                      <div className="text-[10px] uppercase text-slate-500 dark:text-zinc-400 font-bold tracking-wider">Schools & Colleges</div>
                    </div>
                    <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 shadow-sm">
                      <div className="text-lg font-black text-sky-600 dark:text-sky-400">{upzData.stats.healthcare_count}</div>
                      <div className="text-[10px] uppercase text-slate-500 dark:text-zinc-400 font-bold tracking-wider">Hospitals</div>
                    </div>
                    <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 shadow-sm">
                      <div className="text-lg font-black text-amber-600 dark:text-amber-400">{upzData.stats.banking_count}</div>
                      <div className="text-[10px] uppercase text-slate-500 dark:text-zinc-400 font-bold tracking-wider">Bank Branches</div>
                    </div>
                    <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 shadow-sm">
                      <div className="text-lg font-black text-purple-600 dark:text-purple-400">{upzData.stats.unions_count}</div>
                      <div className="text-[10px] uppercase text-slate-500 dark:text-zinc-400 font-bold tracking-wider">Unions</div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap border-b border-slate-200 dark:border-zinc-800 gap-2">
                  {[
                    { id: 'education', label: `Education (${upzData.stats.education_count})`, icon: GraduationCap },
                    { id: 'healthcare', label: `Healthcare (${upzData.stats.healthcare_count})`, icon: HeartPulse },
                    { id: 'banking', label: `Banking (${upzData.stats.banking_count})`, icon: Landmark },
                    { id: 'emergency', label: 'Emergency & Admin', icon: ShieldAlert },
                    { id: 'geography', label: `Unions & Postcodes (${upzData.stats.unions_count})`, icon: MapPin },
                    { id: 'land', label: `Land & Mouza Maps (${upzData.stats.land_khatians_count || 0})`, icon: FileText },
                    { id: 'governance', label: 'Governance & Portals', icon: Building2 }
                  ].map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
                          isActive
                            ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 dark:border-emerald-500 dark:text-emerald-400 dark:bg-zinc-900/60'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Tab 1: Education */}
                {activeTab === 'education' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-500 dark:text-zinc-400">
                      Standard Path: <code className="text-emerald-700 dark:text-emerald-400 font-mono bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">database/education/{selectedDiv}/{selectedDist}/{selectedUpz}/</code>
                    </div>
                    {upzData.education.length === 0 ? (
                      <div className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-center text-slate-500 dark:text-zinc-400">
                        No registered institutions found in this upazila folder.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {upzData.education.map((inst, i) => (
                          <div
                            key={i}
                            onClick={() => setActiveModalItem({
                              category: 'Education',
                              name: inst.name,
                              bn_name: inst.name_bn,
                              type: inst.type,
                              details: `EIIN: ${inst.eiin} | Level: ${inst.level}`,
                              meta: `Category: ${inst.category} | Teachers: ${inst.teacher_count || 0}`,
                              phone: inst.mobile,
                              email: inst.email
                            })}
                            className="p-4 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all flex flex-col justify-between shadow-sm"
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="font-mono bg-slate-100 dark:bg-black px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-400 font-bold border border-slate-200 dark:border-zinc-800">
                                  EIIN {inst.eiin}
                                </span>
                                <span className="text-[11px] text-slate-600 dark:text-zinc-400 capitalize bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-medium">
                                  {inst.category ? inst.category.replace(/_/g, ' ') : inst.type}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{inst.name}</h4>
                              {inst.name_bn && (
                                <p className="text-xs text-slate-500 dark:text-zinc-400 font-['Noto_Sans_Bengali'] line-clamp-1 mt-0.5">{inst.name_bn}</p>
                              )}
                              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2">Level: <span className="text-slate-800 dark:text-zinc-200 font-medium">{inst.level}</span></p>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                              <span>Teachers: <strong className="text-slate-800 dark:text-white">{inst.teacher_count || 0}</strong></span>
                              {inst.mobile && (
                                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-mono font-bold">
                                  <Phone className="w-3 h-3" /> {inst.mobile}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Healthcare */}
                {activeTab === 'healthcare' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-500 dark:text-zinc-400">
                      Standard Path: <code className="text-emerald-700 dark:text-emerald-400 font-mono bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">database/healthcare/divisions/{selectedDiv}/{selectedDist}/{slugify(selectedUpz)}.json</code>
                    </div>
                    {upzData.healthcare.length === 0 ? (
                      <div className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-center text-slate-500 dark:text-zinc-400">
                        No hospital facilities registered directly under this upazila name. Check District General Hospital.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {upzData.healthcare.map((h, i) => (
                          <div
                            key={i}
                            onClick={() => setActiveModalItem({
                              category: 'Healthcare',
                              name: h.name,
                              bn_name: h.bn_name,
                              type: h.category || 'Hospital',
                              details: `Beds: ${h.bed_capacity} | Type: ${h.type}`,
                              meta: h.address,
                              phone: h.emergency_hotline || h.telephone,
                              extra: `ICU: ${h.icu_available ? 'Available' : 'No'} | Ambulance: ${h.ambulance_available ? 'Available' : 'No'}`
                            })}
                            className="p-4 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl cursor-pointer transition-all flex flex-col justify-between shadow-sm"
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-400 font-bold text-[11px]">
                                  {h.type || 'Hospital'}
                                </span>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                  {h.bed_capacity ? `${h.bed_capacity} Beds` : ''}
                                </span>
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{h.name}</h4>
                              {h.bn_name && (
                                <p className="text-xs text-slate-500 dark:text-zinc-400 font-['Noto_Sans_Bengali'] mt-0.5">{h.bn_name}</p>
                              )}
                              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 line-clamp-1">{h.address}</p>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                              <div className="flex gap-1.5">
                                {h.icu_available && (
                                  <span className="text-[10px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 px-1.5 py-0.5 rounded font-extrabold">ICU</span>
                                )}
                                {h.ambulance_available && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0.5 rounded font-extrabold">Ambulance</span>
                                )}
                              </div>
                              {(h.emergency_hotline || h.telephone) && (
                                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-mono font-bold">
                                  <Phone className="w-3 h-3" /> {h.emergency_hotline || h.telephone}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Banking */}
                {activeTab === 'banking' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-500 dark:text-zinc-400">
                      Standard Path: <code className="text-emerald-700 dark:text-emerald-400 font-mono bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">database/banking/divisions/{selectedDiv}/{selectedDist}/{slugify(selectedUpz)}.json</code>
                    </div>
                    {upzData.banking.length === 0 ? (
                      <div className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-center text-slate-500 dark:text-zinc-400">
                        No branches indexed under this specific upazila name.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {upzData.banking.map((b, i) => (
                          <div
                            key={i}
                            onClick={() => setActiveModalItem({
                              category: 'Banking',
                              name: `${b.bank_name} - ${b.branch_name}`,
                              type: b.bank_name,
                              details: `Routing No: ${b.routing_number} | Swift: ${b.swift_code || 'N/A'}`,
                              meta: b.address,
                              phone: b.telephone,
                              email: b.email
                            })}
                            className="p-4 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl cursor-pointer transition-all flex flex-col justify-between shadow-sm"
                          >
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                {b.bank_name}
                              </span>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{b.branch_name}</h4>
                              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 line-clamp-2">{b.address}</p>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-500 block font-bold">ROUTING NUMBER</span>
                                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{b.routing_number}</span>
                              </div>
                              {b.telephone && (
                                <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1 font-mono text-[11px]">
                                  <Phone className="w-3 h-3" /> {b.telephone}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 4: Emergency */}
                {activeTab === 'emergency' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-500 dark:text-zinc-400">
                      Standard Path: <code className="text-emerald-700 dark:text-emerald-400 font-mono bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">database/emergency/divisions/{selectedDiv}/{selectedDist}/{slugify(selectedUpz)}.json</code>
                    </div>

                    {/* National Hotlines Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { name: 'National Emergency', num: '999', desc: 'Police, Fire, Ambulance' },
                        { name: 'Govt Services', num: '333', desc: 'Citizen Info' },
                        { name: 'Legal Aid', num: '16430', desc: 'National Legal Aid' },
                        { name: 'Child Helpline', num: '1098', desc: 'Child Protection' },
                        { name: 'Women Helpline', num: '109', desc: 'Repression Prevention' }
                      ].map((hl, i) => (
                        <div key={i} className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 rounded-xl text-center shadow-sm">
                          <div className="text-xl font-black text-red-600 dark:text-red-400 font-mono">{hl.num}</div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{hl.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{hl.desc}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Police Stations */}
                      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Police Stations
                        </h3>
                        {upzData.emergency.police_stations && upzData.emergency.police_stations.length > 0 ? (
                          <div className="space-y-2.5">
                            {upzData.emergency.police_stations.map((p, idx) => (
                              <div key={idx} className="p-3 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800/80">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h4>
                                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">{p.address}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                  {p.oc_mobile && (
                                    <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">OC: {p.oc_mobile}</span>
                                  )}
                                  {p.duty_officer && (
                                    <span className="text-slate-600 dark:text-zinc-300 font-mono">Duty: {p.duty_officer}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Contact District Police Control Room for assistance.</p>
                        )}
                      </div>

                      {/* District Administration */}
                      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" /> District Administration ({selectedDist})
                        </h3>
                        {upzData.emergency.district_administration ? (
                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 bg-slate-50 dark:bg-black rounded-lg">
                              <span className="text-slate-500 dark:text-zinc-400 block font-bold">DC Office:</span>
                              <span className="text-slate-800 dark:text-white font-mono">{upzData.emergency.district_administration.dc_office || 'Available via district portal'}</span>
                            </div>
                            <div className="p-2.5 bg-slate-50 dark:bg-black rounded-lg">
                              <span className="text-slate-500 dark:text-zinc-400 block font-bold">SP Office:</span>
                              <span className="text-slate-800 dark:text-white font-mono">{upzData.emergency.district_administration.sp_office || 'Available via district portal'}</span>
                            </div>
                            <div className="p-2.5 bg-slate-50 dark:bg-black rounded-lg">
                              <span className="text-slate-500 dark:text-zinc-400 block font-bold">Civil Surgeon Office:</span>
                              <span className="text-slate-800 dark:text-white font-mono">{upzData.emergency.district_administration.civil_surgeon_office || 'Available via district portal'}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">District administration info loading...</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 5: Geography & Unions */}
                {activeTab === 'geography' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-500 dark:text-zinc-400">
                      Standard Path: <code className="text-emerald-700 dark:text-emerald-400 font-mono bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">database/geography/divisions/{selectedDiv}/{selectedDist}/{selectedUpz}/info.json</code>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Unions */}
                      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Unions in {selectedUpz} ({upzData.geography?.unions?.length || 0})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                          {(upzData.geography?.unions || []).map((u, idx) => (
                            <div key={idx} className="p-2 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800/80 text-xs">
                              <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                              {u.bn_name && (
                                <div className="text-slate-500 dark:text-zinc-400 font-['Noto_Sans_Bengali']">{u.bn_name}</div>
                              )}
                              {u.url && (
                                <a
                                  href={`http://${u.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate block mt-1 hover:underline"
                                >
                                  {u.url}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Postal Codes */}
                      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Post Offices &amp; Postal Codes
                        </h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                          {(upzData.geography?.postal_codes || []).map((pc, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">{pc.sub_office}</span>
                                {pc.sub_office_bn && (
                                  <span className="text-slate-500 dark:text-zinc-400 ml-2 font-['Noto_Sans_Bengali']">{pc.sub_office_bn}</span>
                                )}
                              </div>
                              <span className="font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded font-extrabold border border-emerald-300 dark:border-emerald-800">
                                {pc.postcode}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 6: Land Khatians, Mouzas & 2.33 TB Google Drive Mouza Maps */}
                {activeTab === 'land' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-500 dark:text-zinc-400 flex flex-wrap items-center gap-2">
                      <span>Standard Path:</span>
                      <code className="text-emerald-700 dark:text-emerald-400 font-mono bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
                        land/khatians/{selectedDiv}/{selectedDist}/
                      </code>
                      <span>•</span>
                      <code className="text-sky-700 dark:text-sky-400 font-mono bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
                        {upzData.land?.maps?.catalog_github_path || `land/maps/${selectedDiv}/`}
                      </code>
                    </div>

                    {/* Top Metrics + Google Drive Mouza Map Action Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">Digitized Khatians</h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            Survey Khatians (BS, RS, CS, SA) for {selectedUpz}.
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {(upzData.land?.khatian_count ?? upzData.stats.land_khatians_count ?? 0).toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-slate-500 dark:text-zinc-500 uppercase font-bold">Khatians</span>
                        </div>
                      </div>

                      <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">Indexed Mouzas</h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            {upzData.land?.mouza_scope === 'district' ? `District-wide (${selectedDist})` : `Upazila Mouzas (${selectedUpz})`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black text-sky-600 dark:text-sky-400 font-mono">
                            {(upzData.land?.mouza_count ?? 0).toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-slate-500 dark:text-zinc-500 uppercase font-bold">Mouza Entries</span>
                        </div>
                      </div>

                      <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">Mouza Maps Archive</h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            {upzData.land?.maps?.district_total_gb
                              ? `${upzData.land.maps.district_total_gb} GB (${upzData.land.maps.district_uploaded_maps || 0} synced)`
                              : `${selectedDiv} Division Maps`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                            {(upzData.land?.maps?.district_total_maps || 0).toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-slate-500 dark:text-zinc-500 uppercase font-bold">PDF/JPG/TIF</span>
                        </div>
                      </div>
                    </div>

                    {/* Google Drive & GitHub Links Banner */}
                    <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-700 dark:text-zinc-300">
                        <strong className="text-emerald-800 dark:text-emerald-400 block text-sm">Large Mouza Map PDFs Hosted on Google Drive (2.33 TB Archive)</strong>
                        Direct uncompressed folder access for {selectedDist}, {selectedDiv} without hitting GitHub size limits.
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {upzData.land?.maps?.district_drive_url && (
                          <a
                            href={upzData.land.maps.district_drive_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            Open {selectedDist} Maps (Drive)
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {upzData.land?.maps?.division_drive_url && (
                          <a
                            href={upzData.land.maps.division_drive_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 text-xs font-bold transition-colors"
                          >
                            <Folder className="w-3.5 h-3.5" />
                            {selectedDiv} Drive Folder
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {upzData.land?.maps?.catalog_github_path && (
                          <a
                            href={`https://github.com/salman-anik/Bangladesh-Biggest-Public-Database/blob/main/${upzData.land.maps.catalog_github_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 text-xs font-bold transition-colors"
                          >
                            <Database className="w-3.5 h-3.5" />
                            Map Catalog JSON
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Sample Khatians & Sample Mouzas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                          Sample Digitized Khatians ({upzData.land?.sample_khatians?.length || 0} shown)
                        </h4>
                        {upzData.land?.sample_khatians && upzData.land.sample_khatians.length > 0 ? (
                          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                            {upzData.land.sample_khatians.map((k, idx) => (
                              <div key={idx} className="p-2.5 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                    Khatian #{k.khatian_no} ({k.survey || 'Survey'})
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                                    JL: {k.jl_no || '-'} | {k.total_land || '-'} ac
                                  </span>
                                </div>
                                <div className="font-['Noto_Sans_Bengali'] text-slate-800 dark:text-zinc-200 mt-1">
                                  Mouza: {k.mouza_name}
                                </div>
                                {k.owners && (
                                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-['Noto_Sans_Bengali'] line-clamp-2 mt-0.5">
                                    {k.owners}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            No digitized sample khatians indexed for this exact upazila name; browse <code className="font-mono">land/khatians/</code> on GitHub or Drive.
                          </p>
                        )}
                      </div>

                      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                          Mouza Registry Sample ({upzData.land?.sample_mouzas?.length || 0} shown)
                        </h4>
                        {upzData.land?.sample_mouzas && upzData.land.sample_mouzas.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
                            {upzData.land.sample_mouzas.map((m, idx) => (
                              <div key={idx} className="p-2 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
                                <div className="font-bold text-slate-900 dark:text-white font-['Noto_Sans_Bengali'] truncate">
                                  {m.mouza_name}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono flex items-center justify-between mt-0.5">
                                  <span>JL: {m.jl_no || '-'}</span>
                                  <span>{m.survey || ''}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-zinc-400">No mouza list cached for this upazila.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 7: Governance & Portals */}
                {activeTab === 'governance' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-500 dark:text-zinc-400 flex flex-wrap items-center gap-2">
                      <span>Standard Path:</span>
                      <code className="text-emerald-700 dark:text-emerald-400 font-mono bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
                        governance/divisions/{selectedDiv}/{selectedDist}/{selectedUpz}.json
                      </code>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm">
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {upzData.governance?.parliamentary_constituencies?.length || 0}
                        </div>
                        <div className="text-[11px] uppercase text-slate-500 dark:text-zinc-400 font-bold">Parliament Seats ({selectedDist})</div>
                      </div>
                      <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm">
                        <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
                          {upzData.governance?.union_portals_count || upzData.stats.unions_count || 0}
                        </div>
                        <div className="text-[11px] uppercase text-slate-500 dark:text-zinc-400 font-bold">Union Portals</div>
                      </div>
                      <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm">
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                          {upzData.governance?.key_ministries_count || 15}
                        </div>
                        <div className="text-[11px] uppercase text-slate-500 dark:text-zinc-400 font-bold">Key Ministries</div>
                      </div>
                      <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm">
                        <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                          {upzData.governance?.statutory_bodies_count || 10}
                        </div>
                        <div className="text-[11px] uppercase text-slate-500 dark:text-zinc-400 font-bold">Statutory Bodies</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Web Portals & Parliamentary Constituencies */}
                      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Official Portals &amp; Constituencies
                        </h3>
                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-slate-500 dark:text-zinc-400 font-bold">UNO / Upazila Portal:</span>
                            {upzData.governance?.upazila_portal ? (
                              <a
                                href={upzData.governance.upazila_portal.startsWith('http') ? upzData.governance.upazila_portal : `http://${upzData.governance.upazila_portal}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 dark:text-emerald-400 font-mono font-bold hover:underline flex items-center gap-1"
                              >
                                {upzData.governance.upazila_portal} <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400 font-mono">N/A</span>
                            )}
                          </div>
                          <div className="p-2.5 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-slate-500 dark:text-zinc-400 font-bold">District Portal:</span>
                            {upzData.governance?.district_portal ? (
                              <a
                                href={upzData.governance.district_portal.startsWith('http') ? upzData.governance.district_portal : `http://${upzData.governance.district_portal}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-700 dark:text-sky-400 font-mono font-bold hover:underline flex items-center gap-1"
                              >
                                {upzData.governance.district_portal} <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400 font-mono">N/A</span>
                            )}
                          </div>
                        </div>

                        {upzData.governance?.parliamentary_constituencies && upzData.governance.parliamentary_constituencies.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-500 block mb-2">
                              Parliamentary Constituencies in {selectedDist}
                            </span>
                            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                              {upzData.governance.parliamentary_constituencies.map((seat, idx) => (
                                <div key={idx} className="p-2 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between">
                                  <div>
                                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold mr-2">#{seat.seat_number || seat.code}</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{seat.name?.en || seat.name}</span>
                                    {seat.name?.bn && (
                                      <span className="ml-2 font-['Noto_Sans_Bengali'] text-slate-500 dark:text-zinc-400">({seat.name.bn})</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* District Administration & Citizen e-Services */}
                      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          District Administration &amp; Citizen e-Services
                        </h3>
                        {upzData.governance?.administration && (
                          <div className="space-y-2 text-xs">
                            {['dc_office', 'sp_office', 'civil_surgeon_office'].map((k) => {
                              const obj = upzData.governance.administration[k]
                              if (!obj) return null
                              const text = typeof obj === 'string'
                                ? obj
                                : [obj.title, obj.phone, obj.email].filter(Boolean).join(' • ')
                              return (
                                <div key={k} className="p-2.5 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">
                                    {k.replace(/_/g, ' ')}
                                  </span>
                                  <span className="font-mono text-slate-800 dark:text-zinc-200">{text}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {upzData.governance?.citizen_services && upzData.governance.citizen_services.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-500 block mb-2">
                              Citizen e-Services ({upzData.governance.citizen_services.length})
                            </span>
                            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                              {upzData.governance.citizen_services.map((svc, idx) => (
                                <div key={idx} className="p-2 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">{svc.service_name}</span>
                                    {svc.helpline && (
                                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-bold">
                                        {svc.helpline}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                    {svc.agency} • {svc.portal}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <AlertCircle className="w-8 h-8 text-slate-400 dark:text-zinc-600 mx-auto mb-2" />
                <p>No bundled records for this upazila.</p>
              </div>
            )}
          </>
        )}
          </>
        )}
      </main>

      {/* Modal for Entity Details */}
      {activeModalItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative transition-colors">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg bg-slate-100 dark:bg-zinc-800"
            >
              ✕
            </button>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
              {activeModalItem.category}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{activeModalItem.name}</h3>
            {activeModalItem.bn_name && (
              <p className="text-sm text-slate-500 dark:text-zinc-400 font-['Noto_Sans_Bengali']">{activeModalItem.bn_name}</p>
            )}

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                {activeModalItem.details}
              </div>
              {activeModalItem.meta && (
                <div className="p-3 bg-slate-50 dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Address / Meta:</span>
                  {activeModalItem.meta}
                </div>
              )}
              {activeModalItem.phone && (
                <div className="p-3 bg-slate-50 dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-slate-700 dark:text-zinc-300">
                  <span>Phone: <strong className="text-slate-900 dark:text-white font-mono">{activeModalItem.phone}</strong></span>
                  <button
                    onClick={() => handleCopy(activeModalItem.phone, 'phone')}
                    className="text-xs bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1 rounded text-emerald-700 dark:text-emerald-400 font-bold"
                  >
                    {copiedId === 'phone' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
              {activeModalItem.email && (
                <div className="p-3 bg-slate-50 dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                  Email: <strong className="text-slate-900 dark:text-white">{activeModalItem.email}</strong>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-black py-4 text-center text-xs text-slate-500 dark:text-zinc-500 transition-colors">
        <p>Bangladesh Open Data Visualizer • Built with Next.js &amp; Tailwind CSS • Open Source Public Datasets &amp; 2.33 TB Google Drive Mirror</p>
      </footer>
    </div>
  )
}
