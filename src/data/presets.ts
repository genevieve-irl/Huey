import { PresetSample, AnalysisResult, PaletteVariant } from "../types";

// High quality SVG data URLs representing UI screenshots for quick previewing without upload
export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: "crypto-dashboard",
    title: "DeFi Crypto Trading Dashboard",
    category: "Fintech & Web3",
    description: "Dark-mode financial exchange UI with live token tickers, portfolio analytics charts, and swap dialogs.",
    badge: "Popular",
    svgDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'><rect width='800' height='500' fill='%230f172a'/><rect x='20' y='20' width='180' height='460' rx='12' fill='%231e293b'/><circle cx='50' cy='50' r='15' fill='%233b82f6'/><text x='75' y='55' fill='%23f8fafc' font-family='sans-serif' font-weight='bold' font-size='16'>NexusDeFi</text><rect x='40' y='90' width='140' height='36' rx='8' fill='%23334155'/><text x='55' y='113' fill='%233b82f6' font-family='sans-serif' font-size='14'>📊 Portfolio</text><text x='55' y='160' fill='%2394a3b8' font-family='sans-serif' font-size='14'>🔄 Swap Token</text><text x='55' y='200' fill='%2394a3b8' font-family='sans-serif' font-size='14'>⚡ Staking</text><rect x='220' y='20' width='560' height='80' rx='12' fill='%231e293b'/><text x='250' y='55' fill='%2394a3b8' font-family='sans-serif' font-size='12'>Total Net Worth</text><text x='250' y='80' fill='%23f8fafc' font-family='sans-serif' font-weight='bold' font-size='24'>$124,592.40</text><text x='390' y='78' fill='%2310b981' font-family='sans-serif' font-weight='bold' font-size='14'>+14.8% (24h)</text><rect x='220' y='120' width='350' height='360' rx='12' fill='%231e293b'/><path d='M 250 380 L 300 320 L 350 340 L 400 240 L 450 260 L 520 180' stroke='%233b82f6' stroke-width='4' fill='none'/><circle cx='520' cy='180' r='6' fill='%233b82f6'/><rect x='590' y='120' width='190' height='360' rx='12' fill='%231e293b'/><text x='610' y='155' fill='%23f8fafc' font-family='sans-serif' font-weight='bold' font-size='16'>Instant Swap</text><rect x='610' y='180' width='150' height='60' rx='8' fill='%230f172a'/><text x='625' y='215' fill='%23f8fafc' font-family='sans-serif' font-size='18'>4.50 ETH</text><rect x='610' y='320' width='150' height='44' rx='8' fill='%233b82f6'/><text x='640' y='347' fill='%23ffffff' font-family='sans-serif' font-weight='bold' font-size='15'>Execute Swap</text></svg>"
  },
  {
    id: "saas-kanban",
    title: "AI Studio Project Workspace",
    category: "Productivity",
    description: "Clean, collaborative team workspace with drag-and-drop task cards, activity logs, and status badges.",
    badge: "New",
    svgDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'><rect width='800' height='500' fill='%23f8fafc'/><rect x='0' y='0' width='800' height='64' fill='%23ffffff' stroke='%23e2e8f0'/><text x='40' y='38' fill='%230f172a' font-family='sans-serif' font-weight='bold' font-size='18'>🚀 TaskMaster AI</text><rect x='660' y='16' width='100' height='32' rx='6' fill='%236366f1'/><text x='675' y='37' fill='%23ffffff' font-family='sans-serif' font-weight='bold' font-size='13'>+ New Task</text><rect x='40' y='90' width='220' height='380' rx='10' fill='%23f1f5f9'/><text x='60' y='125' fill='%23475569' font-family='sans-serif' font-weight='bold' font-size='14'>IN PROGRESS (4)</text><rect x='55' y='145' width='190' height='90' rx='8' fill='%23ffffff' stroke='%23e2e8f0'/><text x='70' y='175' fill='%230f172a' font-family='sans-serif' font-weight='bold' font-size='14'>Design Token Engine</text><rect x='70' y='195' width='60' height='22' rx='4' fill='%23e0e7ff'/><text x='78' y='210' fill='%234f46e5' font-family='sans-serif' font-size='11'>Frontend</text><rect x='290' y='90' width='220' height='380' rx='10' fill='%23f1f5f9'/><text x='310' y='125' fill='%23475569' font-family='sans-serif' font-weight='bold' font-size='14'>IN REVIEW (2)</text><rect x='305' y='145' width='190' height='110' rx='8' fill='%23ffffff' stroke='%23e2e8f0'/><text x='320' y='175' fill='%230f172a' font-family='sans-serif' font-weight='bold' font-size='14'>Gemini 3.1 Vision API</text><rect x='320' y='195' width='55' height='22' rx='4' fill='%23dcfce7'/><text x='328' y='210' fill='%2316a34a' font-family='sans-serif' font-size='11'>Backend</text><rect x='540' y='90' width='220' height='380' rx='10' fill='%23f1f5f9'/><text x='560' y='125' fill='%23475569' font-family='sans-serif' font-weight='bold' font-size='14'>COMPLETED (18)</text></svg>"
  },
  {
    id: "luxury-store",
    title: "Aura Luxe Commerce Storefront",
    category: "E-Commerce",
    description: "High-end minimalist fashion storefront with hero banner, product grid cards, and elegant typography.",
    badge: "Editorial",
    svgDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'><rect width='800' height='500' fill='%23faf9f6'/><text x='350' y='45' fill='%231c1917' font-family='serif' font-size='22' letter-spacing='4'>A U R A</text><path d='M 40 70 L 760 70' stroke='%23e7e5e4'/><rect x='40' y='100' width='720' height='180' rx='4' fill='%231c1917'/><text x='80' y='185' fill='%23faf9f6' font-family='serif' font-size='32'>Autumn Minimalist Collection</text><text x='80' y='220' fill='%23d6d3d1' font-family='sans-serif' font-size='14'>Crafted with organic silk and raw wool textures.</text><rect x='80' y='235' width='130' height='32' fill='%23faf9f6'/><text x='105' y='256' fill='%231c1917' font-family='sans-serif' font-weight='bold' font-size='12'>EXPLORE NOW</text><rect x='40' y='300' width='220' height='170' rx='4' fill='%23f5f5f4'/><text x='55' y='440' fill='%231c1917' font-family='sans-serif' font-weight='bold' font-size='14'>Tailored Silk Coat</text><text x='55' y='460' fill='%2378716c' font-family='sans-serif' font-size='13'>$840.00</text><rect x='290' y='300' width='220' height='170' rx='4' fill='%23f5f5f4'/><text x='305' y='440' fill='%231c1917' font-family='sans-serif' font-weight='bold' font-size='14'>Cashmere Knit Vest</text><text x='305' y='460' fill='%2378716c' font-family='sans-serif' font-size='13'>$420.00</text><rect x='540' y='300' width='220' height='170' rx='4' fill='%23f5f5f4'/><text x='555' y='440' fill='%231c1917' font-family='sans-serif' font-weight='bold' font-size='14'>Pleated Wool Trousers</text><text x='555' y='460' fill='%2378716c' font-family='sans-serif' font-size='13'>$560.00</text></svg>"
  }
];

// Pre-analyzed results for instant loading when a sample is clicked
export const PRESET_ANALYSES: Record<string, { analysis: AnalysisResult; variants: PaletteVariant[] }> = {
  "crypto-dashboard": {
    analysis: {
      html: `
<div class="min-h-full w-full bg-[var(--bg-base)] text-[var(--text-primary)] font-sans p-6 transition-colors duration-300">
  <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
    <!-- Sidebar Navigation -->
    <aside class="w-full md:w-64 bg-[var(--surface-1)] rounded-2xl p-6 border border-[var(--border-accent)] flex flex-col justify-between shrink-0 shadow-lg">
      <div>
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-[var(--btn-primary)] flex items-center justify-center text-[var(--btn-text)] font-bold text-xl shadow-md">N</div>
          <span class="text-xl font-bold tracking-tight text-[var(--text-primary)]">NexusDeFi</span>
        </div>
        <nav class="space-y-2">
          <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-base)] text-[var(--btn-primary)] font-medium border border-[var(--border-accent)] shadow-sm">
            <span>📊</span> Portfolio Overview
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)] transition-colors">
            <span>🔄</span> Instant Swap
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)] transition-colors">
            <span>⚡</span> Staking Rewards
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)] transition-colors">
            <span>🛡️</span> Security & Keys
          </a>
        </nav>
      </div>
      <div class="mt-8 pt-6 border-t border-[var(--border-accent)]">
        <div class="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-accent)] text-center">
          <p class="text-xs text-[var(--text-muted)] mb-1">PRO PLAN ACTIVE</p>
          <p class="text-sm font-semibold text-[var(--accent-green)]">Zero Gas Fees 🚀</p>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 space-y-6">
      <!-- Top Metrics Banner -->
      <div class="bg-[var(--surface-1)] rounded-2xl p-6 border border-[var(--border-accent)] flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div>
          <span class="text-sm text-[var(--text-muted)] font-medium uppercase tracking-wider">Total Net Worth</span>
          <div class="flex items-baseline gap-3 mt-1">
            <h1 class="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)]">$124,592.40</h1>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--accent-green-bg)] text-[var(--accent-green)]">+14.8% (24h)</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button class="px-5 py-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-primary)] font-medium border border-[var(--border-accent)] hover:opacity-80 transition-opacity">Deposit</button>
          <button class="px-5 py-2.5 rounded-xl bg-[var(--btn-primary)] text-[var(--btn-text)] font-semibold shadow-lg hover:opacity-90 transition-opacity">+ Send Crypto</button>
        </div>
      </div>

      <!-- Split Chart & Swap Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart Section -->
        <div class="lg:col-span-2 bg-[var(--surface-1)] rounded-2xl p-6 border border-[var(--border-accent)] shadow-lg flex flex-col justify-between">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-bold text-[var(--text-primary)]">ETH / USD Performance</h2>
              <p class="text-xs text-[var(--text-muted)]">Live WebSocket feed from decentralized exchanges</p>
            </div>
            <div class="flex gap-1 bg-[var(--bg-base)] p-1 rounded-lg border border-[var(--border-accent)] text-xs font-medium text-[var(--text-secondary)]">
              <span class="px-2.5 py-1 rounded bg-[var(--btn-primary)] text-[var(--btn-text)]">24H</span>
              <span class="px-2.5 py-1 rounded hover:text-[var(--text-primary)] cursor-pointer">7D</span>
              <span class="px-2.5 py-1 rounded hover:text-[var(--text-primary)] cursor-pointer">1M</span>
              <span class="px-2.5 py-1 rounded hover:text-[var(--text-primary)] cursor-pointer">ALL</span>
            </div>
          </div>
          <div class="h-64 w-full flex items-end justify-between gap-2 pb-2 border-b border-[var(--border-accent)]">
            <!-- Simulated interactive bar chart -->
            <div class="w-full bg-[var(--surface-2)] rounded-t-lg h-[40%] hover:bg-[var(--btn-primary)] transition-all"></div>
            <div class="w-full bg-[var(--surface-2)] rounded-t-lg h-[65%] hover:bg-[var(--btn-primary)] transition-all"></div>
            <div class="w-full bg-[var(--surface-2)] rounded-t-lg h-[50%] hover:bg-[var(--btn-primary)] transition-all"></div>
            <div class="w-full bg-[var(--surface-2)] rounded-t-lg h-[80%] hover:bg-[var(--btn-primary)] transition-all"></div>
            <div class="w-full bg-[var(--surface-2)] rounded-t-lg h-[60%] hover:bg-[var(--btn-primary)] transition-all"></div>
            <div class="w-full bg-[var(--btn-primary)] rounded-t-lg h-[95%] shadow-md"></div>
            <div class="w-full bg-[var(--surface-2)] rounded-t-lg h-[75%] hover:bg-[var(--btn-primary)] transition-all"></div>
            <div class="w-full bg-[var(--surface-2)] rounded-t-lg h-[85%] hover:bg-[var(--btn-primary)] transition-all"></div>
          </div>
          <div class="flex justify-between text-xs text-[var(--text-muted)] mt-4">
            <span>00:00 UTC</span><span>06:00 UTC</span><span>12:00 UTC</span><span>18:00 UTC</span><span>NOW</span>
          </div>
        </div>

        <!-- Swap Widget -->
        <div class="bg-[var(--surface-1)] rounded-2xl p-6 border border-[var(--border-accent)] shadow-lg flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-[var(--text-primary)]">Instant Swap</h3>
              <span class="text-xs text-[var(--accent-green)] font-semibold">● 0.05% Slippage</span>
            </div>
            <div class="space-y-3">
              <div class="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-accent)]">
                <div class="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>You Pay</span><span>Balance: 14.2 ETH</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-2xl font-bold text-[var(--text-primary)]">4.50</span>
                  <span class="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--text-primary)] font-bold text-sm">ETH ▾</span>
                </div>
              </div>
              <div class="flex justify-center -my-2 relative z-10">
                <div class="w-8 h-8 rounded-full bg-[var(--btn-primary)] text-[var(--btn-text)] flex items-center justify-center shadow-md cursor-pointer hover:rotate-180 transition-transform">↓</div>
              </div>
              <div class="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-accent)]">
                <div class="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>You Receive</span><span>Estimated</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-2xl font-bold text-[var(--accent-green)]">14,850.00</span>
                  <span class="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--text-primary)] font-bold text-sm">USDC ▾</span>
                </div>
              </div>
            </div>
          </div>
          <button class="w-full mt-6 py-3.5 rounded-xl bg-[var(--btn-primary)] text-[var(--btn-text)] font-bold shadow-lg hover:opacity-90 transition-all transform active:scale-95">
            Execute Swap Now
          </button>
        </div>
      </div>
    </main>
  </div>
</div>
      `,
      originalMapping: {
        "--bg-base": "#0f172a",
        "--surface-1": "#1e293b",
        "--surface-2": "#334155",
        "--text-primary": "#f8fafc",
        "--text-secondary": "#cbd5e1",
        "--text-muted": "#94a3b8",
        "--btn-primary": "#3b82f6",
        "--btn-text": "#ffffff",
        "--border-accent": "#334155",
        "--accent-green": "#10b981",
        "--accent-green-bg": "#064e3b"
      },
      detectedFonts: ["Inter", "Space Grotesk"],
      summary: "DeFi Crypto Trading Dashboard featuring live ETH metrics, interactive portfolio performance chart, and token swap widget."
    },
    variants: [
      {
        id: "variant-1",
        name: "Nordic Forest & Sage",
        description: "Replaces high-tech financial blues with calming organic forest tones and warm sage accents, creating a relaxed, stress-free investment experience.",
        variables: {
          "--bg-base": "#121d18",
          "--surface-1": "#1b2d24",
          "--surface-2": "#284236",
          "--text-primary": "#f1f5f3",
          "--text-secondary": "#cbd5d0",
          "--text-muted": "#869c91",
          "--btn-primary": "#34d399",
          "--btn-text": "#064e3b",
          "--border-accent": "#2f4d3f",
          "--accent-green": "#6ee7b7",
          "--accent-green-bg": "#065f46"
        }
      },
      {
        id: "variant-2",
        name: "Cyberpunk Neon Synth",
        description: "An electric cyberpunk aesthetic pairing deep midnight violet with neon magenta highlights and electric cyan indicators for a high-octane Web3 trading terminal.",
        variables: {
          "--bg-base": "#090514",
          "--surface-1": "#150d2a",
          "--surface-2": "#241744",
          "--text-primary": "#f8f0ff",
          "--text-secondary": "#d8b4fe",
          "--text-muted": "#a881db",
          "--btn-primary": "#e879f9",
          "--btn-text": "#1a0321",
          "--border-accent": "#3b1f6e",
          "--accent-green": "#22d3ee",
          "--accent-green-bg": "#164e63"
        }
      },
      {
        id: "variant-3",
        name: "Onyx & Amber Executive",
        description: "A refined deep charcoal and obsidian dark mode accented with warm amber buttons and crisp platinum text for high-net-worth portfolio management.",
        variables: {
          "--bg-base": "#0c0d10",
          "--surface-1": "#16181d",
          "--surface-2": "#21242c",
          "--text-primary": "#f8fafc",
          "--text-secondary": "#cbd5e1",
          "--text-muted": "#94a3b8",
          "--btn-primary": "#f59e0b",
          "--btn-text": "#000000",
          "--border-accent": "#2a2e38",
          "--accent-green": "#10b981",
          "--accent-green-bg": "#064e3b"
        }
      }
    ]
  },
  "saas-kanban": {
    analysis: {
      html: `
<div class="min-h-full w-full bg-[var(--bg-base)] text-[var(--text-primary)] font-sans p-8 transition-colors duration-300">
  <!-- Top Navigation Bar -->
  <header class="flex items-center justify-between pb-6 mb-8 border-b border-[var(--border-accent)]">
    <div class="flex items-center gap-4">
      <div class="w-10 h-10 rounded-xl bg-[var(--btn-primary)] flex items-center justify-center text-[var(--btn-text)] font-extrabold text-lg shadow-md">TM</div>
      <div>
        <h1 class="text-xl font-bold tracking-tight text-[var(--text-primary)]">TaskMaster AI Studio</h1>
        <p class="text-xs text-[var(--text-muted)]">Sprint 14: Design Token Architecture & Auto-Theming</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex -space-x-2 overflow-hidden">
        <div class="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-base)] bg-purple-500 text-white text-xs flex items-center justify-center font-bold">AL</div>
        <div class="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-base)] bg-blue-500 text-white text-xs flex items-center justify-center font-bold">MK</div>
        <div class="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-base)] bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">GH</div>
      </div>
      <button class="px-4 py-2 rounded-xl bg-[var(--btn-primary)] text-[var(--btn-text)] font-medium text-sm shadow hover:opacity-90 transition-opacity flex items-center gap-2">
        <span>+</span> New Task Card
      </button>
    </div>
  </header>

  <!-- Kanban Columns Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- In Progress Column -->
    <div class="bg-[var(--surface-1)] p-5 rounded-2xl border border-[var(--border-accent)] shadow-sm flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span> IN PROGRESS (3)
        </span>
        <button class="text-[var(--text-muted)] hover:text-[var(--text-primary)]">•••</button>
      </div>
      <div class="space-y-3">
        <div class="bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border-accent)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-[var(--badge-blue-bg)] text-[var(--badge-blue)]">Frontend UX</span>
          <h4 class="font-bold text-[var(--text-primary)] mt-2">Design Token Variable Engine</h4>
          <p class="text-xs text-[var(--text-muted)] mt-1">Map semantic CSS variables dynamically to iframe preview canvas.</p>
          <div class="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-accent)] text-xs text-[var(--text-muted)]">
            <span>💬 8 comments</span>
            <span class="font-medium text-[var(--text-primary)]">Due Today</span>
          </div>
        </div>
        <div class="bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border-accent)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-[var(--badge-purple-bg)] text-[var(--badge-purple)]">AI Vision</span>
          <h4 class="font-bold text-[var(--text-primary)] mt-2">Gemini 3.1 Prompt Refinement</h4>
          <p class="text-xs text-[var(--text-muted)] mt-1">Ensure JSON output schema strict adherence for HTML & hex extraction.</p>
          <div class="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-accent)] text-xs text-[var(--text-muted)]">
            <span>💬 14 comments</span>
            <span class="font-medium text-[var(--text-primary)]">Due Tomorrow</span>
          </div>
        </div>
      </div>
    </div>

    <!-- In Review Column -->
    <div class="bg-[var(--surface-1)] p-5 rounded-2xl border border-[var(--border-accent)] shadow-sm flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-500"></span> IN REVIEW (2)
        </span>
        <button class="text-[var(--text-muted)] hover:text-[var(--text-primary)]">•••</button>
      </div>
      <div class="space-y-3">
        <div class="bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border-accent)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-[var(--badge-green-bg)] text-[var(--badge-green)]">Accessibility</span>
          <h4 class="font-bold text-[var(--text-primary)] mt-2">WCAG Contrast Checker Route</h4>
          <p class="text-xs text-[var(--text-muted)] mt-1">Calculate real-time contrast ratios between text and background tokens.</p>
          <div class="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-accent)] text-xs text-[var(--text-muted)]">
            <span>💬 3 comments</span>
            <span class="font-medium text-[var(--badge-green)]">Approved ✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Completed Column -->
    <div class="bg-[var(--surface-1)] p-5 rounded-2xl border border-[var(--border-accent)] shadow-sm flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span> COMPLETED (12)
        </span>
        <button class="text-[var(--text-muted)] hover:text-[var(--text-primary)]">•••</button>
      </div>
      <div class="space-y-3 opacity-75">
        <div class="bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border-accent)] shadow-sm">
          <span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-[var(--badge-blue-bg)] text-[var(--badge-blue)]">Infrastructure</span>
          <h4 class="font-bold text-[var(--text-primary)] mt-2 line-through">Express + Vite Fullstack Setup</h4>
          <p class="text-xs text-[var(--text-muted)] mt-1">Configured esbuild bundling and 50MB payload limits.</p>
        </div>
      </div>
    </div>
  </div>
</div>
      `,
      originalMapping: {
        "--bg-base": "#f8fafc",
        "--surface-1": "#f1f5f9",
        "--surface-2": "#ffffff",
        "--text-primary": "#0f172a",
        "--text-secondary": "#334155",
        "--text-muted": "#64748b",
        "--btn-primary": "#4f46e5",
        "--btn-text": "#ffffff",
        "--border-accent": "#e2e8f0",
        "--badge-blue": "#2563eb",
        "--badge-blue-bg": "#dbeafe",
        "--badge-purple": "#9333ea",
        "--badge-purple-bg": "#f3e8ff",
        "--badge-green": "#16a34a",
        "--badge-green-bg": "#dcfce7"
      },
      detectedFonts: ["Inter", "Plus Jakarta Sans"],
      summary: "Productivity Kanban project board with task cards, status badges, and team collaboration headers."
    },
    variants: [
      {
        id: "variant-1",
        name: "Nordic Sage Minimal",
        description: "A calm, organic light workspace combining soft sage tint surfaces, deep forest green typography, and crisp white cards for mindful productivity.",
        variables: {
          "--bg-base": "#f3f6f4",
          "--surface-1": "#e7ece8",
          "--surface-2": "#ffffff",
          "--text-primary": "#14241c",
          "--text-secondary": "#2d4437",
          "--text-muted": "#5e776a",
          "--btn-primary": "#15803d",
          "--btn-text": "#ffffff",
          "--border-accent": "#d2ded5",
          "--badge-blue": "#0284c7",
          "--badge-blue-bg": "#e0f2fe",
          "--badge-purple": "#7c3aed",
          "--badge-purple-bg": "#ede9fe",
          "--badge-green": "#16a34a",
          "--badge-green-bg": "#dcfce7"
        }
      },
      {
        id: "variant-2",
        name: "Warm Sandstone & Terracotta",
        description: "Infuses cozy warm sandstone surfaces, espresso typography, and terracotta orange action buttons for an approachable, artisanal boutique studio ambiance.",
        variables: {
          "--bg-base": "#faf7f2",
          "--surface-1": "#f1ebe1",
          "--surface-2": "#ffffff",
          "--text-primary": "#292524",
          "--text-secondary": "#44403c",
          "--text-muted": "#78716c",
          "--btn-primary": "#ea580c",
          "--btn-text": "#ffffff",
          "--border-accent": "#e7dfd5",
          "--badge-blue": "#0284c7",
          "--badge-blue-bg": "#e0f2fe",
          "--badge-purple": "#9333ea",
          "--badge-purple-bg": "#f3e8ff",
          "--badge-green": "#16a34a",
          "--badge-green-bg": "#dcfce7"
        }
      },
      {
        id: "variant-3",
        name: "Neo-Brutalist High Contrast",
        description: "A bold, energetic high-contrast light theme using stark borders, vivid canary yellow primary accents, and crisp typography for maximum visual punch.",
        variables: {
          "--bg-base": "#ffffff",
          "--surface-1": "#f4f4f0",
          "--surface-2": "#ffffff",
          "--text-primary": "#000000",
          "--text-secondary": "#222222",
          "--text-muted": "#555555",
          "--btn-primary": "#facc15",
          "--btn-text": "#000000",
          "--border-accent": "#000000",
          "--badge-blue": "#1d4ed8",
          "--badge-blue-bg": "#bfdbfe",
          "--badge-purple": "#7e22ce",
          "--badge-purple-bg": "#e9d5ff",
          "--badge-green": "#15803d",
          "--badge-green-bg": "#bbf7d0"
        }
      }
    ]
  },
  "luxury-store": {
    analysis: {
      html: `
<div class="min-h-full w-full bg-[var(--bg-base)] text-[var(--text-primary)] font-serif p-8 transition-colors duration-300">
  <!-- Brand Header -->
  <header class="max-w-6xl mx-auto text-center pb-8 border-b border-[var(--border-accent)] mb-12">
    <h1 class="text-3xl md:text-5xl tracking-[0.35em] uppercase font-normal text-[var(--text-primary)]">A U R A</h1>
    <p class="text-xs font-sans tracking-widest text-[var(--text-muted)] uppercase mt-2">Paris • Tokyo • New York</p>
  </header>

  <div class="max-w-6xl mx-auto space-y-12">
    <!-- Hero Banner Card -->
    <div class="bg-[var(--surface-1)] text-[var(--text-inverse)] p-8 md:p-14 rounded-lg flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
      <div class="max-w-xl space-y-4">
        <span class="text-xs font-sans tracking-widest uppercase text-[var(--text-muted)]">Exclusive Release</span>
        <h2 class="text-3xl md:text-5xl leading-tight">The Autumn Minimalist Collection</h2>
        <p class="font-sans text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">Crafted with unrefined organic silk, raw merino wool, and structural Japanese tailoring designed for timeless versatility.</p>
        <div class="pt-2">
          <button class="px-8 py-3.5 bg-[var(--btn-primary)] text-[var(--btn-text)] font-sans text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity">
            Explore Collection
          </button>
        </div>
      </div>
      <div class="w-full md:w-64 h-64 bg-[var(--surface-2)] rounded flex items-center justify-center border border-[var(--border-accent)]">
        <span class="font-sans text-xs tracking-widest uppercase text-[var(--text-muted)]">Lookbook 2026</span>
      </div>
    </div>

    <!-- Product Grid -->
    <div>
      <div class="flex items-center justify-between mb-8 font-sans">
        <h3 class="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]">Curated Essentials</h3>
        <a href="#" class="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-4">View All (24)</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 font-sans">
        <!-- Product 1 -->
        <div class="group cursor-pointer space-y-4">
          <div class="h-80 w-full bg-[var(--surface-2)] rounded-lg flex items-center justify-center relative overflow-hidden border border-[var(--border-accent)]">
            <span class="text-xs text-[var(--text-muted)] font-serif italic">Silk Tailored Coat</span>
            <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div class="flex justify-between items-baseline">
            <h4 class="font-medium text-sm text-[var(--text-primary)]">Tailored Silk Trench Coat</h4>
            <span class="font-semibold text-sm text-[var(--text-primary)]">$840</span>
          </div>
          <p class="text-xs text-[var(--text-muted)]">Raw Alabaster / Size S-XL</p>
        </div>

        <!-- Product 2 -->
        <div class="group cursor-pointer space-y-4">
          <div class="h-80 w-full bg-[var(--surface-2)] rounded-lg flex items-center justify-center relative overflow-hidden border border-[var(--border-accent)]">
            <span class="text-xs text-[var(--text-muted)] font-serif italic">Cashmere Vest</span>
          </div>
          <div class="flex justify-between items-baseline">
            <h4 class="font-medium text-sm text-[var(--text-primary)]">Heavyweight Cashmere Vest</h4>
            <span class="font-semibold text-sm text-[var(--text-primary)]">$420</span>
          </div>
          <p class="text-xs text-[var(--text-muted)]">Oatmeal / Size XS-L</p>
        </div>

        <!-- Product 3 -->
        <div class="group cursor-pointer space-y-4">
          <div class="h-80 w-full bg-[var(--surface-2)] rounded-lg flex items-center justify-center relative overflow-hidden border border-[var(--border-accent)]">
            <span class="text-xs text-[var(--text-muted)] font-serif italic">Pleated Trousers</span>
          </div>
          <div class="flex justify-between items-baseline">
            <h4 class="font-medium text-sm text-[var(--text-primary)]">Pleated Raw Wool Trousers</h4>
            <span class="font-semibold text-sm text-[var(--text-primary)]">$560</span>
          </div>
          <p class="text-xs text-[var(--text-muted)]">Deep Slate / Size 28-36</p>
        </div>
      </div>
    </div>
  </div>
</div>
      `,
      originalMapping: {
        "--bg-base": "#faf9f6",
        "--surface-1": "#1c1917",
        "--surface-2": "#f5f5f4",
        "--text-primary": "#1c1917",
        "--text-secondary": "#d6d3d1",
        "--text-muted": "#78716c",
        "--text-inverse": "#faf9f6",
        "--btn-primary": "#faf9f6",
        "--btn-text": "#1c1917",
        "--border-accent": "#e7e5e4"
      },
      detectedFonts: ["Playfair Display", "Inter"],
      summary: "High-end editorial fashion storefront with minimalist serif typography and contrast hero banner."
    },
    variants: [
      {
        id: "variant-1",
        name: "French Linen & Olive",
        description: "A soft French country light palette with unbleached linen surfaces, deep olive accents, and warm ivory cards for natural elegance.",
        variables: {
          "--bg-base": "#f9f8f5",
          "--surface-1": "#2d382e",
          "--surface-2": "#efece4",
          "--text-primary": "#1c231e",
          "--text-secondary": "#e8e5dc",
          "--text-muted": "#768076",
          "--text-inverse": "#f9f8f5",
          "--btn-primary": "#f9f8f5",
          "--btn-text": "#2d382e",
          "--border-accent": "#ded9cd"
        }
      },
      {
        id: "variant-2",
        name: "Nordic Terracotta Sunset",
        description: "Replaces stark monochromatic black and white with warm Mediterranean clay, sandstone beige, and sun-baked terracotta for an earthy, artisanal aesthetic.",
        variables: {
          "--bg-base": "#fbf8f3",
          "--surface-1": "#8c442e",
          "--surface-2": "#efe9df",
          "--text-primary": "#2b2320",
          "--text-secondary": "#f1e8e2",
          "--text-muted": "#7a6e69",
          "--text-inverse": "#fbf8f3",
          "--btn-primary": "#fbf8f3",
          "--btn-text": "#8c442e",
          "--border-accent": "#e3dcd1"
        }
      },
      {
        id: "variant-3",
        name: "Bauhaus Minimalist Ivory",
        description: "A pristine high-contrast light theme with rich warm ivory backgrounds, deep carbon black typography, and structured raw geometric balance.",
        variables: {
          "--bg-base": "#f7f5f0",
          "--surface-1": "#18181b",
          "--surface-2": "#ebe6dc",
          "--text-primary": "#18181b",
          "--text-secondary": "#e4dfd5",
          "--text-muted": "#71717a",
          "--text-inverse": "#f7f5f0",
          "--btn-primary": "#f7f5f0",
          "--btn-text": "#18181b",
          "--border-accent": "#dcd5c7"
        }
      }
    ]
  }
};
