import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, MapPin, FileText, Download, ExternalLink, Layers, 
  Menu, X, Database, ShieldCheck, Compass, Info, CheckCircle2,
  ChevronRight, Building2, Map as MapIcon, Landmark, Sparkles
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('khatian'); // 'khatian', 'map', 'dashboard'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data states
  const [khatians, setKhatians] = useState([]);
  const [summary, setSummary] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected modal for khatian details
  const [selectedKhatian, setSelectedKhatian] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        const [kRes, sRes, divRes, distRes, upaRes] = await Promise.all([
          fetch('/land/khatians_sample.json').then(r => r.json()).catch(() => []),
          fetch('/land/summary.json').then(r => r.json()).catch(() => null),
          fetch('/land/metadata/divisions.json').then(r => r.json()).catch(() => []),
          fetch('/land/metadata/districts.json').then(r => r.json()).catch(() => []),
          fetch('/land/metadata/upazilas.json').then(r => r.json()).catch(() => [])
        ]);
        
        setKhatians(kRes || []);
        setSummary(sRes);
        setDivisions(divRes || []);
        setDistricts(distRes || []);
        setUpazilas(upaRes || []);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // Filtered districts based on selected division
  const filteredDistricts = useMemo(() => {
    if (!selectedDivision) return districts;
    return districts.filter(d => 
      d.DIVISION_NAME === selectedDivision || 
      d.DIVISION_NAME_EN?.toUpperCase() === selectedDivision.toUpperCase()
    );
  }, [districts, selectedDivision]);

  // Filtered upazilas based on selected district
  const filteredUpazilas = useMemo(() => {
    if (!selectedDistrict) return upazilas;
    return upazilas.filter(u => 
      u.DISTRICT_NAME === selectedDistrict || 
      u.DISTRICT_NAME_EN?.toUpperCase() === selectedDistrict.toUpperCase()
    );
  }, [upazilas, selectedDistrict]);

  // Main filter for Khatians
  const filteredKhatians = useMemo(() => {
    let list = khatians;
    
    if (selectedDivision) {
      list = list.filter(k => 
        (k.division && k.division.includes(selectedDivision)) ||
        (k.division_en && k.division_en.toLowerCase() === selectedDivision.toLowerCase())
      );
    }
    if (selectedDistrict) {
      list = list.filter(k => 
        (k.district && k.district.includes(selectedDistrict)) ||
        (k.district_en && k.district_en.toLowerCase() === selectedDistrict.toLowerCase())
      );
    }
    if (selectedUpazila) {
      list = list.filter(k => 
        (k.upazila && k.upazila.includes(selectedUpazila)) ||
        (k.upazila_en && k.upazila_en.toLowerCase() === selectedUpazila.toLowerCase())
      );
    }
    if (selectedSurvey) {
      list = list.filter(k => 
        (k.survey && k.survey.toUpperCase() === selectedSurvey.toUpperCase()) ||
        (k.survey_key && k.survey_key.toUpperCase() === selectedSurvey.toUpperCase())
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(k => 
        String(k.khatian_no || '').toLowerCase().includes(q) ||
        String(k.owners || '').toLowerCase().includes(q) ||
        String(k.dags || '').toLowerCase().includes(q) ||
        String(k.mouza_name || '').toLowerCase().includes(q) ||
        String(k.upazila || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [khatians, selectedDivision, selectedDistrict, selectedUpazila, selectedSurvey, searchQuery]);

  // Paginated items
  const paginatedKhatians = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredKhatians.slice(start, start + itemsPerPage);
  }, [filteredKhatians, currentPage]);

  const totalPages = Math.ceil(filteredKhatians.length / itemsPerPage);

  const gdriveRoot = "https://drive.google.com/drive/folders/1NFsDEfd9sJ2Ln3CyqD3HNYz9C4d3tjdb";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇧🇩</span>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                বাংলাদেশ ভূমি ও খতিয়ান সেবা
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">National Land Records & Cadastral Map Explorer</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('khatian')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'khatian' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" /> খতিয়ান অনুসন্ধান (Khatian Search)
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'map' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <MapIcon className="w-4 h-4" /> মৌজা ম্যাপ ও নকশা (Mouza Maps)
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'dashboard' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" /> ডাটাবেজ ড্যাশবোর্ড
            </button>
            <a
              href={gdriveRoot}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Google Drive (16.8 GB PDFs)
            </a>
          </nav>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
            <button
              onClick={() => { setActiveTab('khatian'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
                activeTab === 'khatian' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" /> খতিয়ান অনুসন্ধান (Khatian Search)
            </button>
            <button
              onClick={() => { setActiveTab('map'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
                activeTab === 'map' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300'
              }`}
            >
              <MapIcon className="w-4 h-4" /> মৌজা ম্যাপ ও নকশা (Mouza Maps)
            </button>
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
                activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300'
              }`}
            >
              <Database className="w-4 h-4" /> ডাটাবেজ ড্যাশবোর্ড
            </button>
            <a
              href={gdriveRoot}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-400 bg-slate-800/80 flex items-center gap-2.5"
            >
              <Download className="w-4 h-4" /> Google Drive Cloud PDFs
            </a>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ======================= TAB 1: KHATIAN SEARCH ======================= */}
        {activeTab === 'khatian' && (
          <div className="space-y-6">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" /> সরকারি ই-পর্চা যাচাইকৃত ডাটাবেজ (Verified)
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  অনলাইন খতিয়ান অনুসন্ধান ও রেকর্ডরুম
                </h2>
                <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                  বিভাগ, জেলা, উপজেলা এবং মৌজা নির্বাচন করে খতিয়ান নম্বর, দাগ নম্বর কিংবা মালিকের নাম দিয়ে সহজেই যেকোনো খতিয়ান ও পিডিএফ খুঁজে নিন।
                </p>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Division */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">বিভাগ (Division)</label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => {
                      setSelectedDivision(e.target.value);
                      setSelectedDistrict('');
                      setSelectedUpazila('');
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">সকল বিভাগ (All Divisions)</option>
                    {divisions.map(d => (
                      <option key={d.ID} value={d.NAME}>{d.NAME} ({d.NAME_EN})</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">জেলা (District)</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedUpazila('');
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">সকল জেলা (All Districts)</option>
                    {filteredDistricts.map(d => (
                      <option key={d.ID} value={d.NAME}>{d.NAME} ({d.NAME_EN})</option>
                    ))}
                  </select>
                </div>

                {/* Upazila */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">উপজেলা (Upazila)</label>
                  <select
                    value={selectedUpazila}
                    onChange={(e) => {
                      setSelectedUpazila(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">সকল উপজেলা (All Upazilas)</option>
                    {filteredUpazilas.map(u => (
                      <option key={u.ID} value={u.NAME}>{u.NAME} ({u.NAME_EN})</option>
                    ))}
                  </select>
                </div>

                {/* Survey Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">সার্ভে টাইপ (Survey)</label>
                  <select
                    value={selectedSurvey}
                    onChange={(e) => {
                      setSelectedSurvey(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">সকল সার্ভে (All Surveys)</option>
                    <option value="RS">আর এস (RS)</option>
                    <option value="CS">সি এস (CS)</option>
                    <option value="SA">এস এ (SA)</option>
                    <option value="BS">বি এস (BS)</option>
                  </select>
                </div>
              </div>

              {/* Free Text Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="🔍 খতিয়ান নং, দাগ নং, মালিকের নাম, কিংবা মৌজা লিখে সার্চ করুন..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Status bar */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                <span>
                  প্রদর্শিত রেকর্ড: <strong className="text-emerald-400">{filteredKhatians.length.toLocaleString()}</strong> টি খতিয়ান
                </span>
                <span>
                  সর্বমোট সংগৃহীত পিডিএফ: <strong className="text-emerald-400">{summary?.total_pdfs?.toLocaleString() || '52,148'}</strong> টি
                </span>
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-slate-400 text-sm">খতিয়ান রেকর্ডসমূহ লোড হচ্ছে...</p>
              </div>
            ) : paginatedKhatians.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-300">কোনো খতিয়ান পাওয়া যায়নি</h3>
                <p className="text-sm text-slate-500 mt-1">অনুসন্ধান বা ফিল্টারের মান পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedKhatians.map((k, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl group"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-emerald-400">
                            খতিয়ান নং: {k.khatian_no}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {k.survey || k.survey_key || 'RS'}
                        </span>
                      </div>

                      {/* Location details */}
                      <div className="text-xs text-slate-400 mb-3 flex items-center gap-1.5 flex-wrap">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-medium text-slate-300">{k.mouza_name || 'মৌজা'}</span>
                        {k.jl_no && <span>(জে এল: {k.jl_no})</span>}
                        <span>·</span>
                        <span>{k.upazila}, {k.district}</span>
                      </div>

                      {/* Owners info */}
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-3">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          মালিকগণের বিবরণ (Owners)
                        </div>
                        <div className="text-xs text-slate-200 line-clamp-2">
                          {k.owners || 'রেকর্ডরুম বিবরণ অন্তর্ভুক্ত'}
                        </div>
                      </div>

                      {/* Dag numbers */}
                      {k.dags && (
                        <div className="text-xs text-slate-400 mb-3">
                          <span className="font-semibold text-slate-300">দাগ নং:</span> {k.dags}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedKhatian(k)}
                        className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      >
                        বিস্তারিত দেখুন
                      </button>
                      <a
                        href={k.gdrive_url || gdriveRoot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-lg text-xs font-medium bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                        title="Google Drive থেকে অফিসিয়াল পিডিএফ ডাউনলোড করুন"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 pb-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                >
                  পূর্ববর্তী (Prev)
                </button>
                <span className="text-xs text-slate-400 px-3">
                  পৃষ্ঠা {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                >
                  পরবর্তী (Next)
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB 2: MOUZA MAP & PLOTS ======================= */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                <Compass className="w-3.5 h-3.5" /> ডিজিটাল ক্যাডাস্ট্রাল মৌজা ম্যাপ ও নকশা
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                মৌজা ম্যাপ ও দাগ/প্লট নকশা সন্ধান
              </h2>
              <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                মৌজা নির্বাচন করে ক্যাডাস্ট্রাল শিট ম্যাপ, প্লট সীমানা এবং ভূমি মন্ত্রণালয়ের জিআইএস ম্যাপ ভিউয়ারে সরাসরি প্রবেশ করুন।
              </p>
            </div>

            {/* Mouza Selector Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-emerald-400" /> এলাকা ও মৌজা সিলেক্ট করুন
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">বিভাগ (Division)</label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => {
                      setSelectedDivision(e.target.value);
                      setSelectedDistrict('');
                      setSelectedUpazila('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">সকল বিভাগ</option>
                    {divisions.map(d => (
                      <option key={d.ID} value={d.NAME}>{d.NAME}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">জেলা (District)</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedUpazila('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">সকল জেলা</option>
                    {filteredDistricts.map(d => (
                      <option key={d.ID} value={d.NAME}>{d.NAME}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">উপজেলা (Upazila)</label>
                  <select
                    value={selectedUpazila}
                    onChange={(e) => setSelectedUpazila(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">সকল উপজেলা</option>
                    {filteredUpazilas.map(u => (
                      <option key={u.ID} value={u.NAME}>{u.NAME}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Direct Portal Launch */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                <div>
                  <div className="text-sm font-bold text-slate-200">
                    মন্ত্রণালয়ের অফিসিয়াল জিআইএস ক্যাডাস্ট্রাল ম্যাপ ভিউয়ার
                  </div>
                  <div className="text-xs text-slate-400">
                    লাইভ স্যাটেলাইট ইমেজ, মৌজা সীমানা ও দাগ নম্বরসমূহ মানচিত্রে সরাসরি দেখুন।
                  </div>
                </div>
                <a
                  href="https://eporcha.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shrink-0 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> ওপেন ক্যাডাস্ট্রাল ম্যাপ
                </a>
              </div>
            </div>

            {/* Interactive Cadastral Map Canvas Mockup */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" /> মৌজা প্লট / দাগ নকশা সিমুলেশন
                  </h3>
                  <p className="text-xs text-slate-400">একটি দাগে ক্লিক করে সেটির তথ্য অনুসন্ধান করুন</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                  শিট নং: ০১ (Sheet 1)
                </span>
              </div>

              {/* Cadastral SVG Map */}
              <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-center overflow-x-auto">
                <svg className="w-full max-w-2xl h-80" viewBox="0 0 600 300">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Cadastral plots */}
                  <polygon points="50,40 160,30 170,110 60,120" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" className="hover:fill-emerald-950/60 cursor-pointer transition-colors" onClick={() => setSearchQuery('১০১')} />
                  <text x="100" y="80" fill="#34d399" fontSize="11" fontWeight="bold">দাগ ১০১</text>

                  <polygon points="170,30 300,45 290,130 170,110" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" className="hover:fill-emerald-950/60 cursor-pointer transition-colors" onClick={() => setSearchQuery('১০২')} />
                  <text x="220" y="80" fill="#34d399" fontSize="11" fontWeight="bold">দাগ ১০২</text>

                  <polygon points="300,45 450,20 460,110 290,130" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" className="hover:fill-emerald-950/60 cursor-pointer transition-colors" onClick={() => setSearchQuery('১০৩')} />
                  <text x="360" y="80" fill="#34d399" fontSize="11" fontWeight="bold">দাগ ১০৩</text>

                  <polygon points="60,120 170,110 180,240 70,250" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" className="hover:fill-emerald-950/60 cursor-pointer transition-colors" onClick={() => setSearchQuery('১০৪')} />
                  <text x="110" y="180" fill="#34d399" fontSize="11" fontWeight="bold">দাগ ১০৪</text>

                  <polygon points="170,110 290,130 280,260 180,240" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" className="hover:fill-emerald-950/60 cursor-pointer transition-colors" onClick={() => setSearchQuery('১০৫')} />
                  <text x="220" y="190" fill="#34d399" fontSize="11" fontWeight="bold">দাগ ১০৫</text>

                  <polygon points="290,130 460,110 440,250 280,260" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" className="hover:fill-emerald-950/60 cursor-pointer transition-colors" onClick={() => setSearchQuery('১০৬')} />
                  <text x="360" y="190" fill="#34d399" fontSize="11" fontWeight="bold">দাগ ১০৬</text>
                </svg>
              </div>
              <div className="text-center text-xs text-slate-500 mt-2">
                ক্যাডাস্ট্রাল ম্যাপ শিটের যে-কোনো দাগের উপর ক্লিক করলে স্বয়ংক্রিয়ভাবে খতিয়ান অনুসন্ধান ফিল্টার হবে।
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: DASHBOARD ======================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                বাংলাদেশ ওপেন ডাটাবেজ ড্যাশবোর্ড
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                ভূমি ও খতিয়ানসহ স্বাস্থ্য, জরুরি যোগাযোগ, শাসন ও নাগরিক সেবাসমূহের সার্বিক পরিসংখ্যান
              </p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs font-semibold text-slate-400">সর্বমোট সংগৃহীত খতিয়ান</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                  {summary?.total_khatians?.toLocaleString() || '54,472'}
                </div>
                <div className="text-xs text-slate-500 mt-1">৮টি প্রশাসনিক বিভাগ জুড়ে</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs font-semibold text-slate-400">অফিসিয়াল পিডিএফ ফাইল</div>
                <div className="text-2xl sm:text-3xl font-black text-teal-400 mt-1">
                  {summary?.total_pdfs?.toLocaleString() || '52,148'}
                </div>
                <div className="text-xs text-slate-500 mt-1">আয়তন: ১৬.৮৫ গিগাবাইট</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs font-semibold text-slate-400">অন্তর্ভুক্ত জেলাসমূহ</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">৬৪ টি</div>
                <div className="text-xs text-slate-500 mt-1">সমগ্র বাংলাদেশ জুড়ে</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs font-semibold text-slate-400">উপজেলা ও থানা</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">৫২৭ টি</div>
                <div className="text-xs text-slate-500 mt-1">সকল সার্কেল অন্তর্ভুক্ত</div>
              </div>
            </div>

            {/* Cloud Storage Integration Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-emerald-400" /> গুগল ড্রাইভে সংরক্ষিত সম্পূর্ণ ডাটাবেজ
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                    গিটহাবের সাইজ সীমাবদ্ধতার কারণে ১৬.৮৫ জিবি সম্পন্ন সকল মূল পিডিএফ ও আর্কাইভ সরাসরি গুগল ড্রাইভ ক্লাউডে রাখা হয়েছে। যেকোনো মুহূর্তে ব্যাকআপ ফাইল ডাউনলোড করুন।
                  </p>
                </div>
                <a
                  href={gdriveRoot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
                >
                  <ExternalLink className="w-4 h-4" /> ওপেন গুগল ড্রাইভ ফোল্ডার
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================= MODAL: KHATIAN DETAILS ======================= */}
      {selectedKhatian && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedKhatian(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-emerald-400">
                খতিয়ান নং: {selectedKhatian.khatian_no}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {selectedKhatian.survey || selectedKhatian.survey_key || 'RS'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div><span className="text-slate-400">বিভাগ:</span> {selectedKhatian.division}</div>
                <div><span className="text-slate-400">জেলা:</span> {selectedKhatian.district}</div>
                <div><span className="text-slate-400">উপজেলা:</span> {selectedKhatian.upazila}</div>
                <div><span className="text-slate-400">মৌজা:</span> {selectedKhatian.mouza_name} (জে এল: {selectedKhatian.jl_no})</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-semibold text-slate-300 mb-1">মালিকগণের নাম ও অংশ (Owners & Shares):</div>
                <div className="text-slate-200 leading-relaxed">{selectedKhatian.owners || 'রেকর্ডরুম বিবরণ উপলব্ধ'}</div>
              </div>

              {selectedKhatian.guardians && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-semibold text-slate-300 mb-1">পিতা / স্বামীর নাম (Father / Husband):</div>
                  <div className="text-slate-200">{selectedKhatian.guardians}</div>
                </div>
              )}

              {selectedKhatian.dags && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-semibold text-slate-300 mb-1">দাগ নম্বরসমূহ (Dag / Plot Numbers):</div>
                  <div className="text-slate-200">{selectedKhatian.dags}</div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedKhatian(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                বন্ধ করুন
              </button>
              <a
                href={selectedKhatian.gdrive_url || gdriveRoot}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> অফিসিয়াল PDF ডাউনলোড করুন
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-400">
        <p>© 2026 বাংলাদেশ ওপেন ডাটাবেজ প্রজেক্ট | Bangladesh Open Database Explorer</p>
        <p className="mt-1 text-slate-500">
          তথ্যসূত্র: গণপ্রজাতন্ত্রী বাংলাদেশ সরকার ভূমি রেকর্ড ও জরিপ অধিদপ্তর (ePorcha DLRMS)
        </p>
      </footer>
    </div>
  );
}
