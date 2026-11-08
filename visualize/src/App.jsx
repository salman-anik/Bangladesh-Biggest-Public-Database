import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, MapPin, Building2, GraduationCap, HeartPulse,
  Landmark, ShieldAlert, FileText, ChevronRight, Filter,
  Phone, Mail, Globe, CheckCircle2, AlertCircle, Copy, ExternalLink,
  Layers, Database, Compass, ArrowLeft, RefreshCw
} from 'lucide-react'

export default function App() {
  const [overview, setOverview] = useState(null)
  const [searchIndex, setSearchIndex] = useState([])
  const [loading, setLoading] = useState(true)
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <h2 className="text-xl font-semibold">Loading Bangladesh Public Database...</h2>
        <p className="text-sm text-slate-500 mt-1">Indexing 50,000+ public records across 64 districts</p>
      </div>
    )
  }

  const { hierarchy, stats } = overview
  const currentDivData = hierarchy[selectedDiv] || {}
  const districtList = currentDivData.districts ? Object.keys(currentDivData.districts) : []
  const currentDistData = currentDivData.districts ? currentDivData.districts[selectedDist] : null
  const upazilaList = currentDistData ? currentDistData.upazilas : []

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🇧🇩</span>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-white tracking-tight">Bangladesh Public Database</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Division &gt; District &gt; Upazila
                </span>
              </div>
              <p className="text-xs text-slate-400">Searchable open repository for Education, Healthcare, Banking, Emergency, and Land</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="hidden lg:flex items-center space-x-5 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span><strong>8</strong> Divisions</span>
            </div>
            <div><strong>64</strong> Districts</div>
            <div><strong>494</strong> Upazilas</div>
            <div><strong>40K+</strong> Schools</div>
            <div><strong>8.7K+</strong> Bank Branches</div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col gap-6">

        {/* Search Bar & Categories */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything: School name, EIIN, Hospital, Bank Routing Number, Police station, Postcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-24 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['All', 'Education', 'Healthcare', 'Banking', 'Emergency', 'Postal'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  searchCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* If Active Search Results */}
        {searchQuery.trim().length >= 2 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-400" />
                Search Results ({searchResults.length})
              </h2>
              <span className="text-xs text-slate-400">Showing top matches for "{searchQuery}"</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p>No results found for "{searchQuery}".</p>
                <p className="text-xs text-slate-500 mt-1">Try another keyword, EIIN code, bank name, or district.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveModalItem(item)}
                    className="p-3.5 bg-slate-950 hover:bg-slate-800/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400">
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-500 truncate max-w-[150px]">
                          {item.district} {item.upazila ? `> ${item.upazila}` : ''}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-100 line-clamp-1">{item.name}</h4>
                      {item.bn_name && (
                        <p className="text-xs text-slate-400 font-['Noto_Sans_Bengali'] line-clamp-1">{item.bn_name}</p>
                      )}
                      <p className="text-xs text-emerald-300/90 mt-2 line-clamp-1 font-mono">{item.details}</p>
                    </div>
                    {item.meta && (
                      <p className="text-[11px] text-slate-500 mt-2 truncate pt-2 border-t border-slate-800/60">
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <h2 className="font-bold text-white text-base">Select Administrative Location</h2>
                </div>
                <div className="text-xs text-slate-400">
                  Navigate folder path: <span className="font-mono text-emerald-400">{selectedDiv} &gt; {selectedDist} &gt; {selectedUpz}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Division */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    1. Division
                  </label>
                  <select
                    value={selectedDiv}
                    onChange={(e) => {
                      const newDiv = e.target.value
                      setSelectedDiv(newDiv)
                      const firstDist = Object.keys(hierarchy[newDiv]?.districts || {})[0] || ''
                      setSelectedDist(firstDist)
                      const firstUpz = hierarchy[newDiv]?.districts[firstDist]?.upazilas[0] || ''
                      setSelectedUpz(firstUpz)
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    3. Upazila (Upozilla)
                  </label>
                  <select
                    value={selectedUpz}
                    onChange={(e) => setSelectedUpz(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-2" />
                <p>Loading records for {selectedUpz}...</p>
              </div>
            ) : upzData ? (
              <div className="space-y-6">
                {/* Header Banner for Upazila */}
                <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400 mb-1">
                      <span>{selectedDiv}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      <span>{selectedDist}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      <span className="font-semibold">{selectedUpz}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">
                      {selectedUpz} Upazila
                      {upzData.geography?.upazila_bn && (
                        <span className="ml-2 font-['Noto_Sans_Bengali'] text-emerald-300 font-normal text-xl">
                          ({upzData.geography.upazila_bn})
                        </span>
                      )}
                    </h2>
                    {upzData.geography?.official_url && (
                      <a
                        href={`http://${upzData.geography.official_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1 mt-1 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        http://{upzData.geography.official_url}
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2">
                      <div className="text-lg font-bold text-emerald-400">{upzData.stats.education_count}</div>
                      <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Schools & Colleges</div>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2">
                      <div className="text-lg font-bold text-sky-400">{upzData.stats.healthcare_count}</div>
                      <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Hospitals</div>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2">
                      <div className="text-lg font-bold text-amber-400">{upzData.stats.banking_count}</div>
                      <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Bank Branches</div>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2">
                      <div className="text-lg font-bold text-purple-400">{upzData.stats.unions_count}</div>
                      <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Unions</div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap border-b border-slate-800 gap-2">
                  {[
                    { id: 'education', label: `Education (${upzData.stats.education_count})`, icon: GraduationCap },
                    { id: 'healthcare', label: `Healthcare (${upzData.stats.healthcare_count})`, icon: HeartPulse },
                    { id: 'banking', label: `Banking (${upzData.stats.banking_count})`, icon: Landmark },
                    { id: 'emergency', label: 'Emergency & Admin', icon: ShieldAlert },
                    { id: 'geography', label: `Unions & Postcodes (${upzData.stats.unions_count})`, icon: MapPin },
                    { id: 'land', label: `Land Khatians (${upzData.stats.land_khatians_count || 0})`, icon: FileText }
                  ].map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                          isActive
                            ? 'border-emerald-500 text-emerald-400 bg-slate-900/50'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
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
                    <div className="text-xs text-slate-400">
                      Folder: <code className="text-emerald-400 font-mono bg-slate-900 px-2 py-0.5 rounded">database/education/{selectedDiv}/{selectedDist}/{selectedUpz}/</code>
                    </div>
                    {upzData.education.length === 0 ? (
                      <div className="p-8 bg-slate-900/60 rounded-xl text-center text-slate-400">
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
                            className="p-4 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl cursor-pointer transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-emerald-400 font-bold">
                                  EIIN {inst.eiin}
                                </span>
                                <span className="text-[11px] text-slate-400 capitalize bg-slate-800/80 px-2 py-0.5 rounded">
                                  {inst.category ? inst.category.replace(/_/g, ' ') : inst.type}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-white line-clamp-1">{inst.name}</h4>
                              {inst.name_bn && (
                                <p className="text-xs text-slate-400 font-['Noto_Sans_Bengali'] line-clamp-1 mt-0.5">{inst.name_bn}</p>
                              )}
                              <p className="text-xs text-slate-400 mt-2">Level: <span className="text-slate-200">{inst.level}</span></p>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
                              <span>Teachers: <strong className="text-white">{inst.teacher_count || 0}</strong></span>
                              {inst.mobile && (
                                <span className="text-emerald-400 flex items-center gap-1 font-mono">
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
                    <div className="text-xs text-slate-400">
                      Folder: <code className="text-emerald-400 font-mono bg-slate-900 px-2 py-0.5 rounded">database/healthcare/divisions/{selectedDiv}/{selectedDist}/{selectedUpz}.json</code>
                    </div>
                    {upzData.healthcare.length === 0 ? (
                      <div className="p-8 bg-slate-900/60 rounded-xl text-center text-slate-400">
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
                            className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl cursor-pointer transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-semibold text-[11px]">
                                  {h.type || 'Hospital'}
                                </span>
                                <span className="text-xs font-semibold text-emerald-400">
                                  {h.bed_capacity ? `${h.bed_capacity} Beds` : ''}
                                </span>
                              </div>
                              <h4 className="font-bold text-white text-sm">{h.name}</h4>
                              {h.bn_name && (
                                <p className="text-xs text-slate-400 font-['Noto_Sans_Bengali'] mt-0.5">{h.bn_name}</p>
                              )}
                              <p className="text-xs text-slate-400 mt-2 line-clamp-1">{h.address}</p>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                              <div className="flex gap-1.5">
                                {h.icu_available && (
                                  <span className="text-[10px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-bold">ICU</span>
                                )}
                                {h.ambulance_available && (
                                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Ambulance</span>
                                )}
                              </div>
                              {(h.emergency_hotline || h.telephone) && (
                                <span className="text-emerald-400 flex items-center gap-1 font-mono font-medium">
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
                    <div className="text-xs text-slate-400">
                      Folder: <code className="text-emerald-400 font-mono bg-slate-900 px-2 py-0.5 rounded">database/banking/divisions/{selectedDiv}/{selectedDist}/{selectedUpz}.json</code>
                    </div>
                    {upzData.banking.length === 0 ? (
                      <div className="p-8 bg-slate-900/60 rounded-xl text-center text-slate-400">
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
                            className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl cursor-pointer transition-all flex flex-col justify-between"
                          >
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                {b.bank_name}
                              </span>
                              <h4 className="font-bold text-white text-sm mt-0.5">{b.branch_name}</h4>
                              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{b.address}</p>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 block">ROUTING NUMBER</span>
                                <span className="font-mono text-emerald-400 font-bold">{b.routing_number}</span>
                              </div>
                              {b.telephone && (
                                <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
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
                    <div className="text-xs text-slate-400">
                      Folder: <code className="text-emerald-400 font-mono bg-slate-900 px-2 py-0.5 rounded">database/emergency/divisions/{selectedDiv}/{selectedDist}/{selectedUpz}.json</code>
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
                        <div key={i} className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-center">
                          <div className="text-xl font-extrabold text-red-400 font-mono">{hl.num}</div>
                          <div className="text-xs font-semibold text-white mt-0.5">{hl.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{hl.desc}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Police Stations */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-emerald-400" /> Police Stations
                        </h3>
                        {upzData.emergency.police_stations && upzData.emergency.police_stations.length > 0 ? (
                          <div className="space-y-2.5">
                            {upzData.emergency.police_stations.map((p, idx) => (
                              <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                                <h4 className="font-semibold text-sm text-white">{p.name}</h4>
                                <p className="text-xs text-slate-400 mt-1">{p.address}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                  {p.oc_mobile && (
                                    <span className="text-emerald-400 font-mono">OC: {p.oc_mobile}</span>
                                  )}
                                  {p.duty_officer && (
                                    <span className="text-slate-300 font-mono">Duty: {p.duty_officer}</span>
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
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-400" /> District Administration ({selectedDist})
                        </h3>
                        {upzData.emergency.district_administration ? (
                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 bg-slate-950 rounded-lg">
                              <span className="text-slate-400 block font-semibold">DC Office:</span>
                              <span className="text-white font-mono">{upzData.emergency.district_administration.dc_office || 'Available via district portal'}</span>
                            </div>
                            <div className="p-2.5 bg-slate-950 rounded-lg">
                              <span className="text-slate-400 block font-semibold">SP Office:</span>
                              <span className="text-white font-mono">{upzData.emergency.district_administration.sp_office || 'Available via district portal'}</span>
                            </div>
                            <div className="p-2.5 bg-slate-950 rounded-lg">
                              <span className="text-slate-400 block font-semibold">Civil Surgeon Office:</span>
                              <span className="text-white font-mono">{upzData.emergency.district_administration.civil_surgeon_office || 'Available via district portal'}</span>
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
                    <div className="text-xs text-slate-400">
                      Folder: <code className="text-emerald-400 font-mono bg-slate-900 px-2 py-0.5 rounded">database/geography/divisions/{selectedDiv}/{selectedDist}/{selectedUpz}/info.json</code>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Unions */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400" /> Unions in {selectedUpz} ({upzData.geography?.unions?.length || 0})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                          {(upzData.geography?.unions || []).map((u, idx) => (
                            <div key={idx} className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 text-xs">
                              <div className="font-semibold text-white">{u.name}</div>
                              {u.bn_name && (
                                <div className="text-slate-400 font-['Noto_Sans_Bengali']">{u.bn_name}</div>
                              )}
                              {u.url && (
                                <a
                                  href={`http://${u.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-emerald-400 truncate block mt-1 hover:underline"
                                >
                                  {u.url}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Postal Codes */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-sky-400" /> Post Offices &amp; Postal Codes
                        </h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                          {(upzData.geography?.postal_codes || []).map((pc, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold text-white">{pc.sub_office}</span>
                                {pc.sub_office_bn && (
                                  <span className="text-slate-400 ml-2 font-['Noto_Sans_Bengali']">{pc.sub_office_bn}</span>
                                )}
                              </div>
                              <span className="font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold">
                                {pc.postcode}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 6: Land Records */}
                {activeTab === 'land' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-400">
                      Folder: <code className="text-emerald-400 font-mono bg-slate-900 px-2 py-0.5 rounded">database/land/khatians/{selectedDiv}/{selectedDist}/{selectedUpz}.json</code>
                    </div>

                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-lg">Digitized Land Khatians</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Official land records, survey Khatians (BS, RS, CS, SA) partitioned by upazila.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                          {upzData.stats.land_khatians_count || 0}
                        </span>
                        <span className="block text-[11px] text-slate-500 uppercase font-bold">Records Available</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>No bundled records for this upazila.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal for Entity Details */}
      {activeModalItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              ✕
            </button>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
              {activeModalItem.category}
            </span>
            <h3 className="text-lg font-bold text-white mt-2">{activeModalItem.name}</h3>
            {activeModalItem.bn_name && (
              <p className="text-sm text-slate-400 font-['Noto_Sans_Bengali']">{activeModalItem.bn_name}</p>
            )}

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-emerald-400">
                {activeModalItem.details}
              </div>
              {activeModalItem.meta && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-slate-300">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Address / Meta:</span>
                  {activeModalItem.meta}
                </div>
              )}
              {activeModalItem.phone && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-slate-300">
                  <span>Phone: <strong className="text-white font-mono">{activeModalItem.phone}</strong></span>
                  <button
                    onClick={() => handleCopy(activeModalItem.phone, 'phone')}
                    className="text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-emerald-400"
                  >
                    {copiedId === 'phone' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
              {activeModalItem.email && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-slate-300">
                  Email: <strong className="text-white">{activeModalItem.email}</strong>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>Bangladesh Open Data Visualizer • Built with React &amp; Vite • Open Source Public Datasets</p>
      </footer>
    </div>
  )
}
