// =============================================
//   Bangladesh Database Explorer - Core App (v3.0 Supreme)
// =============================================

const DATA_ROOT = '../';
const PAGE_SIZE = 50;

// ---- State ----
const state = {
  currentPage: 'dashboard',
  medicine: { data: null, manufacturers: null, activeTab: 'medicines', filtered: [], page: 1, search: '', form: '', company: '', tclass: '' },
  healthcare: { hospitals: null, doctors: null, blood_banks: null, ambulances: null, diag: null, activeTab: 'hospitals', page: 1, filtered: [] },
  land: { khatians: [], filtered: [], summary: null },
    geography: { divisions: null, districts: null, hierarchy: null, postal: null, activeTab: 'hierarchy' },
  law: { constitution: null, penal: null, crpc: null, acts: null, glossary: null, activeTab: 'constitution' },
  emergency: { hotlines: null, police: null, fire: null, admin: null, activeTab: 'hotlines' },
  banking: { banks: null, branches: null, mfs: null, activeTab: 'banks' },
  transport: { stations: null, trains: null, fares: null, buses: null, launches: null, airports: null, companies: null, activeTab: 'trains' },
  education: {
    hierarchy: null,
    activeDiv: 'Dhaka',
    activeDistrict: 'Dhaka',
    activeType: 'school',
    institutions: [],
    filtered: [],
    page: 1,
    search: '',
    loading: false
  },
  teachers: {
    summary: null,
    activeDiv: 'Dhaka',
    activeDistrict: 'Dhaka',
    activeDesig: '',
    teachersList: [],
    filtered: [],
    page: 1,
    search: '',
    loading: false
  },
  islamic: {
    surahsCatalog: null,
    hadithIndex: null,
    names: null,
    prophets: null,
    activeTab: 'quran_reader',
    currentSurahId: 1,
    currentSurahData: null,
    currentHadithBook: 'bukhari',
    currentHadithChapter: '1.json',
    currentHadithData: null,
    showTafsir: true
  },
  governance: { ministries: null, bodies: null, services: null, activeTab: 'services' },
  heritage: { landmarks: null, destinations: null, activeTab: 'landmarks' },
  lawyer: {
    summary: null,
    allMembers: null,
    filtered: [],
    page: 1,
    search: '',
    division: '',
    status: '',
    activeTab: 'members',
    loading: false
  }
};

// ---- Fetch helper ----
async function fetchJSON(path) {
  try {
    const r = await fetch(DATA_ROOT + path);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } catch (e) {
    console.warn('Could not load:', path, e.message);
    return null;
  }
}

// ---- Router ----
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-' + page);
  if (pg) pg.classList.add('active');
  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  state.currentPage = page;
  document.getElementById('topbar-title').textContent = NAV_META[page]?.title || 'Dashboard';
  window.location.hash = page;
  loadPage(page);
}

const NAV_META = {
  dashboard:  { title: '🏠 Dashboard' },
  islamic:    { title: '☪️ Quran with Bangla Tafsir & Hadith Reader' },
  governance: { title: '🏛️ Ministries, Bodies & Citizen Portals' },
  heritage:   { title: '🏛️ Tourism & Cultural Heritage' },
  medicine:   { title: '💊 Medicine & Manufacturers' },
  healthcare: { title: '🏥 Healthcare Services' },
  geography:  { title: '🗺️ Administrative Geography' },
  land:       { title: '📜 Land Records & Khatians (ePorcha)' },
  law:        { title: '⚖️ Legal Codes & Acts' },
  emergency:  { title: '🚨 Emergency & Administration' },
  banking:    { title: '🏦 Banking & MFS' },
  transport:  { title: '🚆 Transport & Transit Directory' },
  teachers:   { title: '👨‍🏫 BANBEIS Teachers Database (198,640 Teachers)' },
  education:  { title: '📚 Education Institutions & Teacher Rosters' },
  lawyer:     { title: '👨‍⚖️ Lawyers Directory' },
};

// ---- Page loaders ----
const pageLoaded = {};

async function loadPage(page) {
  if (pageLoaded[page]) return;
  pageLoaded[page] = true;
  const loaders = {
    dashboard:  loadDashboard,
    islamic:    loadIslamic,
    governance: loadGovernance,
    heritage:   loadHeritage,
    medicine:   loadMedicine,
    healthcare: loadHealthcare,
    geography:  loadGeography,
    land:       loadLand,
    law:        loadLaw,
    emergency:  loadEmergency,
    banking:    loadBanking,
    transport:  loadTransport,
    teachers:   loadTeachers,
    education:  loadEducation,
    lawyer:     loadLawyer,
  };
  if (loaders[page]) await loaders[page]();
}

async function loadDashboard() {
  fetchJSON('land/summary.json').then(summary => {
    if (summary) {
      const cardKhatians = document.getElementById('land-stat-khatians');
      if (cardKhatians) cardKhatians.textContent = `${(summary.total_khatians || 0).toLocaleString()} Khatians`;
      const cardPdfs = document.getElementById('land-stat-pdfs');
      if (cardPdfs) cardPdfs.textContent = `${(summary.total_pdfs_downloaded || 0).toLocaleString()} PDFs`;
    }
  }).catch(() => {});
}

// =================== ISLAMIC QURAN & HADITH READER ===================
async function loadIslamic() {
  showLoader('islamic-content');
  const [surahs, hadithIdx, names, prophets] = await Promise.all([
    fetchJSON('Islamic/surahs_catalog.json'),
    fetchJSON('Islamic/hadith_chapters_index.json'),
    fetchJSON('Islamic/Other Islamic Data/Names of Allah/names-of-allah.json'),
    fetchJSON('Islamic/Other Islamic Data/Prophets/prophets.json'),
  ]);
  state.islamic.surahsCatalog = surahs || [];
  state.islamic.hadithIndex = hadithIdx || {};
  state.islamic.names = names || [];
  state.islamic.prophets = prophets || [];

  renderIslamicTab('quran_reader');
}

async function renderIslamicTab(tab) {
  state.islamic.activeTab = tab;
  setActiveTabs('islamic-tabs', tab);
  const content = document.getElementById('islamic-content');

  if (tab === 'quran_reader') {
    await renderQuranReader();
  } else if (tab === 'hadith_reader') {
    await renderHadithReader();
  } else if (tab === 'surahs_list') {
    renderSurahsCatalog();
  } else if (tab === 'names') {
    renderNamesOfAllah();
  } else if (tab === 'prophets') {
    renderProphetsList();
  }
}

async function renderQuranReader() {
  const content = document.getElementById('islamic-content');
  const surahs = state.islamic.surahsCatalog || [];
  const currentId = state.islamic.currentSurahId || 1;
  const currentSurah = surahs.find(s => s.number === currentId) || surahs[0] || {};

  content.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;margin-bottom:20px">
      <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <label class="font-bold font-sm text-muted">SELECT SURAH:</label>
          <select class="filter-select" id="surah-selector" style="min-width:240px" onchange="changeSurah(parseInt(this.value))">
            ${surahs.map(s => `
              <option value="${s.number}" ${s.number === currentId ? 'selected' : ''}>
                ${s.number}. ${s.name_en} (${s.name_bn}) - ${s.ayah_count} Ayahs
              </option>
            `).join('')}
          </select>
          <span class="badge ${currentSurah.revelation_type==='Makki'?'badge-blue':'badge-green'}">${currentSurah.revelation_type}</span>
          <span class="badge badge-primary font-mono">${currentSurah.ayah_count || 0} Ayahs</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn btn-secondary" onclick="toggleTafsirView()" id="tafsir-toggle-btn">
            ${state.islamic.showTafsir ? '📖 Hide Bangla Tafsir' : '📖 Show Bangla Tafsir'}
          </button>
          <button class="btn btn-primary" onclick="changeSurah(${currentId > 1 ? currentId - 1 : 114})">◀ Prev</button>
          <button class="btn btn-primary" onclick="changeSurah(${currentId < 114 ? currentId + 1 : 1})">Next ▶</button>
        </div>
      </div>
      <div style="text-align:center;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
        <div style="font-family:'Traditional Arabic', Amiri, serif;font-size:36px;color:var(--primary-light);margin-bottom:4px">
          ${esc(currentSurah.name_ar || '')}
        </div>
        <div style="font-size:18px;font-weight:700;color:var(--text)">
          সূরা ${esc(currentSurah.name_bn || '')} · ${esc(currentSurah.name_en || '')}
        </div>
        <div class="text-muted font-sm" style="margin-top:2px">
          ${esc(currentSurah.meaning_en || '')}
        </div>
        ${currentId !== 9 ? `
          <div style="font-family:'Traditional Arabic', Amiri, serif;font-size:24px;color:var(--text);margin-top:14px;background:var(--bg3);display:inline-block;padding:6px 24px;border-radius:24px;border:1px solid var(--border)">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>` : ''}
      </div>
    </div>
    <div id="quran-verses-container">
      <div class="loader"><div class="spinner"></div>Loading Ayahs of Surah ${currentId}…</div>
    </div>
  `;

  // Fetch surah ayahs
  const ayahs = await fetchJSON(`Islamic/Quran/by_surah/${currentId}.json`);
  state.islamic.currentSurahData = ayahs || [];
  renderAyahsList();
}

function renderAyahsList() {
  const container = document.getElementById('quran-verses-container');
  if (!container) return;
  const ayahs = state.islamic.currentSurahData || [];
  if (!ayahs.length) {
    container.innerHTML = `<div class="empty-state"><h3>Could not load Ayahs</h3></div>`;
    return;
  }
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px">
      ${ayahs.map(a => `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;transition:border-color 0.2s">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(46,52,80,0.5);padding-bottom:8px">
            <span class="badge badge-primary font-mono font-bold">Ayah ${a.verse_key}</span>
            <span class="text-muted font-sm">আয়াত ${a.ayah}</span>
          </div>
          <!-- Arabic Verse -->
          <div style="font-family:'Traditional Arabic', Amiri, serif;font-size:26px;color:var(--text);text-align:right;line-height:2.2;direction:rtl;margin-bottom:14px;padding:8px 0">
            ${esc(a.arabic)} <span style="color:var(--primary-light);font-size:22px">﴿${a.ayah}﴾</span>
          </div>
          <!-- Bangla Translation -->
          <div style="font-size:15px;line-height:1.7;color:var(--primary-light);font-weight:600;margin-bottom:${state.islamic.showTafsir && a.tafsir_bn ? '14px' : '4px'}">
            <span class="badge badge-green" style="margin-right:6px">অনুবাদ</span> ${esc(a.bangla)}
          </div>
          <!-- Bangla Tafsir (Mokhtasar) -->
          ${state.islamic.showTafsir && a.tafsir_bn ? `
            <div style="background:var(--bg3);border:1px solid var(--border);border-left:4px solid var(--primary);border-radius:var(--radius-sm);padding:14px 16px;font-size:13.5px;color:var(--text);line-height:1.8">
              <div class="font-bold text-muted font-sm" style="margin-bottom:6px">📖 সংক্ষেপিত তাফসীর (তাফসীর আল-মুখতাসার):</div>
              ${esc(a.tafsir_bn)}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

window.changeSurah = function(surahId) {
  state.islamic.currentSurahId = surahId;
  renderQuranReader();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.toggleTafsirView = function() {
  state.islamic.showTafsir = !state.islamic.showTafsir;
  const btn = document.getElementById('tafsir-toggle-btn');
  if (btn) btn.textContent = state.islamic.showTafsir ? '📖 Hide Bangla Tafsir' : '📖 Show Bangla Tafsir';
  renderAyahsList();
};

// =================== HADITH READER ===================
async function renderHadithReader() {
  const content = document.getElementById('islamic-content');
  const hadithIdx = state.islamic.hadithIndex || {};
  const books = Object.keys(hadithIdx);
  const currentBook = state.islamic.currentHadithBook || 'bukhari';
  const chapters = hadithIdx[currentBook] || [];
  const currentChapter = state.islamic.currentHadithChapter || (chapters[0]?.file || '1.json');

  const bookNames = {
    bukhari: 'Sahih al-Bukhari (صحيح البخاري)',
    muslim: 'Sahih Muslim (صحيح مسلم)',
    tirmidhi: 'Jami\' at-Tirmidhi (جامع الترمذي)',
    abudawud: 'Sunan Abi Dawud (سنن أبي داود)',
    nasai: 'Sunan an-Nasa\'i (سنن النسائي)',
    ibnmajah: 'Sunan Ibn Majah (سنن ابن ماجه)',
    malik: 'Muwatta Malik (موطأ مالك)',
    ahmed: 'Musnad Ahmad (مسند أحمد)',
    darimi: 'Sunan ad-Darimi (سنن الدارمي)'
  };

  content.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;margin-bottom:20px">
      <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <label class="font-bold font-sm text-muted">SELECT BOOK:</label>
          <select class="filter-select" id="hadith-book-sel" onchange="changeHadithBook(this.value)">
            ${books.map(b => `<option value="${b}" ${b===currentBook?'selected':''}>${bookNames[b] || b}</option>`).join('')}
          </select>
          <label class="font-bold font-sm text-muted">CHAPTER:</label>
          <select class="filter-select" id="hadith-chapter-sel" style="min-width:260px" onchange="changeHadithChapter(this.value)">
            ${chapters.map(c => `
              <option value="${c.file}" ${c.file===currentChapter?'selected':''}>
                ${c.chapter_id}. ${c.english} (${c.hadith_count} hadiths)
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>
    <div id="hadith-items-container">
      <div class="loader"><div class="spinner"></div>Loading hadiths from ${bookNames[currentBook] || currentBook}…</div>
    </div>
  `;

  // Fetch chapter hadiths
  const chapterData = await fetchJSON(`Islamic/Hadith/by_chapter/the_9_books/${currentBook}/${currentChapter}`);
  state.islamic.currentHadithData = chapterData;
  renderHadithItems();
}

function renderHadithItems() {
  const container = document.getElementById('hadith-items-container');
  if (!container) return;
  const d = state.islamic.currentHadithData || {};
  const hadiths = d.hadiths || [];
  const ch = d.chapter || {};

  if (!hadiths.length) {
    container.innerHTML = `<div class="empty-state"><h3>No Hadiths in this chapter</h3></div>`;
    return;
  }

  container.innerHTML = `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;margin-bottom:16px">
      <div style="font-size:16px;font-weight:700;color:var(--text)">Chapter: ${esc(ch.english || '')}</div>
      <div style="font-family:'Traditional Arabic', Amiri, serif;font-size:22px;color:var(--primary-light);margin-top:4px">${esc(ch.arabic || '')}</div>
      <div class="text-muted font-sm" style="margin-top:4px">Showing ${hadiths.length} authentic hadiths in this chapter</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      ${hadiths.map((h, i) => `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(46,52,80,0.5);padding-bottom:8px">
            <span class="badge badge-primary font-mono font-bold">Hadith #${h.idInBook || h.id || i+1}</span>
            <span class="badge badge-green font-sm">Authentic Narration</span>
          </div>
          <!-- Arabic text -->
          <div style="font-family:'Traditional Arabic', Amiri, serif;font-size:22px;color:var(--text);text-align:right;line-height:2.2;direction:rtl;margin-bottom:14px;padding:8px 0">
            ${esc(typeof h.arabic === 'string' ? h.arabic : h.arabic?.text || '')}
          </div>
          <!-- English translation -->
          <div style="background:var(--bg3);border-radius:var(--radius-sm);padding:14px 16px;font-size:14px;color:var(--text);line-height:1.7;border:1px solid var(--border)">
            ${h.english?.narrator ? `<div class="font-bold text-primary" style="margin-bottom:6px">${esc(h.english.narrator)}</div>` : ''}
            <div>${esc(typeof h.english === 'string' ? h.english : h.english?.text || '')}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

window.changeHadithBook = function(book) {
  state.islamic.currentHadithBook = book;
  const chapters = (state.islamic.hadithIndex || {})[book] || [];
  state.islamic.currentHadithChapter = chapters[0]?.file || '1.json';
  renderHadithReader();
};

window.changeHadithChapter = function(file) {
  state.islamic.currentHadithChapter = file;
  renderHadithReader();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Surahs Catalog
function renderSurahsCatalog() {
  const content = document.getElementById('islamic-content');
  const surahs = state.islamic.surahsCatalog || [];
  content.innerHTML = `
    <div class="table-wrapper"><table class="data-table">
      <thead><tr><th>#</th><th>Surah Name</th><th>Arabic</th><th>English Meaning</th><th>বাংলা নাম</th><th>Ayahs</th><th>Revelation</th><th>Action</th></tr></thead>
      <tbody>${surahs.map(s => `<tr>
        <td class="font-mono text-primary font-bold">${s.number}</td>
        <td class="font-bold">${esc(s.name_en)}</td>
        <td style="font-family:'Traditional Arabic', Amiri, serif;font-size:20px;color:var(--primary-light)">${esc(s.name_ar)}</td>
        <td class="text-muted">${esc(s.meaning_en)}</td>
        <td class="font-bold">${esc(s.name_bn)}</td>
        <td class="font-mono text-green font-bold">${s.ayah_count}</td>
        <td><span class="badge ${s.revelation_type==='Makki'?'badge-blue':'badge-green'}">${esc(s.revelation_type)}</span></td>
        <td><button class="btn btn-primary font-sm" onclick="state.islamic.currentSurahId=${s.number};renderIslamicTab('quran_reader')">📖 Read</button></td>
      </tr>`).join('')}
      </tbody></table></div>`;
}

function renderNamesOfAllah() {
  const content = document.getElementById('islamic-content');
  const names = state.islamic.names || [];
  content.innerHTML = `
    <div class="results-info"><span class="results-count">${names.length}</span> Beautiful Names of Allah (Asmaul Husna)</div>
    <div class="cards-grid">${names.map((n, i) => `
      <div class="info-card" style="text-align:center">
        <div class="badge badge-primary font-mono" style="margin-bottom:8px">#${i + 1}</div>
        <div style="font-family:'Traditional Arabic', Amiri, serif;font-size:32px;color:var(--primary-light);margin-bottom:4px">
          ${esc(n.name || n.ar || '')}
        </div>
        <div class="font-bold" style="font-size:16px;color:var(--text)">${esc(n.transliteration || n.en?.transliteration || '')}</div>
        <div class="text-green font-sm" style="margin-top:4px">${esc(n.en?.meaning || n.meaning || '')}</div>
        ${n.bn?.meaning ? `<div class="text-muted font-sm" style="margin-top:2px">${esc(n.bn.meaning)}</div>` : ''}
      </div>
    `).join('')}</div>`;
}

function renderProphetsList() {
  const content = document.getElementById('islamic-content');
  const prophets = state.islamic.prophets || [];
  content.innerHTML = `
    <div class="results-info"><span class="results-count">${prophets.length}</span> Prophets Mentioned in the Holy Quran</div>
    <div class="cards-grid">${prophets.map(p => `
      <div class="info-card">
        <div class="info-card-header">
          <div>
            <div class="info-card-title">${esc(p.name || p.englishName)}</div>
            <div class="info-card-sub" style="font-family:'Traditional Arabic', Amiri, serif;font-size:20px;color:var(--primary-light)">${esc(p.arabicName || p.name_ar || '')}</div>
          </div>
          ${p.order ? `<span class="badge badge-primary">Prophet #${p.order}</span>` : ''}
        </div>
        ${p.title ? `<div class="info-row"><span class="info-row-label">Title</span><span class="info-row-value font-bold text-green">${esc(p.title)}</span></div>` : ''}
        ${p.quranMentionCount ? `<div class="info-row"><span class="info-row-label">Quran Mentions</span><span class="info-row-value font-mono font-bold">${p.quranMentionCount} times</span></div>` : ''}
        ${p.era || p.period ? `<div class="info-row"><span class="info-row-label">Mission / Era</span><span class="info-row-value font-sm">${esc(p.era || p.period || '—')}</span></div>` : ''}
        ${p.miracles ? `<div class="info-row"><span class="info-row-label">Miracles</span><span class="info-row-value font-sm text-muted">${esc(p.miracles)}</span></div>` : ''}
      </div>
    `).join('')}</div>`;
}

// =================== GOVERNANCE ===================
async function loadGovernance() {
  showLoader('governance-content');
  const [ministries, bodies, services] = await Promise.all([
    fetchJSON('governance/ministries.json'),
    fetchJSON('governance/statutory_bodies.json'),
    fetchJSON('governance/citizen_services.json'),
  ]);
  state.governance.ministries = ministries || [];
  state.governance.bodies = bodies || [];
  state.governance.services = services || [];
  renderGovernanceTab('services');
}

function renderGovernanceTab(tab) {
  state.governance.activeTab = tab;
  setActiveTabs('governance-tabs', tab);
  const content = document.getElementById('governance-content');

  if (tab === 'services') {
    const services = state.governance.services || [];
    content.innerHTML = `
      <div class="results-info"><span class="results-count">${services.length}</span> official digital portals for citizens</div>
      <div class="cards-grid">${services.map(s => `
        <div class="info-card">
          <div class="info-card-header">
            <div>
              <div class="info-card-title">${esc(s.service_name)}</div>
              <div class="info-card-sub">${esc(s.agency)}</div>
            </div>
            <span class="badge badge-primary font-mono">📞 ${esc(s.helpline)}</span>
          </div>
          <div class="info-row"><span class="info-row-label">Official Portal</span><span class="info-row-value"><a href="https://${s.portal}" target="_blank" class="phone-link font-bold font-mono">🔗 ${esc(s.portal)}</a></span></div>
          <div class="info-row"><span class="info-row-label">Description</span><span class="info-row-value font-sm text-muted">${esc(s.description)}</span></div>
        </div>
      `).join('')}</div>`;
  } else if (tab === 'ministries') {
    const ministries = state.governance.ministries || [];
    content.innerHTML = `
      <div class="results-info"><span class="results-count">${ministries.length}</span> ministries & divisions</div>
      <div class="table-wrapper"><table class="data-table">
        <thead><tr><th>#</th><th>Ministry Name</th><th>বাংলা নাম</th><th>Headquarters</th><th>Hotline</th><th>Website</th></tr></thead>
        <tbody>${ministries.map((m, i) => `<tr>
          <td class="text-muted font-sm">${i+1}</td>
          <td class="font-bold">${esc(m.name)}</td>
          <td>${esc(m.bn_name)}</td>
          <td class="font-sm text-muted">${esc(m.headquarters)}</td>
          <td class="font-mono text-green"><a class="phone-link" href="tel:${m.hotline}">${esc(m.hotline)}</a></td>
          <td><a href="https://${m.website}" target="_blank" class="phone-link font-mono font-sm">🌐 ${esc(m.website)}</a></td>
        </tr>`).join('')}
        </tbody></table></div>`;
  } else if (tab === 'bodies') {
    const bodies = state.governance.bodies || [];
    content.innerHTML = `
      <div class="results-info"><span class="results-count">${bodies.length}</span> constitutional & regulatory bodies</div>
      <div class="cards-grid">${bodies.map(b => `
        <div class="info-card">
          <div class="info-card-header">
            <div>
              <div class="info-card-title">${esc(b.name)}</div>
              <div class="info-card-sub">${esc(b.bn_name)}</div>
            </div>
            <span class="badge badge-blue">${esc(b.category)}</span>
          </div>
          <div class="info-row"><span class="info-row-label">Headquarters</span><span class="info-row-value font-sm">${esc(b.headquarters)}</span></div>
          <div class="info-row"><span class="info-row-label">Hotline</span><span class="info-row-value font-mono text-green"><a class="phone-link" href="tel:${b.hotline}">${esc(b.hotline)}</a></span></div>
          <div class="info-row"><span class="info-row-label">Website</span><span class="info-row-value"><a href="https://${b.website}" target="_blank" class="phone-link font-mono font-sm">🌐 ${esc(b.website)}</a></span></div>
        </div>
      `).join('')}</div>`;
  }
}

// =================== TOURISM & HERITAGE ===================
async function loadHeritage() {
  showLoader('heritage-content');
  const [landmarks, destinations] = await Promise.all([
    fetchJSON('heritage/landmarks.json'),
    fetchJSON('heritage/destinations.json'),
  ]);
  state.heritage.landmarks = landmarks || [];
  state.heritage.destinations = destinations || [];
  renderHeritageTab('landmarks');
}

function renderHeritageTab(tab) {
  state.heritage.activeTab = tab;
  setActiveTabs('heritage-tabs', tab);
  const content = document.getElementById('heritage-content');

  if (tab === 'landmarks') {
    const landmarks = state.heritage.landmarks || [];
    content.innerHTML = `
      <div class="results-info"><span class="results-count">${landmarks.length}</span> UNESCO & historic heritage monuments</div>
      <div class="cards-grid">${landmarks.map(l => `
        <div class="info-card">
          <div class="info-card-header">
            <div>
              <div class="info-card-title">${esc(l.name)}</div>
              <div class="info-card-sub">${esc(l.bn_name)}</div>
            </div>
            <span class="badge badge-yellow font-sm">${esc(l.category)}</span>
          </div>
          <div class="info-row"><span class="info-row-label">Location</span><span class="info-row-value font-bold">${esc(l.district)}, ${esc(l.division)}</span></div>
          <div class="info-row"><span class="info-row-label">Period</span><span class="info-row-value font-sm">${esc(l.established)}</span></div>
          <div class="info-row"><span class="info-row-label">Entry Fee</span><span class="info-row-value font-mono text-green">৳ ${esc(l.entry_fee_bdt)}</span></div>
          <div class="info-row"><span class="info-row-label">Hours</span><span class="info-row-value font-sm">${esc(l.visiting_hours)}</span></div>
          <div class="info-row"><span class="info-row-label">Highlights</span><span class="info-row-value font-sm text-muted">${esc(l.highlights)}</span></div>
        </div>
      `).join('')}</div>`;
  } else if (tab === 'destinations') {
    const destinations = state.heritage.destinations || [];
    content.innerHTML = `
      <div class="results-info"><span class="results-count">${destinations.length}</span> prominent tourist destinations</div>
      <div class="cards-grid">${destinations.map(d => `
        <div class="info-card">
          <div class="info-card-header">
            <div>
              <div class="info-card-title">${esc(d.destination)}</div>
              <div class="info-card-sub">${esc(d.bn_name)}</div>
            </div>
            <span class="badge badge-green">${esc(d.category)}</span>
          </div>
          <div class="info-row"><span class="info-row-label">District</span><span class="info-row-value font-bold">${esc(d.district)}, ${esc(d.division)}</span></div>
          <div class="info-row"><span class="info-row-label">Best Season</span><span class="info-row-value font-mono text-primary font-bold">${esc(d.best_season)}</span></div>
          <div class="info-row"><span class="info-row-label">Features</span><span class="info-row-value font-sm">${esc(d.features)}</span></div>
          <div class="info-row"><span class="info-row-label">How to Reach</span><span class="info-row-value font-sm text-muted">${esc(d.how_to_reach)}</span></div>
        </div>
      `).join('')}</div>`;
  }
}

// =================== MEDICINE & PHARMA ===================
async function loadMedicine() {
  showLoader('medicine-table-wrap');
  const [meds, forms, companies, tclasses] = await Promise.all([
    fetchJSON('medicine/all_medicines_summary.json'),
    fetchJSON('medicine/dosage_forms.json'),
    fetchJSON('medicine/manufacturers.json'),
    fetchJSON('medicine/therapeutic_classes.json'),
  ]);
  state.medicine.data = meds || [];
  state.medicine.manufacturers = companies || [];

  if (forms && meds) {
    const sel = document.getElementById('med-form-filter');
    const unique = [...new Set(meds.map(m => m.dosage_form).filter(Boolean))].sort();
    unique.forEach(f => { const o = document.createElement('option'); o.value = f; o.textContent = f; sel.appendChild(o); });
  }
  if (companies && meds) {
    const sel = document.getElementById('med-company-filter');
    const unique = [...new Set(meds.map(m => m.manufacturer).filter(Boolean))].sort();
    unique.slice(0, 250).forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c.length > 40 ? c.slice(0,40)+'…' : c; sel.appendChild(o); });
  }
  if (tclasses && meds) {
    const sel = document.getElementById('med-class-filter');
    const unique = [...new Set(meds.map(m => m.therapeutic_class).filter(Boolean))].sort();
    unique.forEach(tc => { const o = document.createElement('option'); o.value = tc; o.textContent = tc.length > 45 ? tc.slice(0,45)+'…' : tc; sel.appendChild(o); });
  }

  document.getElementById('med-total').textContent = (meds||[]).length.toLocaleString();
  const forms_count = new Set((meds||[]).map(m => m.dosage_form).filter(Boolean)).size;
  const companies_count = (companies||[]).length;
  const classes_count = new Set((meds||[]).map(m => m.therapeutic_class).filter(Boolean)).size;
  document.getElementById('med-forms').textContent = forms_count;
  document.getElementById('med-companies').textContent = companies_count;
  document.getElementById('med-classes').textContent = classes_count;

  filterMedicine();
  renderPharmaCompanies();
}

function setMedicineTab(tab) {
  state.medicine.activeTab = tab;
  setActiveTabs('medicine-tabs', tab);
  if (tab === 'medicines') {
    document.getElementById('med-medicines-view').style.display = 'block';
    document.getElementById('med-companies-view').style.display = 'none';
  } else {
    document.getElementById('med-medicines-view').style.display = 'none';
    document.getElementById('med-companies-view').style.display = 'block';
    renderPharmaCompanies();
  }
}

function filterMedicine() {
  const search = state.medicine.search.toLowerCase();
  const form = state.medicine.form;
  const company = state.medicine.company;
  const tclass = state.medicine.tclass;
  state.medicine.filtered = (state.medicine.data || []).filter(m => {
    if (form && m.dosage_form !== form) return false;
    if (company && m.manufacturer !== company) return false;
    if (tclass && m.therapeutic_class !== tclass) return false;
    if (search) {
      return (m.brand_name||'').toLowerCase().includes(search) ||
             (m.generic_name||'').toLowerCase().includes(search) ||
             (m.manufacturer||'').toLowerCase().includes(search);
    }
    return true;
  });
  state.medicine.page = 1;
  renderMedicineTable();
}

function renderMedicineTable() {
  const { filtered, page } = state.medicine;
  const start = (page - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);
  const wrap = document.getElementById('medicine-table-wrap');
  if (!slice.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-icon">💊</div><h3>No medicines found</h3><p>Try adjusting your search or filters</p></div>`;
    document.getElementById('med-results-info').textContent = '0 results';
    return;
  }
  document.getElementById('med-results-info').textContent = `Showing ${start+1}–${Math.min(start+PAGE_SIZE, filtered.length)} of ${filtered.length.toLocaleString()} medicines`;
  wrap.innerHTML = `
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr>
          <th>#</th><th>Brand Name</th><th>Generic Name</th><th>Strength</th>
          <th>Form</th><th>Manufacturer</th><th>Price</th><th>Preg. Cat.</th>
        </tr></thead>
        <tbody>${slice.map((m,i) => `
          <tr>
            <td class="text-muted font-mono font-sm">${start+i+1}</td>
            <td class="font-bold">${esc(m.brand_name)}</td>
            <td><span class="med-generic-tag">${esc(m.generic_name)}</span></td>
            <td class="font-mono">${esc(m.strength)}</td>
            <td>${m.dosage_form ? `<span class="badge badge-blue">${esc(m.dosage_form)}</span>` : ''}</td>
            <td class="text-muted">${esc(m.manufacturer)}</td>
            <td class="font-mono text-green">${esc(m.unit_price)}</td>
            <td>${m.pregnancy_category ? `<span class="badge badge-yellow">${esc(m.pregnancy_category)}</span>` : '<span class="text-dim">—</span>'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      ${renderPaginationHTML('med-pagination', state.medicine)}
    </div>`;
  attachPaginationEvents('med-pagination', state.medicine, renderMedicineTable);
}

function renderPharmaCompanies() {
  const search = (document.getElementById('pharma-company-search')?.value || '').toLowerCase();
  const companies = (state.medicine.manufacturers || []).filter(c => {
    if (!search) return true;
    return (c.name || '').toLowerCase().includes(search);
  });
  const countEl = document.getElementById('pharma-company-count');
  if (countEl) countEl.textContent = companies.length.toLocaleString();

  const wrap = document.getElementById('pharma-companies-wrap');
  if (!companies.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-icon">🏭</div><h3>No companies found</h3></div>`;
    return;
  }
  wrap.innerHTML = `
    <div class="cards-grid">
      ${companies.map(c => `
        <div class="info-card">
          <div class="info-card-header">
            <div>
              <div class="info-card-title">${esc(c.name)}</div>
              <div class="info-card-sub">Pharmaceutical Manufacturer</div>
            </div>
            <span class="badge badge-primary font-mono">${(c.medicines_count || 0).toLocaleString()} Drugs</span>
          </div>
          <div class="info-row"><span class="info-row-label">Brands Count</span><span class="info-row-value font-mono font-bold">${c.brands_count || '—'}</span></div>
          <div class="info-row"><span class="info-row-label">Generics Formulated</span><span class="info-row-value font-mono">${c.generics_count || '—'}</span></div>
          ${Array.isArray(c.sample_brands) && c.sample_brands.length ? `
            <div class="info-row"><span class="info-row-label">Sample Brands</span><span class="info-row-value"><div class="tag-list">${c.sample_brands.slice(0, 8).map(b => `<span class="tag">${esc(b)}</span>`).join('')}</div></span></div>` : ''}
        </div>
      `).join('')}
    </div>`;
}

// =================== TRANSPORT ===================
async function loadTransport() {
  showLoader('transport-content');
  const [stations, trains, fares, buses, launches, airports, companies] = await Promise.all([
    fetchJSON('transport/railway_stations.json'),
    fetchJSON('transport/intercity_trains.json'),
    fetchJSON('transport/train_fares.json'),
    fetchJSON('transport/bus_routes.json'),
    fetchJSON('transport/launch_routes.json'),
    fetchJSON('transport/airports.json'),
    fetchJSON('transport/transport_companies.json'),
  ]);
  state.transport.stations = stations || [];
  state.transport.trains = trains || [];
  state.transport.fares = fares || [];
  state.transport.buses = buses || [];
  state.transport.launches = launches || [];
  state.transport.airports = airports || [];
  state.transport.companies = companies || [];
  renderTransportTab('trains');
}

function renderTransportTab(tab) {
  state.transport.activeTab = tab;
  setActiveTabs('transport-tabs', tab);
  const content = document.getElementById('transport-content');
  const search = (document.getElementById('transport-search')?.value || '').toLowerCase();
  const catFilter = document.getElementById('transport-company-filter');

  if (catFilter) {
    catFilter.style.display = tab === 'companies' ? 'block' : 'none';
  }

  if (tab === 'trains') {
    let trains = state.transport.trains || [];
    if (search) {
      trains = trains.filter(t =>
        (t.name || '').toLowerCase().includes(search) ||
        (t.train_no || '').toLowerCase().includes(search) ||
        (t.origin || '').toLowerCase().includes(search) ||
        (t.destination || '').toLowerCase().includes(search)
      );
    }
    content.innerHTML = `
      <div class="results-info"><span class="results-count">${trains.length}</span> intercity trains available</div>
      <div class="table-wrapper"><table class="data-table">
        <thead><tr><th>#</th><th>Train</th><th>Number</th><th>Route</th><th>Departure</th><th>Arrival</th><th>Off Day</th><th>Type</th></tr></thead>
        <tbody>${trains.map((t,i)=>`<tr>
          <td class="text-muted font-sm">${i+1}</td>
          <td><div class="font-bold">${esc(t.name)}</div><div class="font-sm text-muted">${esc(t.bn_name||'')}</div></td>
          <td class="font-mono text-primary font-bold">${esc(String(t.train_no||t.number||''))}</td>
          <td class="font-sm">${esc(t.origin||t.from||'')} → ${esc(t.destination||t.to||'')} (${t.distance_km ? t.distance_km + ' km' : ''})</td>
          <td class="font-mono text-green">${esc(t.departure_time||t.departure||'—')}</td>
          <td class="font-mono text-blue">${esc(t.arrival_time||'—')}</td>
          <td><span class="badge ${t.off_day==='None'?'badge-gray':'badge-yellow'}">${esc(t.off_day||'None')}</span></td>
          <td><span class="badge badge-primary">${esc(t.type||'Intercity')}</span></td>
        </tr>`).join('')}
        </tbody></table></div>`;
  } else if (tab === 'companies') {
    const selectedCategory = catFilter?.value || '';
    let companies = state.transport.companies || [];
    if (selectedCategory) {
      companies = companies.filter(c => c.category === selectedCategory);
    }
    if (search) {
      companies = companies.filter(c =>
        (c.name || '').toLowerCase().includes(search) ||
        (c.headquarters || '').toLowerCase().includes(search) ||
        (c.category || '').toLowerCase().includes(search) ||
        (c.coverage_areas || []).some(a => a.toLowerCase().includes(search))
      );
    }
    content.innerHTML = `
      <div class="results-info"><span class="results-count">${companies.length}</span> transport companies & operators</div>
      <div class="cards-grid">${companies.map(c => `
        <div class="info-card">
          <div class="info-card-header">
            <div>
              <div class="info-card-title">${esc(c.name)}</div>
              <div class="info-card-sub">${esc(c.bn_name || '')}</div>
            </div>
            <span class="badge badge-primary">${esc(c.category)}</span>
          </div>
          <div class="info-row"><span class="info-row-label">HQ Location</span><span class="info-row-value">${esc(c.headquarters || '—')}</span></div>
          <div class="info-row"><span class="info-row-label">Hotline</span><span class="info-row-value"><a class="phone-link font-mono font-bold" href="tel:${c.hotline}">${esc(c.hotline || '—')}</a></span></div>
          ${c.website ? `<div class="info-row"><span class="info-row-label">Website</span><span class="info-row-value"><a href="https://${c.website}" target="_blank" class="phone-link">${esc(c.website)}</a></span></div>` : ''}
          ${Array.isArray(c.fleet_types) && c.fleet_types.length ? `
            <div class="info-row"><span class="info-row-label">Fleet</span><span class="info-row-value"><div class="tag-list">${c.fleet_types.map(f => `<span class="tag">${esc(f)}</span>`).join('')}</div></span></div>` : ''}
          ${Array.isArray(c.coverage_areas) && c.coverage_areas.length ? `
            <div class="info-row"><span class="info-row-label">Coverage</span><span class="info-row-value text-muted font-sm">${c.coverage_areas.join(', ')}</span></div>` : ''}
        </div>
      `).join('')}</div>`;
  } else if (tab === 'stations') {
    let stations = state.transport.stations || [];
    if (search) {
      stations = stations.filter(s =>
        (s.name || '').toLowerCase().includes(search) ||
        (s.station_code || s.code || '').toLowerCase().includes(search) ||
        (s.district || '').toLowerCase().includes(search)
      );
    }
    content.innerHTML = `
      <div class="results-info"><span class="results-count">${stations.length}</span> railway stations & junctions</div>
      <div class="table-wrapper"><table class="data-table">
        <thead><tr><th>#</th><th>Station</th><th>Code</th><th>District</th><th>Division</th><th>Zone</th><th>Gauge</th><th>Platforms</th></tr></thead>
        <tbody>${stations.map((s,i)=>`<tr>
          <td class="text-muted font-sm">${i+1}</td>
          <td><div class="font-bold">${esc(s.name)}</div><div class="font-sm text-muted">${esc(s.bn_name||'')}</div></td>
          <td class="font-mono text-primary font-bold">${esc(s.station_code||s.code||'')}</td>
          <td>${esc(s.district||'')}</td>
          <td>${esc(s.division||'')}</td>
          <td><span class="badge ${s.zone==='East Zone'?'badge-blue':'badge-green'}">${esc(s.zone||'—')}</span></td>
          <td class="font-sm">${esc(s.gauge||'—')}</td>
          <td class="font-mono font-bold">${s.platforms || '—'}</td>
        </tr>`).join('')}
        </tbody></table></div>`;
  } else if (tab === 'buses') {
    let buses = state.transport.buses || [];
    if (search) {
      buses = buses.filter(b => (b.route_name || b.route || '').toLowerCase().includes(search));
    }
    content.innerHTML = `
      <div class="results-info"><span class="results-count">${buses.length}</span> major highway bus corridors</div>
      <div class="cards-grid">${buses.map(b=>`
        <div class="info-card">
          <div class="info-card-header">
            <div><div class="info-card-title">${esc(b.route_name||b.route||'')}</div><div class="info-card-sub">${esc(b.highway||'')}</div></div>
            <span class="badge badge-blue font-bold">${esc(String(b.distance_km||b.distance||''))} km</span>
          </div>
          <div class="info-row"><span class="info-row-label">Travel Time</span><span class="info-row-value font-mono text-green">${esc(b.travel_time_hours||b.duration||'—')}</span></div>
          ${Array.isArray(b.boarding_points) ? `<div class="info-row"><span class="info-row-label">Boarding</span><span class="info-row-value font-sm text-muted">${b.boarding_points.join(', ')}</span></div>` : ''}
          ${Array.isArray(b.dropping_points) ? `<div class="info-row"><span class="info-row-label">Dropping</span><span class="info-row-value font-sm text-muted">${b.dropping_points.join(', ')}</span></div>` : ''}
          ${Array.isArray(b.prominent_operators) && b.prominent_operators.length ? `
            <div class="info-row"><span class="info-row-label">Operators</span><span class="info-row-value">
              <div style="display:flex;flex-direction:column;gap:6px">
                ${b.prominent_operators.map(op => `
                  <div style="background:var(--bg3);padding:6px 10px;border-radius:6px;font-size:12px">
                    <div class="font-bold text-primary">${esc(op.operator)}</div>
                    <div class="text-green font-mono">৳ ${esc(op.fare_range_bdt || op.fare_ac || '—')}</div>
                    ${op.hotline ? `<a class="phone-link font-mono font-sm" href="tel:${op.hotline}">📞 ${esc(op.hotline)}</a>` : ''}
                  </div>
                `).join('')}
              </div>
            </span></div>` : ''}
        </div>`).join('')}</div>`;
  } else if (tab === 'launches') {
    let launches = state.transport.launches || [];
    if (search) {
      launches = launches.filter(l => (l.route_name || l.route || '').toLowerCase().includes(search));
    }
    content.innerHTML = `
      <div class="results-info"><span class="results-count">${launches.length}</span> river navigation corridors</div>
      <div class="cards-grid">${launches.map(l=>`
        <div class="info-card">
          <div class="info-card-header">
            <div><div class="info-card-title">${esc(l.route_name||l.route||'')}</div><div class="info-card-sub">${esc(l.departure_terminal||'')}</div></div>
            <span class="badge badge-purple">${esc(String(l.distance_nautical_miles||''))} NM</span>
          </div>
          <div class="info-row"><span class="info-row-label">Arrival Port</span><span class="info-row-value font-bold">${esc(l.arrival_terminal||'—')}</span></div>
          <div class="info-row"><span class="info-row-label">Duration</span><span class="info-row-value font-mono text-green">${esc(l.travel_time_hours||'—')}</span></div>
          ${Array.isArray(l.prominent_launches) ? `
            <div class="info-row"><span class="info-row-label">Vessels</span><span class="info-row-value">
              <div style="display:flex;flex-direction:column;gap:6px">
                ${l.prominent_launches.map(v => `
                  <div style="background:var(--bg3);padding:6px 10px;border-radius:6px;font-size:12px">
                    <div class="font-bold">${esc(v.name)}</div>
                    <div class="text-muted font-sm">${esc(v.operator || '')}</div>
                    <div style="display:flex;gap:8px;margin-top:4px">
                      <span class="badge badge-green font-mono">Single: ৳${esc(String(v.cabin_single_bdt||'—'))}</span>
                      <span class="badge badge-blue font-mono">Double: ৳${esc(String(v.cabin_double_bdt||'—'))}</span>
                      <span class="badge badge-gray font-mono">Deck: ৳${esc(String(v.deck_bdt||'—'))}</span>
                    </div>
                    ${v.hotline ? `<div style="margin-top:4px"><a class="phone-link font-mono font-sm" href="tel:${v.hotline}">📞 ${esc(v.hotline)}</a></div>` : ''}
                  </div>
                `).join('')}
              </div>
            </span></div>` : ''}
        </div>`).join('')}</div>`;
  } else if (tab === 'airports') {
    let airports = state.transport.airports || [];
    if (search) {
      airports = airports.filter(a => (a.name || '').toLowerCase().includes(search) || (a.city || '').toLowerCase().includes(search));
    }
    content.innerHTML = `
      <div class="results-info"><span class="results-count">${airports.length}</span> civil aviation airports & hubs</div>
      <div class="cards-grid">${airports.map(a=>`
        <div class="info-card">
          <div class="info-card-header">
            <div><div class="info-card-title">${esc(a.name||a.airport_name||'')}</div><div class="info-card-sub">${esc(a.bn_name||a.city||'')}</div></div>
            <span class="badge ${(a.type||'').includes('International')?'badge-green':'badge-blue'}">${esc(a.type||'Domestic')}</span>
          </div>
          <div class="info-row"><span class="info-row-label">IATA Code</span><span class="info-row-value font-mono font-bold text-primary">${esc(a.iata_code||a.iata||'—')}</span></div>
          <div class="info-row"><span class="info-row-label">ICAO Code</span><span class="info-row-value font-mono">${esc(a.icao_code||a.icao||'—')}</span></div>
          <div class="info-row"><span class="info-row-label">Runway</span><span class="info-row-value font-mono">${esc(String(a.runway_length_ft||''))} ft</span></div>
          ${a.hotline ? `<div class="info-row"><span class="info-row-label">Hotline</span><span class="info-row-value"><a class="phone-link font-mono" href="tel:${a.hotline}">${esc(a.hotline)}</a></span></div>` : ''}
          <div class="info-row"><span class="info-row-label">Airlines</span><span class="info-row-value font-sm">${Array.isArray(a.airlines)?a.airlines.join(', '):esc(a.airlines||'—')}</span></div>
        </div>`).join('')}</div>`;
  }
}

// =================== HEALTHCARE ===================
async function loadHealthcare() {
  showLoader('healthcare-content');
  const [hospitals, doctors, blood_banks, ambulances, diag] = await Promise.all([
    fetchJSON('healthcare/hospitals.json'),
    fetchJSON('healthcare/doctors.json'),
    fetchJSON('healthcare/blood_banks.json'),
    fetchJSON('healthcare/ambulance_services.json'),
    fetchJSON('healthcare/diagnostic_centers.json'),
  ]);
  state.healthcare.hospitals = hospitals || [];
  state.healthcare.doctors = doctors || [];
  state.healthcare.blood_banks = blood_banks || [];
  state.healthcare.ambulances = ambulances || [];
  state.healthcare.diag = diag || [];

  const districts = [...new Set((hospitals||[]).map(h => h.district).filter(Boolean))].sort();
  const sel = document.getElementById('hosp-district');
  if (sel && sel.options.length <= 1) {
    districts.forEach(d => {
      const o = document.createElement('option');
      o.value = d;
      o.textContent = d;
      sel.appendChild(o);
    });
  }

  renderHealthcareTab(state.healthcare.activeTab);
}

function renderHealthcareTab(tab) {
  state.healthcare.activeTab = tab;
  setActiveTabs('healthcare-tabs', tab);
  const content = document.getElementById('healthcare-content');
  const filtersBar = document.getElementById('healthcare-filters-bar');

  if (filtersBar) {
    filtersBar.style.display = (tab === 'hospitals') ? 'flex' : 'none';
  }

  if (tab === 'hospitals') {
    const search = (document.getElementById('hosp-search')||{value:''}).value?.trim().toLowerCase() || '';
    const district = (document.getElementById('hosp-district')||{value:''}).value || '';
    const typeFilter = (document.getElementById('hosp-type')||{value:''}).value || '';

    const filtered = (state.healthcare.hospitals || []).filter(h => {
      if (district && h.district !== district) return false;
      if (typeFilter) {
        if (typeFilter === 'Government') {
          if (h.type !== 'Government' && h.type !== 'Autonomous Govt') return false;
        } else if (typeFilter === 'Private') {
          if (h.type !== 'Private') return false;
        } else {
          const cat = (h.category || '').toLowerCase();
          if (!cat.includes(typeFilter.toLowerCase())) return false;
        }
      }
      if (search) {
        const match = (h.name || '').toLowerCase().includes(search) ||
                      (h.bn_name || '').toLowerCase().includes(search) ||
                      (h.district || '').toLowerCase().includes(search) ||
                      (h.upazila || '').toLowerCase().includes(search) ||
                      (h.address || '').toLowerCase().includes(search) ||
                      (h.category || '').toLowerCase().includes(search);
        if (!match) return false;
      }
      return true;
    });

    state.healthcare.filtered = filtered;
    const total = filtered.length;
    const withIcu = filtered.filter(h => h.icu_available).length;
    const govtCount = filtered.filter(h => h.type === 'Government' || h.type === 'Autonomous Govt').length;
    const totalBeds = filtered.reduce((acc, h) => acc + (parseInt(h.bed_capacity) || 0), 0);

    const p = state.healthcare.page || 1;
    const start = (p - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    content.innerHTML = `
      <div class="stats-grid" style="margin-bottom:16px">
        <div class="stat-card">
          <div class="stat-card-label">Hospitals & Clinics</div>
          <div class="stat-card-value font-mono">${total.toLocaleString()}</div>
          <div class="stat-card-sub">${district ? esc(district) : 'Across all 64 districts'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Government & UHC</div>
          <div class="stat-card-value text-green font-mono">${govtCount.toLocaleString()}</div>
          <div class="stat-card-sub">Public medical centers</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">With ICU Facilities</div>
          <div class="stat-card-value text-blue font-mono">${withIcu.toLocaleString()}</div>
          <div class="stat-card-sub">Intensive Care Units</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Total Bed Capacity</div>
          <div class="stat-card-value text-yellow font-mono">${totalBeds.toLocaleString()}+</div>
          <div class="stat-card-sub">Inpatient bed capacity</div>
        </div>
      </div>

      ${pageItems.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">🏥</div>
          <h3>No health facilities found</h3>
          <p class="text-muted">No hospitals or clinics matched your filter criteria.</p>
        </div>
      ` : `
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Hospital / Medical Facility</th>
                <th>Category</th>
                <th>District / Upazila</th>
                <th>Type & Beds</th>
                <th>ICU / CCU</th>
                <th>Emergency Helpline</th>
                <th>Map</th>
              </tr>
            </thead>
            <tbody>
              ${pageItems.map((h, i) => {
                const isGovt = h.type === 'Government' || h.type === 'Autonomous Govt';
                let catBadgeClass = 'badge-muted';
                const cat = h.category || '';
                if (cat.includes('Govt Medical')) catBadgeClass = 'badge-green';
                else if (cat.includes('Upazila Health')) catBadgeClass = 'badge-blue';
                else if (cat.includes('District Sadar')) catBadgeClass = 'badge-primary';
                else if (cat.includes('Specialized')) catBadgeClass = 'badge-purple';
                else if (cat.includes('Private Medical')) catBadgeClass = 'badge-yellow';

                return `
                  <tr>
                    <td class="text-muted font-mono font-sm">${start + i + 1}</td>
                    <td>
                      <div class="font-bold" style="font-size:13.5px">${esc(h.name)}</div>
                      ${h.bn_name ? `<div class="text-primary font-sm">${esc(h.bn_name)}</div>` : ''}
                      <div class="font-sm text-muted" style="margin-top:2px">${esc(h.address || '')}</div>
                    </td>
                    <td><span class="badge ${catBadgeClass}">${esc(cat || 'Hospital')}</span></td>
                    <td>
                      <div class="font-bold">${esc(h.district)}</div>
                      ${h.upazila ? `<div class="font-sm text-muted">${esc(h.upazila)}</div>` : ''}
                    </td>
                    <td>
                      <div><span class="badge ${isGovt ? 'badge-green' : 'badge-blue'}">${esc(h.type || 'Hospital')}</span></div>
                      ${h.bed_capacity ? `<div class="font-mono font-sm text-muted" style="margin-top:3px">${h.bed_capacity} Beds</div>` : ''}
                    </td>
                    <td>
                      <div>${h.icu_available ? '<span class="badge badge-green font-sm">ICU Available</span>' : '<span class="badge badge-muted font-sm">No ICU</span>'}</div>
                      ${h.ccu_available ? '<div style="margin-top:2px"><span class="badge badge-blue font-sm">CCU</span></div>' : ''}
                    </td>
                    <td class="font-mono font-sm">
                      ${h.emergency_hotline ? `<div>📞 <a href="tel:${esc(h.emergency_hotline.split('/')[0].trim())}">${esc(h.emergency_hotline)}</a></div>` : '<span class="text-muted">—</span>'}
                      ${h.telephone && h.telephone !== h.emergency_hotline ? `<div class="text-muted font-sm">Tel: <a href="tel:${esc(h.telephone)}">${esc(h.telephone)}</a></div>` : ''}
                      ${h.website ? `<div>🌐 <a href="${esc(h.website)}" target="_blank" rel="noopener">Website</a></div>` : ''}
                    </td>
                    <td>
                      ${h.latitude && h.longitude ? `
                        <a href="https://www.google.com/maps?q=${h.latitude},${h.longitude}" target="_blank" rel="noopener" class="btn btn-sm" style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.3);padding:3px 8px;border-radius:4px;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px">
                          📍 Map
                        </a>
                      ` : '<span class="text-muted font-sm">—</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        ${renderPaginationHTML('hosp-pagination', state.healthcare)}
      `}
    `;

    attachPaginationEvents('hosp-pagination', state.healthcare, () => renderHealthcareTab('hospitals'));
  } else if (tab === 'doctors') {
    content.innerHTML = `<div class="cards-grid">${(state.healthcare.doctors||[]).map(d => `
      <div class="info-card">
        <div class="info-card-header">
          <div><div class="info-card-title">${esc(d.name)}</div><div class="info-card-sub">${esc(d.speciality||d.specialty||'')}</div></div>
          <span class="badge badge-primary">${esc(d.degree||'')}</span>
        </div>
        <div class="info-row"><span class="info-row-label">BMDC Reg.</span><span class="info-row-value font-mono">${esc(d.bmdc_reg||'N/A')}</span></div>
        <div class="info-row"><span class="info-row-label">Hospital</span><span class="info-row-value">${esc(d.hospital||'')}</span></div>
        <div class="info-row"><span class="info-row-label">District</span><span class="info-row-value">${esc(d.district||'')}</span></div>
        <div class="info-row"><span class="info-row-label">Fee</span><span class="info-row-value text-green font-bold">${esc(d.consultation_fee||'')}</span></div>
        <div class="info-row"><span class="info-row-label">Phone</span><span class="info-row-value"><a class="phone-link" href="tel:${d.phone}">${esc(d.phone||'')}</a></span></div>
      </div>`).join('')}</div>`;
  } else if (tab === 'blood') {
    content.innerHTML = `<div class="cards-grid">${(state.healthcare.blood_banks||[]).map(b => `
      <div class="info-card">
        <div class="info-card-header">
          <div><div class="info-card-title">${esc(b.name)}</div><div class="info-card-sub">${esc(b.district)}</div></div>
          ${b.emergency_24_7 ? '<span class="badge badge-red">24/7</span>' : ''}
        </div>
        <div class="info-row"><span class="info-row-label">Address</span><span class="info-row-value">${esc(b.address||'')}</span></div>
        <div class="info-row"><span class="info-row-label">Hotline</span><span class="info-row-value"><a class="phone-link font-mono" href="tel:${b.hotline}">${esc(b.hotline||'')}</a></span></div>
        <div class="info-row"><span class="info-row-label">Components</span><span class="info-row-value"><div class="tag-list">${(b.components||[]).map(c=>`<span class="tag">${esc(c)}</span>`).join('')}</div></span></div>
      </div>`).join('')}</div>`;
  } else if (tab === 'ambulance') {
    content.innerHTML = `<div class="cards-grid">${(state.healthcare.ambulances||[]).map(a => `
      <div class="info-card">
        <div class="info-card-header">
          <div><div class="info-card-title">${esc(a.name)}</div><div class="info-card-sub">${esc(a.type||'')}</div></div>
          ${a.air_ambulance ? '<span class="badge badge-purple">✈ Air</span>' : ''}
        </div>
        <div class="info-row"><span class="info-row-label">Coverage</span><span class="info-row-value">${esc(a.coverage||'')}</span></div>
        <div class="info-row"><span class="info-row-label">Hotline</span><span class="info-row-value"><a class="phone-link font-mono" href="tel:${a.hotline}">${esc(a.hotline||'')}</a></span></div>
        <div class="info-row"><span class="info-row-label">Fee</span><span class="info-row-value">${esc(a.base_fare||a.fee||'—')}</span></div>
      </div>`).join('')}</div>`;
  }
}

// =================== GEOGRAPHY ===================
async function loadGeography() {
  showLoader('geo-content');
  const [divs, dists, hierarchy, postal] = await Promise.all([
    fetchJSON('geography/divisions.json'),
    fetchJSON('geography/districts.json'),
    fetchJSON('geography/hierarchy.json'),
    fetchJSON('geography/postal_codes.json'),
  ]);
  state.geography.divisions = divs || [];
  state.geography.districts = dists || [];
  state.geography.hierarchy = hierarchy || {};
  state.geography.postal = postal || [];
  renderGeographyTab('hierarchy');
}

function renderGeographyTab(tab) {
  state.geography.activeTab = tab;
  setActiveTabs('geo-tabs', tab);
  const content = document.getElementById('geo-content');

  if (tab === 'hierarchy') {
    const h = state.geography.hierarchy;
    let html = '<div class="hierarchy-tree">';
    for (const [divName, divData] of Object.entries(h)) {
      html += `<div class="hierarchy-node level-0">🗂️ ${esc(divName)} <span class="text-muted font-sm" style="margin-left:auto">${Object.keys(divData.districts||divData||{}).length} districts</span></div>`;
      const districts = divData.districts || divData || {};
      for (const [distName, distData] of Object.entries(districts)) {
        const upazilas = distData.upazilas || distData || {};
        html += `<div class="hierarchy-node level-1">🏙️ ${esc(distName)} <span class="text-muted font-sm" style="margin-left:auto">${Object.keys(upazilas).length} upazilas</span></div>`;
      }
    }
    html += '</div>';
    content.innerHTML = html;
  } else if (tab === 'districts') {
    const dists = state.geography.districts || [];
    content.innerHTML = `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>#</th><th>District</th><th>বাংলা</th><th>Division</th><th>Area (km²)</th><th>Population</th></tr></thead>
      <tbody>${dists.map((d,i) => `<tr>
        <td class="text-muted font-sm">${i+1}</td>
        <td class="font-bold">${esc(d.name||d.district_name||d.name_en||'')}</td>
        <td>${esc(d.bn_name||d.name_bn||d.district_name_bn||'')}</td>
        <td>${esc(d.division_name||d.division||'')}</td>
        <td class="font-mono">${esc(String(d.area||d.area_km2||'—'))}</td>
        <td class="font-mono">${d.population ? Number(d.population).toLocaleString() : '—'}</td>
      </tr>`).join('')}
      </tbody></table></div>`;
  } else if (tab === 'postal') {
    const postal = state.geography.postal || [];
    const search = (document.getElementById('postal-search')||{value:''}).value?.toLowerCase()||'';
    const filtered = search ? postal.filter(p =>
      (p.postOffice||p.post_office||'').toLowerCase().includes(search) ||
      (p.district||'').toLowerCase().includes(search) ||
      String(p.postCode||p.post_code||'').includes(search)
    ) : postal;
    content.innerHTML = `
      <div class="filters-bar" style="margin-bottom:12px">
        <div class="search-wrap"><span class="search-icon">🔍</span>
          <input class="search-input" id="postal-search" placeholder="Search post office, district, code…" oninput="state.geography.postal&&renderPostalSearch(this.value)">
        </div>
        <div class="results-info"><span class="results-count">${filtered.length.toLocaleString()}</span> postal codes</div>
      </div>
      <div class="table-wrapper"><table class="data-table">
        <thead><tr><th>Post Code</th><th>Post Office</th><th>বাংলা</th><th>Upazila</th><th>District</th><th>Division</th></tr></thead>
        <tbody>${filtered.slice(0,200).map(p => `<tr>
          <td class="font-mono font-bold text-primary">${esc(String(p.postCode||p.post_code||''))}</td>
          <td>${esc(p.postOffice||p.post_office||p.name_en||'')}</td>
          <td>${esc(p.postOfficeBn||p.name_bn||'')}</td>
          <td>${esc(p.upazila||p.upazila_name||'')}</td>
          <td>${esc(p.district||p.district_name||'')}</td>
          <td>${esc(p.division||p.division_name||'')}</td>
        </tr>`).join('')}
        </tbody></table>
        ${filtered.length > 200 ? `<div class="pagination"><div class="pagination-info">Showing first 200 of ${filtered.length.toLocaleString()}. Use search to narrow results.</div></div>` : ''}
      </div>`;
  }
}

window.renderPostalSearch = function(val) {
  state.geography.postalSearch = val;
  renderGeographyTab('postal');
};

// =================== LAW ===================
async function loadLaw() {
  showLoader('law-content');
  const [constitution, penal, crpc, acts, glossary] = await Promise.all([
    fetchJSON('law/constitution.json'),
    fetchJSON('law/penal_code_1860.json'),
    fetchJSON('law/major_acts_catalog.json'),
    fetchJSON('law/crpc_1898.json'),
    fetchJSON('law/legal_terms_glossary.json'),
  ]);
  state.law.constitution = constitution || {};
  state.law.penal = penal || {};
  state.law.crpc = crpc || {};
  state.law.acts = acts || {};
  state.law.glossary = glossary || {};
  renderLawTab('constitution');
}

function renderLawTab(tab) {
  state.law.activeTab = tab;
  setActiveTabs('law-tabs', tab);
  const content = document.getElementById('law-content');

  if (tab === 'constitution') {
    const data = state.law.constitution;
    const parts = data.parts || data.sections || [];
    const articles = data.articles || [];
    let html = '';
    if (parts.length) {
      html = parts.map(p => `
        <div class="info-card" style="margin-bottom:12px">
          <div class="info-card-header">
            <div><div class="info-card-title">${esc(p.part||p.title||p.name||'')}</div><div class="info-card-sub">${esc(p.title||p.heading||'')}</div></div>
            ${p.articles_range ? `<span class="badge badge-primary">Arts. ${esc(p.articles_range)}</span>` : ''}
          </div>
          <div class="info-card-body">${esc(p.summary||p.description||p.content||'').slice(0,300)}${(p.summary||'').length>300?'…':''}</div>
        </div>`).join('');
    } else if (articles.length) {
      html = `<div class="table-wrapper"><table class="data-table">
        <thead><tr><th>Article</th><th>Title</th><th>Summary</th></tr></thead>
        <tbody>${articles.map(a=>`<tr>
          <td class="font-mono font-bold text-primary">${esc(String(a.number||a.article||''))}</td>
          <td class="font-bold">${esc(a.title||a.heading||'')}</td>
          <td class="text-muted font-sm">${esc((a.text||a.content||a.summary||'').slice(0,200))}…</td>
        </tr>`).join('')}</tbody></table></div>`;
    }
    content.innerHTML = html;
  } else if (tab === 'penal') {
    const data = state.law.penal;
    const sections = data.sections || (Array.isArray(data) ? data : []);
    content.innerHTML = `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Section</th><th>Offence</th><th>Punishment</th><th>Cognizable</th></tr></thead>
      <tbody>${sections.map(s=>`<tr>
        <td class="font-mono font-bold text-primary">§${esc(String(s.section||s.number||''))}</td>
        <td><div class="font-bold">${esc(s.title||s.offence||s.heading||'')}</div><div class="font-sm text-muted">${esc((s.description||s.text||'').slice(0,100))}</div></td>
        <td class="font-sm">${esc(s.punishment||s.penalty||'—')}</td>
        <td>${s.cognizable===true?'<span class="badge badge-red">Yes</span>':s.cognizable===false?'<span class="badge badge-gray">No</span>':'—'}</td>
      </tr>`).join('')}
      </tbody></table></div>`;
  } else if (tab === 'crpc') {
    const data = state.law.crpc;
    const sections = data.sections || (Array.isArray(data) ? data : []);
    content.innerHTML = `<div class="cards-grid">${sections.map(s=>`
      <div class="info-card">
        <div class="info-card-header">
          <div><div class="info-card-title">Section ${esc(String(s.section||s.number||''))}</div><div class="info-card-sub">${esc(s.title||s.heading||'')}</div></div>
        </div>
        <div class="info-card-body">${esc((s.text||s.content||s.summary||s.description||'').slice(0,250))}${((s.text||s.content||s.summary||'').length>250)?'…':''}</div>
      </div>`).join('')}</div>`;
  } else if (tab === 'acts') {
    const data = state.law.acts;
    const acts = data.acts || (Array.isArray(data) ? data : Object.values(data));
    content.innerHTML = `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>#</th><th>Act Name</th><th>Year</th><th>Category</th><th>Status</th></tr></thead>
      <tbody>${acts.map((a,i)=>`<tr>
        <td class="text-muted font-sm">${i+1}</td>
        <td class="font-bold">${esc(a.name||a.title||a.act_name||'')}</td>
        <td class="font-mono">${esc(String(a.year||a.enacted||''))}</td>
        <td>${a.category ? `<span class="badge badge-blue">${esc(a.category)}</span>` : '—'}</td>
        <td>${a.status==='In Force'||a.active===true?'<span class="badge badge-green">In Force</span>':a.status?`<span class="badge badge-gray">${esc(a.status)}</span>`:'—'}</td>
      </tr>`).join('')}
      </tbody></table></div>`;
  } else if (tab === 'glossary') {
    const data = state.law.glossary;
    const terms = data.terms || (Array.isArray(data) ? data : []);
    content.innerHTML = `<div class="cards-grid">${terms.map(t=>`
      <div class="info-card">
        <div class="info-card-title" style="margin-bottom:6px">${esc(t.term||t.name||t.latin||'')}</div>
        ${t.bn ? `<div class="font-sm text-muted" style="margin-bottom:8px">${esc(t.bn)}</div>` : ''}
        <div class="info-card-body">${esc(t.definition||t.meaning||t.description||'')}</div>
      </div>`).join('')}</div>`;
  }
}

// =================== EMERGENCY ===================
async function loadEmergency() {
  showLoader('emergency-content');
  const [hotlines, police, fire, admin] = await Promise.all([
    fetchJSON('emergency/national_hotlines.json'),
    fetchJSON('emergency/police_stations.json'),
    fetchJSON('emergency/fire_stations.json'),
    fetchJSON('emergency/district_administration.json'),
  ]);
  state.emergency.hotlines = hotlines || [];
  state.emergency.police = police || [];
  state.emergency.fire = fire || [];
  state.emergency.admin = admin || [];

  const districts = [...new Set((police||[]).map(p => p.district).filter(Boolean))].sort();
  const sel = document.getElementById('emergency-district');
  if (sel) districts.forEach(d => { const o = document.createElement('option'); o.value = d; o.textContent = d; sel.appendChild(o); });

  renderEmergencyTab('hotlines');
}

function renderEmergencyTab(tab) {
  state.emergency.activeTab = tab;
  setActiveTabs('emergency-tabs', tab);
  const content = document.getElementById('emergency-content');
  const search = (document.getElementById('emergency-search')||{value:''}).value?.toLowerCase()||'';
  const district = (document.getElementById('emergency-district')||{value:''}).value||'';

  if (tab === 'hotlines') {
    content.innerHTML = `<div class="hotline-grid">${(state.emergency.hotlines||[]).map(h=>`
      <div class="hotline-card">
        <div class="hotline-num">${esc(String(h.number||h.code||''))}</div>
        <div>
          <div class="hotline-info-name">${esc(h.name||h.service||'')}</div>
          <div class="hotline-info-desc">${esc(h.description||h.desc||h.type||'')}</div>
        </div>
      </div>`).join('')}</div>`;
  } else if (tab === 'police') {
    const filtered = (state.emergency.police||[]).filter(p => {
      if (district && p.district !== district) return false;
      if (search) return (p.name||p.thana||'').toLowerCase().includes(search) || (p.district||'').toLowerCase().includes(search);
      return true;
    });
    content.innerHTML = `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>#</th><th>Station / Thana</th><th>District</th><th>OC Name</th><th>Duty Officer</th><th>Phone</th></tr></thead>
      <tbody>${filtered.map((p,i)=>`<tr>
        <td class="text-muted font-sm">${i+1}</td>
        <td class="font-bold">${esc(p.name||p.thana||p.station||'')}</td>
        <td>${esc(p.district||'')}</td>
        <td>${esc(p.oc_name||p.officer||'—')}</td>
        <td>${esc(p.duty_officer||'—')}</td>
        <td><a class="phone-link font-mono" href="tel:${p.phone||p.contact}">${esc(p.phone||p.contact||'—')}</a></td>
      </tr>`).join('')}
      </tbody></table></div>`;
  } else if (tab === 'fire') {
    const filtered = (state.emergency.fire||[]).filter(f => {
      if (district && f.district !== district) return false;
      if (search) return (f.name||f.station||'').toLowerCase().includes(search) || (f.district||'').toLowerCase().includes(search);
      return true;
    });
    content.innerHTML = `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>#</th><th>Fire Station</th><th>District</th><th>Division</th><th>Phone</th></tr></thead>
      <tbody>${filtered.map((f,i)=>`<tr>
        <td class="text-muted font-sm">${i+1}</td>
        <td class="font-bold">${esc(f.name||f.station||'')}</td>
        <td>${esc(f.district||'')}</td>
        <td>${esc(f.division||'')}</td>
        <td><a class="phone-link font-mono" href="tel:${f.phone||f.contact}">${esc(f.phone||f.contact||'—')}</a></td>
      </tr>`).join('')}
      </tbody></table></div>`;
  } else if (tab === 'admin') {
    const filtered = (state.emergency.admin||[]).filter(a => {
      if (district && a.district !== district) return false;
      if (search) return (a.district||'').toLowerCase().includes(search) || (a.dc_name||'').toLowerCase().includes(search);
      return true;
    });
    content.innerHTML = `<div class="table-wrapper"><table class="data-table">
      <thead><tr><th>#</th><th>District</th><th>DC Name</th><th>DC Phone</th><th>SP Phone</th><th>Email</th></tr></thead>
      <tbody>${filtered.map((a,i)=>`<tr>
        <td class="text-muted font-sm">${i+1}</td>
        <td class="font-bold">${esc(a.district||'')}</td>
        <td>${esc(a.dc_name||'—')}</td>
        <td><a class="phone-link font-mono" href="tel:${a.dc_phone}">${esc(a.dc_phone||'—')}</a></td>
        <td><a class="phone-link font-mono" href="tel:${a.sp_phone}">${esc(a.sp_phone||'—')}</a></td>
        <td class="font-sm">${a.email?`<a href="mailto:${a.email}">${esc(a.email)}</a>`:'—'}</td>
      </tr>`).join('')}
      </tbody></table></div>`;
  }
}

// =================== BANKING ===================
async function loadBanking() {
  showLoader('banking-content');
  const [banks, branches, mfs] = await Promise.all([
    fetchJSON('banking/banks.json'),
    fetchJSON('banking/branches.json'),
    fetchJSON('banking/mfs_providers.json'),
  ]);
  state.banking.banks = banks || [];
  state.banking.branches = branches || [];
  state.banking.mfs = mfs || [];

  const bankSel = document.getElementById('branch-bank');
  if (bankSel) {
    const bankNames = [...new Set((branches||[]).map(b => b.bank_name).filter(Boolean))].sort();
    bankNames.forEach(b => { const o = document.createElement('option'); o.value = b; o.textContent = b; bankSel.appendChild(o); });
  }
  const distSel = document.getElementById('branch-district');
  if (distSel) {
    const dists = [...new Set((branches||[]).map(b => b.district).filter(Boolean))].sort();
    dists.forEach(d => { const o = document.createElement('option'); o.value = d; o.textContent = d; distSel.appendChild(o); });
  }

  renderBankingTab('banks');
}

function renderBankingTab(tab) {
  state.banking.activeTab = tab;
  setActiveTabs('banking-tabs', tab);
  const content = document.getElementById('banking-content');

  if (tab === 'banks') {
    const banks = state.banking.banks || [];
    content.innerHTML = `
      <div class="stats-grid" style="margin-bottom:16px">
        <div class="stat-card"><div class="stat-card-label">Scheduled Banks</div><div class="stat-card-value">${banks.length}</div></div>
        <div class="stat-card"><div class="stat-card-label">State-owned</div><div class="stat-card-value">${banks.filter(b=>b.type==='State-owned Commercial Bank'||b.bank_type==='State-Owned Commercial Bank'||(b.type||'').includes('State')).length}</div></div>
        <div class="stat-card"><div class="stat-card-label">Private</div><div class="stat-card-value">${banks.filter(b=>(b.type||b.bank_type||'').toLowerCase().includes('private')).length}</div></div>
        <div class="stat-card"><div class="stat-card-label">Foreign</div><div class="stat-card-value">${banks.filter(b=>(b.type||b.bank_type||'').toLowerCase().includes('foreign')).length}</div></div>
      </div>
      <div class="table-wrapper"><table class="data-table">
        <thead><tr><th>#</th><th>Bank Name</th><th>Short Name</th><th>Type</th><th>HQ</th><th>SWIFT</th></tr></thead>
        <tbody>${banks.map((b,i)=>`<tr>
          <td class="text-muted font-sm">${i+1}</td>
          <td class="font-bold">${esc(b.name||b.bank_name||'')}</td>
          <td class="font-mono text-primary">${esc(b.short_name||b.abbreviation||'—')}</td>
          <td>${b.type||b.bank_type?`<span class="badge badge-blue">${esc(b.type||b.bank_type)}</span>`:'—'}</td>
          <td class="font-sm text-muted">${esc(b.hq||b.headquarter||b.head_office||'—')}</td>
          <td class="font-mono font-sm">${esc(b.swift_code||b.swift||'—')}</td>
        </tr>`).join('')}
        </tbody></table></div>`;
  } else if (tab === 'branches') {
    const search = (document.getElementById('branch-search')||{value:''}).value?.toLowerCase()||'';
    const bank = (document.getElementById('branch-bank')||{value:''}).value||'';
    const dist = (document.getElementById('branch-district')||{value:''}).value||'';
    let filtered = state.banking.branches || [];
    if (bank) filtered = filtered.filter(b => b.bank_name === bank);
    if (dist) filtered = filtered.filter(b => b.district === dist);
    if (search) filtered = filtered.filter(b =>
      (b.branch_name||'').toLowerCase().includes(search) ||
      (b.bank_name||'').toLowerCase().includes(search) ||
      (b.district||'').toLowerCase().includes(search)
    );
    const page = state.banking.branchPage || 1;
    const start = (page - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);
    content.innerHTML = `
      <div class="results-info" style="margin-bottom:12px">
        <span class="results-count">${filtered.length.toLocaleString()}</span> branches found
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>#</th><th>Branch</th><th>Bank</th><th>District</th><th>Upazila</th><th>Routing No.</th></tr></thead>
          <tbody>${slice.map((b,i)=>`<tr>
            <td class="text-muted font-sm">${start+i+1}</td>
            <td class="font-bold">${esc(b.branch_name||b.name||'')}</td>
            <td class="font-sm text-muted">${esc(b.bank_name||'')}</td>
            <td>${esc(b.district||'')}</td>
            <td>${esc(b.upazila||'')}</td>
            <td class="font-mono text-primary">${esc(b.routing_number||b.routing||'—')}</td>
          </tr>`).join('')}
          </tbody>
        </table>
        <div class="pagination">
          <div class="pagination-info">Showing ${start+1}–${Math.min(start+PAGE_SIZE,filtered.length)} of ${filtered.length.toLocaleString()}</div>
          <div class="pagination-controls">
            <button class="page-btn" onclick="changeBranchPage(${page-1})" ${page<=1?'disabled':''}>‹</button>
            <span class="page-btn active">${page}</span>
            <span class="text-muted" style="padding:0 8px">of ${Math.ceil(filtered.length/PAGE_SIZE)}</span>
            <button class="page-btn" onclick="changeBranchPage(${page+1})" ${page>=Math.ceil(filtered.length/PAGE_SIZE)?'disabled':''}>›</button>
          </div>
        </div>
      </div>`;
  } else if (tab === 'mfs') {
    const mfs = state.banking.mfs || [];
    content.innerHTML = `<div class="cards-grid">${mfs.map(m=>`
      <div class="info-card">
        <div class="info-card-header">
          <div><div class="info-card-title">${esc(m.name||'')}</div><div class="info-card-sub">${esc(m.full_name||m.operator||'')}</div></div>
          ${m.launched ? `<span class="badge badge-primary">${esc(String(m.launched||''))}</span>` : ''}
        </div>
        <div class="info-row"><span class="info-row-label">Operator</span><span class="info-row-value">${esc(m.operator||m.company||'—')}</span></div>
        <div class="info-row"><span class="info-row-label">Subscribers</span><span class="info-row-value">${esc(m.subscribers||m.users||'—')}</span></div>
        <div class="info-row"><span class="info-row-label">Helpline</span><span class="info-row-value"><a class="phone-link font-mono" href="tel:${m.helpline}">${esc(m.helpline||'—')}</a></span></div>
        <div class="info-row"><span class="info-row-label">Send Money</span><span class="info-row-value">${esc(m.send_money_charge||'—')}</span></div>
        <div class="info-row"><span class="info-row-label">Cash Out</span><span class="info-row-value">${esc(m.cash_out_charge||'—')}</span></div>
      </div>`).join('')}</div>`;
  }
}

window.changeBranchPage = function(page) {
  state.banking.branchPage = page;
  renderBankingTab('branches');
};

// =================== BANBEIS TEACHERS DATABASE ===================
async function loadTeachers() {
  showLoader('teachers-content');
  if (!state.teachers.summary) {
    state.teachers.summary = await fetchJSON('education/teachers/teachers_summary.json') || {};
  }

  // Populate Division dropdown
  const divSelect = document.getElementById('teachers-div-select');
  if (divSelect) {
    const divs = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Sylhet'];
    divSelect.innerHTML = divs.map(d => `<option value="${esc(d)}" ${d === state.teachers.activeDiv ? 'selected' : ''}>${esc(d)}</option>`).join('');
  }

  // Populate Designation filter
  const desigSelect = document.getElementById('teachers-desig-select');
  if (desigSelect && state.teachers.summary.top_designations) {
    const desigs = Object.keys(state.teachers.summary.top_designations);
    desigSelect.innerHTML = `<option value="">All Designations (198K)</option>` +
      desigs.map(dg => `<option value="${esc(dg)}" ${dg === state.teachers.activeDesig ? 'selected' : ''}>${esc(dg)} (${state.teachers.summary.top_designations[dg].toLocaleString()})</option>`).join('');
  }

  await onTeachersDivisionChange(state.teachers.activeDiv || 'Dhaka', true);
}

window.onTeachersDivisionChange = async function(div, keepCurrent = false) {
  state.teachers.activeDiv = div;
  const distSelect = document.getElementById('teachers-dist-select');
  if (!state.teachers.summary) {
    state.teachers.summary = await fetchJSON('education/teachers/teachers_summary.json') || {};
  }

  const allDistKeys = Object.keys(state.teachers.summary.districts || {});
  const divDists = allDistKeys
    .filter(k => k.startsWith(div + '__'))
    .map(k => k.split('__')[1]);

  if (!keepCurrent || !divDists.includes(state.teachers.activeDistrict)) {
    state.teachers.activeDistrict = divDists[0] || '';
  }

  if (distSelect) {
    distSelect.innerHTML = divDists.map(d => {
      const count = state.teachers.summary.districts[`${div}__${d}`] || 0;
      return `<option value="${esc(d)}" ${d === state.teachers.activeDistrict ? 'selected' : ''}>${esc(d)} (${count.toLocaleString()} Teachers)</option>`;
    }).join('');
  }

  await onTeachersDistrictChange(state.teachers.activeDistrict, keepCurrent);
};

window.onTeachersDistrictChange = async function(dist, keepCurrent = false) {
  state.teachers.activeDistrict = dist;
  await loadTeachersDistrictData();
};

window.onTeachersDesignationChange = function(desig) {
  state.teachers.activeDesig = desig;
  executeTeacherFilter();
};

async function loadTeachersDistrictData() {
  const div = state.teachers.activeDiv;
  const dist = state.teachers.activeDistrict;
  const content = document.getElementById('teachers-content');
  if (!div || !dist) return;
  showLoader('teachers-content');

  try {
    const list = await fetchJSON(`education/teachers/${div}__${dist}.json`);
    state.teachers.teachersList = list || [];
    state.teachers.page = 1;
    executeTeacherFilter();
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Could not load teachers data</h3><p class="text-muted">${esc(err.message)}</p></div>`;
  }
}

let teacherSearchDebounce = null;
window.filterTeachersLive = function(query) {
  if (query !== undefined) state.teachers.search = query;
  clearTimeout(teacherSearchDebounce);
  teacherSearchDebounce = setTimeout(() => {
    executeTeacherFilter();
  }, 120);
};

function executeTeacherFilter() {
  const q = (state.teachers.search || '').trim().toLowerCase();
  const desig = (state.teachers.activeDesig || '').trim().toLowerCase();
  let list = state.teachers.teachersList || [];

  if (desig) {
    list = list.filter(t => (t.designation || '').toLowerCase().includes(desig));
  }

  if (q) {
    list = list.filter(t => {
      if ((t.teacher_name || '').toLowerCase().includes(q)) return true;
      if ((t.designation || '').toLowerCase().includes(q)) return true;
      if ((t.institution_name || '').toLowerCase().includes(q)) return true;
      if (String(t.eiin || '').includes(q)) return true;
      if ((t.upazila || '').toLowerCase().includes(q)) return true;
      return false;
    });
  }

  state.teachers.filtered = list;
  state.teachers.page = 1;
  renderTeachersTable();
}

function renderTeachersTable() {
  const content = document.getElementById('teachers-content');
  const allInDistrict = state.teachers.teachersList || [];
  const filtered = state.teachers.filtered || [];

  const total = filtered.length;
  const headmasters = filtered.filter(t => (t.designation || '').toUpperCase().includes('HEADMASTER') || (t.designation || '').toUpperCase().includes('HEAD MASTER')).length;
  const asstTeachers = filtered.filter(t => (t.designation || '').toUpperCase().includes('ASSISTANT TEACHER')).length;
  const coveredSchools = new Set(filtered.map(t => t.eiin).filter(Boolean)).size;

  const p = state.teachers.page;
  const start = (p - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  content.innerHTML = `
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-card-label">Teachers in View</div>
        <div class="stat-card-value font-mono">${total.toLocaleString()}</div>
        <div class="stat-card-sub">${esc(state.teachers.activeDiv)} &bull; ${esc(state.teachers.activeDistrict)} (${allInDistrict.length.toLocaleString()} total in district)</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Headmasters / Principals</div>
        <div class="stat-card-value text-green font-mono">${headmasters.toLocaleString()}</div>
        <div class="stat-card-sub">School leaders</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Assistant Teachers</div>
        <div class="stat-card-value text-blue font-mono">${asstTeachers.toLocaleString()}</div>
        <div class="stat-card-sub">Subject & general teachers</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Institutions Covered</div>
        <div class="stat-card-value text-yellow font-mono">${coveredSchools.toLocaleString()}</div>
        <div class="stat-card-sub">Unique EIIN schools in view</div>
      </div>
    </div>

    ${pageItems.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No teachers found</h3>
        <p class="text-muted">No teachers matched your search query in ${esc(state.teachers.activeDistrict)}.</p>
      </div>
    ` : `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Teacher Name</th>
              <th>Designation</th>
              <th>Institution & EIIN</th>
              <th>Location</th>
              <th>First Joining</th>
              <th>Birth Date</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map((t, idx) => {
              const isHead = (t.designation || '').toUpperCase().includes('HEADMASTER') || (t.designation || '').toUpperCase().includes('HEAD MASTER');
              let badgeColor = 'badge-blue';
              if (isHead) badgeColor = 'badge-green';
              else if ((t.designation || '').toUpperCase().includes('PHYSICAL')) badgeColor = 'badge-yellow';
              else if ((t.designation || '').toUpperCase().includes('EMPLOYEE')) badgeColor = 'badge-muted';

              return `
                <tr>
                  <td class="font-mono text-muted font-sm">${start + idx + 1}</td>
                  <td>
                    <div class="font-bold" style="color:var(--text);font-size:13.5px">👤 ${esc(t.teacher_name)}</div>
                    ${t.year ? `<span class="badge font-mono font-sm" style="background:var(--bg3);color:var(--text-dim);font-size:10px">Census: ${esc(t.year)}</span>` : ''}
                  </td>
                  <td>
                    <span class="badge ${badgeColor}">${esc(t.designation || 'Teacher')}</span>
                  </td>
                  <td>
                    <div class="font-bold" style="font-size:13px">${esc(t.institution_name || 'School')}</div>
                    <div style="margin-top:2px;display:flex;gap:6px;align-items:center">
                      <span class="badge font-mono font-sm" style="background:var(--bg3);color:var(--text)">EIIN: ${esc(t.eiin || '—')}</span>
                      <span class="text-muted font-sm">${esc(t.institution_type || 'SCHOOL')}</span>
                    </div>
                  </td>
                  <td>
                    <div class="font-bold">${esc(t.upazila || '—')}</div>
                    <div class="text-muted font-sm">${esc(t.district || state.teachers.activeDistrict)}</div>
                  </td>
                  <td class="font-mono font-sm">
                    ${t.first_joining_date ? `<div>📅 ${esc(t.first_joining_date)}</div>` : '<span class="text-muted">—</span>'}
                  </td>
                  <td class="font-mono font-sm text-muted">
                    ${t.date_of_birth ? esc(t.date_of_birth) : '—'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ${renderPaginationHTML('teachers-pagination', state.teachers)}
    `}
  `;

  attachPaginationEvents('teachers-pagination', state.teachers, renderTeachersTable);
}

// =================== EDUCATION INSTITUTIONS & TEACHERS ===================
const EDU_TYPE_LABELS = {
  school: '🏫 Secondary Schools (With Full Teacher Rosters)',
  primary_school: '🏫 Primary Schools (With Teacher Rosters)',
  college: '🎓 Colleges',
  dakhil_madrasa: '🕌 Dakhil Madrasas',
  kawmi_madrasa: '🕌 Qawmi Madrasas',
  madrasa_other: '🕌 Other Madrasas',
  school_and_college: '🏫 School & Colleges',
  private_university: '🏛️ Private Universities',
  public_university: '🏛️ Public Universities',
  other: '🏢 Technical & Other'
};

async function loadEducation() {
  showLoader('edu-content');
  if (!state.education.hierarchy) {
    state.education.hierarchy = await fetchJSON('education/education_hierarchy.json') || {};
  }
  
  // Populate Division dropdown
  const divSelect = document.getElementById('edu-div-select');
  if (divSelect) {
    const divs = Object.keys(state.education.hierarchy);
    divSelect.innerHTML = `<option value="">Select Division</option>` +
      divs.map(d => `<option value="${esc(d)}" ${d === state.education.activeDiv ? 'selected' : ''}>${esc(d)}</option>`).join('');
  }

  // Trigger district population for active division (default Dhaka)
  await onEduDivisionChange(state.education.activeDiv || 'Dhaka', true);
}

window.onEduDivisionChange = async function(div, keepCurrent = false) {
  state.education.activeDiv = div;
  const distSelect = document.getElementById('edu-dist-select');
  const typeSelect = document.getElementById('edu-type-select');
  
  if (!div || !state.education.hierarchy[div]) {
    if (distSelect) distSelect.innerHTML = '<option value="">Select District</option>';
    if (typeSelect) typeSelect.innerHTML = '<option value="">All Categories</option>';
    document.getElementById('edu-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎓</div>
        <h3>Select a Division</h3>
        <p class="text-muted">Choose any division from the dropdown above to explore institutions and teacher profiles.</p>
      </div>`;
    return;
  }

  const districts = Object.keys(state.education.hierarchy[div]);
  if (!keepCurrent || !districts.includes(state.education.activeDistrict)) {
    state.education.activeDistrict = districts[0] || '';
  }

  if (distSelect) {
    distSelect.innerHTML = districts.map(d => 
      `<option value="${esc(d)}" ${d === state.education.activeDistrict ? 'selected' : ''}>${esc(d)}</option>`
    ).join('');
  }

  await onEduDistrictChange(state.education.activeDistrict, keepCurrent);
};

window.onEduDistrictChange = async function(dist, keepCurrent = false) {
  state.education.activeDistrict = dist;
  const div = state.education.activeDiv;
  const typeSelect = document.getElementById('edu-type-select');
  
  if (!dist || !state.education.hierarchy[div] || !state.education.hierarchy[div][dist]) {
    if (typeSelect) typeSelect.innerHTML = '<option value="">All Categories</option>';
    return;
  }

  const distTypes = state.education.hierarchy[div][dist];
  const typeKeys = Object.keys(distTypes);
  const totalCount = Object.values(distTypes).reduce((a, b) => a + b, 0);

  if (typeSelect) {
    typeSelect.innerHTML = `<option value="" ${!state.education.activeType ? 'selected' : ''}>All Categories (${totalCount})</option>` +
      typeKeys.map(k => `<option value="${esc(k)}" ${k === state.education.activeType ? 'selected' : ''}>${EDU_TYPE_LABELS[k] || k} (${distTypes[k]})</option>`).join('');
  }

  await loadEduInstitutions();
};

window.onEduTypeChange = async function(type) {
  state.education.activeType = type;
  await loadEduInstitutions();
};

async function loadEduInstitutions() {
  const div = state.education.activeDiv;
  const dist = state.education.activeDistrict;
  const type = state.education.activeType;
  const content = document.getElementById('edu-content');
  
  if (!div || !dist) return;
  showLoader('edu-content');

  try {
    let list = [];
    if (type) {
      const filename = `education/summaries/${div}__${dist}__${type}.json`;
      const data = await fetchJSON(filename);
      list = data || [];
    } else {
      // Load all types for this district
      const distTypes = Object.keys(state.education.hierarchy[div]?.[dist] || {});
      const promises = distTypes.map(t => fetchJSON(`education/summaries/${div}__${dist}__${t}.json`));
      const results = await Promise.all(promises);
      list = results.flat().filter(Boolean);
    }
    
    state.education.institutions = list;
    state.education.page = 1;
    filterEduInstitutions(state.education.search || '');
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Could not load institutions</h3><p class="text-muted">${esc(err.message)}</p></div>`;
  }
}

window.filterEduInstitutions = function(query) {
  if (query !== undefined) state.education.search = query;
  const q = (state.education.search || '').trim().toLowerCase();
  
  if (!q) {
    state.education.filtered = [...state.education.institutions];
  } else {
    state.education.filtered = state.education.institutions.filter(inst => {
      if ((inst.name || '').toLowerCase().includes(q)) return true;
      if ((inst.name_bn || '').toLowerCase().includes(q)) return true;
      if (String(inst.eiin || '').includes(q)) return true;
      if ((inst.upazila || '').toLowerCase().includes(q)) return true;
      if ((inst.level || '').toLowerCase().includes(q)) return true;
      if ((inst.type || '').toLowerCase().includes(q)) return true;
      // Match inside teachers roster
      if (inst.teachers && inst.teachers.some(t => 
        (t.teacher_name || '').toLowerCase().includes(q) ||
        (t.designation || '').toLowerCase().includes(q)
      )) return true;
      return false;
    });
  }

  state.education.page = 1;
  renderEduTable();
};

function renderEduTable() {
  const content = document.getElementById('edu-content');
  const filtered = state.education.filtered || [];

  const total = filtered.length;
  const withTeachers = filtered.filter(i => (i.teacher_count || (i.teachers && i.teachers.length) || 0) > 0).length;
  const govtCount = filtered.filter(i => (i.management || '').toUpperCase().includes('GOVERNMENT') && !(i.management || '').toUpperCase().includes('NON')).length;
  const mpoCount = filtered.filter(i => (i.is_mpo || '').toUpperCase() === 'YES').length;

  const p = state.education.page;
  const start = (p - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  content.innerHTML = `
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-card-label">Current View</div>
        <div class="stat-card-value font-mono">${total.toLocaleString()}</div>
        <div class="stat-card-sub">${esc(state.education.activeDiv)} &bull; ${esc(state.education.activeDistrict)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Teacher Rosters Available</div>
        <div class="stat-card-value text-green font-mono">${withTeachers.toLocaleString()}</div>
        <div class="stat-card-sub">With individual staff rosters</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Government Institutions</div>
        <div class="stat-card-value text-blue font-mono">${govtCount.toLocaleString()}</div>
        <div class="stat-card-sub">Public institutions</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">MPO Enrolled</div>
        <div class="stat-card-value text-yellow font-mono">${mpoCount.toLocaleString()}</div>
        <div class="stat-card-sub">Monthly Pay Order status</div>
      </div>
    </div>

    ${pageItems.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No institutions found</h3>
        <p class="text-muted">No institutions match "${esc(state.education.search)}" in ${esc(state.education.activeDistrict)}.</p>
      </div>
    ` : `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>EIIN</th>
              <th>Institution Name</th>
              <th>Type & Level</th>
              <th>Location</th>
              <th>Status</th>
              <th>Contact</th>
              <th>Teachers</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map(inst => {
              const tc = inst.teacher_count || (inst.teachers ? inst.teachers.length : 0);
              const isGovt = (inst.management || '').toUpperCase().includes('GOVERNMENT') && !(inst.management || '').toUpperCase().includes('NON');
              const isMpo = (inst.is_mpo || '').toUpperCase() === 'YES';
              return `
                <tr>
                  <td><span class="badge font-mono" style="background:var(--bg3);color:var(--text)">${esc(inst.eiin || '—')}</span></td>
                  <td>
                    <div class="font-bold">${esc(inst.name || 'Unnamed Institution')}</div>
                    ${inst.name_bn ? `<div class="text-primary font-sm">${esc(inst.name_bn)}</div>` : ''}
                  </td>
                  <td>
                    <span class="badge ${isGovt ? 'badge-green' : 'badge-blue'}">${esc(inst.type || 'INSTITUTION')}</span>
                    ${inst.level ? `<div class="text-muted font-sm" style="margin-top:2px">${esc(inst.level)}</div>` : ''}
                  </td>
                  <td>
                    <div class="font-bold">${esc(inst.upazila || '—')}</div>
                    <div class="text-muted font-sm">${esc(state.education.activeDistrict)}</div>
                  </td>
                  <td>
                    <div><span class="badge ${isGovt ? 'badge-green' : 'badge-muted'}">${isGovt ? 'GOVERNMENT' : 'NON-GOVT'}</span></div>
                    <div style="margin-top:3px"><span class="badge ${isMpo ? 'badge-yellow' : 'badge-muted'} font-sm">MPO: ${esc(inst.is_mpo || 'NO')}</span></div>
                  </td>
                  <td class="font-sm font-mono">
                    ${inst.mobile ? `<div>📞 <a href="tel:${esc(inst.mobile)}">${esc(inst.mobile)}</a></div>` : ''}
                    ${inst.email ? `<div>✉️ <a href="mailto:${esc(inst.email)}">${esc(inst.email)}</a></div>` : ''}
                    ${!inst.mobile && !inst.email ? '<span class="text-muted">—</span>' : ''}
                  </td>
                  <td>
                    ${tc > 0 ? `
                      <button class="btn btn-sm" style="background:rgba(0,106,78,0.2);color:var(--primary-light);border:1px solid var(--primary);cursor:pointer;padding:4px 10px;border-radius:4px;font-weight:600" onclick="showTeacherModal('${esc(inst.eiin)}')">
                        👨‍🏫 View Staff (${tc})
                      </button>
                    ` : `
                      <span class="text-muted font-sm">No Roster</span>
                    `}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ${renderPaginationHTML('edu-pagination', state.education)}
    `}
  `;

  attachPaginationEvents('edu-pagination', state.education, renderEduTable);
}

window.showTeacherModal = function(eiin) {
  const inst = (state.education.institutions || []).find(i => String(i.eiin) === String(eiin));
  if (!inst) return;

  const teachers = inst.teachers || [];
  let modal = document.getElementById('teacher-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'teacher-modal-overlay';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-window" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div>
          <div class="font-bold" style="font-size:16px">${esc(inst.name || 'Institution')}</div>
          <div class="text-primary font-sm">${esc(inst.name_bn || '')} &bull; EIIN: <span class="font-mono">${esc(inst.eiin)}</span> &bull; ${esc(inst.upazila || '')}, ${esc(state.education.activeDistrict || '')}</div>
        </div>
        <button class="modal-close-btn" onclick="closeTeacherModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="stats-grid" style="margin-bottom:14px; grid-template-columns: repeat(3, 1fr)">
          <div class="stat-card" style="padding:10px 14px"><div class="stat-card-label">Total Staff / Teachers</div><div class="stat-card-value font-mono" style="font-size:22px">${teachers.length}</div></div>
          <div class="stat-card" style="padding:10px 14px"><div class="stat-card-label">Institution Level</div><div class="stat-card-value" style="font-size:16px">${esc(inst.level || 'General')}</div></div>
          <div class="stat-card" style="padding:10px 14px"><div class="stat-card-label">Management / MPO</div><div class="stat-card-value" style="font-size:15px">${esc(inst.management || '')} (${esc(inst.is_mpo || 'N/A')})</div></div>
        </div>

        <div style="margin-bottom:12px; display:flex; gap:10px; align-items:center">
          <input type="text" id="teacher-modal-search" class="search-input" placeholder="Search teacher by name or designation..." oninput="filterTeacherModal(this.value)" style="width:100%">
        </div>

        <div class="table-wrapper" style="max-height:420px; overflow-y:auto">
          <table class="data-table" id="teacher-modal-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Teacher Name</th>
                <th>Designation</th>
                <th>First Joining Date</th>
                <th>Birth Date</th>
              </tr>
            </thead>
            <tbody id="teacher-modal-tbody">
              ${renderTeacherRows(teachers)}
            </tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeTeacherModal()" style="padding:6px 16px;border-radius:4px;cursor:pointer">Close</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  modal.onclick = closeTeacherModal;
  window._currentModalTeachers = teachers;
};

window.renderTeacherRows = function(list) {
  if (!list || list.length === 0) {
    return '<tr><td colspan="5" class="text-center text-muted" style="padding:20px">No teacher records available</td></tr>';
  }
  return list.map((t, idx) => `
    <tr>
      <td class="font-mono text-muted">${idx + 1}</td>
      <td class="font-bold">${esc(t.teacher_name || '—')}</td>
      <td><span class="badge badge-blue font-sm">${esc(t.designation || 'Teacher')}</span></td>
      <td class="font-mono">${esc(t.first_joining_date || '—')}</td>
      <td class="font-mono text-muted">${esc(t.date_of_birth || '—')}</td>
    </tr>
  `).join('');
};

window.filterTeacherModal = function(q) {
  const query = (q || '').toLowerCase();
  const list = (window._currentModalTeachers || []).filter(t => 
    (t.teacher_name || '').toLowerCase().includes(query) ||
    (t.designation || '').toLowerCase().includes(query)
  );
  const tbody = document.getElementById('teacher-modal-tbody');
  if (tbody) tbody.innerHTML = renderTeacherRows(list);
};

window.closeTeacherModal = function() {
  const modal = document.getElementById('teacher-modal-overlay');
  if (modal) modal.style.display = 'none';
};

// =================== LAWYER DIRECTORY & PROFILES ===================
async function loadLawyer() {
  showLoader('lawyer-content');
  if (!state.lawyer.summary) {
    state.lawyer.summary = await fetchJSON('Lawyer/hierarchy_summary.json') || {};
  }
  
  setActiveTabs('lawyer-tabs', state.lawyer.activeTab);
  
  if (state.lawyer.activeTab === 'members') {
    await loadLawyerMembers();
  } else {
    renderLawyerSummary();
  }
}

window.setLawyerTab = async function(tab) {
  state.lawyer.activeTab = tab;
  setActiveTabs('lawyer-tabs', tab);
  const filtersBar = document.getElementById('lawyer-filters-bar');
  if (tab === 'members') {
    if (filtersBar) filtersBar.style.display = 'flex';
    await loadLawyerMembers();
  } else {
    renderLawyerSummary();
  }
};

async function loadLawyerMembers() {
  const content = document.getElementById('lawyer-content');
  if (!state.lawyer.allMembers) {
    content.innerHTML = `<div class="loader"><div class="spinner"></div>Loading 34,591 Dhaka Bar Association lawyers database...</div>`;
    const members = await fetchJSON('Lawyer/dhaka_bar_association_members.json');
    state.lawyer.allMembers = members || [];
  }
  filterLawyerMembers();
}

window.filterLawyerMembers = function() {
  const searchInput = document.getElementById('lawyer-search');
  const divSelect = document.getElementById('lawyer-division');
  const statusSelect = document.getElementById('lawyer-status-filter');

  const q = (searchInput ? searchInput.value : state.lawyer.search || '').trim().toLowerCase();
  const div = (divSelect ? divSelect.value : state.lawyer.division || '');
  const status = (statusSelect ? statusSelect.value : state.lawyer.status || '');

  state.lawyer.search = q;
  state.lawyer.division = div;
  state.lawyer.status = status;

  let list = state.lawyer.allMembers || [];

  if (div) {
    list = list.filter(m => (m['Division'] || '') === div);
  }
  if (status) {
    list = list.filter(m => (m['Membership Status'] || '') === status);
  }
  if (q) {
    list = list.filter(m => {
      if ((m['Name'] || '').toLowerCase().includes(q)) return true;
      if ((m['Name (Bengali)'] || '').toLowerCase().includes(q)) return true;
      if (String(m['Member ID'] || '').includes(q)) return true;
      if ((m['Phone'] || '').includes(q)) return true;
      if ((m['District'] || '').toLowerCase().includes(q)) return true;
      if ((m['Present Address'] || '').toLowerCase().includes(q)) return true;
      if ((m['Category of Member'] || '').toLowerCase().includes(q)) return true;
      return false;
    });
  }

  state.lawyer.filtered = list;
  state.lawyer.page = 1;
  renderLawyerMembers();
};

function renderLawyerMembers() {
  const content = document.getElementById('lawyer-content');
  const list = state.lawyer.filtered || [];
  const total = list.length;
  const activeCount = list.filter(m => m['Membership Status'] === 'Active Member').length;
  const defaulterCount = list.filter(m => m['Membership Status'] === 'Defaulter').length;
  const deadCount = list.filter(m => m['Membership Status'] === 'Dead').length;

  const p = state.lawyer.page;
  const start = (p - 1) * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);

  content.innerHTML = `
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-card-label">Lawyers in View</div>
        <div class="stat-card-value font-mono">${total.toLocaleString()}</div>
        <div class="stat-card-sub">Filtered from 34,591 total</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Active Members</div>
        <div class="stat-card-value text-green font-mono">${activeCount.toLocaleString()}</div>
        <div class="stat-card-sub">Current practicing attorneys</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Defaulters</div>
        <div class="stat-card-value text-yellow font-mono">${defaulterCount.toLocaleString()}</div>
        <div class="stat-card-sub">Outstanding dues</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Deceased / Others</div>
        <div class="stat-card-value text-muted font-mono">${deadCount.toLocaleString()}</div>
        <div class="stat-card-sub">Historical records</div>
      </div>
    </div>

    ${pageItems.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No lawyers found</h3>
        <p class="text-muted">No lawyers matched your search query or filters.</p>
      </div>
    ` : `
      <div class="lawyer-grid">
        ${pageItems.map(m => {
          const status = m['Membership Status'] || 'Unknown';
          let statusBadgeClass = 'badge-muted';
          if (status === 'Active Member') statusBadgeClass = 'badge-green';
          else if (status === 'Defaulter') statusBadgeClass = 'badge-yellow';
          else if (status === 'Sanad Suspended') statusBadgeClass = 'badge-red';
          else if (status === 'Transferred') statusBadgeClass = 'badge-blue';

          const photoUrl = m['Photo URL'];
          const hasPhoto = photoUrl && photoUrl.startsWith('http');

          return `
            <div class="lawyer-card">
              <div class="lawyer-top">
                ${hasPhoto ? `
                  <img src="${esc(photoUrl)}" class="lawyer-photo" alt="${esc(m['Name'])}" onerror="this.onerror=null;this.replaceWith(document.createRange().createContextualFragment('<div class=\\'lawyer-photo\\'>⚖️</div>'))">
                ` : `
                  <div class="lawyer-photo">⚖️</div>
                `}
                <div class="lawyer-meta">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:2px">
                    <span class="badge font-mono" style="background:var(--bg3); color:var(--text-dim); font-size:10px">ID: ${esc(m['Member ID'] || '—')}</span>
                    <span class="badge ${statusBadgeClass}">${esc(status)}</span>
                  </div>
                  <div class="lawyer-name" title="${esc(m['Name'])}">${esc(m['Name'] || 'Lawyer')}</div>
                  ${m['Name (Bengali)'] ? `<div class="lawyer-name-bn font-sm">${esc(m['Name (Bengali)'])}</div>` : ''}
                  <div class="text-muted font-sm" style="margin-top:2px">${esc(m['Category of Member'] || 'Member')}</div>
                </div>
              </div>

              <div class="lawyer-details">
                <div class="info-row">
                  <span class="info-row-label">District:</span>
                  <span class="info-row-value font-bold">${esc(m['District'] || '—')} (${esc(m['Division'] || '—')})</span>
                </div>
                ${m['Phone'] ? `
                  <div class="info-row">
                    <span class="info-row-label">Phone:</span>
                    <span class="info-row-value font-mono"><a href="tel:${esc(m['Phone'])}">📞 ${esc(m['Phone'])}</a></span>
                  </div>
                ` : ''}
                ${m['Email'] ? `
                  <div class="info-row">
                    <span class="info-row-label">Email:</span>
                    <span class="info-row-value font-mono"><a href="mailto:${esc(m['Email'])}">✉️ ${esc(m['Email'])}</a></span>
                  </div>
                ` : ''}
                <div class="info-row">
                  <span class="info-row-label">Enrollment:</span>
                  <span class="info-row-value font-mono font-sm">${esc(m['Date of Enrollment'] || '—')} &bull; Mem: ${esc(m['Date of Membership'] || '—')}</span>
                </div>
                ${m['Present Address'] ? `
                  <div class="info-row">
                    <span class="info-row-label">Chamber:</span>
                    <span class="info-row-value font-sm" style="color:var(--text-muted)">${esc(m['Present Address'])}</span>
                  </div>
                ` : ''}
                ${m['Bio'] ? `
                  <div class="info-row">
                    <span class="info-row-label">Bio:</span>
                    <span class="info-row-value font-sm text-muted">${esc(m['Bio'])}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ${renderPaginationHTML('lawyer-pagination', state.lawyer)}
    `}
  `;

  attachPaginationEvents('lawyer-pagination', state.lawyer, renderLawyerMembers);
}

function renderLawyerSummary() {
  const summary = state.lawyer.summary || {};
  const search = (document.getElementById('lawyer-search')||{value:''}).value?.toLowerCase()||'';
  const divFilter = (document.getElementById('lawyer-division')||{value:''}).value||'';
  const content = document.getElementById('lawyer-content');

  let rows = [];
  for (const [div, divData] of Object.entries(summary)) {
    if (divFilter && div !== divFilter) continue;
    for (const [dist, distData] of Object.entries(divData.districts||{})) {
      if (search && !dist.toLowerCase().includes(search) && !div.toLowerCase().includes(search)) continue;
      const statusBreakdown = distData.status_breakdown || {};
      rows.push({ division: div, district: dist, total: distData.total, ...statusBreakdown });
    }
  }

  const totalLawyers = rows.reduce((a, r) => a + (r.total||0), 0);
  const totalActive = rows.reduce((a, r) => a + (r['Active Member']||0), 0);
  const totalDead = rows.reduce((a, r) => a + (r['Dead']||0), 0);
  const totalDefaulter = rows.reduce((a, r) => a + (r['Defaulter']||0), 0);

  content.innerHTML = `
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-card-label">Total Lawyers</div><div class="stat-card-value font-mono">${totalLawyers.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-card-label">Active Members</div><div class="stat-card-value text-green font-mono">${totalActive.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-card-label">Defaulters</div><div class="stat-card-value text-yellow font-mono">${totalDefaulter.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-card-label">Deceased</div><div class="stat-card-value text-muted font-mono">${totalDead.toLocaleString()}</div></div>
    </div>
    <div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Division</th><th>District</th><th>Total</th><th>Active</th><th>Defaulter</th><th>Transferred</th><th>Suspended</th><th>Dead</th></tr></thead>
      <tbody>${rows.map(r=>`<tr>
        <td>${esc(r.division)}</td>
        <td class="font-bold">${esc(r.district)}</td>
        <td class="font-mono font-bold">${(r.total||0).toLocaleString()}</td>
        <td class="text-green font-mono">${(r['Active Member']||0).toLocaleString()}</td>
        <td class="text-yellow font-mono">${(r['Defaulter']||0).toLocaleString()}</td>
        <td class="text-muted font-mono">${(r['Transferred']||0).toLocaleString()}</td>
        <td class="text-red font-mono">${(r['Sanad Suspended']||0).toLocaleString()}</td>
        <td class="text-muted font-mono">${(r['Dead']||0).toLocaleString()}</td>
      </tr>`).join('')}
      </tbody></table></div>`;
}

// =================== UTILS ===================
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function showLoader(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="loader"><div class="spinner"></div>Loading data...</div>`;
}

function setActiveTabs(containerId, activeTab) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === activeTab);
  });
}

function renderPaginationHTML(id, st) {
  const total = st.filtered.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return '';
  const p = st.page;
  const nums = [];
  for (let i = Math.max(1, p-2); i <= Math.min(pages, p+2); i++) nums.push(i);
  return `<div class="pagination" id="${id}">
    <div class="pagination-info">Page ${p} of ${pages} (${total.toLocaleString()} total)</div>
    <div class="pagination-controls">
      <button class="page-btn" data-p="${p-1}" ${p<=1?'disabled':''}>‹</button>
      ${p > 3 ? `<button class="page-btn" data-p="1">1</button><span style="color:var(--text-dim);padding:0 4px">…</span>` : ''}
      ${nums.map(n=>`<button class="page-btn ${n===p?'active':''}" data-p="${n}">${n}</button>`).join('')}
      ${p < pages-2 ? `<span style="color:var(--text-dim);padding:0 4px">…</span><button class="page-btn" data-p="${pages}">${pages}</button>` : ''}
      <button class="page-btn" data-p="${p+1}" ${p>=pages?'disabled':''}>›</button>
    </div>
  </div>`;
}

function attachPaginationEvents(id, st, renderFn) {
  const el = document.getElementById(id);
  if (!el) return;
  el.querySelectorAll('.page-btn[data-p]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.p);
      if (p >= 1 && p <= Math.ceil(st.filtered.length / PAGE_SIZE)) {
        st.page = p;
        renderFn();
        window.scrollTo(0, 0);
      }
    });
  });
}


// =================== LAND & KHATIAN RECORDS (ePorcha) ===================
async function loadLand() {
  showLoader('land-content');
  try {
    const summary = await fetchJSON('land/summary.json').catch(() => null);
    if (summary) {
      state.land.summary = summary;
      const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      setEl('land-total-count', (summary.total_khatians || 0).toLocaleString());
      setEl('land-pdf-count', (summary.total_pdfs_downloaded || 0).toLocaleString());
      setEl('land-pdf-size', (summary.total_pdf_size_mb || 0).toLocaleString() + ' MB');
      setEl('land-dist-count', (summary.districts_represented || 0).toLocaleString());
      setEl('land-upa-count', (summary.upazilas_represented || 0).toLocaleString());
      setEl('land-mouza-count', (summary.mouzas_represented || 0).toLocaleString());
    }

    if (!state.land.khatians || state.land.khatians.length === 0) {
      const content = document.getElementById('land-content');
      if (content) {
        content.innerHTML = `<div class="loader"><div class="spinner"></div>Loading ${(summary?.total_khatians || 50000).toLocaleString()}+ Land Khatian records...</div>`;
      }
      const khatians = await fetchJSON('land/khatians/khatians.json');
      state.land.khatians = khatians || [];
      state.land.filtered = [...state.land.khatians];
      state.land.page = 1;
    }

    // Populate District Filter
    const distFilter = document.getElementById('land-district-filter');
    if (distFilter && distFilter.options.length <= 1) {
      const districts = Array.from(new Set(state.land.khatians.map(k => k.district).filter(Boolean))).sort();
      distFilter.innerHTML = '<option value="">All Districts (সকল জেলা)</option>' +
        districts.map(d => `<option value="${escapeHTML(d)}">${escapeHTML(d)}</option>`).join('');
    }

    renderLandKhatians();
  } catch (err) {
    console.error('Error loading land database:', err);
    const content = document.getElementById('land-content');
    if (content) content.innerHTML = `<div class="error-box">Failed to load Land Records: ${escapeHTML(err.message)}</div>`;
  }
}

function filterLandKhatians() {
  const query = (document.getElementById('land-search-input')?.value || '').trim().toLowerCase();
  const survey = document.getElementById('land-survey-filter')?.value || '';
  const district = document.getElementById('land-district-filter')?.value || '';

  state.land.page = 1;
  state.land.filtered = state.land.khatians.filter(k => {
    if (survey && (k.survey_key || '').toUpperCase() !== survey.toUpperCase()) return false;
    if (district && k.district !== district) return false;
    if (!query) return true;

    return (
      (k.khatian_no && String(k.khatian_no).toLowerCase().includes(query)) ||
      (k.owners && k.owners.toLowerCase().includes(query)) ||
      (k.guardians && k.guardians.toLowerCase().includes(query)) ||
      (k.dags && String(k.dags).toLowerCase().includes(query)) ||
      (k.mouza_name && k.mouza_name.toLowerCase().includes(query)) ||
      (k.upazila && k.upazila.toLowerCase().includes(query)) ||
      (k.district && k.district.toLowerCase().includes(query))
    );
  });

  renderLandKhatians();
}

function renderLandKhatians() {
  const content = document.getElementById('land-content');
  if (!content) return;

  const items = state.land.filtered || [];
  if (!items.length) {
    content.innerHTML = '<div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-muted);">No khatians found matching your search.</div>';
    return;
  }

  const p = state.land.page || 1;
  const PAGE_LEN = 50;
  const start = (p - 1) * PAGE_LEN;
  const slice = items.slice(start, start + PAGE_LEN);

  content.innerHTML = `
    <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; color: var(--text-muted); font-size: 0.9rem;">
      <span>Showing ${start + 1}–${Math.min(start + PAGE_LEN, items.length)} of ${items.length.toLocaleString()} Khatians</span>
      <span>${(state.land.summary?.total_pdfs_downloaded || 0).toLocaleString()} PDFs available</span>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px;">
      ${slice.map(k => `
        <div class="card" style="border: 1px solid var(--border); border-radius: 12px; padding: 16px; background: var(--bg-card); display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 1.15rem; font-weight: 700; color: var(--primary);">খতিয়ান নং: ${escapeHTML(String(k.khatian_no))}</span>
              <span class="badge" style="background: var(--bg-hover); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">${escapeHTML(k.survey || k.survey_key || 'RS')}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">
              📍 <strong>${escapeHTML(k.mouza_name || '')}</strong> (JL: ${escapeHTML(String(k.jl_no || ''))}) · ${escapeHTML(k.upazila || '')}, ${escapeHTML(k.district || '')}
            </div>

            <div style="margin-bottom: 8px; font-size: 0.9rem; line-height: 1.4;">
              <div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">মালিকগণ (Owners)</div>
              <div style="max-height: 70px; overflow-y: auto; color: var(--text);">${escapeHTML(k.owners || 'রেকর্ডরুম বিবরণ উপলব্ধ')}</div>
            </div>

            ${k.guardians ? `
              <div style="margin-bottom: 8px; font-size: 0.85rem;">
                <span style="color: var(--text-muted);">পিতা/স্বামী:</span> ${escapeHTML(k.guardians)}
              </div>
            ` : ''}

            <div style="display: flex; gap: 12px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--border); font-size: 0.85rem;">
              <div><strong>দাগ নং:</strong> ${escapeHTML(String(k.dags || '—'))}</div>
              <div><strong>মোট জমি:</strong> ${escapeHTML(String(k.total_land || '—'))} একর</div>
            </div>
          </div>

          <div style="margin-top: 14px; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: ${k.pdf_status === 'Downloaded' ? 'var(--success, #10b981)' : 'var(--text-muted)'};">
              ${k.pdf_status === 'Downloaded' ? '✓ PDF সংরক্ষিত' : 'PDF অপেক্ষমাণ'}
            </span>
            ${k.pdf_path ? `
              <a href="../land/${encodeURI(k.pdf_path)}" target="_blank" class="btn btn-sm btn-primary" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; background: var(--primary); color: #fff;">
                📄 খতিয়ান PDF দেখুন
              </a>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>

    ${renderPaginationHTML('land-pagination', state.land)}
  `;

  attachPaginationEvents('land-pagination', state.land, renderLandKhatians);
}

// =================== GLOBAL EVENT WIRING ===================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page));
  });

  document.querySelectorAll('.db-card[data-page]').forEach(card => {
    card.addEventListener('click', () => navigate(card.dataset.page));
  });

  // Islamic tabs
  document.getElementById('islamic-tabs')?.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => renderIslamicTab(btn.dataset.tab));
  });

  // Governance tabs
  document.getElementById('governance-tabs')?.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => renderGovernanceTab(btn.dataset.tab));
  });

  // Heritage tabs
  document.getElementById('heritage-tabs')?.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => renderHeritageTab(btn.dataset.tab));
  });

  // Medicine tabs & filters
  document.getElementById('medicine-tabs')?.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => setMedicineTab(btn.dataset.tab));
  });
  const medSearch = document.getElementById('med-search');
  if (medSearch) {
    medSearch.addEventListener('input', e => { state.medicine.search = e.target.value; filterMedicine(); });
  }
  document.getElementById('med-form-filter')?.addEventListener('change', e => { state.medicine.form = e.target.value; filterMedicine(); });
  document.getElementById('med-company-filter')?.addEventListener('change', e => { state.medicine.company = e.target.value; filterMedicine(); });
  document.getElementById('med-class-filter')?.addEventListener('change', e => { state.medicine.tclass = e.target.value; filterMedicine(); });
  document.getElementById('pharma-company-search')?.addEventListener('input', renderPharmaCompanies);

  // Healthcare tabs & filters
  document.getElementById('healthcare-tabs')?.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.healthcare.page = 1;
      renderHealthcareTab(btn.dataset.tab);
    });
  });
  let hospDebounce = null;
  document.getElementById('hosp-search')?.addEventListener('input', () => {
    clearTimeout(hospDebounce);
    hospDebounce = setTimeout(() => {
      state.healthcare.page = 1;
      renderHealthcareTab('hospitals');
    }, 120);
  });
  document.getElementById('hosp-district')?.addEventListener('change', () => {
    state.healthcare.page = 1;
    renderHealthcareTab('hospitals');
  });
  document.getElementById('hosp-type')?.addEventListener('change', () => {
    state.healthcare.page = 1;
    renderHealthcareTab('hospitals');
  });

  // Geography tabs
  document.getElementById('geo-tabs')?.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => renderGeographyTab(btn.dataset.tab));
  });

  // Law tabs
  document.getElementById('law-tabs')?.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => renderLawTab(btn.dataset.tab));
  });

  // Emergency tabs & filters
  document.getElementById('emergency-tabs')?.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => renderEmergencyTab(btn.dataset.tab));
  });
  document.getElementById('emergency-search')?.addEventListener('input', () => renderEmergencyTab(state.emergency.activeTab));
  document.getElementById('emergency-district')?.addEventListener('change', () => renderEmergencyTab(state.emergency.activeTab));

  // Banking tabs & filters
  document.getElementById('banking-tabs')?.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => { state.banking.branchPage = 1; renderBankingTab(btn.dataset.tab); });
  });
  document.getElementById('branch-search')?.addEventListener('input', () => { state.banking.branchPage = 1; renderBankingTab('branches'); });
  document.getElementById('branch-bank')?.addEventListener('change', () => { state.banking.branchPage = 1; renderBankingTab('branches'); });
  document.getElementById('branch-district')?.addEventListener('change', () => { state.banking.branchPage = 1; renderBankingTab('branches'); });

  // Transport tabs & filters
  document.getElementById('transport-tabs')?.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => renderTransportTab(btn.dataset.tab));
  });
  document.getElementById('transport-search')?.addEventListener('input', () => renderTransportTab(state.transport.activeTab));
  document.getElementById('transport-company-filter')?.addEventListener('change', () => renderTransportTab('companies'));

  // Lawyer tabs & filters
  document.getElementById('lawyer-tabs')?.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => setLawyerTab(btn.dataset.tab));
  });

  let lawyerDebounce = null;
  document.getElementById('lawyer-search')?.addEventListener('input', () => {
    clearTimeout(lawyerDebounce);
    lawyerDebounce = setTimeout(() => {
      if (state.lawyer.activeTab === 'members') filterLawyerMembers();
      else renderLawyerSummary();
    }, 150);
  });
  document.getElementById('lawyer-division')?.addEventListener('change', () => {
    if (state.lawyer.activeTab === 'members') filterLawyerMembers();
    else renderLawyerSummary();
  });
  document.getElementById('lawyer-status-filter')?.addEventListener('change', () => {
    if (state.lawyer.activeTab === 'members') filterLawyerMembers();
  });

  // Hamburger
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Sidebar global search
  document.getElementById('sidebar-global-search')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = q && !text.includes(q) ? 'none' : '';
    });
  });

  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);
});
