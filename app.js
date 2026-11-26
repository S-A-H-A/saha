(() => {
  "use strict";

  const HISTORY_KEY = "indiavisa_track_history_v1";
  const THEME_KEY = "indiavisa_glass_theme_v1";
  const LANG_KEY = "indiavisa_lang_v1";
  const API_BASE_KEY = "indiavisa_api_base_url_v1";

  const ICONS = {
    shieldCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
    searchCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 11 2 2 4-4"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    fileText: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
    bookmarkCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/><path d="m9 10 2 2 4-4"/></svg>`,
    palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z"/></svg>`,
    camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`,
    loader: `<svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    xCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
    alertTriangle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    alertCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
    printer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>`,
    packageCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
    externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
    server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>`,
    waves: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  };

  const GLASS_THEMES = [
    { id: "light", name: "Daylight Glass", subtitle: "Default · Bright", metaBg: "#eef1f7", swatches: ["#fbbf24", "#fb7185", "#38bdf8"] },
    { id: "rose-quartz", name: "Rose Quartz", subtitle: "Light · Warm", metaBg: "#f6eef4", swatches: ["#f472b6", "#fb923c", "#a78bfa"] },
    { id: "lavender-frost", name: "Lavender Frost", subtitle: "Light · Crisp", metaBg: "#eef0fa", swatches: ["#8b5cf6", "#38bdf8", "#2dd4bf"] },
    { id: "dark-slate", name: "Dark Slate", subtitle: "Dark · Neutral", metaBg: "#070a13", swatches: ["#ffc14d", "#f43f5e", "#38bdf8"] },
    { id: "midnight-navy", name: "Midnight Navy", subtitle: "Dark · Deep", metaBg: "#040917", swatches: ["#38bdf8", "#a855f7", "#2dd4bf"] },
    { id: "emerald-dusk", name: "Emerald Dusk", subtitle: "Dark · Rich", metaBg: "#04110f", swatches: ["#10b981", "#fbbf24", "#38bdf8"] },
  ];

  const NAV_ITEMS = [
    { id: "tracker", label: "Status Tracker", shortLabel: "Tracker", tabletLabel: "Tracker", hue: "amber", rgbVar: "var(--c-amber)", icon: "searchCheck" },
    { id: "requirements", label: "Requirements", shortLabel: "Docs", tabletLabel: "Requirements", hue: "emerald", rgbVar: "var(--c-emerald)", icon: "fileText" },
    { id: "history", label: "Saved Checks", shortLabel: "Saved", tabletLabel: "Saved", hue: "violet", rgbVar: "var(--c-violet)", icon: "bookmarkCheck" },
    { id: "appearance", label: "Settings", shortLabel: "Settings", tabletLabel: "Settings", hue: "cyan", rgbVar: "var(--c-cyan)", icon: "palette" },
  ];

  const IVAC_CENTERS = [
    { prefix: "BGDD", name: "IVAC Dhaka (Jamuna Future Park)", shortName: "Dhaka (JFP)" },
    { prefix: "BGDC", name: "IVAC Chittagong", shortName: "Chittagong" },
    { prefix: "BGDS", name: "IVAC Sylhet", shortName: "Sylhet" },
    { prefix: "BGDR", name: "IVAC Rajshahi", shortName: "Rajshahi" },
    { prefix: "BGDK", name: "IVAC Khulna", shortName: "Khulna" },
    { prefix: "BGDP", name: "IVAC Khulna (Alt Prefix)", shortName: "Khulna" },
    { prefix: "BGDB", name: "IVAC Barishal", shortName: "Barishal" },
    { prefix: "BGDJ", name: "IVAC Jashore", shortName: "Jashore" },
    { prefix: "BGDM", name: "IVAC Mymensingh", shortName: "Mymensingh" },
    { prefix: "BGDN", name: "IVAC Noakhali", shortName: "Noakhali" },
    { prefix: "BGDT", name: "IVAC Thakurgaon", shortName: "Thakurgaon" },
    { prefix: "BGDF", name: "IVAC Faridpur", shortName: "Faridpur" },
    { prefix: "BGDH", name: "IVAC Brahmanbaria", shortName: "Brahmanbaria" },
    { prefix: "BGDU", name: "IVAC Kushtia", shortName: "Kushtia" },
    { prefix: "BGDL", name: "IVAC Bogura", shortName: "Bogura" },
    { prefix: "BGDO", name: "IVAC Satkhira", shortName: "Satkhira" },
    { prefix: "BGDE", name: "IVAC Rangpur", shortName: "Rangpur" },
  ];

  const REQUIREMENTS = {
    en: [
      { step: "01", title: "Original Passport", hue: "amber", items: [
        "Minimum 6 months validity remaining from the application submission date.",
        "At least two blank pages available for visa endorsement.",
        "Submit all previous/old passports. If lost, attach a GD copy, Lost Circular, and notarized affidavit.",
      ]},
      { step: "02", title: "Recent Photograph", hue: "sky", items: [
        "One recent 2 inch × 2 inch (51mm × 51mm) color photograph on a plain white background.",
        "Must match the digital photo uploaded on the online visa application form.",
      ]},
      { step: "03", title: "Identity & Address Proof", hue: "violet", items: [
        "Copy of National ID (NID) card or Birth Registration Certificate (for minors).",
        "Copy of a recent utility bill (electricity, gas, water, or telephone) from the last 3 months confirming current residence.",
      ]},
      { step: "04", title: "Financial Solvency", hue: "emerald", items: [
        "Last 6 months bank statement with bank seal and signature (recommended minimum closing balance BDT 20,000+ per applicant).",
        "Or an international credit/travel card with USD endorsement seal in the passport.",
      ]},
      { step: "05", title: "Profession Proof", hue: "rose", items: [
        "Employed: NOC (No Objection Certificate) on company letterhead & office ID copy.",
        "Business owners: Updated Trade License copy.",
        "Students: Student ID card & school/university leave letter.",
      ]},
      { step: "06", title: "Online Application & IVAC VPF", hue: "cyan", items: [
        "Completed and signed Indian Visa Online application printed from indianvisaonline.gov.in.",
        "India charges zero visa fee for Bangladeshi passport holders; IVAC charges a Visa Processing Fee (VPF) of BDT 1,500 via the appointment portal.",
      ]},
    ],
    bn: [
      { step: "01", title: "মূল পাসপোর্ট", hue: "amber", items: [
        "আবেদন জমা দেওয়ার তারিখ থেকে কমপক্ষে ৬ মাস মেয়াদ থাকতে হবে।",
        "ভিসা স্টিকার ও সিলের জন্য কমপক্ষে দুটি খালি পৃষ্ঠা থাকতে হবে।",
        "সকল পুরাতন পাসপোর্ট সাথে জমা দিতে হবে। পুরাতন পাসপোর্ট হারিয়ে গেলে জিডি কপি, লস্ট সার্কুলার ও এফিডেভিট জমা দিতে হবে।",
      ]},
      { step: "02", title: "সাম্প্রতিক পাসপোর্ট সাইজ ছবি", hue: "sky", items: [
        "সাদা ব্যাকগ্রাউন্ডে তোলা ২ ইঞ্চি × ২ ইঞ্চি রঙিন ছবি (১ কপি)।",
        "ছবিটি অনলাইন আবেদনপত্রে আপলোড করা ছবির সাথে মিল থাকতে হবে।",
      ]},
      { step: "03", title: "পরিচয়পত্র ও ঠিকানার প্রমাণ", hue: "violet", items: [
        "জাতীয় পরিচয়পত্র (NID) অথবা জন্ম নিবন্ধন সনদের ফটোকপি (অপ্রাপ্তবয়স্কদের জন্য)।",
        "বর্তমান ঠিকানা নিশ্চিত করার জন্য সর্বশেষ ৩ মাসের মধ্যে ইস্যুকৃত বিদ্যুৎ, গ্যাস, পানি বা টেলিফোন বিলের কপি।",
      ]},
      { step: "04", title: "আর্থিক সচ্ছলতার প্রমাণ", hue: "emerald", items: [
        "ব্যাংকের সিল ও স্বাক্ষরসহ সর্বশেষ ৬ মাসের ব্যাংক স্টেটমেন্ট (ন্যূনতম ২০,০০০+ টাকা ব্যালেন্স থাকা উত্তম)।",
        "অথবা পাসপোর্টে ডলার এন্ডোর্সমেন্ট সিলসহ আন্তর্জাতিক ক্রেডিট/ট্রাভেল কার্ড।",
      ]},
      { step: "05", title: "পেশাগত প্রমাণপত্র", hue: "rose", items: [
        "চাকরিজীবী: অফিসের লেটারহেডে এনওসি (NOC) এবং অফিস আইডি কার্ডের কপি।",
        "ব্যবসায়ী: হালনাগাদ ট্রেড লাইসেন্সের কপি।",
        "শিক্ষার্থী: স্টুডেন্ট আইডি কার্ড এবং শিক্ষাপ্রতিষ্ঠানের ছুটির/অনুমতি পত্র।",
      ]},
      { step: "06", title: "অনলাইন আবেদন ও আইভ্যাক ভিপিএফ", hue: "cyan", items: [
        "indianvisaonline.gov.in থেকে পূরণকৃত ও স্বাক্ষরিত প্রিন্টেড আবেদন ফর্ম।",
        "বাংলাদেশি পাসপোর্টধারীদের জন্য ভারতের কোনো ভিসা ফি নেই; তবে আইভ্যাক প্রসেসিং ফি (VPF) ১,৫০০ টাকা অ্যাপয়েন্টমেন্ট পোর্টালের মাধ্যমে পরিশোধ করতে হয়।",
      ]},
    ],
  };

  const AVATAR_GRADIENTS = [
    "linear-gradient(135deg,#f59e0b,#db2777)",
    "linear-gradient(135deg,#38bdf8,#7c3aed)",
    "linear-gradient(135deg,#34d399,#0d9488)",
    "linear-gradient(135deg,#fb7185,#f59e0b)",
    "linear-gradient(135deg,#a78bfa,#2563eb)",
  ];

  function createInitialSteps() {
    return [
      { step: 1, title: "Session Setup", detail: "Initialize encrypted portal cookie jars", state: "pending", elapsedMs: null },
      { step: 2, title: "Visa Portal Connect", detail: "Connect to indianvisaonline.gov.in", state: "pending", elapsedMs: null },
      { step: 3, title: "Visa Status Query", detail: "Verify access code & read decision", state: "pending", elapsedMs: null },
      { step: 4, title: "Passtrack Connect", detail: "Connect to passtrack.net", state: "pending", elapsedMs: null },
      { step: 5, title: "Delivery Timeline", detail: "Verify captcha & extract IVAC steps", state: "pending", elapsedMs: null },
      { step: 6, title: "Report Synthesis", detail: "Compile dual-portal status report", state: "pending", elapsedMs: null },
    ];
  }

  function loadStorage(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch {
      return fallback;
    }
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function normalizeBaseUrl(raw) {
    if (!raw) return "";
    const trimmed = String(raw).trim().replace(/\/+$/, "");
    if (!trimmed) return "";
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }

  function getEnvApiBase() {
    return normalizeBaseUrl(window.__API_BASE_URL__ || "");
  }

  function getEffectiveApiBase() {
    return normalizeBaseUrl(loadStorage(API_BASE_KEY, "")) || getEnvApiBase();
  }

  function apiUrl(path) {
    const clean = path.startsWith("/") ? path : `/${path}`;
    const base = getEffectiveApiBase();
    return base ? `${base}${clean}` : clean;
  }

  const STATUS_PRESETS = [
    { category: "processed_printed", label: "Processed & Printed", message: "Visa Processed and Printed. Your passport is printed and ready for dispatch/collection." },
    { category: "granted_not_printed", label: "Granted (Not Printed)", message: "Visa Granted, but Not-Printed yet. Printing queue is pending before dispatch." },
    { category: "under_processing", label: "Under Processing", message: "Application is Under Processing at the Indian High Commission / Mission." },
    { category: "attention_required", label: "Contact Respective Office", message: "Please contact the respective IVAC or Indian Visa Office on the next working day." },
    { category: "closed", label: "Application Closed", message: "Application status shows Closed in the Indian Visa Online database." },
    { category: "not_found", label: "Record Not Found", message: "No matching visa application record was found for the entered ID and Passport." },
  ];

  const PASSTRACK_STAGE_PRESETS = [
    { stepsDone: 0, label: "Not Listed Yet" },
    { stepsDone: 1, label: "1/4 Application Received at IVAC" },
    { stepsDone: 2, label: "2/4 Sent to Indian High Commission" },
    { stepsDone: 3, label: "3/4 Received from High Commission" },
    { stepsDone: 4, label: "4/4 Ready For Delivery" },
  ];

  function isStaticHost() {
    if (state && state.backendStatus === "static" && !getEffectiveApiBase()) return true;
    const host = window.location.hostname.toLowerCase();
    return host.endsWith(".github.io") || Boolean(host && host !== "localhost" && host !== "127.0.0.1" && state && state.backendStatus === "static");
  }

  const state = {
    activeSection: "tracker",
    theme: loadStorage(THEME_KEY, "light"),
    lang: loadStorage(LANG_KEY, "en") === "bn" ? "bn" : "en",
    applicationId: "",
    passportNo: "",
    maskAppId: false,
    maskPassport: false,
    maskName: false,
    submissionDate: "",
    historySearch: "",
    isRunning: false,
    scanningReceipt: false,
    scanNotice: null,
    validationError: null,
    showPipeline: false,
    steps: createInitialSteps(),
    elapsedMs: 0,
    captchaPrompt: null,
    visaCaptchaOverride: null,
    ptCaptchaOverride: null,
    streamError: null,
    backendStatus: "unknown",
    staticAssist: null,
    assistCategory: "processed_printed",
    assistApplicantName: "",
    assistPasstrackStage: 4,
    copiedField: null,
    showWorkerGuide: false,
    workerCopyNotice: null,
    result: null,
    previousResult: null,
    statusChangedNotice: null,
    autoRefreshMin: 0,
    secondsUntilRefresh: null,
    history: loadHistory(),
    apiInput: getEffectiveApiBase(),
    testingApi: false,
    apiFeedback: null,
  };

  let backendProbePromise = null;

  async function probeBackendHealth(force = false) {
    if (!force && backendProbePromise) return backendProbePromise;
    backendProbePromise = (async () => {
      const configuredBase = getEffectiveApiBase();
      if (!configuredBase) {
        try {
          const headResp = await fetch("./index.html", { method: "HEAD", cache: "no-store" });
          const backendHeader = (headResp.headers.get("x-visatrack-backend") || "").toLowerCase();
          const host = window.location.hostname.toLowerCase();
          if (backendHeader === "express" || host === "localhost" || host === "127.0.0.1") {
            state.backendStatus = "live";
            return true;
          }
          state.backendStatus = "static";
          return false;
        } catch {
          state.backendStatus = "static";
          return false;
        }
      }

      try {
        const resp = await fetch(apiUrl("/api/portal-health"), { method: "GET" });
        const ct = (resp.headers.get("content-type") || "").toLowerCase();
        if (!resp.ok || !ct.includes("application/json")) {
          state.backendStatus = "static";
          return false;
        }
        const json = await resp.json().catch(() => null);
        if (json && Array.isArray(json.portals)) {
          state.backendStatus = "live";
          return true;
        }
        state.backendStatus = "static";
        return false;
      } catch {
        state.backendStatus = "static";
        return false;
      }
    })();
    return backendProbePromise;
  }

  async function ensureBackendStatus() {
    if (state.backendStatus === "unknown") {
      await probeBackendHealth();
    }
    return state.backendStatus === "live";
  }

  if (!GLASS_THEMES.some((t) => t.id === state.theme)) {
    state.theme = "light";
  }

  let abortController = null;
  let countdownInterval = null;

  function esc(val) {
    return String(val ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function resolveIvacCenter(appId) {
    if (!appId || appId.trim().length < 4) return null;
    const prefix = appId.trim().substring(0, 4).toUpperCase();
    return IVAC_CENTERS.find((c) => c.prefix === prefix) || null;
  }

  function getBilingualGuidance(category) {
    switch (category) {
      case "processed_printed":
        return {
          enTitle: "Visa Approved & Printed",
          enDetail: "Your Indian visa has been processed and printed onto your passport. Monitor the IVAC Delivery Tracker for 'Ready For Delivery' before visiting your center.",
          bnDetail: "আপনার ভিসা প্রসেস এবং প্রিন্ট সম্পন্ন হয়েছে (ভিসা হয়েছে)। পাসপোর্ট সংগ্রহের আগে আইভ্যাক ডেলিভারি ট্র্যাকারে 'Ready For Delivery' স্ট্যাটাস নিশ্চিত হয়ে সংশ্লিষ্ট অফিসে যোগাযোগ করুন।",
        };
      case "granted_not_printed":
        return {
          enTitle: "Granted (Awaiting Print)",
          enDetail: "Your visa application has been approved (Granted), and the sticker print queue is pending. Once printed, your passport will be dispatched back to IVAC.",
          bnDetail: "আপনার ভিসা অনুমোদন (Granted) করা হয়েছে, তবে এখনো প্রিন্ট সম্পন্ন হয়নি (Not-Printed)। ভিসা প্রিন্ট সম্পন্ন হলে পরবর্তী কর্মদিবসে পাসপোর্ট আইভ্যাকে পাঠানো হবে।",
        };
      case "under_processing":
        return {
          enTitle: "Under Consular Processing",
          enDetail: "Your application is actively under review at the Indian High Commission / Mission. Continue monitoring via live refresh.",
          bnDetail: "আপনার ভিসা অ্যাপ্লিকেশনটি বর্তমানে ভারতীয় হাইকমিশনে প্রক্রিয়াধীন (Under Processing) রয়েছে। নিয়মিত আপডেট দেখতে রিফ্রেশ করুন।",
        };
      case "attention_required":
        return {
          enTitle: "Contact Respective Office",
          enDetail: "The portal advises contacting your respective IVAC / Indian Mission office. Usually this indicates an ungranted passport or documentation query ready for pickup.",
          bnDetail: "অনুগ্রহ করে পরবর্তী কর্মদিবসে সংশ্লিষ্ট আইভ্যাক বা ভারতীয় ভিসা অফিসে যোগাযোগ করে আপনার পাসপোর্ট ও বিস্তারিত তথ্য সংগ্রহ করুন।",
        };
      case "closed":
        return {
          enTitle: "Application Closed",
          enDetail: "This file is marked Closed in the Visa Online database. Please contact the respective IVAC center on the next working day.",
          bnDetail: "আপনার ভিসা অ্যাপ্লিকেশনের স্ট্যাটাস 'Closed' হিসেবে প্রদর্শিত হচ্ছে। বিস্তারিত তথ্যের জন্য পরবর্তী কর্মদিবসে সংশ্লিষ্ট অফিসে যোগাযোগ করুন।",
        };
      case "not_found":
        return {
          enTitle: "Record Not Found",
          enDetail: "No matching record was found in the Indian Visa Online database. Double-check your 12-character Application ID and Passport Number.",
          bnDetail: "আপনার প্রদানকৃত তথ্যটি ভিসা পোর্টাল ডাটাবেজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক ১২ অক্ষরের অ্যাপ্লিকেশন আইডি ও পাসপোর্ট নম্বর দিয়ে আবার চেষ্টা করুন।",
        };
      default:
        return {
          enTitle: "Status Retrieved",
          enDetail: "Official response retrieved from the Indian Visa Online Status Enquiry system.",
          bnDetail: "ভারতীয় ভিসা পোর্টাল থেকে প্রাপ্ত সর্বশেষ তথ্য উপরে প্রদর্শিত হয়েছে।",
        };
    }
  }

  function getStatusVisuals(category) {
    switch (category) {
      case "processed_printed":
        return { hue: "emerald", rgb: "var(--c-emerald)", textVar: "var(--tx-pos)", icon: "checkCircle" };
      case "granted_not_printed":
        return { hue: "emerald", rgb: "var(--c-emerald)", textVar: "var(--tx-pos)", icon: "printer" };
      case "under_processing":
        return { hue: "amber", rgb: "var(--c-amber)", textVar: "var(--tx-warn)", icon: "clock" };
      case "attention_required":
      case "closed":
        return { hue: "rose", rgb: "var(--c-rose)", textVar: "var(--tx-neg)", icon: "xCircle" };
      case "not_found":
        return { hue: "sky", rgb: "var(--c-sky)", textVar: "var(--tx-info)", icon: "alertTriangle" };
      default:
        return { hue: "violet", rgb: "var(--c-violet)", textVar: "var(--tx-violet)", icon: "fileText" };
    }
  }

  function getAvatarGradient(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
  }

  function getYesterdayIso() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }

  function countWorkingDays(startIso) {
    if (!startIso) return null;
    const start = new Date(`${startIso}T00:00:00`);
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const calendarDays = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
    let workingDays = 0;
    const cursor = new Date(start);
    while (cursor < end) {
      cursor.setDate(cursor.getDate() + 1);
      const day = cursor.getDay();
      if (day >= 0 && day <= 4) workingDays++;
    }
    return { calendarDays, workingDays };
  }

  function applyTheme(nextTheme, coords) {
    const themeDef = GLASS_THEMES.find((t) => t.id === nextTheme) || GLASS_THEMES[0];
    const applyDom = () => {
      state.theme = themeDef.id;
      document.documentElement.dataset.theme = themeDef.id;
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute("content", themeDef.metaBg);
      try {
        localStorage.setItem(THEME_KEY, themeDef.id);
      } catch {
        // ignore
      }
      render();
    };

    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduced && coords) {
      try {
        const cx = coords.x || window.innerWidth - 60;
        const cy = coords.y || 80;
        const vt = document.startViewTransition(applyDom);
        vt.ready
          .then(() => {
            const r = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));
            document.documentElement.animate(
              { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${r}px at ${cx}px ${cy}px)`] },
              { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
            );
          })
          .catch(() => {});
        return;
      } catch {
        // fallback below
      }
    }
    applyDom();
  }

  function setLang(nextLang) {
    state.lang = nextLang === "bn" ? "bn" : "en";
    document.documentElement.lang = state.lang;
    try {
      localStorage.setItem(LANG_KEY, state.lang);
    } catch {
      // ignore
    }
    render();
  }

  function saveHistory(nextHistory) {
    state.history = nextHistory;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } catch {
      // ignore
    }
  }

  function addResultToHistory(res) {
    const rows = res.passtrack.table.length > 1 ? res.passtrack.table.slice(1) : [];
    const doneRows = rows.filter((r) => r[2] && r[2].toLowerCase().includes("done"));
    const pct = rows.length > 0 ? Math.round((doneRows.length / rows.length) * 100) : undefined;
    const latestStep = doneRows.length > 0 ? doneRows[doneRows.length - 1][1] : undefined;

    const filtered = state.history.filter((h) => h.application_id !== res.application_id);
    const entry = {
      id: res.application_id,
      application_id: res.application_id,
      passport_no: res.passport_no,
      applicant_name: res.passtrack.applicant_name && res.passtrack.applicant_name !== "Unknown" ? res.passtrack.applicant_name : undefined,
      last_checked_at: res.checked_at,
      visa_category: res.visa_portal.category,
      visa_label: res.visa_portal.label,
      visa_message: res.visa_portal.message,
      passtrack_progress_pct: pct,
      latest_delivery_step: latestStep,
    };
    saveHistory([entry, ...filtered].slice(0, 20));
  }

  function resetAutoWatchTimer() {
    if (countdownInterval) {
      window.clearInterval(countdownInterval);
      countdownInterval = null;
    }
    if (state.autoRefreshMin <= 0 || !state.result || state.isRunning || state.captchaPrompt) {
      state.secondsUntilRefresh = null;
      return;
    }
    state.secondsUntilRefresh = state.autoRefreshMin * 60;
    countdownInterval = window.setInterval(() => {
      if (state.secondsUntilRefresh === null) return;
      state.secondsUntilRefresh -= 1;
      const countdownEl = document.getElementById("autoWatchCountdown");
      if (state.secondsUntilRefresh <= 0) {
        window.clearInterval(countdownInterval);
        countdownInterval = null;
        state.secondsUntilRefresh = 0;
        runLiveCheck({ appId: state.result.application_id, passNo: state.result.passport_no });
      } else if (countdownEl) {
        const m = Math.floor(state.secondsUntilRefresh / 60);
        const s = state.secondsUntilRefresh % 60;
        countdownEl.textContent = `Next: ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }
    }, 1000);
  }

  function activateStaticAssist(appId, passNo) {
    state.backendStatus = "static";
    state.isRunning = false;
    state.showPipeline = false;
    state.streamError = null;
    state.captchaPrompt = null;
    state.staticAssist = { appId, passNo };
    render();
  }

  function buildAssistResult() {
    if (!state.staticAssist) return;
    const { appId, passNo } = state.staticAssist;
    const preset = STATUS_PRESETS.find((p) => p.category === state.assistCategory) || STATUS_PRESETS[0];
    const stageCount = Number(state.assistPasstrackStage) || 0;
    const stepLabels = [
      "Application Received at IVAC",
      "Sent to Indian High Commission",
      "Received from High Commission",
      "Ready For Delivery",
    ];
    const ptTable =
      stageCount > 0
        ? [
            ["Sl", "Step", "Status"],
            ...stepLabels.map((lbl, i) => [String(i + 1), lbl, i < stageCount ? "Done" : "Pending"]),
          ]
        : [];

    const payload = {
      status: "success",
      application_id: appId,
      passport_no: passNo,
      checked_at: new Date().toISOString(),
      elapsed_ms: 0,
      source_mode: "manual_portal",
      visa_portal: {
        status: "success",
        message: preset.message,
        category: preset.category,
        label: preset.label,
      },
      passtrack: {
        status: stageCount > 0 ? "success" : "not-found",
        applicant_name: state.assistApplicantName.trim() || "Unknown",
        table: ptTable,
        message: stageCount > 0 ? undefined : "Not listed on Passtrack yet.",
      },
    };

    state.staticAssist = null;
    state.previousResult = payload;
    state.result = payload;
    state.statusChangedNotice = null;
    addResultToHistory(payload);
    render();
  }

  async function runLiveCheck(opts) {
    const isLive = await ensureBackendStatus();
    if (!isLive && !getEffectiveApiBase()) {
      activateStaticAssist(opts.appId, opts.passNo);
      return;
    }

    if (abortController) abortController.abort();
    abortController = new AbortController();

    state.activeSection = "tracker";
    state.isRunning = true;
    state.showPipeline = true;
    state.streamError = null;
    state.staticAssist = null;
    state.captchaPrompt = null;
    state.visaCaptchaOverride = null;
    state.ptCaptchaOverride = null;

    if (!opts.isResume) {
      state.steps = createInitialSteps();
      state.elapsedMs = 0;
      state.statusChangedNotice = null;
    }
    resetAutoWatchTimer();
    render();

    try {
      const resp = await fetch(apiUrl("/api/check-status-stream"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          application_id: opts.appId,
          passport_no: opts.passNo,
          visa_captcha: opts.visaCaptcha,
          visa_session_id: opts.visaSessionId,
          passtrack_captcha: opts.passtrackCaptcha,
          passtrack_session_id: opts.passtrackSessionId,
          cached_visa_result: opts.cachedVisaResult,
          cached_passtrack_result: opts.cachedPasstrackResult,
        }),
      });

      const contentType = (resp.headers.get("content-type") || "").toLowerCase();
      if (resp.status === 404 || resp.status === 405 || (resp.ok && contentType.includes("text/html"))) {
        activateStaticAssist(opts.appId, opts.passNo);
        return;
      }

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => null);
        if (!errJson) {
          activateStaticAssist(opts.appId, opts.passNo);
          return;
        }
        throw new Error(errJson.error || `Server returned HTTP ${resp.status}.`);
      }

      if (!resp.body) {
        throw new Error("Streaming response unavailable from server.");
      }

      state.backendStatus = "live";
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const lines = block.split("\n");
          let eventName = "message";
          let dataStr = "";
          for (const line of lines) {
            if (line.startsWith("event:")) eventName = line.slice(6).trim();
            else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
          }
          if (!dataStr) continue;
          const payload = JSON.parse(dataStr);

          if (eventName === "step") {
            if (typeof payload.elapsedMs === "number") state.elapsedMs = payload.elapsedMs;
            state.steps = state.steps.map((s) =>
              s.step === payload.step
                ? { ...s, state: payload.state, detail: payload.message || s.detail, elapsedMs: payload.elapsedMs }
                : s
            );
            render();
          } else if (eventName === "captcha_required") {
            if (typeof payload.elapsedMs === "number") state.elapsedMs = payload.elapsedMs;
            state.captchaPrompt = payload;
            state.isRunning = false;
            render();
          } else if (eventName === "result") {
            if (state.previousResult && state.previousResult.application_id === payload.application_id) {
              const prevMsg = state.previousResult.visa_portal.message;
              const prevPtLen = state.previousResult.passtrack.table.filter((r) => r[2] && r[2].toLowerCase().includes("done")).length;
              const currPtLen = payload.passtrack.table.filter((r) => r[2] && r[2].toLowerCase().includes("done")).length;
              if (prevMsg !== payload.visa_portal.message || prevPtLen !== currPtLen) {
                state.statusChangedNotice = `Live Watch detected an update at ${new Date(payload.checked_at).toLocaleTimeString()}: ${payload.visa_portal.label || "Status updated"}.`;
              }
            }
            state.previousResult = payload;
            state.result = payload;
            state.elapsedMs = payload.elapsed_ms;
            state.isRunning = false;
            state.showPipeline = false;
            addResultToHistory(payload);
            resetAutoWatchTimer();
            render();
          } else if (eventName === "error") {
            throw new Error(payload.message || "Dual-portal lookup failed.");
          }
        }
      }
    } catch (err) {
      if (err && err.name === "AbortError") {
        state.isRunning = false;
        state.showPipeline = false;
        render();
        return;
      }
      if (err instanceof TypeError && !getEffectiveApiBase()) {
        activateStaticAssist(opts.appId, opts.passNo);
        return;
      }
      state.streamError = err instanceof Error ? err.message : "Could not complete live status enquiry.";
      state.isRunning = false;
      render();
    }
  }

  function downloadStatusCardPng() {
    const result = state.result;
    if (!result) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 675;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maskStr = (val, keep = 0) => {
      if (!val) return "••••••••";
      if (keep > 0 && val.length > keep) return val.slice(0, keep) + "•".repeat(val.length - keep);
      return val.replace(/[A-Za-z0-9]/g, "•");
    };

    const wrapText = (text, maxW) => {
      const words = String(text || "").split(/\s+/);
      const lines = [];
      let cur = "";
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (ctx.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else {
          cur = test;
        }
      }
      if (cur) lines.push(cur);
      return lines;
    };

    ctx.fillStyle = "#0F172A";
    ctx.fillRect(0, 0, 1200, 675);

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(32, 32, 1136, 611, 16);
    ctx.fill();

    ctx.fillStyle = "#F8FAFC";
    ctx.beginPath();
    ctx.roundRect(32, 32, 1136, 92, [16, 16, 0, 0]);
    ctx.fill();

    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 124);
    ctx.lineTo(1168, 124);
    ctx.stroke();

    ctx.fillStyle = "#0F172A";
    ctx.font = "700 28px Outfit, system-ui, sans-serif";
    ctx.fillText("IndiaVisa Track", 64, 82);

    const center = resolveIvacCenter(result.application_id);
    ctx.fillStyle = "#475569";
    ctx.font = "500 15px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText(
      `${center ? center.name : "Indian Visa & IVAC Verification"} · ${new Date(result.checked_at).toLocaleString()}`,
      64,
      106
    );

    const nameRaw = result.passtrack.applicant_name && result.passtrack.applicant_name !== "Unknown" ? result.passtrack.applicant_name : "Not Available";
    const meta = [
      { label: "APPLICATION ID", value: state.maskAppId ? maskStr(result.application_id, 4) : result.application_id },
      { label: "PASSPORT NO", value: state.maskPassport ? maskStr(result.passport_no, 2) : result.passport_no },
      { label: "APPLICANT NAME", value: state.maskName ? maskStr(nameRaw) : nameRaw },
      { label: state.submissionDate ? "SUBMISSION DATE" : "CENTER", value: state.submissionDate || (center ? center.shortName : "IVAC") },
    ];
    meta.forEach((m, i) => {
      const x = 64 + i * 272;
      ctx.fillStyle = "#64748B";
      ctx.font = "600 11px 'JetBrains Mono', monospace";
      ctx.fillText(m.label, x, 164);
      ctx.fillStyle = "#0F172A";
      ctx.font = "600 18px 'JetBrains Mono', monospace";
      ctx.fillText(m.value.slice(0, 22), x, 190);
    });

    ctx.strokeStyle = "#E2E8F0";
    ctx.beginPath();
    ctx.moveTo(64, 214);
    ctx.lineTo(1136, 214);
    ctx.stroke();

    const accentMap = {
      processed_printed: { fg: "#15803D", bg: "#F0FDF4" },
      granted_not_printed: { fg: "#15803D", bg: "#F0FDF4" },
      under_processing: { fg: "#B45309", bg: "#FFFBEB" },
      attention_required: { fg: "#B91C1C", bg: "#FEF2F2" },
      closed: { fg: "#B91C1C", bg: "#FEF2F2" },
      not_found: { fg: "#1D4ED8", bg: "#EFF6FF" },
    };
    const colors = accentMap[result.visa_portal.category || ""] || { fg: "#1D4ED8", bg: "#EFF6FF" };

    ctx.fillStyle = colors.bg;
    ctx.strokeStyle = "#CBD5E1";
    ctx.beginPath();
    ctx.roundRect(64, 238, 520, 310, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#475569";
    ctx.font = "600 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText("INDIAN VISA ONLINE PORTAL", 88, 274);

    ctx.fillStyle = colors.fg;
    ctx.font = "700 24px Outfit, system-ui, sans-serif";
    ctx.fillText(result.visa_portal.label || "Status Retrieved", 88, 312);

    ctx.fillStyle = "#1E293B";
    ctx.font = "500 16px 'Plus Jakarta Sans', system-ui, sans-serif";
    wrapText(result.visa_portal.message, 468).slice(0, 7).forEach((line, idx) => {
      ctx.fillText(line, 88, 354 + idx * 26);
    });

    ctx.fillStyle = "#F8FAFC";
    ctx.strokeStyle = "#CBD5E1";
    ctx.beginPath();
    ctx.roundRect(616, 238, 520, 310, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#475569";
    ctx.font = "600 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText("IVAC PASSTRACK DELIVERY", 640, 274);

    const rows = result.passtrack.table.length > 1 ? result.passtrack.table.slice(1) : [];
    const doneCount = rows.filter((r) => r[2] && r[2].toLowerCase().includes("done")).length;
    const pct = rows.length > 0 ? Math.round((doneCount / rows.length) * 100) : 0;

    ctx.fillStyle = "#0F172A";
    ctx.font = "700 24px Outfit, system-ui, sans-serif";
    ctx.fillText(rows.length > 0 ? `${pct}% Complete (${doneCount}/${rows.length} Steps)` : "Delivery Timeline", 640, 312);

    if (rows.length > 0) {
      rows.slice(0, 5).forEach((r, idx) => {
        const y = 356 + idx * 36;
        const done = r[2] && r[2].toLowerCase().includes("done");
        ctx.fillStyle = done ? "#15803D" : "#64748B";
        ctx.font = "700 13px 'JetBrains Mono', monospace";
        ctx.fillText(done ? "[DONE]" : "[WAIT]", 640, y);
        ctx.fillStyle = "#0F172A";
        ctx.font = "500 15px 'Plus Jakarta Sans', system-ui, sans-serif";
        ctx.fillText((r[1] || r[0] || "").slice(0, 42), 710, y);
      });
    } else {
      ctx.fillStyle = "#475569";
      ctx.font = "500 15px 'Plus Jakarta Sans', system-ui, sans-serif";
      wrapText(result.passtrack.message || "Delivery tracking steps not available yet.", 468).slice(0, 5).forEach((line, idx) => {
        ctx.fillText(line, 640, 356 + idx * 26);
      });
    }

    ctx.fillStyle = "#64748B";
    ctx.font = "500 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText("Live dual-portal verification from indianvisaonline.gov.in & passtrack.net", 64, 608);

    const link = document.createElement("a");
    link.download = `IndiaVisa_${state.maskAppId ? "Status" : result.application_id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function iconTile(hue, size, iconName) {
    const r = Math.round(size * 0.29);
    return `<span class="icon-tile tile-${hue}" style="width:${size}px;height:${size}px;border-radius:${r}px">${ICONS[iconName] || ""}</span>`;
  }

  function langPillGroup(extraClass = "") {
    return `
      <div role="group" aria-label="Guidance Language" class="lang-pill-group ${extraClass}">
        <button type="button" data-action="set-lang" data-lang="en" class="lang-pill-btn ${state.lang === "en" ? "active" : ""}">EN</button>
        <button type="button" data-action="set-lang" data-lang="bn" class="lang-pill-btn font-bn ${state.lang === "bn" ? "active" : ""}">বাংলা</button>
      </div>
    `;
  }

  function renderSidebar() {
    return `
      <aside aria-label="Primary Sidebar Navigation" class="glass-sidebar sidebar">
        <a href="#tracker" data-action="nav" data-section="tracker" class="brand-link">
          ${iconTile("multi", 38, "shieldCheck")}
          <span class="brand-text title-grad">IndiaVisa Track</span>
        </a>
        <nav class="sidebar-nav">
          ${NAV_ITEMS.map((item) => {
            const active = state.activeSection === item.id;
            const activeStyle = active
              ? `background:linear-gradient(135deg, rgba(${item.rgbVar}, 0.18), rgba(${item.rgbVar}, 0.05)); border-color: rgba(${item.rgbVar}, 0.42);`
              : "";
            return `
              <button type="button" data-action="nav" data-section="${item.id}" class="nav-item ${active ? "active" : ""}" style="${activeStyle}">
                ${active ? `<span aria-hidden="true" class="nav-item-bar" style="background:linear-gradient(180deg, rgba(${item.rgbVar}, 1), rgba(${item.rgbVar}, 0.45))"></span>` : ""}
                ${iconTile(item.hue, 36, item.icon)}
                <span class="truncate">${item.label}</span>
                ${item.id === "history" && state.history.length > 0 ? `<span class="nav-count tabular-nums">${state.history.length}</span>` : ""}
              </button>
            `;
          }).join("")}
        </nav>
        <div class="sidebar-foot">
          <div class="lang-row">
            <span style="font-size:12px;font-weight:700;color:var(--ink)">Guidance Language</span>
            ${langPillGroup()}
          </div>
          <p style="margin:0;font-size:11px;line-height:1.55;color:var(--mut)">
            Queries Indian Visa Online and IVAC Passtrack directly with automated verification.
          </p>
        </div>
      </aside>
    `;
  }

  function renderBottomNav() {
    const idx = Math.max(0, NAV_ITEMS.findIndex((i) => i.id === state.activeSection));
    const activeItem = NAV_ITEMS[idx];
    return `
      <nav aria-label="Mobile and Tablet Navigation" class="glass-bar bottom-nav">
        <span aria-hidden="true" class="bottom-nav-indicator" style="left:calc(${idx * 25}% + 12.5%);background:rgba(${activeItem.rgbVar},0.20);border-color:rgba(${activeItem.rgbVar},0.50);box-shadow:0 6px 16px -6px rgba(${activeItem.rgbVar},0.65);"></span>
        ${NAV_ITEMS.map((item) => {
          const active = state.activeSection === item.id;
          return `
            <button type="button" data-action="nav" data-section="${item.id}" class="bottom-nav-btn ${active ? "active" : ""}">
              <span class="bottom-nav-icon">
                ${ICONS[item.icon]}
                ${item.id === "history" && state.history.length > 0 ? `<span class="bottom-nav-badge tabular-nums">${state.history.length}</span>` : ""}
              </span>
              <span class="bottom-label-mobile">${item.shortLabel}</span>
              <span class="bottom-label-tablet">${item.tabletLabel}</span>
            </button>
          `;
        }).join("")}
      </nav>
    `;
  }

  function renderPipeline() {
    if (!state.showPipeline) return "";
    const completed = state.steps.filter((s) => s.state === "completed").length;
    const pct = Math.round((completed / state.steps.length) * 100);
    const activeVisa = state.visaCaptchaOverride || (state.captchaPrompt && state.captchaPrompt.captchas.visa);
    const activePt = state.ptCaptchaOverride || (state.captchaPrompt && state.captchaPrompt.captchas.passtrack);

    return `
      <section aria-label="Live Dual-Portal Verification Pipeline" class="glass-panel card-pad animate-rise">
        <div class="flex-between" style="flex-wrap:wrap;margin-bottom:16px">
          <div class="flex-row">
            ${iconTile(state.captchaPrompt ? "amber" : "violet", 40, state.isRunning ? "loader" : "waves")}
            <div>
              <h3 class="card-title" style="font-size:16px">${state.captchaPrompt ? "Portal Captcha Verification Required" : "Live Dual-Portal Stream"}</h3>
              <p class="card-sub" style="font-size:12px">${state.isRunning ? "Automatic verification running across both portals" : "Pipeline status"}</p>
            </div>
          </div>
          <div class="flex-row" style="font-size:12px;font-weight:600;color:var(--mut)">
            <span class="font-mono">${(state.elapsedMs / 1000).toFixed(1)}s</span>
            <span aria-hidden="true">·</span>
            <span class="font-mono" style="font-weight:700;color:var(--ink)">${pct}%</span>
            ${state.isRunning ? `<button type="button" data-action="cancel-pipeline" class="btn-glass-ghost" style="padding:6px 12px;font-size:12px">Cancel</button>` : ""}
          </div>
        </div>

        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>

        <ol class="pipeline-grid">
          ${state.steps.map((step) => {
            const done = step.state === "completed";
            const active = step.state === "active";
            const style = done
              ? "background:rgba(var(--c-emerald),0.12);border-color:rgba(var(--c-emerald),0.42);"
              : active
                ? "background:rgba(var(--c-sky),0.12);border-color:rgba(var(--c-sky),0.48);"
                : "";
            const badgeStyle = done
              ? "background:linear-gradient(135deg,#4ade80,#0d9488);color:#fff;"
              : active
                ? "background:linear-gradient(135deg,#38bdf8,#8b5cf6);color:#fff;"
                : "";
            return `
              <li class="pipeline-step" style="${style}">
                <div class="pipeline-badge" style="${badgeStyle}">
                  ${done ? `<span style="width:14px;height:14px;display:inline-flex">${ICONS.check}</span>` : active ? `<span style="width:14px;height:14px;display:inline-flex">${ICONS.loader}</span>` : step.step}
                </div>
                <div style="min-width:0;flex:1">
                  <div class="flex-between" style="gap:8px">
                    <span class="truncate" style="font-family:var(--font-display);font-size:12px;font-weight:700">${esc(step.title)}</span>
                    ${typeof step.elapsedMs === "number" ? `<span class="font-mono" style="font-size:11px;color:var(--mut2)">${(step.elapsedMs / 1000).toFixed(1)}s</span>` : ""}
                  </div>
                  <p class="truncate" style="margin:2px 0 0;font-size:12px;color:var(--mut)">${esc(step.detail)}</p>
                </div>
              </li>
            `;
          }).join("")}
        </ol>

        ${state.captchaPrompt ? `
          <form id="manualCaptchaForm" style="margin-top:22px;padding-top:18px;border-top:1px solid var(--line2)">
            <div class="flex-row" style="align-items:flex-start;margin-bottom:14px;font-size:13px">
              <span style="width:16px;height:16px;color:var(--tx-info);flex-shrink:0;margin-top:2px">${ICONS.shieldCheck}</span>
              <p style="margin:0">${esc(state.captchaPrompt.reason)}</p>
            </div>
            <div class="captcha-grid">
              ${activeVisa ? `
                <div class="glass-inset" style="padding:16px">
                  <div class="flex-between" style="margin-bottom:8px">
                    <span style="font-size:12px;font-weight:700">Indian Visa Online Access Code</span>
                    <button type="button" data-action="refresh-captcha" data-portal="indianvisa" class="btn-glass-ghost" style="padding:4px 10px;font-size:11px">Refresh</button>
                  </div>
                  <div class="captcha-img-box"><img src="${esc(activeVisa.imageDataUrl)}" alt="Indian Visa Online Captcha" referrerpolicy="no-referrer" /></div>
                  <input id="visaCaptchaInput" type="text" required placeholder="Enter access code shown above" autocomplete="off" class="glass-input" style="width:100%;height:44px;padding:0 14px;font-family:var(--font-mono);font-size:14px" />
                </div>
              ` : ""}
              ${activePt ? `
                <div class="glass-inset" style="padding:16px">
                  <div class="flex-between" style="margin-bottom:8px">
                    <span style="font-size:12px;font-weight:700">IVAC Passtrack Verification Code</span>
                    <button type="button" data-action="refresh-captcha" data-portal="passtrack" class="btn-glass-ghost" style="padding:4px 10px;font-size:11px">Refresh</button>
                  </div>
                  <div class="captcha-img-box"><img src="${esc(activePt.imageDataUrl)}" alt="IVAC Passtrack Captcha" referrerpolicy="no-referrer" /></div>
                  <input id="ptCaptchaInput" type="text" required placeholder="Enter verification code shown above" autocomplete="off" class="glass-input" style="width:100%;height:44px;padding:0 14px;font-family:var(--font-mono);font-size:14px" />
                </div>
              ` : ""}
            </div>
            <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px">
              <button type="button" data-action="cancel-pipeline" class="btn-glass-ghost" style="padding:9px 16px;font-size:12px">Cancel</button>
              <button type="submit" class="btn-glass-primary" style="padding:9px 18px;font-size:12px">Verify &amp; Complete Check</button>
            </div>
          </form>
        ` : ""}
      </section>
    `;
  }

  function renderStatusReport() {
    const result = state.result;
    if (!result) return "";

    const center = resolveIvacCenter(result.application_id);
    const guidance = getBilingualGuidance(result.visa_portal.category);
    const visuals = getStatusVisuals(result.visa_portal.category);

    const rawTable = result.passtrack.table || [];
    const rows = rawTable.length > 1 ? rawTable.slice(1) : [];
    const doneCount = rows.filter((r) => r[2] && String(r[2]).toLowerCase().includes("done")).length;
    const pct = rows.length > 0 ? Math.round((doneCount / rows.length) * 100) : 0;
    const latestDone = [...rows].reverse().find((r) => r[2] && String(r[2]).toLowerCase().includes("done"));
    const latestStepText = (latestDone && latestDone[1]) || (rows[0] && rows[0][1]) || "";

    const isUnknown = !result.passtrack.applicant_name || result.passtrack.applicant_name.trim().toLowerCase() === "unknown";
    const displayName = isUnknown ? "Unavailable" : state.maskName ? result.passtrack.applicant_name.replace(/[A-Za-z0-9]/g, "•") : result.passtrack.applicant_name;

    const elapsedStats = countWorkingDays(state.submissionDate);
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (pct / 100) * circumference;

    const cat = result.visa_portal.category;
    const visaLifecycle = [
      { label: "Submitted", done: true },
      { label: "Consular Review", done: ["under_processing", "granted_not_printed", "processed_printed", "attention_required", "closed"].includes(cat) },
      { label: "Decision / Granted", done: ["granted_not_printed", "processed_printed"].includes(cat) },
      { label: "Visa Printed", done: cat === "processed_printed" },
    ];

    const countdownStr = state.secondsUntilRefresh !== null
      ? `${String(Math.floor(state.secondsUntilRefresh / 60)).padStart(2, "0")}:${String(state.secondsUntilRefresh % 60).padStart(2, "0")}`
      : "";

    return `
      <div class="section-stack animate-rise">
        <div class="glass-panel report-toolbar">
          <div class="toolbar-meta">
            <span class="font-mono" style="font-weight:700;color:var(--tx-info)">${state.maskAppId ? `${esc(result.application_id.slice(0, 4))}••••••••` : esc(result.application_id)}</span>
            <span aria-hidden="true">·</span>
            <span style="font-weight:600;color:var(--ink)">${center ? esc(center.name) : "Indian Mission / IVAC"}</span>
            <span aria-hidden="true">·</span>
            <span class="font-mono">Checked ${esc(new Date(result.checked_at).toLocaleTimeString())}</span>
            <span aria-hidden="true">·</span>
            <span class="font-mono">${(result.elapsed_ms / 1000).toFixed(1)}s</span>
          </div>

          <div class="toolbar-controls">
            <div role="group" aria-label="Auto-Watch Interval" class="autowatch-group">
              <span style="padding:0 8px;font-size:11px;font-weight:700;color:var(--mut)">Auto-Watch</span>
              ${[0, 5, 15].map((min) => `
                <button type="button" data-action="set-autowatch" data-min="${min}" class="autowatch-btn ${state.autoRefreshMin === min ? "active" : ""}">
                  ${min === 0 ? "Off" : `${min}m`}
                </button>
              `).join("")}
            </div>
            ${state.secondsUntilRefresh !== null && state.autoRefreshMin > 0 ? `<span id="autoWatchCountdown" class="font-mono" style="font-size:12px;font-weight:700;color:var(--tx-info)">Next: ${countdownStr}</span>` : ""}
            <button type="button" data-action="refresh-now" ${state.isRunning ? "disabled" : ""} class="btn-glass-ghost" style="padding:8px 14px;font-size:12px">
              <span style="width:14px;height:14px;display:inline-flex">${state.isRunning ? ICONS.loader : ICONS.refresh}</span>
              <span>Refresh Now</span>
            </button>
            <button type="button" data-action="download-png" class="btn-glass-emerald" style="padding:8px 16px;font-size:12px">
              <span style="width:14px;height:14px;display:inline-flex">${ICONS.download}</span>
              <span>Save Status Image</span>
            </button>
          </div>
        </div>

        ${state.statusChangedNotice ? `<div role="status" class="glass-panel alert-emerald" style="padding:14px 18px;font-size:13px">${esc(state.statusChangedNotice)}</div>` : ""}

        <div class="dual-split">
          <section aria-label="Indian Visa Online Portal Status" class="glass-panel card-pad dual-left">
            <div class="visa-card-inner">
              <div>
                <div class="flex-between" style="margin-bottom:16px">
                  <div class="flex-row">
                    ${iconTile(visuals.hue, 40, "shieldCheck")}
                    <h3 class="card-title" style="font-size:16px">Indian Visa Online</h3>
                  </div>
                  ${langPillGroup()}
                </div>
                <div class="status-banner" style="background:rgba(${visuals.rgb},0.12);border-color:rgba(${visuals.rgb},0.45)">
                  <div class="flex-row" style="gap:10px">
                    <span style="width:20px;height:20px;color:${visuals.textVar};flex-shrink:0;display:inline-flex">${ICONS[visuals.icon]}</span>
                    <span class="font-display" style="font-size:18px;font-weight:700;color:${visuals.textVar}">${esc(result.visa_portal.label || guidance.enTitle)}</span>
                  </div>
                  <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:var(--ink)">${esc(result.visa_portal.message)}</p>
                </div>
              </div>

              <div class="visa-card-right" style="display:flex;flex-direction:column;justify-content:space-between;gap:18px">
                <p class="${state.lang === "bn" ? "font-bn" : ""}" style="margin:0;font-size:14px;line-height:1.65;color:var(--mut)">
                  ${esc(state.lang === "en" ? guidance.enDetail : guidance.bnDetail)}
                </p>
                <div style="padding-top:16px;border-top:1px solid var(--line2)">
                  <div style="margin-bottom:12px;font-size:12px;font-weight:700;color:var(--mut)">Consular Decision Lifecycle</div>
                  <div class="lifecycle-grid">
                    ${visaLifecycle.map((stage, i) => `
                      <div style="display:flex;flex-direction:column;gap:6px">
                        <div class="lifecycle-bar ${stage.done ? "done" : ""}"></div>
                        <span class="font-mono" style="font-size:11px;font-weight:600;color:var(--mut2)">0${i + 1}</span>
                        <span style="font-size:12px;font-weight:600;line-height:1.3;color:${stage.done ? "var(--ink)" : "var(--mut2)"}">${esc(stage.label)}</span>
                      </div>
                    `).join("")}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section aria-label="IVAC Passtrack Delivery Tracker" class="glass-panel card-pad dual-right">
            <div class="passtrack-head">
              <div>
                <div class="flex-row" style="margin-bottom:8px">
                  ${iconTile("amber", 40, "packageCheck")}
                  <h3 class="card-title" style="font-size:16px">${center ? `${esc(center.name)} Delivery Tracker` : "IVAC Passtrack Delivery"}</h3>
                </div>
                <div class="flex-row" style="font-size:14px;color:var(--mut)">
                  <span>Applicant:</span>
                  <strong style="color:var(--ink)">${esc(displayName)}</strong>
                  ${!isUnknown ? `<button type="button" data-action="toggle-mask-name" class="eye-btn" style="position:static;transform:none" aria-label="Toggle Applicant Name">${state.maskName ? ICONS.eyeOff : ICONS.eye}</button>` : ""}
                </div>
                ${latestStepText ? `<div style="margin-top:6px;font-size:12px;color:var(--mut)">Current Milestone: <strong style="color:var(--ink)">${esc(latestStepText)}</strong></div>` : ""}
              </div>

              <div class="radial-box">
                <svg viewBox="0 0 96 96" style="width:96px;height:96px;transform:rotate(-90deg)">
                  <defs>
                    <linearGradient id="radialProgressGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stop-color="#ffd166"/>
                      <stop offset="55%" stop-color="#34d399"/>
                      <stop offset="100%" stop-color="#38bdf8"/>
                    </linearGradient>
                  </defs>
                  <circle cx="48" cy="48" r="${radius}" fill="none" stroke="var(--srf2)" stroke-width="8"/>
                  <circle cx="48" cy="48" r="${radius}" fill="none" stroke="url(#radialProgressGrad)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"/>
                </svg>
                <div class="radial-center">
                  <span class="font-mono" style="font-size:18px;font-weight:700">${pct}%</span>
                  <span class="font-mono" style="font-size:10px;font-weight:600;color:var(--mut2)">${doneCount}/${rows.length || 4}</span>
                </div>
              </div>
            </div>

            <div class="submission-row">
              <div class="flex-row">
                <label for="submissionDatePicker" class="flex-row" style="gap:6px;font-size:12px;font-weight:700;color:var(--mut)">
                  <span style="width:14px;height:14px;color:var(--tx-info);display:inline-flex">${ICONS.calendar}</span>
                  <span>Submission Date</span>
                </label>
                <input id="submissionDatePicker" type="date" max="${getYesterdayIso()}" value="${esc(state.submissionDate)}" class="glass-input date-input" />
              </div>
              ${elapsedStats ? `
                <div class="tabular-nums" style="font-size:12px;color:var(--mut)">
                  <strong class="font-mono" style="color:var(--ink)">${elapsedStats.workingDays}</strong> working days elapsed
                  <span aria-hidden="true"> · </span>
                  <strong class="font-mono" style="color:var(--ink)">${elapsedStats.calendarDays}</strong> calendar days total
                </div>
              ` : `<span style="font-size:12px;color:var(--mut2)">Select submission date to compute Sun–Thu working days</span>`}
            </div>

            ${result.passtrack.status !== "success" || rows.length === 0 ? `
              <div class="alert-box alert-amber" style="padding:16px">
                <div class="flex-row" style="align-items:flex-start;gap:12px">
                  <span style="width:20px;height:20px;color:var(--tx-warn);flex-shrink:0;margin-top:2px;display:inline-flex">${ICONS.alertTriangle}</span>
                  <div>
                    <div class="font-display" style="font-weight:700;color:var(--tx-warn);margin-bottom:4px">
                      ${result.passtrack.status === "not-found" ? "Passtrack Record Not Listed Yet" : "IVAC Passtrack Notice"}
                    </div>
                    <p style="margin:0 0 8px;font-size:12px;font-weight:500">${esc(result.passtrack.message || "Delivery steps could not be loaded from IVAC Passtrack right now.")}</p>
                    <a href="https://www.passtrack.net/regular_passport.php" target="_blank" rel="noopener noreferrer" class="flex-row" style="gap:6px;font-size:12px;font-weight:700;color:var(--tx-info)">
                      <span>Open Official Passtrack</span>
                      <span style="width:13px;height:13px;display:inline-flex">${ICONS.externalLink}</span>
                    </a>
                  </div>
                </div>
              </div>
            ` : `
              <div class="milestones-grid">
                ${rows.map((r, idx) => {
                  const done = r[2] && String(r[2]).toLowerCase().includes("done");
                  return `
                    <div class="milestone-card" style="${done ? "background:rgba(var(--c-emerald),0.12);border-color:rgba(var(--c-emerald),0.45);" : ""}">
                      <div style="min-width:0;flex:1">
                        <span class="font-mono" style="font-size:11px;font-weight:600;color:var(--mut2)">Step 0${idx + 1}</span>
                        <div class="font-display" style="margin-top:2px;font-size:12px;font-weight:700;line-height:1.35">${esc(r[1] || r[0])}</div>
                      </div>
                      <span class="font-mono" style="font-size:11px;font-weight:700;color:${done ? "var(--tx-pos)" : "var(--mut2)"}">${done ? "DONE" : "PENDING"}</span>
                    </div>
                  `;
                }).join("")}
              </div>
            `}
          </section>
        </div>
      </div>
    `;
  }

  function renderTrackerSection() {
    const center = resolveIvacCenter(state.applicationId);
    return `
      <div class="hero-header animate-rise">
        <div class="hero-title-wrap">
          ${iconTile("amber", 48, "shieldCheck")}
          <div>
            <h1 class="hero-title title-grad">Indian Visa &amp; Passtrack Status</h1>
            <p class="hero-sub">Check Indian Visa Online and IVAC Passtrack status in real time.</p>
          </div>
        </div>
        ${langPillGroup("mobile-lang-switch")}
      </div>

      <div class="section-stack">
        <section aria-label="Visa Status Enquiry Form" class="glass-panel card-pad animate-rise">
          <div class="card-header">
            ${iconTile("sky", 42, "searchCheck")}
            <div>
              <h2 class="card-title">Check Visa Status</h2>
              <p class="card-sub">Enter your 12-character Web File Number and Passport Number.</p>
            </div>
          </div>

          <form id="enquiryForm" class="section-stack" style="gap:14px">
            <div class="enquiry-grid">
              <div class="enquiry-col-app">
                <div class="field-head">
                  <label for="applicationIdInput" class="field-label">Application ID (Web File Number)</label>
                  <span id="appIdCounter" class="field-counter">${state.applicationId.length}/12</span>
                </div>
                <div class="input-wrap">
                  <input id="applicationIdInput" type="${state.maskAppId ? "password" : "text"}" maxlength="12" autocomplete="off" ${state.isRunning ? "disabled" : ""} placeholder="e.g., BGDD01234567" value="${esc(state.applicationId)}" class="glass-input form-input" />
                  <button type="button" data-action="toggle-mask-app" class="eye-btn" aria-label="Toggle Application ID Visibility">${state.maskAppId ? ICONS.eyeOff : ICONS.eye}</button>
                </div>
                <div id="appIdHint" class="field-hint">
                  ${center ? `${esc(center.name)} · Prefix <strong class="font-mono" style="color:var(--tx-info)">${esc(center.prefix)}</strong>` : "12-character Web File ID from your IVAC receipt"}
                </div>
              </div>

              <div class="enquiry-col-pass">
                <div class="field-head">
                  <label for="passportNoInput" class="field-label">Passport Number</label>
                  <span id="passportCounter" class="field-counter">${state.passportNo.length}/9+</span>
                </div>
                <div class="input-wrap">
                  <input id="passportNoInput" type="${state.maskPassport ? "password" : "text"}" maxlength="14" autocomplete="off" ${state.isRunning ? "disabled" : ""} placeholder="e.g., A01234567" value="${esc(state.passportNo)}" class="glass-input form-input" />
                  <button type="button" data-action="toggle-mask-pass" class="eye-btn" aria-label="Toggle Passport Number Visibility">${state.maskPassport ? ICONS.eyeOff : ICONS.eye}</button>
                </div>
                <div class="field-hint">Current passport number submitted with application</div>
              </div>

              <div class="form-actions">
                <input id="receiptFileInput" type="file" accept="image/*" capture="environment" class="hidden" />
                <button type="button" data-action="trigger-scan" ${state.isRunning || state.scanningReceipt ? "disabled" : ""} class="btn-glass-ghost btn-scan">
                  <span style="width:16px;height:16px;display:inline-flex">${state.scanningReceipt ? ICONS.loader : ICONS.camera}</span>
                  <span>Scan Receipt</span>
                </button>
                <button type="submit" ${state.isRunning ? "disabled" : ""} class="btn-glass-primary btn-submit">
                  <span style="width:16px;height:16px;display:inline-flex">${state.isRunning ? ICONS.loader : ICONS.search}</span>
                  <span>${state.isRunning ? "Checking" : "Check Status"}</span>
                </button>
              </div>
            </div>

            ${state.validationError ? `<div role="alert" class="alert-box alert-rose"><span class="flex-row"><span style="width:16px;height:16px;flex-shrink:0;display:inline-flex">${ICONS.alertCircle}</span><span>${esc(state.validationError)}</span></span></div>` : ""}
            ${state.scanNotice ? `<div class="alert-box alert-sky">${esc(state.scanNotice)}</div>` : ""}
          </form>

          ${state.history.length > 0 ? `
            <div class="recent-wrap">
              <div class="field-label" style="margin-bottom:10px">Recent Enquiries</div>
              <div class="recent-grid">
                ${state.history.slice(0, 3).map((entry) => `
                  <button type="button" data-action="recheck-recent" data-app="${esc(entry.application_id)}" data-pass="${esc(entry.passport_no)}" ${state.isRunning ? "disabled" : ""} class="btn-glass-ghost recent-card">
                    <div class="recent-top">
                      <span class="font-mono" style="font-weight:700;color:var(--tx-info)">${state.maskAppId ? `${esc(entry.application_id.slice(0, 4))}••••••••` : esc(entry.application_id)}</span>
                      ${entry.visa_label ? `<span class="truncate" style="font-size:11px;font-weight:600;color:var(--mut)">${esc(entry.visa_label)}</span>` : ""}
                    </div>
                    ${entry.applicant_name ? `<span class="truncate" style="width:100%;font-weight:600;color:var(--ink)">${esc(entry.applicant_name)}</span>` : ""}
                  </button>
                `).join("")}
              </div>
            </div>
          ` : ""}
        </section>

        ${state.streamError ? `
          <div role="alert" class="glass-panel alert-box alert-rose" style="padding:16px 20px;flex-wrap:wrap">
            <div class="flex-row" style="align-items:flex-start;gap:12px">
              <span style="width:20px;height:20px;flex-shrink:0;margin-top:2px;display:inline-flex">${ICONS.alertCircle}</span>
              <div>
                <div class="font-display" style="font-weight:700;font-size:14px">Live Enquiry Failed</div>
                <p style="margin:4px 0 0;font-size:12px;font-weight:500">${esc(state.streamError)}</p>
              </div>
            </div>
            ${isStaticHost() ? `
              <div class="flex-row" style="flex-wrap:wrap">
                <a href="https://indianvisaonline.gov.in/visa/StatusEnquiry" target="_blank" rel="noopener noreferrer" class="btn-glass-ghost" style="padding:6px 12px;font-size:12px">Official Visa Portal</a>
                <a href="https://www.passtrack.net/regular_passport.php" target="_blank" rel="noopener noreferrer" class="btn-glass-ghost" style="padding:6px 12px;font-size:12px">Official Passtrack</a>
                <button type="button" data-action="nav" data-section="appearance" class="btn-glass-ghost" style="padding:6px 12px;font-size:12px">Open Settings</button>
              </div>
            ` : ""}
          </div>
        ` : ""}

        ${renderStaticAssist()}

        ${renderPipeline()}

        ${state.result ? renderStatusReport() : !state.showPipeline && !state.staticAssist ? `
          <section class="overview-grid animate-rise">
            <div class="glass-panel overview-card">
              ${iconTile("amber", 38, "shieldCheck")}
              <div>
                <h3 class="card-title" style="font-size:14px">Visa Decision</h3>
                <p class="card-sub" style="font-size:12px">Indian Visa Online &amp; bilingual guidance</p>
              </div>
            </div>
            <div class="glass-panel overview-card">
              ${iconTile("sky", 38, "clock")}
              <div>
                <h3 class="card-title" style="font-size:14px">Passtrack Progress</h3>
                <p class="card-sub" style="font-size:12px">4-stage IVAC delivery tracking</p>
              </div>
            </div>
            <div class="glass-panel overview-card">
              ${iconTile("emerald", 38, "sparkles")}
              <div>
                <h3 class="card-title" style="font-size:14px">100% Free Hosting</h3>
                <p class="card-sub" style="font-size:12px">Works free on GitHub Pages &amp; Worker proxy</p>
              </div>
            </div>
          </section>
        ` : ""}
      </div>
    `;
  }

  function renderStaticAssist() {
    if (!state.staticAssist) return "";
    const { appId, passNo } = state.staticAssist;
    const center = resolveIvacCenter(appId);

    return `
      <section aria-label="Free Static Portal Assist" class="glass-panel card-pad animate-rise">
        <div class="flex-between" style="flex-wrap:wrap;gap:12px;padding-bottom:16px;border-bottom:1px solid var(--line2)">
          <div class="flex-row">
            ${iconTile("sky", 42, "globe")}
            <div>
              <h3 class="card-title" style="font-size:17px">Free Portal Check &amp; Status Card Builder</h3>
              <p class="card-sub" style="font-size:12px">
                Running free on static hosting (${esc(window.location.hostname)}). Copy your verified IDs below to check directly on the official government portals, or connect a 100% free Cloudflare Worker in Settings.
              </p>
            </div>
          </div>
          <div class="flex-row" style="flex-wrap:wrap">
            <button type="button" data-action="nav" data-section="appearance" class="btn-glass-ghost" style="padding:7px 12px;font-size:12px">Connect Free Worker ($0)</button>
            <button type="button" data-action="close-assist" class="btn-glass-ghost" style="padding:7px 12px;font-size:12px">Dismiss</button>
          </div>
        </div>

        <div class="assist-grid">
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="assist-cred-list">
              <div class="assist-cred-box">
                <div style="min-width:0">
                  <div class="field-label">Application ID · ${center ? esc(center.shortName) : "IVAC"}</div>
                  <div class="font-mono" style="margin-top:2px;font-size:15px;font-weight:700;color:var(--tx-info)">
                    ${state.maskAppId ? `${esc(appId.slice(0, 4))}••••••••` : esc(appId)}
                  </div>
                </div>
                <button type="button" data-action="copy-text" data-field="app" data-value="${esc(appId)}" class="btn-glass-ghost" style="padding:7px 12px;font-size:12px">
                  <span style="width:14px;height:14px;display:inline-flex">${state.copiedField === "app" ? ICONS.check : ICONS.copy}</span>
                  <span>${state.copiedField === "app" ? "Copied" : "Copy ID"}</span>
                </button>
              </div>

              <div class="assist-cred-box">
                <div style="min-width:0">
                  <div class="field-label">Passport Number</div>
                  <div class="font-mono" style="margin-top:2px;font-size:15px;font-weight:700">
                    ${state.maskPassport ? `${esc(passNo.slice(0, 2))}••••••` : esc(passNo)}
                  </div>
                </div>
                <button type="button" data-action="copy-text" data-field="pass" data-value="${esc(passNo)}" class="btn-glass-ghost" style="padding:7px 12px;font-size:12px">
                  <span style="width:14px;height:14px;display:inline-flex">${state.copiedField === "pass" ? ICONS.check : ICONS.copy}</span>
                  <span>${state.copiedField === "pass" ? "Copied" : "Copy Passport"}</span>
                </button>
              </div>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:10px">
              <a href="https://indianvisaonline.gov.in/visa/StatusEnquiry" target="_blank" rel="noopener noreferrer" class="btn-glass-primary" style="flex:1;min-width:190px;padding:11px 16px;font-size:13px">
                <span>1. Open Indian Visa Online</span>
                <span style="width:14px;height:14px;display:inline-flex">${ICONS.externalLink}</span>
              </a>
              <a href="https://www.passtrack.net/regular_passport.php" target="_blank" rel="noopener noreferrer" class="btn-glass-ghost" style="flex:1;min-width:170px;padding:11px 14px;font-size:13px">
                <span>2. Open IVAC Passtrack</span>
                <span style="width:14px;height:14px;display:inline-flex">${ICONS.externalLink}</span>
              </a>
            </div>
          </div>

          <form id="staticAssistForm" class="glass-inset" style="padding:16px;display:flex;flex-direction:column;gap:12px">
            <div>
              <div class="font-display" style="font-size:14px;font-weight:700">Generate Bilingual Report &amp; PNG Card</div>
              <p style="margin:2px 0 0;font-size:12px;color:var(--mut)">Select the result shown on the official portal to save &amp; export your card free.</p>
            </div>

            <div class="status-choice-grid">
              ${STATUS_PRESETS.map((preset) => `
                <button type="button" data-action="set-assist-cat" data-cat="${preset.category}" class="status-choice-btn ${state.assistCategory === preset.category ? "active" : ""}">
                  <span>${esc(preset.label)}</span>
                  ${state.assistCategory === preset.category ? `<span style="width:14px;height:14px;color:var(--tx-pos);display:inline-flex">${ICONS.check}</span>` : ""}
                </button>
              `).join("")}
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label for="assistApplicantInput" class="field-label" style="display:block;margin-bottom:4px">Applicant Name (Optional)</label>
                <input id="assistApplicantInput" type="text" value="${esc(state.assistApplicantName)}" placeholder="e.g., RAHIM UDDIN" class="glass-input" style="width:100%;height:38px;padding:0 12px;font-size:12px" />
              </div>
              <div>
                <label for="assistPasstrackSelect" class="field-label" style="display:block;margin-bottom:4px">IVAC Delivery Stage</label>
                <select id="assistPasstrackSelect" class="glass-input" style="width:100%;height:38px;padding:0 10px;font-size:12px">
                  ${PASSTRACK_STAGE_PRESETS.map((st) => `<option value="${st.stepsDone}" ${Number(state.assistPasstrackStage) === st.stepsDone ? "selected" : ""}>${esc(st.label)}</option>`).join("")}
                </select>
              </div>
            </div>

            <div style="display:flex;justify-content:flex-end">
              <button type="submit" class="btn-glass-emerald" style="padding:10px 18px;font-size:13px">
                <span style="width:15px;height:15px;display:inline-flex">${ICONS.sparkles}</span>
                <span>Generate Report &amp; Save</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  function renderRequirementsSection() {
    const sections = REQUIREMENTS[state.lang];
    return `
      <div class="section-stack animate-rise ${state.lang === "bn" ? "font-bn" : ""}">
        <div class="flex-between" style="flex-wrap:wrap;gap:16px">
          <div class="flex-row" style="align-items:flex-start;gap:14px">
            ${iconTile("emerald", 46, "fileText")}
            <div>
              <h2 class="card-title" style="font-size:22px">
                ${state.lang === "en" ? "India Tourist Visa Requirements" : "বাংলাদেশিদের জন্য ভারতীয় ট্যুরিস্ট ভিসার প্রয়োজনীয় কাগজপত্র"}
              </h2>
              <p class="card-sub">
                ${state.lang === "en" ? "Standard document checklist for Bangladeshi passport holders." : "ভারতীয় ট্যুরিস্ট ভিসা আবেদনের প্রয়োজনীয় কাগজপত্রের পূর্ণাঙ্গ তালিকা।"}
              </p>
            </div>
          </div>
          ${langPillGroup()}
        </div>

        <div class="two-col-grid">
          ${sections.map((sec) => `
            <section class="glass-panel card-pad">
              <div class="flex-row" style="margin-bottom:14px;gap:12px">
                ${iconTile(sec.hue, 40, "fileText")}
                <div>
                  <span class="font-mono" style="font-size:11px;font-weight:700;color:var(--mut2)">${sec.step}</span>
                  <h3 class="card-title" style="font-size:16px">${esc(sec.title)}</h3>
                </div>
              </div>
              <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;font-size:14px;line-height:1.55;color:var(--mut)">
                ${sec.items.map((item) => `
                  <li style="display:flex;align-items:flex-start;gap:10px">
                    <span style="width:14px;height:14px;margin-top:4px;color:var(--tx-pos);flex-shrink:0;display:inline-flex">${ICONS.check}</span>
                    <span>${esc(item)}</span>
                  </li>
                `).join("")}
              </ul>
            </section>
          `).join("")}
        </div>
      </div>
    `;
  }

  function getFilteredHistory() {
    const q = state.historySearch.trim().toLowerCase();
    if (!q) return state.history;
    return state.history.filter((item) => {
      const center = resolveIvacCenter(item.application_id);
      return [item.application_id, item.applicant_name || "", item.visa_label || "", (center && center.name) || ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }

  function renderHistoryCards() {
    const filtered = getFilteredHistory();
    if (state.history.length === 0) {
      return `
        <div class="glass-panel" style="padding:54px 24px;text-align:center;display:flex;flex-direction:column;align-items:center">
          ${iconTile("violet", 64, "bookmarkCheck")}
          <h3 class="card-title" style="margin-top:16px">No saved enquiries yet</h3>
          <p class="card-sub" style="max-width:340px">Run a live visa status check in the Status Tracker tab to store and monitor your application here.</p>
        </div>
      `;
    }
    if (filtered.length === 0) {
      return `<div class="glass-panel" style="padding:40px 24px;text-align:center;font-size:14px;color:var(--mut)">No saved enquiries match your search.</div>`;
    }
    return `
      <div class="two-col-grid">
        ${filtered.map((item) => {
          const center = resolveIvacCenter(item.application_id);
          const pct = typeof item.passtrack_progress_pct === "number" ? item.passtrack_progress_pct : 0;
          const initials = item.applicant_name
            ? item.applicant_name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
            : item.application_id.slice(0, 2);
          return `
            <article class="glass-panel history-card">
              <div>
                <div style="display:flex;align-items:flex-start;gap:14px">
                  <span class="avatar-badge" style="background:${getAvatarGradient(item.application_id)}">${esc(initials)}</span>
                  <div style="min-width:0;flex:1">
                    <div class="flex-between">
                      <span class="font-mono" style="font-size:14px;font-weight:700;color:var(--tx-info)">${state.maskAppId ? `${esc(item.application_id.slice(0, 4))}••••••••` : esc(item.application_id)}</span>
                      <span class="font-mono" style="font-size:11px;color:var(--mut2)">${esc(new Date(item.last_checked_at).toLocaleDateString())}</span>
                    </div>
                    <div class="truncate font-display" style="margin-top:4px;font-size:16px;font-weight:700">${esc(item.applicant_name || (center ? center.name : "Indian Visa Applicant"))}</div>
                    <div style="margin-top:2px;font-size:12px;color:var(--mut)">
                      <span>${center ? esc(center.shortName) : "IVAC"}</span>
                      <span aria-hidden="true"> · </span>
                      <strong style="color:var(--ink)">${esc(item.visa_label || "Checked")}</strong>
                    </div>
                  </div>
                </div>
                <div style="margin-top:16px">
                  <div class="flex-between" style="margin-bottom:6px;font-size:11px;font-weight:600;color:var(--mut)">
                    <span>${esc(item.latest_delivery_step || "Delivery Progress")}</span>
                    <span class="font-mono" style="color:var(--ink)">${typeof item.passtrack_progress_pct === "number" ? `${pct}%` : "—"}</span>
                  </div>
                  <div style="height:6px;width:100%;border-radius:999px;background:var(--srf2);overflow:hidden">
                    <div style="height:100%;width:${Math.max(4, pct)}%;border-radius:999px;background:${pct >= 75 ? "linear-gradient(90deg,#34d399,#a3e635)" : "linear-gradient(90deg,#38bdf8,#8b5cf6)"}"></div>
                  </div>
                </div>
              </div>
              <div class="flex-between" style="margin-top:16px">
                <span class="font-mono" style="font-size:11px;color:var(--mut2)">Checked ${esc(new Date(item.last_checked_at).toLocaleTimeString())}</span>
                <div class="flex-row" style="gap:8px">
                  <button type="button" data-action="recheck-recent" data-app="${esc(item.application_id)}" data-pass="${esc(item.passport_no)}" class="btn-glass-primary" style="padding:7px 14px;font-size:12px">
                    <span style="width:14px;height:14px;display:inline-flex">${ICONS.refresh}</span>
                    <span>Re-check</span>
                  </button>
                  <button type="button" data-action="delete-history" data-id="${esc(item.id)}" aria-label="Remove entry" class="btn-glass-ghost" style="width:32px;height:32px;color:var(--tx-neg)">
                    <span style="width:14px;height:14px;display:inline-flex">${ICONS.trash}</span>
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderHistorySection() {
    return `
      <div class="section-stack animate-rise">
        <div class="flex-between" style="flex-wrap:wrap;gap:14px">
          <div class="flex-row" style="align-items:flex-start;gap:14px">
            ${iconTile("violet", 46, "bookmarkCheck")}
            <div>
              <h2 class="card-title" style="font-size:22px">Saved Visa Enquiries</h2>
              <p class="card-sub">Stored locally on your device for instant one-click re-verification.</p>
            </div>
          </div>
          ${state.history.length > 0 ? `<button type="button" data-action="clear-history" class="btn-glass-ghost" style="padding:8px 14px;font-size:12px">Clear All</button>` : ""}
        </div>

        ${state.history.length > 0 ? `
          <div class="glass-panel" style="padding:14px">
            <div class="input-wrap">
              <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--mut2);pointer-events:none;display:inline-flex">${ICONS.search}</span>
              <input id="historySearchInput" type="text" value="${esc(state.historySearch)}" placeholder="Search by Application ID, applicant name, or decision..." aria-label="Search saved visa enquiries" class="glass-input" style="width:100%;height:44px;padding:0 16px 0 40px;font-size:14px" />
            </div>
          </div>
        ` : ""}

        <div id="historyGridContainer">${renderHistoryCards()}</div>
      </div>
    `;
  }

  function renderSettingsSection() {
    return `
      <div class="section-stack animate-rise">
        <div class="flex-row" style="align-items:flex-start;gap:14px">
          ${iconTile("cyan", 46, "palette")}
          <div>
            <h2 class="card-title" style="font-size:22px">${state.lang === "bn" ? "সেটিংস ও থিম" : "Settings"}</h2>
            <p class="card-sub">${state.lang === "bn" ? "থিম, ভাষা, প্রাইভেসি মাস্কিং এবং সার্ভার সংযোগ নির্ধারণ করুন।" : "Customize glass theme, language, privacy masking, and optional remote server."}</p>
          </div>
        </div>

        <div class="settings-split">
          <section aria-label="Theme Picker" class="glass-panel card-pad settings-themes">
            <div class="flex-row" style="margin-bottom:4px">
              <span style="width:20px;height:20px;color:var(--tx-info);display:inline-flex">${ICONS.palette}</span>
              <h3 class="card-title" style="font-size:16px">Theme &amp; Appearance</h3>
            </div>
            <p class="card-sub" style="margin-bottom:16px;font-size:12px">Six glass palettes crafted for daylight clarity and night tracking.</p>

            <div class="themes-grid">
              ${GLASS_THEMES.map((item) => {
                const selected = state.theme === item.id;
                const style = selected ? "background:rgba(var(--c-amber),0.11);border-color:rgba(var(--c-amber),0.72);box-shadow:0 8px 20px -10px rgba(var(--c-amber),0.55);" : "";
                return `
                  <button type="button" data-action="set-theme" data-theme="${item.id}" aria-pressed="${selected}" class="theme-card" style="${style}">
                    <span class="theme-swatch" style="background:${item.metaBg}">
                      <span class="swatch-dot" style="top:-4px;left:-4px;background:${item.swatches[0]}"></span>
                      <span class="swatch-dot" style="top:2px;right:-4px;background:${item.swatches[1]}"></span>
                      <span class="swatch-dot" style="bottom:-8px;left:10px;background:${item.swatches[2]}"></span>
                    </span>
                    <span style="min-width:0;flex:1">
                      <span class="truncate font-display" style="display:block;font-size:12px;font-weight:700">${esc(item.name)}</span>
                      <span style="display:block;margin-top:2px;font-size:11px;color:var(--mut2)">${esc(item.subtitle)}</span>
                    </span>
                    ${selected ? `<span style="width:16px;height:16px;color:var(--tx-pos);flex-shrink:0;display:inline-flex">${ICONS.check}</span>` : ""}
                  </button>
                `;
              }).join("")}
            </div>
          </section>

          <div class="settings-side">
            <section aria-label="Guidance Language" class="glass-panel card-pad">
              <div class="flex-row" style="margin-bottom:4px">
                <span style="width:20px;height:20px;color:var(--tx-info);display:inline-flex">${ICONS.globe}</span>
                <h3 class="card-title" style="font-size:16px">Language / ভাষা</h3>
              </div>
              <p class="card-sub" style="margin-bottom:14px;font-size:12px">Controls guidance explanations and Tourist Visa checklist language.</p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                <button type="button" data-action="set-lang" data-lang="en" class="theme-card" style="${state.lang === "en" ? "background:rgba(var(--c-amber),0.13);border-color:rgba(var(--c-amber),0.68);" : ""}">
                  ${iconTile("sky", 34, "globe")}
                  <div style="min-width:0;flex:1">
                    <div class="font-display" style="font-size:13px;font-weight:700">English</div>
                    <div style="font-size:11px;color:var(--mut)">Default</div>
                  </div>
                </button>
                <button type="button" data-action="set-lang" data-lang="bn" class="theme-card" style="${state.lang === "bn" ? "background:rgba(var(--c-amber),0.13);border-color:rgba(var(--c-amber),0.68);" : ""}">
                  ${iconTile("amber", 34, "globe")}
                  <div style="min-width:0;flex:1">
                    <div class="font-bn" style="font-size:13px;font-weight:700">বাংলা</div>
                    <div class="font-bn" style="font-size:11px;color:var(--mut)">বাংলাদেশ</div>
                  </div>
                </button>
              </div>
            </section>

            <section aria-label="Privacy Masking" class="glass-panel card-pad">
              <div class="flex-row" style="margin-bottom:4px">
                <span style="width:20px;height:20px;color:var(--tx-pos);display:inline-flex">${ICONS.shield}</span>
                <h3 class="card-title" style="font-size:16px">Privacy Masking</h3>
              </div>
              <p class="card-sub" style="margin-bottom:14px;font-size:12px">Hide sensitive identifiers on screen and exported status images.</p>
              <div style="display:flex;flex-direction:column;gap:10px">
                <button type="button" data-action="toggle-mask-app" class="toggle-btn">
                  <span>Mask Application ID</span>
                  <span class="flex-row" style="gap:6px;color:var(--mut)">
                    <span style="width:14px;height:14px;color:${state.maskAppId ? "var(--tx-warn)" : "var(--tx-pos)"};display:inline-flex">${state.maskAppId ? ICONS.eyeOff : ICONS.eye}</span>
                    <span>${state.maskAppId ? "Masked" : "Visible"}</span>
                  </span>
                </button>
                <button type="button" data-action="toggle-mask-pass" class="toggle-btn">
                  <span>Mask Passport Number</span>
                  <span class="flex-row" style="gap:6px;color:var(--mut)">
                    <span style="width:14px;height:14px;color:${state.maskPassport ? "var(--tx-warn)" : "var(--tx-pos)"};display:inline-flex">${state.maskPassport ? ICONS.eyeOff : ICONS.eye}</span>
                    <span>${state.maskPassport ? "Masked" : "Visible"}</span>
                  </span>
                </button>
              </div>
            </section>

            <section aria-label="Free Live Backend & Cloudflare Worker" class="glass-panel card-pad settings-server-card">
              <div class="flex-between" style="flex-wrap:wrap;gap:8px;margin-bottom:4px">
                <div class="flex-row">
                  <span style="width:20px;height:20px;color:var(--tx-info);display:inline-flex">${ICONS.server}</span>
                  <h3 class="card-title" style="font-size:16px">Free Live Backend / Cloudflare Worker</h3>
                </div>
                <span class="font-mono" style="font-size:11px;font-weight:700;color:${state.backendStatus === "live" ? "var(--tx-pos)" : "var(--tx-info)"}">
                  ${state.backendStatus === "live" ? "Live Connected" : "Free Static Mode"}
                </span>
              </div>
              <p class="card-sub" style="margin-bottom:14px;font-size:12px">Connect a 100% free Cloudflare Worker ($0/mo, 100,000 requests/day) or Node server to run live dual-portal queries directly from ${esc(window.location.hostname || "your domain")}.</p>
              <form id="apiSettingsForm" style="display:flex;flex-direction:column;gap:10px">
                <input id="apiUrlInput" type="url" value="${esc(state.apiInput)}" placeholder="https://indiavisa-proxy.yourname.workers.dev" aria-label="Backend or Cloudflare Worker URL" class="glass-input" style="height:40px;width:100%;padding:0 12px;font-family:var(--font-mono);font-size:12px" />
                <div class="flex-row" style="flex-wrap:wrap">
                  <button type="submit" ${state.testingApi ? "disabled" : ""} class="btn-glass-primary" style="padding:8px 14px;font-size:12px">${state.testingApi ? "Testing..." : "Save & Test"}</button>
                  <button type="button" data-action="reset-api" class="btn-glass-ghost" style="padding:8px 14px;font-size:12px">Reset Default</button>
                  <button type="button" data-action="toggle-worker-guide" class="btn-glass-ghost" style="padding:8px 14px;font-size:12px">${state.showWorkerGuide ? "Hide Free Setup Guide" : "Setup Free Worker ($0)"}</button>
                </div>
              </form>
              ${state.apiFeedback ? `<p style="margin:10px 0 0;font-size:12px;font-weight:600;color:${state.apiFeedback.ok ? "var(--tx-pos)" : "var(--tx-neg)"}">${esc(state.apiFeedback.text)}</p>` : ""}
              ${state.showWorkerGuide ? `
                <div class="worker-guide-box">
                  <div class="flex-between" style="flex-wrap:wrap;gap:8px">
                    <strong class="font-display" style="font-size:13px">2-Minute Free Cloudflare Worker Setup ($0 Forever)</strong>
                    <button type="button" data-action="copy-worker-code" class="btn-glass-emerald" style="padding:6px 12px;font-size:11px">
                      <span style="width:13px;height:13px;display:inline-flex">${ICONS.copy}</span>
                      <span>${state.workerCopyNotice || "Copy cloudflare-worker.js"}</span>
                    </button>
                  </div>
                  <ol class="worker-step-list">
                    <li>Open <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" style="color:var(--tx-info);text-decoration:underline">dash.cloudflare.com</a> (free account, no card) → <strong>Workers &amp; Pages → Create Worker</strong>.</li>
                    <li>Click <strong>Copy cloudflare-worker.js</strong> above, paste it into the Worker editor, and click <strong>Deploy</strong>.</li>
                    <li>Copy your free <code>https://*.workers.dev</code> URL, paste it in the box above, and click <strong>Save &amp; Test</strong>.</li>
                  </ol>
                </div>
              ` : ""}
            </section>
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    const root = document.getElementById("app");
    if (!root) return;

    let bodyHtml = "";
    if (state.activeSection === "tracker") bodyHtml = renderTrackerSection();
    else if (state.activeSection === "requirements") bodyHtml = renderRequirementsSection();
    else if (state.activeSection === "history") bodyHtml = renderHistorySection();
    else bodyHtml = renderSettingsSection();

    root.innerHTML = `
      <div class="app-shell">
        <div class="bg-backdrop" aria-hidden="true">
          <div class="blob blob-1"></div>
          <div class="blob blob-2"></div>
          <div class="blob blob-3"></div>
        </div>
        ${renderSidebar()}
        <main class="main-content">
          ${bodyHtml}
          <footer class="app-footer">
            <span>IndiaVisa Track · Queries routed to Indian Visa Online &amp; Passtrack</span>
            <div class="flex-row" style="gap:14px">
              <a href="https://indianvisaonline.gov.in/visa/StatusEnquiry" target="_blank" rel="noopener noreferrer" style="font-weight:600">indianvisaonline.gov.in</a>
              <span aria-hidden="true">·</span>
              <a href="https://www.passtrack.net/regular_passport.php" target="_blank" rel="noopener noreferrer" style="font-weight:600">passtrack.net</a>
            </div>
          </footer>
        </main>
        ${renderBottomNav()}
      </div>
    `;
  }

  // Event delegation (keeps inputs smooth & clean)
  document.addEventListener("input", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (target.id === "applicationIdInput") {
      const cleaned = target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
      if (target.value !== cleaned) target.value = cleaned;
      state.applicationId = cleaned;
      state.validationError = null;
      const counter = document.getElementById("appIdCounter");
      if (counter) counter.textContent = `${cleaned.length}/12`;
      const hint = document.getElementById("appIdHint");
      if (hint) {
        const center = resolveIvacCenter(cleaned);
        hint.innerHTML = center
          ? `${esc(center.name)} · Prefix <strong class="font-mono" style="color:var(--tx-info)">${esc(center.prefix)}</strong>`
          : "12-character Web File ID from your IVAC receipt";
      }
    } else if (target.id === "passportNoInput") {
      const cleaned = target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 14);
      if (target.value !== cleaned) target.value = cleaned;
      state.passportNo = cleaned;
      state.validationError = null;
      const counter = document.getElementById("passportCounter");
      if (counter) counter.textContent = `${cleaned.length}/9+`;
    } else if (target.id === "historySearchInput") {
      state.historySearch = target.value;
      const container = document.getElementById("historyGridContainer");
      if (container) container.innerHTML = renderHistoryCards();
    } else if (target.id === "apiUrlInput") {
      state.apiInput = target.value;
      state.apiFeedback = null;
    } else if (target.id === "assistApplicantInput") {
      state.assistApplicantName = target.value.toUpperCase();
    } else if (target.id === "submissionDatePicker") {
      state.submissionDate = target.value;
      render();
    }
  });

  document.addEventListener("change", async (e) => {
    const target = e.target;
    if (target instanceof HTMLSelectElement && target.id === "assistPasstrackSelect") {
      state.assistPasstrackStage = Number(target.value) || 0;
      return;
    }
    if (!(target instanceof HTMLInputElement)) return;
    if (target.id !== "receiptFileInput") return;
    const file = target.files && target.files[0];
    if (!file) return;

    state.scanningReceipt = true;
    state.scanNotice = null;
    state.validationError = null;
    render();

    try {
      // 1. Try 100% free browser-native QR/Barcode detection first (works offline on Chrome/Android)
      if ("BarcodeDetector" in window) {
        try {
          const bitmap = await createImageBitmap(file);
          const detector = new window.BarcodeDetector({ formats: ["qr_code", "code_128", "code_39", "pdf417"] });
          const codes = await detector.detect(bitmap);
          bitmap.close?.();
          for (const code of codes) {
            const raw = String(code.rawValue || "").toUpperCase();
            const appMatch = raw.match(/\b(BGD[A-Z0-9]{9})\b/);
            if (appMatch) {
              state.applicationId = appMatch[1];
              state.scanNotice = "Application ID extracted via free offline barcode scan. Verify Passport Number and check status.";
              state.scanningReceipt = false;
              render();
              return;
            }
          }
        } catch {
          // continue to backend scan if available
        }
      }

      const isLive = await ensureBackendStatus();
      if (!isLive && !getEffectiveApiBase()) {
        state.scanNotice = "Enter your 12-character Application ID and Passport Number directly above — works 100% free with zero setup.";
        state.scanningReceipt = false;
        render();
        return;
      }

      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read selected image."));
        reader.readAsDataURL(file);
      });
      const resp = await fetch(apiUrl("/api/scan-receipt"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl, mimeType: file.type || "image/jpeg" }),
      });
      const json = await resp.json().catch(() => null);
      if (!resp.ok || !json) {
        if (resp.status === 404 || resp.status === 405 || !json) {
          state.scanNotice = "Enter your 12-character Application ID and Passport Number directly above — works 100% free.";
        } else {
          state.scanNotice = json.error || "Could not extract details from receipt.";
        }
      } else {
        let found = false;
        if (json.application_id) {
          state.applicationId = String(json.application_id).slice(0, 12);
          found = true;
        }
        if (json.passport_no) {
          state.passportNo = String(json.passport_no).slice(0, 14);
          found = true;
        }
        state.scanNotice = found
          ? "Credentials extracted from receipt. Verify and click Check Status."
          : "No Application ID or Passport Number detected in this image.";
      }
    } catch (err) {
      state.scanNotice = err instanceof Error ? err.message : "Failed to scan receipt.";
    } finally {
      state.scanningReceipt = false;
      render();
    }
  });

  document.addEventListener("submit", async (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (form.id === "enquiryForm") {
      e.preventDefault();
      const appId = state.applicationId.trim().toUpperCase();
      const passNo = state.passportNo.trim().toUpperCase();

      if (appId.length !== 12 || !/^[A-Z0-9]{12}$/.test(appId)) {
        state.validationError = "Application ID must be exactly 12 alphanumeric characters (e.g., BGDD12345678).";
        render();
        return;
      }
      if (passNo.length < 7 || passNo.length > 14 || !/^[A-Z0-9]+$/.test(passNo)) {
        state.validationError = "Passport Number must be 7 to 14 alphanumeric characters (e.g., A01234567).";
        render();
        return;
      }
      state.validationError = null;
      runLiveCheck({ appId, passNo });
    } else if (form.id === "staticAssistForm") {
      e.preventDefault();
      buildAssistResult();
    } else if (form.id === "manualCaptchaForm" && state.captchaPrompt) {
      e.preventDefault();
      const visaInput = document.getElementById("visaCaptchaInput");
      const ptInput = document.getElementById("ptCaptchaInput");
      const activeVisa = state.visaCaptchaOverride || state.captchaPrompt.captchas.visa;
      const activePt = state.ptCaptchaOverride || state.captchaPrompt.captchas.passtrack;
      runLiveCheck({
        appId: state.captchaPrompt.application_id,
        passNo: state.captchaPrompt.passport_no,
        visaCaptcha: activeVisa && visaInput ? visaInput.value.trim() : undefined,
        visaSessionId: activeVisa ? activeVisa.sessionId : undefined,
        passtrackCaptcha: activePt && ptInput ? ptInput.value.trim() : undefined,
        passtrackSessionId: activePt ? activePt.sessionId : undefined,
        cachedVisaResult: state.captchaPrompt.partial.visa_portal,
        cachedPasstrackResult: state.captchaPrompt.partial.passtrack,
        isResume: true,
      });
    } else if (form.id === "apiSettingsForm") {
      e.preventDefault();
      const normalized = normalizeBaseUrl(state.apiInput);
      try {
        if (normalized) localStorage.setItem(API_BASE_KEY, normalized);
        else localStorage.removeItem(API_BASE_KEY);
      } catch {
        // ignore
      }
      state.apiInput = normalized;
      state.testingApi = true;
      state.apiFeedback = null;
      render();

      try {
        const resp = await fetch(apiUrl("/api/portal-health"));
        const json = await resp.json().catch(() => null);
        if (resp.ok && json && Array.isArray(json.portals)) {
          state.backendStatus = "live";
          const kind = json.workerRelay ? "Free Cloudflare Worker" : "Node/Express Server";
          state.apiFeedback = {
            ok: true,
            text: normalized ? `Connected to ${kind} at ${normalized}` : `Connected to ${kind} (same-origin).`,
          };
        } else {
          state.backendStatus = "static";
          state.apiFeedback = {
            ok: false,
            text: `Endpoint responded with HTTP ${resp.status}. Deploy cloudflare-worker.js or server.ts at that URL.`,
          };
        }
      } catch {
        state.backendStatus = "static";
        state.apiFeedback = {
          ok: false,
          text: "Could not reach backend endpoint. Verify the URL and CORS configuration.",
        };
      } finally {
        state.testingApi = false;
        render();
      }
    }
  });

  document.addEventListener("click", async (e) => {
    const btn = e.target instanceof Element ? e.target.closest("[data-action]") : null;
    if (!btn) return;
    const action = btn.getAttribute("data-action");

    if (action === "nav") {
      e.preventDefault();
      const sec = btn.getAttribute("data-section");
      if (sec) {
        state.activeSection = sec;
        render();
      }
    } else if (action === "set-lang") {
      setLang(btn.getAttribute("data-lang"));
    } else if (action === "set-theme") {
      applyTheme(btn.getAttribute("data-theme"), { x: e.clientX, y: e.clientY });
    } else if (action === "toggle-mask-app") {
      state.maskAppId = !state.maskAppId;
      render();
    } else if (action === "toggle-mask-pass") {
      state.maskPassport = !state.maskPassport;
      render();
    } else if (action === "toggle-mask-name") {
      state.maskName = !state.maskName;
      render();
    } else if (action === "trigger-scan") {
      const input = document.getElementById("receiptFileInput");
      if (input) input.click();
    } else if (action === "cancel-pipeline") {
      if (abortController) abortController.abort();
      state.isRunning = false;
      state.showPipeline = false;
      state.captchaPrompt = null;
      render();
    } else if (action === "close-assist") {
      state.staticAssist = null;
      render();
    } else if (action === "set-assist-cat") {
      state.assistCategory = btn.getAttribute("data-cat") || "processed_printed";
      render();
    } else if (action === "copy-text") {
      const field = btn.getAttribute("data-field");
      const val = btn.getAttribute("data-value") || "";
      if (val && navigator.clipboard) {
        navigator.clipboard.writeText(val).catch(() => {});
      }
      state.copiedField = field;
      render();
      setTimeout(() => {
        if (state.copiedField === field) {
          state.copiedField = null;
          render();
        }
      }, 1500);
    } else if (action === "toggle-worker-guide") {
      state.showWorkerGuide = !state.showWorkerGuide;
      state.workerCopyNotice = null;
      render();
    } else if (action === "copy-worker-code") {
      try {
        const res = await fetch("./cloudflare-worker.js");
        const code = await res.text();
        await navigator.clipboard.writeText(code);
        state.workerCopyNotice = "Copied!";
      } catch {
        state.workerCopyNotice = "Open /cloudflare-worker.js";
      }
      render();
      setTimeout(() => {
        state.workerCopyNotice = null;
        render();
      }, 2200);
    } else if (action === "refresh-captcha") {
      const portal = btn.getAttribute("data-portal");
      try {
        const resp = await fetch(apiUrl("/api/refresh-captcha"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portal }),
        });
        const json = await resp.json().catch(() => null);
        if (resp.ok && json && json.sessionId && json.imageDataUrl) {
          if (portal === "indianvisa") state.visaCaptchaOverride = json;
          else state.ptCaptchaOverride = json;
          render();
        }
      } catch {
        // ignore transient refresh failure
      }
    } else if (action === "set-autowatch") {
      state.autoRefreshMin = Number(btn.getAttribute("data-min")) || 0;
      resetAutoWatchTimer();
      render();
    } else if (action === "refresh-now" && state.result) {
      runLiveCheck({ appId: state.result.application_id, passNo: state.result.passport_no });
    } else if (action === "download-png") {
      downloadStatusCardPng();
    } else if (action === "recheck-recent") {
      const appId = btn.getAttribute("data-app") || "";
      const passNo = btn.getAttribute("data-pass") || "";
      if (appId && passNo) {
        state.applicationId = appId;
        state.passportNo = passNo;
        runLiveCheck({ appId, passNo });
      }
    } else if (action === "delete-history") {
      const id = btn.getAttribute("data-id");
      saveHistory(state.history.filter((h) => h.id !== id));
      render();
    } else if (action === "clear-history") {
      saveHistory([]);
      render();
    } else if (action === "reset-api") {
      try {
        localStorage.removeItem(API_BASE_KEY);
      } catch {
        // ignore
      }
      const envUrl = getEnvApiBase();
      state.apiInput = envUrl;
      state.apiFeedback = {
        ok: true,
        text: envUrl ? `Reset to build default (${envUrl}).` : "Reset to same-origin default (/api/*).",
      };
      probeBackendHealth(true).then(() => render());
    }
  });

  // Boot
  applyTheme(state.theme);
  document.documentElement.lang = state.lang;
  probeBackendHealth(true).then(() => {
    if (state.activeSection === "appearance") render();
  });
})();
