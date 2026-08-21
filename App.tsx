import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, TextInput, FlatList, Dimensions, Modal, Image, BackHandler,
} from 'react-native';
import { STATIONS, searchStations } from './src/data/stations';
import { LINES, LINE_ORDER, getFareByStations } from './src/data/lines';

const { width, height } = Dimensions.get('window');
const MY_PHOTO = require('./src/assets/photo.jpg');

// ─── COLORS ──────────────────────────────────────────────────
const PRIMARY      = '#0D47A1';
const PRIMARY_DARK = '#082c6b';
const ACCENT       = '#C62828';
const WHITE        = '#FFFFFF';
const BG           = '#F0F4F8';
const TEXT         = '#1A1A2E';
const TEXT2        = '#4A5568';
const MUTED        = '#9CA3AF';
const GOLD         = '#F59E0B';
const GREEN        = '#15803D';


// ─── LOOKUP TABLES ───────────────────────────────────────────
const stationMap: Record<string, any> = {};
STATIONS.forEach(s => { stationMap[s.id] = s; });
const LM = LINES as Record<string, any>;

// ─── TOURIST SPOTS ───────────────────────────────────────────
const TOURIST_SPOTS = [
  { name: 'Red Fort (Lal Qila)',    cat: '🏛️ Heritage',          metro: 'Chandni Chowk',      line: 'yellow', walk: '10 min walk', desc: 'UNESCO World Heritage Site — iconic Mughal fort, Light & Sound show in evenings' },
  { name: 'India Gate',             cat: '🏛️ Heritage',          metro: 'Central Secretariat', line: 'violet', walk: '15 min walk', desc: 'National war memorial — best visited in the evening when lit up' },
  { name: 'Qutub Minar',           cat: '🏛️ Heritage',          metro: 'Qutab Minar',         line: 'yellow', walk: '15 min walk', desc: 'UNESCO site — world\'s tallest brick minaret (72.5 m), built in 1193' },
  { name: 'Lotus Temple',           cat: '⛪ Religious',          metro: 'Kalkaji Mandir',      line: 'violet', walk: '10 min walk', desc: 'Baháʼí House of Worship — stunning lotus-shaped architecture, free entry' },
  { name: 'Humayun\'s Tomb',        cat: '🏛️ Heritage',          metro: 'JLN Stadium',         line: 'violet', walk: '15 min walk', desc: 'UNESCO site — inspiration for Taj Mahal, beautiful Mughal gardens' },
  { name: 'Akshardham Temple',      cat: '⛪ Religious',          metro: 'Akshardham',          line: 'blue',   walk: '5 min walk',  desc: 'Magnificent Hindu temple — musical fountain show, boat ride, exhibition halls' },
  { name: 'Chandni Chowk',         cat: '🛍️ Shopping',          metro: 'Chandni Chowk',       line: 'yellow', walk: '2 min walk',  desc: 'Historic market — best street food, spices, textiles, wedding shopping' },
  { name: 'Connaught Place',        cat: '🛍️ Shopping',          metro: 'Rajiv Chowk',         line: 'yellow', walk: '2 min walk',  desc: 'Heart of Delhi — premium shopping, cafes, restaurants, Palika Bazaar' },
  { name: 'Jantar Mantar',          cat: '🏛️ Heritage',          metro: 'Patel Chowk',         line: 'yellow', walk: '10 min walk', desc: '18th-century astronomical observatory built by Maharaja Jai Singh II' },
  { name: 'National Museum',        cat: '🎨 Museum',             metro: 'Udyog Bhawan',        line: 'yellow', walk: '10 min walk', desc: 'India\'s premier museum — 5000 years of history, artefacts from Harappan era' },
  { name: 'IGI Airport T3',         cat: '✈️ Airport',           metro: 'IGI Airport',         line: 'orange', walk: '5 min walk',  desc: 'Terminal 3 — direct metro via Airport Express Line (₹60 from New Delhi)' },
  { name: 'Hauz Khas Village',      cat: '🍽️ Food & Culture',    metro: 'Hauz Khas',           line: 'yellow', walk: '20 min walk', desc: 'Trendy cafes, art galleries, bars & medieval ruins with deer park nearby' },
  { name: 'Dilli Haat (INA)',       cat: '🛍️ Shopping',          metro: 'INA',                 line: 'yellow', walk: '5 min walk',  desc: 'Handicraft bazaar — authentic crafts from all Indian states, food court' },
  { name: 'Lodi Garden',            cat: '🌿 Park',               metro: 'JLN Stadium',         line: 'violet', walk: '20 min walk', desc: 'Beautiful garden — 15th-century tombs amid manicured lawns, morning walks' },
  { name: 'ISKCON Temple',          cat: '⛪ Religious',          metro: 'Nehru Place',         line: 'violet', walk: '15 min walk', desc: 'Beautiful Krishna temple — free vegetarian prasad, evening aarti at 7 PM' },
  { name: 'Raj Ghat',               cat: '🏛️ Heritage',          metro: 'Lal Qila',            line: 'yellow', walk: '10 min walk', desc: 'Memorial to Mahatma Gandhi — peaceful, serene black marble platform' },
  { name: 'Delhi Zoo',              cat: '🐘 Zoo',                metro: 'Pragati Maidan',      line: 'blue',   walk: '10 min walk', desc: '1300+ animals & 130+ bird species — best visited Oct–March, closed Fri' },
  { name: 'Sarojini Nagar Market',  cat: '🛍️ Shopping',          metro: 'Sarojini Nagar',      line: 'pink',   walk: '2 min walk',  desc: 'Best budget fashion market — export surplus clothes, bargain shopping' },
  { name: 'Karol Bagh Market',      cat: '🛍️ Shopping',          metro: 'Karol Bagh',          line: 'blue',   walk: '5 min walk',  desc: 'Electronics, jewellery, branded clothing, Ajmal Khan Road market' },
  { name: 'Pragati Maidan (ITPO)',  cat: '🎨 Museum',             metro: 'Pragati Maidan',      line: 'blue',   walk: '5 min walk',  desc: 'National trade fair venue — regular exhibitions, India International Trade Fair' },
];

// ─── STATION FACILITIES ───────────────────────────────────────
const STATION_FACILITIES: Record<string, string[]> = {
  RJ:   ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '📶 WiFi', '🚌 Feeder Bus', '🚕 Auto/Taxi Stand'],
  RJC:  ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '📶 WiFi', '🚌 Feeder Bus', '🚕 Auto/Taxi Stand'],
  KG:   ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '📶 WiFi', '🚕 Auto/Taxi Stand'],
  KGV:  ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '📶 WiFi', '🚕 Auto/Taxi Stand'],
  ND:   ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '📶 WiFi', '🚌 Feeder Bus', '🚕 Auto/Taxi Stand'],
  ND2:  ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '📶 WiFi', '🚌 Feeder Bus'],
  IGI:  ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '📶 WiFi', '✈️ Airport Access', '🛄 Luggage Trolley'],
  AIIMS:['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '🏥 Hospital Nearby'],
  AIM2: ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '🏥 Hospital Nearby'],
  HK2:  ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '🚕 Auto/Taxi Stand'],
  HK4:  ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '🚕 Auto/Taxi Stand'],
  BTG:  ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '🌿 Park Nearby'],
  JW:   ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '🚌 Feeder Bus'],
  CS:   ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '📶 WiFi'],
  CS2:  ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '📶 WiFi'],
  SS2:  ['🏧 ATM', '🛗 Lift', '♿ Wheelchair', '🚻 Toilet', '📶 WiFi', '🚕 Auto/Taxi Stand'],
};
const getStationFacilities = (s: any): string[] =>
  STATION_FACILITIES[s.id] ||
  (s.underground
    ? ['🛗 Lift', '♿ Wheelchair Access', '🚻 Toilet', '🏧 ATM']
    : ['🛗 Lift', '♿ Wheelchair Access', '🏧 ATM']);

// ─── METRO TIPS ───────────────────────────────────────────────
const TRAVEL_TIPS = [
  {
    section: '🎫 Ticketing & Cards',
    tips: [
      'Buy a Smart Card (₹100 refundable deposit + ₹50 balance) for 10% discount on all trips.',
      'Tokens cost ₹10–₹60 based on distance. Purchase at counters or Ticket Vending Machines.',
      'Airport Express Line has separate tickets — flat ₹60 from New Delhi to T3 Airport.',
      'Tourist Card: 1-Day ₹200 or 3-Day ₹500 — unlimited travel on all lines (except Airport Express).',
      'Recharge your Smart Card at station counters, TVMs, or the official DMRC app.',
    ],
  },
  {
    section: '🚇 In the Metro',
    tips: [
      'First and last coaches are reserved ONLY for women. Men must not board these coaches.',
      'Priority seats (marked yellow/yellow stripe) must be vacated for elderly, disabled & pregnant passengers.',
      'No eating, drinking, or smoking inside metro coaches or on platforms.',
      'Keep music low — headphones recommended. Loud audio is not allowed.',
      'Stand behind the yellow safety line until the metro has fully stopped.',
    ],
  },
  {
    section: '🔐 Security & Rules',
    tips: [
      'All passengers must pass through security screening and bag X-ray at every station.',
      'Prohibited items: firearms, flammables, sharp weapons, liquids over 500 ml.',
      'Carry valid photo ID — may be required on demand by CISF security.',
      'Do not put feet on seats. Penalty applies for violation of metro rules.',
      'Report suspicious objects or persons to station staff or CISF immediately.',
    ],
  },
  {
    section: '⏰ Timings & Frequency',
    tips: [
      'All lines run approx 6:00 AM – 11:00 PM (Airport Express: 4:45 AM – 11:45 PM).',
      'Peak hours: 8–10 AM and 5–8 PM. Metro runs every 3–5 minutes.',
      'Off-peak hours: metro every 7–12 minutes depending on the line.',
      'Last entry at stations is typically 15 minutes before closing time.',
      'Metro runs every day including Sundays and public holidays.',
    ],
  },
  {
    section: '♿ Accessibility',
    tips: [
      'All metro stations have lifts for wheelchair users and passengers with mobility issues.',
      'Separate queues for women and senior citizens at security checks.',
      'Guide paths are available for visually impaired passengers.',
      'Wheelchair-friendly ramps available at all entry/exit gates.',
      'Free travel for Divyangjan (disabled persons) — contact station master for details.',
    ],
  },
  {
    section: '📞 Helpline Numbers',
    tips: [
      'DMRC Customer Care: 155370 (available 24x7)',
      'Lost & Found: 011-2341-1541',
      'Senior Citizen / Disability Helpdesk: 1800-11-2553 (toll-free)',
      'Emergency / Police: 112 | Ambulance: 108',
      'CISF Metro Security Control: 011-2374-8545',
    ],
  },
];

// ─── LINE TIMINGS ─────────────────────────────────────────────
const LINE_TIMINGS: Record<string, { first: string; last: string; peak: string; off: string }> = {
  yellow:  { first: '6:00 AM', last: '11:00 PM', peak: '3–4 min', off: '6–8 min' },
  blue:    { first: '5:30 AM', last: '11:00 PM', peak: '3–4 min', off: '6–8 min' },
  red:     { first: '6:00 AM', last: '11:00 PM', peak: '4–5 min', off: '8–10 min' },
  green:   { first: '6:00 AM', last: '10:30 PM', peak: '5–6 min', off: '10–12 min' },
  violet:  { first: '6:00 AM', last: '11:00 PM', peak: '4–5 min', off: '7–10 min' },
  pink:    { first: '5:55 AM', last: '11:00 PM', peak: '5–6 min', off: '9–10 min' },
  magenta: { first: '6:00 AM', last: '10:30 PM', peak: '5–7 min', off: '10–12 min' },
  grey:    { first: '6:05 AM', last: '10:00 PM', peak: '10 min',  off: '15 min' },
  orange:  { first: '4:45 AM', last: '11:45 PM', peak: '10–15 min', off: '15–20 min' },
};

// ─── HOME TILES ───────────────────────────────────────────────
const HOME_TILES = [
  { key: 'route',    icon: '🧭', label: 'Route Finder',  bg: '#EEF2FF', border: '#4F46E5' },
  { key: 'fare',     icon: '₹',  label: 'Fare & Ticket', bg: '#FFFBEB', border: '#D97706' },
  { key: 'map',      icon: '🗺️', label: 'Metro Map',     bg: '#ECFDF5', border: '#059669' },
  { key: 'stations', icon: '📋', label: 'All Stations',  bg: '#E0F7FA', border: '#0097A7' },
  { key: 'first',    icon: '🕐', label: 'Metro Timings', bg: '#F3E8FF', border: '#7C3AED' },
  { key: 'tourist',  icon: '🏛️', label: 'Tourist Guide', bg: '#FFF7ED', border: '#EA580C' },
  { key: 'upcoming', icon: '🚧', label: 'Phase 4 Metro', bg: '#FDF2F8', border: '#DB2777' },
  { key: 'tips',     icon: '📌', label: 'Tips & Rules',  bg: '#F0FDF4', border: '#16A34A' },
  { key: 'about',    icon: 'ℹ️', label: 'About App',    bg: '#F8FAFC', border: '#64748B' },
];

// ─── BFS GRAPH ────────────────────────────────────────────────
const buildAdj = () => {
  const adj: Record<string, { id: string; line: string }[]> = {};
  STATIONS.forEach(s => { adj[s.id] = []; });
  const addEdge = (a: string, b: string, lk: string) => {
    if (!adj[a] || !adj[b]) return;
    adj[a].push({ id: b, line: lk });
    adj[b].push({ id: a, line: lk });
  };
  LINE_ORDER.forEach(lk => {
    const line: any = LM[lk];
    if (!line) return;
    for (let i = 0; i + 1 < line.stations.length; i++)
      addEdge(line.stations[i], line.stations[i + 1], lk);
    if (line.branches) {
      const bp: string = line.stations[line.stations.length - 1];
      (line.branches as string[][]).forEach(branch => {
        addEdge(bp, branch[0], lk);
        for (let i = 0; i + 1 < branch.length; i++)
          addEdge(branch[i], branch[i + 1], lk);
      });
    }
  });
  const nameIdx: Record<string, string[]> = {};
  STATIONS.forEach(s => {
    const k = s.name.toLowerCase().trim();
    if (!nameIdx[k]) nameIdx[k] = [];
    nameIdx[k].push(s.id);
  });
  Object.values(nameIdx).forEach(ids => {
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++)
        addEdge(ids[i], ids[j], 'interchange');
  });
  return adj;
};
const ADJ = buildAdj();

const findRoute = (fromId: string, toId: string) => {
  if (fromId === toId) return null;
  const visited = new Set([fromId]);
  const queue: [string, { id: string; line: string | null }[]][] = [
    [fromId, [{ id: fromId, line: null }]],
  ];
  while (queue.length) {
    const [cur, path] = queue.shift()!;
    if (cur === toId) return path;
    for (const nb of ADJ[cur] || []) {
      if (!visited.has(nb.id)) {
        visited.add(nb.id);
        queue.push([nb.id, [...path, nb]]);
      }
    }
  }
  return null;
};

const getDirection = (lk: string, fromId: string, toId: string): string => {
  const line = LM[lk];
  if (!line) return '';
  const arr = line.stations as string[];
  const fi = arr.indexOf(fromId), ti = arr.indexOf(toId);
  if (fi !== -1 && ti !== -1) return fi < ti ? `Towards ${line.to}` : `Towards ${line.from}`;
  if (line.branches) {
    for (const br of line.branches as string[][]) {
      const bfi = br.indexOf(fromId), bti = br.indexOf(toId);
      if (bfi !== -1 && bti !== -1) return bfi < bti ? `Towards ${line.to}` : `Towards ${line.from}`;
    }
    if (arr.indexOf(fromId) !== -1) return `Towards ${line.to}`;
  }
  return `Towards ${line.to}`;
};

// ─── METRO LOGO ───────────────────────────────────────────────
// Red outer ring → white inner circle → bold red "M"
// "DELHI" / "METRO" text sits on the red ring in white — always readable
function MetroLogo({ size = 200 }: { size?: number }) {
  const S = size;
  const innerD = S * 0.68;   // white circle diameter (leaves 16% red ring each side)
  const showText = S >= 90;  // hide labels on very small badges
  return (
    <View style={{ width: S, height: S, borderRadius: S / 2, backgroundColor: ACCENT,
                   alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* thin white separator ring */}
      <View style={{ position: 'absolute', width: S * 0.80, height: S * 0.80,
                     borderRadius: S * 0.40, borderWidth: Math.max(1.5, S * 0.018),
                     borderColor: 'rgba(255,255,255,0.55)', backgroundColor: 'transparent' }} />
      {/* white inner circle with bold red M */}
      <View style={{ width: innerD, height: innerD, borderRadius: innerD / 2,
                     backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: ACCENT, fontSize: S * 0.38, fontWeight: '900',
                       lineHeight: S * 0.44, marginTop: -S * 0.02 }}>M</Text>
      </View>
      {/* DELHI — white text on red ring, top */}
      {showText && (
        <Text style={{ position: 'absolute', top: S * 0.048, color: WHITE,
                       fontSize: S * 0.12, fontWeight: '900', letterSpacing: S * 0.008 }}>
          DELHI
        </Text>
      )}
      {/* METRO — white text on red ring, bottom */}
      {showText && (
        <Text style={{ position: 'absolute', bottom: S * 0.048, color: WHITE,
                       fontSize: S * 0.09, fontWeight: '800', letterSpacing: S * 0.012 }}>
          METRO
        </Text>
      )}
    </View>
  );
}

// ─── SPLASH SCREEN ────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, []);
  return (
    <View style={spl.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <View style={spl.badge}><Text style={spl.badgeTxt}>v1.5</Text></View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <MetroLogo size={240} />
        <Text style={spl.appName}>Metro Saathi</Text>
        <Text style={spl.appSub}>Aapka offline metro companion</Text>
      </View>
      <View style={spl.footer}>
        <View style={spl.divider} />
        <Text style={spl.byTxt}>DEVELOPED BY</Text>
        <View style={spl.devRow}>
          <Image source={MY_PHOTO} style={spl.photo} />
          <Text style={spl.devName}>Mukesh Kumar</Text>
          <Text style={spl.devSub}>Metro Saathi App</Text>
        </View>
      </View>
    </View>
  );
}
const spl = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  badge:     { position: 'absolute', top: 16, left: 16, backgroundColor: PRIMARY, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, zIndex: 10 },
  badgeTxt:  { color: WHITE, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  appName:   { fontSize: 24, fontWeight: '900', color: TEXT, marginTop: 20, letterSpacing: 0.3 },
  appSub:    { fontSize: 13, color: TEXT2, marginTop: 6 },
  footer:    { paddingHorizontal: 24, paddingBottom: 30 },
  divider:   { height: 1, backgroundColor: '#E2E8F0', marginBottom: 20 },
  byTxt:     { fontSize: 10, color: MUTED, letterSpacing: 2, marginBottom: 16, fontWeight: '600', textAlign: 'center' },
  devRow:    { alignItems: 'center' },
  photo:     { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: PRIMARY, marginBottom: 12 },
  devName:   { fontSize: 20, fontWeight: '800', color: TEXT, textAlign: 'center' },
  devSub:    { fontSize: 12, color: TEXT2, marginTop: 4, textAlign: 'center' },
});

// ─── HOME SCREEN ──────────────────────────────────────────────
function HomeScreen({ onNav }: { onNav: (s: string) => void }) {
  const [clock, setClock] = useState('');
  const [metroOpen, setMetroOpen] = useState(true);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      setClock(`${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`);
      const dec = h + m / 60;
      setMetroOpen(dec >= 5.5 && dec <= 23.5);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const GAP = 10;
  const tileW = Math.floor((width - GAP * 4) / 3);
  const rows: (typeof HOME_TILES)[] = [];
  for (let i = 0; i < HOME_TILES.length; i += 3) rows.push(HOME_TILES.slice(i, i + 3));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: BG }} showsVerticalScrollIndicator={false}>
      {/* Hero banner */}
      <View style={hm.hero}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={[hm.statusDot, { backgroundColor: metroOpen ? '#4ADE80' : '#F87171' }]} />
            <Text style={hm.statusTxt}>{metroOpen ? 'Metro is Running' : 'Metro Closed'}</Text>
          </View>
          <Text style={hm.clock}>{clock}</Text>
          <Text style={hm.heroSub}>5:30 AM – 11:30 PM  ·  9 Lines  ·  268+ Stations</Text>
        </View>
        <MetroLogo size={100} />
      </View>

      {/* 3 Quick-action rows in hero area */}
      <View style={{ backgroundColor: PRIMARY_DARK, paddingHorizontal: 14, paddingBottom: 14 }}>
        {([
          { icon: '🧭', label: 'Find Best Route',  desc: 'Station-to-station directions',        key: 'route'    },
          { icon: '🚉', label: 'All Stations',      desc: '268+ stations with details & search',  key: 'stations' },
          { icon: '💰', label: 'Fare & Tickets',    desc: 'Token, Smart Card & Airport prices',   key: 'fare'     },
        ] as { icon: string; label: string; desc: string; key: string }[]).map((item) => (
          <TouchableOpacity key={item.key} onPress={() => onNav(item.key)} activeOpacity={0.75}
            style={{ flexDirection: 'row', alignItems: 'center',
                     backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 12,
                     paddingHorizontal: 14, paddingVertical: 11, marginBottom: 8,
                     borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
            <Text style={{ fontSize: 22, marginRight: 12 }}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: WHITE, fontWeight: '800', fontSize: 14 }}>{item.label}</Text>
              <Text style={{ color: '#93C5FD', fontSize: 11, marginTop: 1 }}>{item.desc}</Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Info chips — clickable */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={hm.chips}>
        {([
          { icon: '🎫', txt: 'Token ₹10–₹60',            nav: 'fare'  },
          { icon: '💳', txt: 'Smart Card: 10% OFF',       nav: 'fare'  },
          { icon: '✈️', txt: 'Airport Express: ₹60',      nav: 'fare'  },
          { icon: '👩', txt: '1st & Last Coach: Women',   nav: 'tips'  },
          { icon: '📶', txt: 'Free WiFi at stations',     nav: 'about' },
          { icon: '♿', txt: 'All stations accessible',   nav: 'tips'  },
          { icon: '🏧', txt: 'ATM at every station',      nav: 'about' },
        ] as { icon: string; txt: string; nav: string }[]).map((c, i) => (
          <TouchableOpacity key={i} style={hm.chip} onPress={() => onNav(c.nav)} activeOpacity={0.7}>
            <Text style={{ fontSize: 13 }}>{c.icon}</Text>
            <Text style={hm.chipTxt}>{c.txt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <View style={{ paddingHorizontal: GAP, paddingTop: 10, paddingBottom: GAP }}>
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', marginBottom: GAP }}>
            {row.map((tile, ti) => (
              <TouchableOpacity
                key={tile.key}
                style={[hm.tile, { width: tileW, height: tileW + 16, backgroundColor: tile.bg, marginLeft: ti === 0 ? 0 : GAP, borderBottomWidth: 3, borderBottomColor: tile.border }]}
                onPress={() => onNav(tile.key)}
                activeOpacity={0.75}>
                <Text style={hm.tileIcon}>{tile.icon}</Text>
                <Text style={hm.tileLabel}>{tile.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const hm = StyleSheet.create({
  hero:      { backgroundColor: PRIMARY_DARK, padding: 18, flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusTxt: { color: '#CBD5E1', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  clock:     { color: GOLD, fontSize: 22, fontWeight: '900' },
  heroSub:   { color: '#93C5FD', fontSize: 10, marginTop: 6 },
  chips:     { backgroundColor: WHITE, paddingVertical: 10, paddingLeft: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  chip:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 },
  chipTxt:   { fontSize: 11, color: TEXT2, fontWeight: '600' },
  tile:      { alignItems: 'center', justifyContent: 'center', borderRadius: 14, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  tileIcon:  { fontSize: 32, marginBottom: 8 },
  tileLabel: { fontSize: 10, fontWeight: '700', color: TEXT, textAlign: 'center', paddingHorizontal: 4 },
});

// ─── FARE SCREEN ──────────────────────────────────────────────
const FARE_ROWS = [
  ['0 – 2 km', '₹10', '₹9'],
  ['2 – 5 km', '₹20', '₹18'],
  ['5 – 12 km', '₹30', '₹27'],
  ['12 – 21 km', '₹40', '₹36'],
  ['21 – 32 km', '₹50', '₹45'],
  ['Above 32 km', '₹60', '₹54'],
];
function FareScreen() {
  const [tab, setTab] = useState(0);
  const TABS = ['Fare Table', 'Airport Express', 'Tourist Card'];
  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ flexDirection: 'row', backgroundColor: WHITE, padding: 8, gap: 6, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={i} onPress={() => setTab(i)}
            style={{ flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: tab === i ? PRIMARY : '#F1F5F9', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: tab === i ? WHITE : TEXT2 }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {tab === 0 && (
          <View style={{ padding: 12 }}>
            <View style={{ flexDirection: 'row', backgroundColor: PRIMARY, borderRadius: 12, padding: 13, marginBottom: 6 }}>
              <Text style={{ flex: 2, color: WHITE, fontWeight: '800', fontSize: 13 }}>Distance Slab</Text>
              <Text style={{ flex: 1, color: WHITE, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>Token</Text>
              <Text style={{ flex: 1, color: GOLD, fontWeight: '800', fontSize: 13, textAlign: 'center' }}>Smart Card</Text>
            </View>
            {FARE_ROWS.map(([dist, token, smart], i) => (
              <View key={i} style={{ flexDirection: 'row', backgroundColor: i % 2 === 0 ? WHITE : '#F8FAFC', borderRadius: 10, padding: 14, marginBottom: 4, alignItems: 'center', elevation: 1 }}>
                <Text style={{ flex: 2, fontSize: 13, color: TEXT }}>{dist}</Text>
                <Text style={{ flex: 1, fontSize: 17, fontWeight: '800', color: TEXT, textAlign: 'center' }}>{token}</Text>
                <Text style={{ flex: 1, fontSize: 17, fontWeight: '800', color: GREEN, textAlign: 'center' }}>{smart}</Text>
              </View>
            ))}
            <View style={{ backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, marginTop: 10, borderLeftWidth: 4, borderLeftColor: GOLD }}>
              <Text style={{ color: '#92400E', fontSize: 14, fontWeight: '800', marginBottom: 6 }}>💳 Smart Card Benefits</Text>
              <Text style={{ color: '#78350F', fontSize: 13, lineHeight: 22 }}>
                {'• 10% discount on all regular metro fares\n• Skip ticket counter queues\n• Reloadable — recharge anytime\n• Refundable ₹100 security deposit\n• Works on all 9 metro lines'}
              </Text>
            </View>
          </View>
        )}
        {tab === 1 && (
          <View style={{ padding: 12 }}>
            <View style={{ backgroundColor: '#FFF7ED', borderRadius: 14, padding: 16, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: '#EA580C' }}>
              <Text style={{ fontSize: 17, fontWeight: '900', color: '#9A3412', marginBottom: 6 }}>✈️ Airport Express Line</Text>
              <Text style={{ color: '#78350F', fontSize: 13, lineHeight: 21 }}>{'Direct link between New Delhi Railway Station and IGI Airport Terminal 3.\nFlat fare of ₹60 for all journeys on this line.'}</Text>
            </View>
            {[
              ['New Delhi', 'Shivaji Stadium',  '~4 min',  '₹60'],
              ['New Delhi', 'Dhaula Kuan',      '~9 min',  '₹60'],
              ['New Delhi', 'IGI Airport (T3)', '~20 min', '₹60'],
              ['New Delhi', 'Dwarka Sec 21',    '~27 min', '₹60'],
            ].map(([from, to, time, fare], i) => (
              <View key={i} style={{ flexDirection: 'row', backgroundColor: WHITE, borderRadius: 10, padding: 14, marginBottom: 8, alignItems: 'center', elevation: 1 }}>
                <View style={{ flex: 3 }}>
                  <Text style={{ fontSize: 13, color: TEXT, fontWeight: '700' }}>{from} → {to}</Text>
                  <Text style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>⏱ {time}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 20, fontWeight: '900', color: '#EA580C', textAlign: 'right' }}>{fare}</Text>
              </View>
            ))}
            <View style={{ backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14 }}>
              <Text style={{ color: '#991B1B', fontSize: 13, lineHeight: 22, fontWeight: '600' }}>
                {'⚡ Total travel time: ~20 min (New Delhi → T3)\n🕐 Runs: 4:45 AM – 11:45 PM\n🧳 Luggage trolleys & baggage wrapping available\n🚫 No Smart Card discount on this line'}
              </Text>
            </View>
          </View>
        )}
        {tab === 2 && (
          <View style={{ padding: 12 }}>
            <View style={{ backgroundColor: '#EFF6FF', borderRadius: 14, padding: 16, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: PRIMARY }}>
              <Text style={{ fontSize: 17, fontWeight: '900', color: PRIMARY, marginBottom: 6 }}>🎫 Metro Tourist Cards</Text>
              <Text style={{ color: TEXT2, fontSize: 13, lineHeight: 21 }}>{'Unlimited travel on all regular metro lines.\n(Not valid on Airport Express Line)'}</Text>
            </View>
            {[
              { name: '1-Day Card', price: '₹200', desc: 'Unlimited travel for 24 hours from first use', bg: '#DBEAFE', col: PRIMARY },
              { name: '3-Day Card', price: '₹500', desc: 'Unlimited travel for 72 hours from first use', bg: '#D1FAE5', col: GREEN },
            ].map(({ name, price, desc, bg, col }, i) => (
              <View key={i} style={{ backgroundColor: WHITE, borderRadius: 14, padding: 20, marginBottom: 12, elevation: 2, borderTopWidth: 4, borderTopColor: col }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: TEXT }}>{name}</Text>
                  <Text style={{ fontSize: 30, fontWeight: '900', color: col }}>{price}</Text>
                </View>
                <Text style={{ color: TEXT2, fontSize: 13, marginBottom: 12 }}>{desc}</Text>
                <View style={{ backgroundColor: bg, borderRadius: 8, padding: 10 }}>
                  <Text style={{ color: col, fontSize: 12, fontWeight: '700' }}>Available at all metro stations · No deposit required</Text>
                </View>
              </View>
            ))}
            <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14 }}>
              <Text style={{ color: '#166534', fontSize: 13, lineHeight: 21 }}>{'💡 Best value if you plan 3+ metro trips per day.\n🏛️ Also available at IGI Airport metro station.'}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── FIRST / LAST TIMINGS ─────────────────────────────────────
function FirstLastScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: BG }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: PRIMARY_DARK, padding: 16 }}>
        <Text style={{ color: WHITE, fontSize: 15, fontWeight: '800' }}>🕐 Metro Timings & Frequency</Text>
        <Text style={{ color: '#93C5FD', fontSize: 11, marginTop: 4 }}>Tap a line for detailed timing info</Text>
      </View>
      <View style={{ padding: 10 }}>
        {LINE_ORDER.map(lk => {
          const line = (LINES as any)[lk];
          const t = LINE_TIMINGS[lk] || { first: '6:00 AM', last: '11:00 PM', peak: '5 min', off: '10 min' };
          const isExp = expanded === lk;
          return (
            <TouchableOpacity key={lk} activeOpacity={0.85}
              onPress={() => setExpanded(isExp ? null : lk)}
              style={{ backgroundColor: WHITE, borderRadius: 14, marginBottom: 8, overflow: 'hidden', elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: line.color, marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: TEXT }}>{line.name}</Text>
                  <Text style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>{line.from} ↔ {line.to}</Text>
                </View>
                <Text style={{ fontSize: 16, color: MUTED }}>{isExp ? '▲' : '▼'}</Text>
              </View>
              {!isExp && (
                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                  <View style={{ flex: 1, alignItems: 'center', padding: 10, borderRightWidth: 1, borderRightColor: '#F1F5F9' }}>
                    <Text style={{ fontSize: 9, color: MUTED, fontWeight: '700', letterSpacing: 0.5 }}>FIRST METRO</Text>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: GREEN, marginTop: 3 }}>{t.first}</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center', padding: 10 }}>
                    <Text style={{ fontSize: 9, color: MUTED, fontWeight: '700', letterSpacing: 0.5 }}>LAST METRO</Text>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: ACCENT, marginTop: 3 }}>{t.last}</Text>
                  </View>
                </View>
              )}
              {isExp && (
                <View style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', padding: 14 }}>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <View style={{ flex: 1, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, alignItems: 'center' }}>
                      <Text style={{ fontSize: 9, color: MUTED, fontWeight: '700' }}>🌅 FIRST METRO</Text>
                      <Text style={{ fontSize: 22, fontWeight: '900', color: GREEN, marginTop: 4 }}>{t.first}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, alignItems: 'center' }}>
                      <Text style={{ fontSize: 9, color: MUTED, fontWeight: '700' }}>🌙 LAST METRO</Text>
                      <Text style={{ fontSize: 22, fontWeight: '900', color: ACCENT, marginTop: 4 }}>{t.last}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    <View style={{ flex: 1, backgroundColor: '#FFF7ED', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                      <Text style={{ fontSize: 9, color: MUTED, fontWeight: '700' }}>⚡ PEAK HOURS</Text>
                      <Text style={{ fontSize: 17, fontWeight: '900', color: '#EA580C', marginTop: 4 }}>{t.peak}</Text>
                      <Text style={{ fontSize: 9, color: MUTED, marginTop: 2 }}>8–10 AM · 5–8 PM</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                      <Text style={{ fontSize: 9, color: MUTED, fontWeight: '700' }}>🕐 OFF-PEAK</Text>
                      <Text style={{ fontSize: 17, fontWeight: '900', color: PRIMARY, marginTop: 4 }}>{t.off}</Text>
                      <Text style={{ fontSize: 9, color: MUTED, marginTop: 2 }}>All other times</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12 }}>
                    <Text style={{ color: TEXT2, fontSize: 12, lineHeight: 20 }}>
                      {'• Last station entry: 15 min before closing\n• Runs daily including Sundays & public holidays\n• Metro may run less frequent on late night shifts'}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── MAP SCREEN ───────────────────────────────────────────────
const MAP_BOUNDS = { minLat: 28.35, maxLat: 28.75, minLng: 76.95, maxLng: 77.42 };
const MW_BASE = width * 2.4, MH_BASE = 900;
const mapZoomBtn = { width: 40, height: 40, borderRadius: 12, backgroundColor: PRIMARY, alignItems: 'center' as const, justifyContent: 'center' as const, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } };
const lxBase = (lng: number) => ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * MW_BASE;
const lyBase = (lat: number) => ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * MH_BASE;

function MapScreen({ onRoute }: { onRoute: (s: any, type: string) => void }) {
  const [sel, setSel]         = useState<any>(null);
  const [zoom, setZoom]       = useState(1.2);
  const [activeLines, setActiveLines] = useState<Record<string, boolean>>(
    Object.fromEntries(LINE_ORDER.map(l => [l, true])),
  );

  const mw  = MW_BASE * zoom;
  const mh  = MH_BASE * zoom;
  const lxZ = (lng: number) => lxBase(lng) * zoom;
  const lyZ = (lat: number) => lyBase(lat) * zoom;

  const zoomIn  = () => setZoom(z => Math.min(parseFloat((z + 0.3).toFixed(1)), 3.5));
  const zoomOut = () => setZoom(z => Math.max(parseFloat((z - 0.3).toFixed(1)), 0.7));
  const zoomReset = () => setZoom(1.2);

  return (
    <View style={{ flex: 1 }}>
      {/* Line filter chips */}
      <View style={{ backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 8, alignItems: 'center' }}>
          {LINE_ORDER.map(k => {
            const l = LM[k]; const active = activeLines[k];
            return (
              <TouchableOpacity key={k} onPress={() => setActiveLines(p => ({ ...p, [k]: !p[k] }))}
                style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, marginHorizontal: 3,
                         backgroundColor: active ? l.color : '#E2E8F0' }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: active ? l.textColor : '#9CA3AF' }}>
                  {l.name.replace(' Line', '').replace('Airport Express', 'Airport')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Hint bar */}
      <Text style={{ textAlign: 'center', color: MUTED, fontSize: 10, paddingVertical: 4, backgroundColor: WHITE }}>
        Pinch + / − to zoom · Tap any station for details
      </Text>

      {/* Map canvas */}
      <View style={{ flex: 1 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ width: mw }}>
            <View style={{ width: mw, height: mh, backgroundColor: '#F1F5F9' }}>

              {/* Line segments */}
              {LINE_ORDER.map(lineKey => {
                if (!activeLines[lineKey]) return null;
                const line = (LINES as any)[lineKey];
                const seg = (s1: any, s2: any, key: string) => {
                  if (!s1 || !s2) return null;
                  const x1 = lxZ(s1.lng), y1 = lyZ(s1.lat);
                  const x2 = lxZ(s2.lng), y2 = lyZ(s2.lat);
                  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                  const th = Math.max(3, 5 * zoom);
                  return <View key={key} style={{ position: 'absolute', left: x1, top: y1 - th / 2,
                    width: len, height: th, backgroundColor: line.color,
                    transformOrigin: '0 50%', transform: [{ rotate: `${angle}deg` }] }} />;
                };
                const parts: React.ReactNode[] = [];
                line.stations.slice(0, -1).forEach((id: string, i: number) =>
                  parts.push(seg(stationMap[id], stationMap[line.stations[i + 1]], `${lineKey}-m${i}`)));
                if (line.branches) {
                  const trunk = stationMap[line.stations[line.stations.length - 1]];
                  line.branches.forEach((branch: string[], bi: number) => {
                    parts.push(seg(trunk, stationMap[branch[0]], `${lineKey}-b${bi}-s`));
                    branch.slice(0, -1).forEach((id: string, i: number) =>
                      parts.push(seg(stationMap[id], stationMap[branch[i + 1]], `${lineKey}-b${bi}-${i}`)));
                  });
                }
                return parts;
              })}

              {/* Station dots + ALL names */}
              {STATIONS.map(s => {
                if (!activeLines[s.line]) return null;
                const line = (LINES as any)[s.line];
                const x = lxZ(s.lng), y = lyZ(s.lat);
                const r   = (s.interchange ? 9 : 5) * Math.min(zoom, 1.8);
                const fs  = s.interchange
                  ? Math.max(7, 9 * Math.min(zoom, 1.6))
                  : Math.max(6, 7 * Math.min(zoom, 1.6));
                return (
                  <React.Fragment key={s.id}>
                    {/* Dot */}
                    <TouchableOpacity onPress={() => setSel(s)}
                      style={{ position: 'absolute', left: x - r, top: y - r,
                               width: r * 2, height: r * 2, borderRadius: r,
                               backgroundColor: s.interchange ? WHITE : line?.color,
                               borderWidth: s.interchange ? Math.max(2, 3 * Math.min(zoom, 1.5)) : 1.5,
                               borderColor: s.interchange ? line?.color : WHITE }} />
                    {/* Name label — always shown, sized to zoom */}
                    <Text
                      numberOfLines={1}
                      style={{ position: 'absolute', left: x + r + 2, top: y - fs / 2 - 1,
                               fontSize: fs,
                               color: s.interchange ? '#0D1B2A' : '#334155',
                               fontWeight: s.interchange ? '800' : '500',
                               backgroundColor: 'rgba(255,255,255,0.88)',
                               paddingHorizontal: 2, borderRadius: 2,
                               maxWidth: 90 * zoom }}>
                      {s.name}
                    </Text>
                  </React.Fragment>
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>

        {/* Zoom buttons — floating top-right */}
        <View style={{ position: 'absolute', top: 12, right: 12, gap: 6 }}>
          <TouchableOpacity onPress={zoomIn} style={mapZoomBtn}>
            <Text style={{ color: WHITE, fontSize: 22, fontWeight: '900', lineHeight: 26 }}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={zoomOut} style={mapZoomBtn}>
            <Text style={{ color: WHITE, fontSize: 22, fontWeight: '900', lineHeight: 26 }}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={zoomReset}
            style={[mapZoomBtn, { backgroundColor: WHITE, borderWidth: 1, borderColor: '#CBD5E1' }]}>
            <Text style={{ fontSize: 14 }}>⊙</Text>
          </TouchableOpacity>
          {/* Zoom level badge */}
          <View style={{ backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 3, alignItems: 'center' }}>
            <Text style={{ color: WHITE, fontSize: 10, fontWeight: '700' }}>{Math.round(zoom * 100)}%</Text>
          </View>
        </View>
      </View>

      {/* Station detail popup */}
      {sel && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: WHITE,
                       borderTopLeftRadius: 22, borderTopRightRadius: 22, elevation: 16 }}>
          <View style={{ height: 5, backgroundColor: (LINES as any)[sel.line]?.color,
                         borderTopLeftRadius: 22, borderTopRightRadius: 22 }} />
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: TEXT, marginBottom: 8 }}>{sel.name}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <View style={{ backgroundColor: (LINES as any)[sel.line]?.color, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                <Text style={{ color: (LINES as any)[sel.line]?.textColor, fontSize: 12, fontWeight: '700' }}>{(LINES as any)[sel.line]?.name}</Text>
              </View>
              <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                <Text style={{ color: TEXT2, fontSize: 12 }}>{sel.underground ? '🚇 Underground' : '🌅 Elevated'}</Text>
              </View>
              {sel.interchange && <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                <Text style={{ color: ACCENT, fontSize: 12, fontWeight: '700' }}>⇄ Interchange</Text>
              </View>}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: PRIMARY, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                onPress={() => { setSel(null); onRoute(sel, 'from'); }}>
                <Text style={{ color: WHITE, fontWeight: '700' }}>From Here</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                onPress={() => { setSel(null); onRoute(sel, 'to'); }}>
                <Text style={{ color: WHITE, fontWeight: '700' }}>To Here</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setSel(null)} style={{ alignItems: 'center', paddingTop: 14 }}>
              <Text style={{ color: MUTED }}>✕ Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── STATION PICKER ───────────────────────────────────────────
function StationPicker({ visible, onSelect, onClose, title }: any) {
  const [q, setQ] = useState('');
  const data = q ? searchStations(q) : STATIONS.slice(0, 60);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.83 }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 14 }} />
          <Text style={{ fontSize: 17, fontWeight: '800', color: TEXT, marginHorizontal: 18, marginBottom: 10 }}>{title}</Text>
          <View style={{ marginHorizontal: 16, marginBottom: 10, backgroundColor: BG, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }}>
            <Text style={{ fontSize: 15, marginRight: 8 }}>🔍</Text>
            <TextInput style={{ flex: 1, paddingVertical: 11, fontSize: 15, color: TEXT }}
              placeholder="Type station name..." placeholderTextColor={MUTED} value={q} onChangeText={setQ} autoFocus />
            {q ? <TouchableOpacity onPress={() => setQ('')}><Text style={{ color: MUTED, fontSize: 18 }}>✕</Text></TouchableOpacity> : null}
          </View>
          <FlatList data={data} keyExtractor={i => i.id} style={{ maxHeight: height * 0.5 }}
            ListEmptyComponent={
              q.length > 0
                ? <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <Text style={{ fontSize: 32, marginBottom: 10 }}>🔍</Text>
                    <Text style={{ color: TEXT2, fontWeight: '700', fontSize: 14 }}>No station found</Text>
                    <Text style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>Check spelling or try another name</Text>
                  </View>
                : null
            }
            renderItem={({ item }) => {
              const l = LM[item.line];
              return (
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}
                  onPress={() => { onSelect(item); setQ(''); }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: l?.color, marginRight: 14 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, color: TEXT, fontWeight: '600' }}>{item.name}</Text>
                    <Text style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{l?.name}{item.interchange ? ' · Interchange' : ''}</Text>
                  </View>
                  {item.interchange && <Text style={{ color: ACCENT, fontSize: 12, fontWeight: '700' }}>⇄</Text>}
                </TouchableOpacity>
              );
            }} />
          <TouchableOpacity style={{ margin: 16, backgroundColor: BG, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} onPress={onClose}>
            <Text style={{ color: PRIMARY, fontWeight: '700', fontSize: 15 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── ROUTE SCREEN ─────────────────────────────────────────────
function RouteScreen({ initFrom, initTo }: { initFrom?: any; initTo?: any }) {
  const [from, setFrom] = useState<any>(initFrom || null);
  const [to, setTo] = useState<any>(initTo || null);
  const [route, setRoute] = useState<any[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  useEffect(() => { if (initFrom) setFrom(initFrom); }, [initFrom]);
  useEffect(() => { if (initTo) setTo(initTo); }, [initTo]);

  const search = () => {
    if (!from || !to) return;
    if (from.id === to.id) { setRoute(null); setSearched(true); return; }
    setRoute(findRoute(from.id, to.id));
    setSearched(true);
  };
  const swap = () => { const t = from; setFrom(to); setTo(t); setRoute(null); setSearched(false); };

  // Group route into segments (consecutive stations on the same metro line)
  const segments = useMemo(() => {
    if (!route || route.length === 0) return [];
    const segs: { lk: string; stations: any[] }[] = [];
    let curLk = '';
    let cur: any[] = [];
    route.forEach(step => {
      const s = stationMap[step.id];
      if (!s) return;
      if (step.line && step.line !== 'interchange' && step.line !== curLk) {
        if (cur.length > 0) segs.push({ lk: curLk, stations: cur });
        curLk = step.line;
        cur = [s];
      } else if (step.line === 'interchange') {
        if (cur.length > 0) cur.push(s);
      } else {
        cur.push(s);
      }
    });
    if (cur.length > 0) segs.push({ lk: curLk, stations: cur });
    return segs;
  }, [route]);

  const totalStations = route?.length || 0;
  const stops        = Math.max(0, totalStations - 1);          // hops (excludes start)
  const changes      = Math.max(0, segments.length - 1);
  const fare         = stops > 0 ? getFareByStations(stops) : 0;
  const distKm       = (stops * 1.4).toFixed(1);               // ~1.4 km avg per stop
  // travel time = ~2.8 min/stop + 5 min waiting per change
  const time         = Math.round(stops * 2.8 + changes * 5);
  const now          = new Date();
  const hourDec      = now.getHours() + now.getMinutes() / 60;
  const isPeak       = (hourDec >= 8 && hourDec <= 10) || (hourDec >= 17 && hourDec <= 20);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Input card */}
      <View style={rt.card}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={rt.inputRow} onPress={() => setShowFrom(true)}>
            <View style={[rt.dot, { backgroundColor: GREEN }]} />
            <Text style={from ? rt.filled : rt.empty} numberOfLines={1}>{from ? from.name : 'From Station'}</Text>
            <Text style={rt.chevron}>›</Text>
          </TouchableOpacity>
          <View style={rt.sep} />
          <TouchableOpacity style={rt.inputRow} onPress={() => setShowTo(true)}>
            <View style={[rt.dot, { backgroundColor: ACCENT }]} />
            <Text style={to ? rt.filled : rt.empty} numberOfLines={1}>{to ? to.name : 'To Station'}</Text>
            <Text style={rt.chevron}>›</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={rt.swapBtn} onPress={swap}>
          <Text style={{ fontSize: 22, color: PRIMARY }}>⇅</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[rt.findBtn, (!from || !to) && { opacity: 0.4 }]} onPress={search} disabled={!from || !to}>
        <Text style={rt.findBtnTxt}>🔎  Find Best Route</Text>
      </TouchableOpacity>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {searched && !route && (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>
              {from?.id === to?.id ? '📍' : '🚫'}
            </Text>
            <Text style={{ color: ACCENT, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
              {from?.id === to?.id ? 'Source and destination are the same!' : 'No route found between these stations.'}
            </Text>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              {from?.id === to?.id ? 'Please select two different stations.' : 'Check that both stations are on the Delhi Metro network.'}
            </Text>
          </View>
        )}

        {route && route.length > 0 && (
          <View>
            {/* Stats bar */}
            <View style={rt.statsRow}>
              <View style={rt.stat}>
                <Text style={rt.statN}>₹{fare}</Text>
                <Text style={rt.statL}>Token</Text>
              </View>
              <View style={rt.statDiv} />
              <View style={rt.stat}>
                <Text style={[rt.statN, { color: GREEN }]}>₹{Math.ceil(fare * 0.9)}</Text>
                <Text style={rt.statL}>Smart Card</Text>
              </View>
              <View style={rt.statDiv} />
              <View style={rt.stat}>
                <Text style={rt.statN}>{isPeak ? `~${time + 5}` : `~${time}`}</Text>
                <Text style={rt.statL}>Min</Text>
              </View>
              <View style={rt.statDiv} />
              <View style={rt.stat}>
                <Text style={rt.statN}>{stops}</Text>
                <Text style={rt.statL}>Stops</Text>
              </View>
              <View style={rt.statDiv} />
              <View style={rt.stat}>
                <Text style={rt.statN}>{distKm}</Text>
                <Text style={rt.statL}>~Km</Text>
              </View>
              {changes > 0 && <><View style={rt.statDiv} /><View style={rt.stat}>
                <Text style={rt.statN}>{changes}</Text>
                <Text style={rt.statL}>Change{changes > 1 ? 's' : ''}</Text>
              </View></>}
            </View>

            {/* Peak hours warning */}
            {isPeak && (
              <View style={{ backgroundColor: '#FEF3C7', marginHorizontal: 12, marginTop: 8, borderRadius: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: '#F59E0B', flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>⚡</Text>
                <Text style={{ color: '#92400E', fontSize: 11, flex: 1, fontWeight: '600' }}>Peak hours right now — metro is crowded. Allow extra 5–10 min for boarding.</Text>
              </View>
            )}
            {/* General info note */}
            <View style={{ backgroundColor: '#FFFBEB', marginHorizontal: 12, marginTop: 6, borderRadius: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: GOLD }}>
              <Text style={{ color: '#92400E', fontSize: 11, textAlign: 'center' }}>⚠️ Time includes ~5 min per interchange wait. Actual time may vary.</Text>
            </View>
            <View style={{ backgroundColor: '#FAF5FF', marginHorizontal: 12, marginTop: 6, borderRadius: 10, padding: 10 }}>
              <Text style={{ color: '#6B21A8', fontSize: 11, textAlign: 'center', fontWeight: '600' }}>👩 Women: Board 1st or last coach  ·  Keep token or Smart Card ready</Text>
            </View>

            {/* Segment display */}
            <View style={{ marginTop: 10 }}>
              {segments.map((seg, si) => {
                const line = LM[seg.lk];
                const first = seg.stations[0];
                const last = seg.stations[seg.stations.length - 1];
                const dir = getDirection(seg.lk, first?.id, last?.id);
                return (
                  <View key={si}>
                    {si > 0 && (
                      <View style={rt.xfer}>
                        <Text style={{ fontSize: 26 }}>🚶</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={rt.xferTitle}>
                            Change at {segments[si - 1].stations[segments[si - 1].stations.length - 1]?.name}
                          </Text>
                          {/* Line number badge + name */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 8 }}>
                            <View style={{ backgroundColor: line?.color || PRIMARY, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                              <Text style={{ color: line?.textColor || WHITE, fontSize: 11, fontWeight: '900' }}>
                                Line {line?.number}
                              </Text>
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: TEXT }}>
                              {line?.name}
                            </Text>
                          </View>
                          {/* direction — which platform side to go to */}
                          <Text style={{ fontSize: 12, color: ACCENT, fontWeight: '700', marginTop: 4 }}>
                            🎯 Board {dir}
                          </Text>
                          <Text style={[rt.xferSub, { marginTop: 4 }]}>
                            🚶 Walk ~3–5 min · Follow Line {line?.number} signs
                          </Text>
                        </View>
                      </View>
                    )}
                    <View style={rt.segCard}>
                      <View style={[rt.segHead, { backgroundColor: line?.color || PRIMARY }]}>
                        <Text style={[rt.segLine, { color: line?.textColor || WHITE }]}>{line?.name}</Text>
                        <Text style={[rt.segDir, { color: line?.textColor || WHITE }]}>{dir}</Text>
                      </View>
                      <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                        {seg.stations.map((s, idx) => {
                          const isF = idx === 0, isL = idx === seg.stations.length - 1;
                          return (
                            <View key={s.id} style={{ flexDirection: 'row', alignItems: 'flex-start', minHeight: 36 }}>
                              <View style={{ width: 24, alignItems: 'center', marginRight: 12 }}>
                                <View style={{
                                  width: isF || isL ? 14 : 10, height: isF || isL ? 14 : 10,
                                  borderRadius: isF || isL ? 7 : 5, marginTop: 4,
                                  backgroundColor: isF || isL ? line?.color : WHITE,
                                  borderWidth: isF || isL ? 0 : 2, borderColor: line?.color,
                                }} />
                                {!isL && <View style={{ width: 2, flex: 1, minHeight: 16, backgroundColor: (line?.color || '#999') + '44', marginTop: 2 }} />}
                              </View>
                              <View style={{ flex: 1, paddingBottom: isL ? 0 : 10 }}>
                                <Text style={{ fontSize: isF || isL ? 15 : 14, fontWeight: isF || isL ? '800' : '400', color: TEXT }}>{s.name}</Text>
                                {isF && <Text style={{ fontSize: 11, color: GREEN, fontWeight: '700', marginTop: 2 }}>▶ Board here</Text>}
                                {isL && !isF && <Text style={{ fontSize: 11, color: ACCENT, fontWeight: '700', marginTop: 2 }}>⬛ Alight here</Text>}
                                {!isF && !isL && s.interchange && <Text style={{ fontSize: 11, color: '#7C3AED', fontWeight: '600', marginTop: 2 }}>⇄ Interchange</Text>}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={{ height: 24 }} />
          </View>
        )}
      </ScrollView>

      <StationPicker visible={showFrom} title="Select FROM Station"
        onSelect={(s: any) => { setFrom(s); setShowFrom(false); setRoute(null); setSearched(false); }}
        onClose={() => setShowFrom(false)} />
      <StationPicker visible={showTo} title="Select TO Station"
        onSelect={(s: any) => { setTo(s); setShowTo(false); setRoute(null); setSearched(false); }}
        onClose={() => setShowTo(false)} />
    </View>
  );
}
const rt = StyleSheet.create({
  card:      { flexDirection: 'row', backgroundColor: WHITE, margin: 12, borderRadius: 16, elevation: 4, alignItems: 'center', overflow: 'hidden' },
  inputRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15 },
  dot:       { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  filled:    { flex: 1, fontSize: 15, color: TEXT, fontWeight: '700' },
  empty:     { flex: 1, fontSize: 14, color: MUTED },
  chevron:   { fontSize: 22, color: MUTED },
  sep:       { height: 1, backgroundColor: BG, marginHorizontal: 16 },
  swapBtn:   { width: 44, height: 44, margin: 10, backgroundColor: '#EEF2FF', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  findBtn:   { backgroundColor: PRIMARY, borderRadius: 12, marginHorizontal: 12, paddingVertical: 15, alignItems: 'center', elevation: 3, marginBottom: 4 },
  findBtnTxt:{ color: WHITE, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  statsRow:  { flexDirection: 'row', backgroundColor: WHITE, marginHorizontal: 12, borderRadius: 14, padding: 12, elevation: 2, justifyContent: 'space-around', alignItems: 'center' },
  stat:      { alignItems: 'center', paddingHorizontal: 6 },
  statN:     { fontSize: 19, fontWeight: '900', color: TEXT },
  statL:     { fontSize: 9, color: MUTED, marginTop: 2, fontWeight: '700' },
  statDiv:   { width: 1, height: 36, backgroundColor: '#E2E8F0' },
  xfer:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', marginHorizontal: 12, marginBottom: 6, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FED7AA', gap: 12 },
  xferTitle: { fontSize: 13, fontWeight: '800', color: '#92400E' },
  xferSub:   { fontSize: 11, color: '#B45309', marginTop: 3 },
  segCard:   { backgroundColor: WHITE, marginHorizontal: 12, marginBottom: 6, borderRadius: 14, elevation: 2, overflow: 'hidden' },
  segHead:   { paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  segLine:   { fontSize: 13, fontWeight: '900' },
  segDir:    { fontSize: 11, fontWeight: '600', opacity: 0.9, maxWidth: '55%', textAlign: 'right' },
});

// ─── STATIONS SCREEN ──────────────────────────────────────────
function StationsScreen({ onRoute }: { onRoute: (s: any, t: string) => void }) {
  const [q, setQ] = useState('');
  const [line, setLine] = useState('all');
  const [detail, setDetail] = useState<any>(null);

  const data = useMemo(() => STATIONS.filter(s => {
    const lok = line === 'all' || s.line === line;
    const qok = !q || s.name.toLowerCase().includes(q.toLowerCase());
    return lok && qok;
  }), [q, line]);

  return (
    <View style={{ flex: 1, backgroundColor: WHITE }}>
      {/* Search bar */}
      <View style={{ backgroundColor: WHITE, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{ backgroundColor: BG, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Text style={{ fontSize: 16, marginRight: 8, color: MUTED }}>🔍</Text>
          <TextInput
            style={{ flex: 1, paddingVertical: 12, fontSize: 15, color: TEXT }}
            placeholder="Search station name..."
            placeholderTextColor={MUTED}
            value={q}
            onChangeText={setQ}
          />
          {q ? (
            <TouchableOpacity onPress={() => setQ('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ color: MUTED, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Line filter chips */}
      <View style={{ backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}>
          {['all', ...LINE_ORDER].map(k => {
            const l = k === 'all' ? null : LM[k];
            const active = line === k;
            return (
              <TouchableOpacity
                key={k}
                onPress={() => setLine(k)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: active ? (l?.color || PRIMARY) : '#F1F5F9',
                  borderWidth: 1,
                  borderColor: active ? (l?.color || PRIMARY) : '#E2E8F0',
                }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? (l?.textColor || WHITE) : TEXT2 }}>
                  {k === 'all' ? 'All Lines' : l?.name.replace(' Line', '').replace('Airport Express', 'Airport')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Count row */}
      <View style={{ backgroundColor: BG, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: PRIMARY, fontSize: 12, fontWeight: '800' }}>{data.length}</Text>
        <Text style={{ color: MUTED, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>stations found · Tap any for details</Text>
      </View>
      <FlatList data={data} keyExtractor={i => i.id}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 50 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🚉</Text>
            <Text style={{ color: TEXT2, fontWeight: '700', fontSize: 15 }}>No stations found</Text>
            <Text style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>Try a different name or select All Lines</Text>
          </View>
        }
        renderItem={({ item }) => {
          const l = LM[item.line];
          return (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BG }}
              onPress={() => setDetail(item)}>
              <View style={{ width: 5, alignSelf: 'stretch', backgroundColor: l?.color }} />
              <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 13 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: TEXT }}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, flexWrap: 'wrap', gap: 4 }}>
                  <Text style={{ fontSize: 11, color: l?.color, fontWeight: '700' }}>{l?.name}</Text>
                  <Text style={{ color: MUTED }}>·</Text>
                  <Text style={{ fontSize: 11, color: TEXT2 }}>{item.underground ? '🚇 Underground' : '🌅 Elevated'}</Text>
                  {item.interchange && <><Text style={{ color: MUTED }}>·</Text><Text style={{ fontSize: 11, color: ACCENT, fontWeight: '700' }}>⇄ Interchange</Text></>}
                </View>
              </View>
              <Text style={{ color: MUTED, fontSize: 22, paddingRight: 14 }}>›</Text>
            </TouchableOpacity>
          );
        }} />

      {/* Station Detail Modal */}
      <Modal visible={!!detail} animationType="slide" transparent onRequestClose={() => setDetail(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.75 }}>
            {detail && (() => {
              const l = LM[detail.line];
              const fac = getStationFacilities(detail);
              return (
                <>
                  <View style={{ height: 5, backgroundColor: l?.color, borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
                  <ScrollView style={{ padding: 20 }}>
                    <Text style={{ fontSize: 22, fontWeight: '900', color: TEXT, marginBottom: 8 }}>{detail.name}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      <View style={{ backgroundColor: l?.color, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                        <Text style={{ color: l?.textColor, fontSize: 12, fontWeight: '700' }}>{l?.name}</Text>
                      </View>
                      <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                        <Text style={{ color: TEXT2, fontSize: 12 }}>{detail.underground ? '🚇 Underground' : '🌅 Elevated'}</Text>
                      </View>
                      {detail.interchange && <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                        <Text style={{ color: ACCENT, fontSize: 12, fontWeight: '700' }}>⇄ Interchange</Text>
                      </View>}
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: MUTED, letterSpacing: 1, marginBottom: 10 }}>AVAILABLE FACILITIES</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                      {fac.map((f: string, i: number) => (
                        <View key={i} style={{ backgroundColor: '#F8FAFC', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#E2E8F0' }}>
                          <Text style={{ fontSize: 12, color: TEXT2, fontWeight: '600' }}>{f}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                      <TouchableOpacity style={{ flex: 1, backgroundColor: PRIMARY, paddingVertical: 13, borderRadius: 12, alignItems: 'center' }}
                        onPress={() => { setDetail(null); onRoute(detail, 'from'); }}>
                        <Text style={{ color: WHITE, fontWeight: '700' }}>🧭 Route From</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1, backgroundColor: ACCENT, paddingVertical: 13, borderRadius: 12, alignItems: 'center' }}
                        onPress={() => { setDetail(null); onRoute(detail, 'to'); }}>
                        <Text style={{ color: WHITE, fontWeight: '700' }}>🏁 Route To</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                  <TouchableOpacity onPress={() => setDetail(null)}
                    style={{ alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                    <Text style={{ color: MUTED, fontWeight: '600' }}>✕ Close</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── TOURIST GUIDE ────────────────────────────────────────────
function TouristGuideScreen({ onRoute }: { onRoute: (s: any, t: string) => void }) {
  const [cat, setCat] = useState('All');
  const CATS = ['All', '🏛️ Heritage', '⛪ Religious', '🛍️ Shopping', '🎨 Museum', '🌿 Park', '🍽️ Food & Culture', '✈️ Airport', '🐘 Zoo'];
  const filtered = cat === 'All' ? TOURIST_SPOTS : TOURIST_SPOTS.filter(s => s.cat === cat);
  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ backgroundColor: PRIMARY_DARK, padding: 16 }}>
        <Text style={{ color: WHITE, fontSize: 15, fontWeight: '800' }}>🏛️ Delhi Tourist Guide</Text>
        <Text style={{ color: '#93C5FD', fontSize: 11, marginTop: 4 }}>Top attractions with nearest metro station</Text>
      </View>
      <View style={{ backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center' }}>
          {CATS.map((c, i) => (
            <TouchableOpacity key={i} onPress={() => setCat(c)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginHorizontal: 3,
                       backgroundColor: cat === c ? PRIMARY : '#F1F5F9',
                       borderWidth: 1, borderColor: cat === c ? PRIMARY : '#E2E8F0' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: cat === c ? WHITE : TEXT2 }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList data={filtered} keyExtractor={i => i.name}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => {
          const metroLower = item.metro.toLowerCase();
          const st = STATIONS.find(s => s.name.toLowerCase() === metroLower)
                  || STATIONS.find(s => s.name.toLowerCase().includes(metroLower))
                  || STATIONS.find(s => metroLower.includes(s.name.toLowerCase()));
          return (
            <View style={{ backgroundColor: WHITE, borderRadius: 14, marginBottom: 10, elevation: 2, overflow: 'hidden' }}>
              <View style={{ backgroundColor: PRIMARY_DARK, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: WHITE, fontSize: 14, fontWeight: '900', flex: 1 }}>{item.name}</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                  <Text style={{ color: WHITE, fontSize: 10, fontWeight: '700' }}>{item.cat}</Text>
                </View>
              </View>
              <View style={{ padding: 14 }}>
                <Text style={{ color: TEXT2, fontSize: 13, lineHeight: 20, marginBottom: 12 }}>{item.desc}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 10, padding: 10, marginBottom: 10 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: LM[item.line]?.color, marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: TEXT }}>{item.metro}</Text>
                    <Text style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>{LM[item.line]?.name} · {item.walk}</Text>
                  </View>
                </View>
                {st && (
                  <TouchableOpacity style={{ backgroundColor: PRIMARY, borderRadius: 10, paddingVertical: 11, alignItems: 'center' }}
                    onPress={() => onRoute(st, 'to')}>
                    <Text style={{ color: WHITE, fontSize: 13, fontWeight: '700' }}>🧭 Get Route to {item.metro}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }} />
    </View>
  );
}

// ─── TIPS & RULES ─────────────────────────────────────────────
function TipsScreen() {
  const [expanded, setExpanded] = useState<number | null>(0);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: BG }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: PRIMARY_DARK, padding: 16 }}>
        <Text style={{ color: WHITE, fontSize: 15, fontWeight: '800' }}>📌 Metro Guide & Rules</Text>
        <Text style={{ color: '#93C5FD', fontSize: 11, marginTop: 4 }}>Essential information for every metro traveller</Text>
      </View>
      <View style={{ padding: 10 }}>
        {TRAVEL_TIPS.map((sec, si) => (
          <View key={si} style={{ backgroundColor: WHITE, borderRadius: 14, marginBottom: 10, elevation: 2, overflow: 'hidden' }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
              onPress={() => setExpanded(expanded === si ? null : si)}>
              <Text style={{ fontSize: 22, marginRight: 12 }}>{sec.section.split(' ')[0]}</Text>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '800', color: TEXT }}>{sec.section.split(' ').slice(1).join(' ')}</Text>
              <Text style={{ fontSize: 16, color: MUTED }}>{expanded === si ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {expanded === si && (
              <View style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingHorizontal: 16, paddingBottom: 14 }}>
                {sec.tips.map((tip, ti) => (
                  <View key={ti} style={{ flexDirection: 'row', marginTop: 12 }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 1 }}>
                      <Text style={{ color: WHITE, fontSize: 11, fontWeight: '900' }}>{ti + 1}</Text>
                    </View>
                    <Text style={{ flex: 1, color: TEXT2, fontSize: 13, lineHeight: 21 }}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
        {/* Emergency contacts */}
        <View style={{ backgroundColor: '#FEF2F2', borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: ACCENT }}>
          <Text style={{ fontSize: 15, fontWeight: '900', color: ACCENT, marginBottom: 12 }}>🆘 Emergency Contacts</Text>
          {[['DMRC Helpline', '155370'], ['Emergency', '112'], ['Police', '100'], ['Ambulance', '108'], ['Women Helpline', '1091']].map(([n, num]) => (
            <View key={n} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#FEE2E2' }}>
              <Text style={{ color: TEXT2, fontSize: 13 }}>{n}</Text>
              <Text style={{ color: ACCENT, fontSize: 16, fontWeight: '900' }}>{num}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── UPCOMING METRO ───────────────────────────────────────────
const PHASE4 = [
  { id: 1, color: '#E91E63', status: 'Under Construction', name: 'Corridor 1', from: 'Janakpuri West', to: 'RK Ashram Marg', km: '28.92 km', stations: 22, year: '2025–26', stops: ['Janakpuri West', 'Krishna Park Ext.', 'Vikaspuri', 'Uttam Nagar West', 'Keshopur', 'Paschim Vihar East', 'Paschim Vihar West', 'Peeragarhi', 'Mangolpuri North', 'Rohini Sec 35-36', 'Barwala', 'Begumpur', 'Badli', 'Vijay Vihar', 'Bhalswa Dairy', 'Mukherjee Nagar', 'Azadpur', 'Model Town', 'GTB Nagar', 'Vishwavidyalaya', 'Vidhan Sabha', 'RK Ashram Marg'] },
  { id: 2, color: '#9C27B0', status: 'Under Construction', name: 'Corridor 2', from: 'Aerocity', to: 'Tughlakabad', km: '23.62 km', stations: 19, year: '2025–26', stops: ['Aerocity', 'Kishangarh', 'Vasant Kunj Sec D', 'Vasant Kunj', 'Munirka', 'RV College', 'Ber Sarai', 'IIT Delhi', 'Hauz Khas', 'Panchsheel Park', 'Chirag Delhi', 'Pushp Vihar', 'Saket G Block', 'Sangam Vihar', 'Ambedkar Nagar', 'Khanpur', 'Tigri', 'Tughlakabad Ext.', 'Tughlakabad'] },
  { id: 3, color: '#FF69B4', status: 'Under Construction', name: 'Corridor 3', from: 'Maujpur-Babarpur', to: 'Majlis Park', km: '12.37 km', stations: 10, year: '2025–26', stops: ['Maujpur', 'Gokulpuri', 'Johri Enclave', 'Shiv Vihar Extn.', 'Rohtas Nagar', 'Shyam Bazar', 'Yamuna Vihar', 'Khajoori Khas', 'Jagatpur', 'Majlis Park'] },
  { id: 4, color: '#4CAF50', status: 'Under Construction', name: 'Corridor 4', from: 'Inderlok', to: 'Indraprastha', km: '12.58 km', stations: 13, year: '2025–26', stops: ['Inderlok', 'Rajouri Garden', 'Mayapuri', 'Naraina Vihar', 'Delhi Cantt.', 'Durgabai Deshmukh South Campus', 'Moti Bagh', 'Bhikaji Cama Place', 'Sarojini Nagar', 'INA', 'AIIMS', 'Vinobapuri', 'Lajpat Nagar'] },
  { id: 5, color: '#7B00D4', status: 'Approved', name: 'Corridor 5', from: 'Lajpat Nagar', to: 'Saket G Block', km: '7.96 km', stations: 7, year: '2026–27', stops: ['Lajpat Nagar', 'South Extension', 'INA', 'Vinobapuri', 'Kalka Ji Mandir', 'Govind Puri', 'Saket G Block'] },
  { id: 6, color: '#FF5722', status: 'Approved', name: 'Corridor 6', from: 'Saket G Block', to: 'Janakpuri West', km: '20.0 km', stations: 10, year: '2027–28', stops: ['Saket G Block', 'Munirka', 'Vasant Kunj', 'Dwarka Sec 21', 'Dwarka Sec 11', 'Dwarka Sec 12', 'Dwarka Sector 25', 'Pappan Kalan', 'Janakpuri South', 'Janakpuri West'] },
];
// Live update news items fetched from API (fallback to empty)
type MetroNews = { id: number; title: string; body: string; date: string };
const UPDATES_URL = 'https://api.npoint.io/metro-saathi-updates';

function UpcomingMetroScreen() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [news, setNews]         = useState<MetroNews[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [lastFetch, setLastFetch]     = useState('');

  useEffect(() => {
    setNewsLoading(true);
    fetch(UPDATES_URL)
      .then(r => r.json())
      .then((data: { updates?: MetroNews[]; lastUpdated?: string }) => {
        if (Array.isArray(data.updates)) setNews(data.updates);
        if (data.lastUpdated) setLastFetch(data.lastUpdated);
      })
      .catch(() => {/* offline — show empty */})
      .finally(() => setNewsLoading(false));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: BG }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: PRIMARY_DARK, padding: 16 }}>
        <Text style={{ color: WHITE, fontSize: 15, fontWeight: '800' }}>🚧 Delhi Metro Phase 4</Text>
        <Text style={{ color: '#93C5FD', fontSize: 11, marginTop: 4 }}>New corridors expanding the network across Delhi</Text>
      </View>
      {/* Live news / updates section */}
      <View style={{ backgroundColor: WHITE, margin: 10, borderRadius: 14, padding: 14, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: newsLoading ? GOLD : (news.length ? '#4ADE80' : MUTED), marginRight: 8 }} />
          <Text style={{ fontWeight: '800', fontSize: 13, color: TEXT, flex: 1 }}>
            {newsLoading ? 'Checking for updates…' : news.length ? `Live Updates  ·  ${lastFetch}` : 'No new updates · Using built-in data'}
          </Text>
        </View>
        {news.length > 0 && news.map(n => (
          <View key={n.id} style={{ borderLeftWidth: 3, borderLeftColor: PRIMARY, paddingLeft: 12, marginBottom: 10 }}>
            <Text style={{ fontWeight: '700', fontSize: 13, color: TEXT }}>{n.title}</Text>
            <Text style={{ fontSize: 12, color: TEXT2, marginTop: 3 }}>{n.body}</Text>
            <Text style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{n.date}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', backgroundColor: WHITE, padding: 14, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        {[['6', 'Corridors'], ['~100', 'New Stations'], ['~93 km', 'New Track']].map(([v, l]) => (
          <View key={l} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: PRIMARY }}>{v}</Text>
            <Text style={{ fontSize: 10, color: TEXT2, marginTop: 2, fontWeight: '600' }}>{l}</Text>
          </View>
        ))}
      </View>
      <View style={{ padding: 10 }}>
        {PHASE4.map(c => (
          <View key={c.id} style={{ backgroundColor: WHITE, borderRadius: 14, marginBottom: 10, elevation: 2, overflow: 'hidden' }}>
            <TouchableOpacity onPress={() => setExpanded(expanded === c.id ? null : c.id)}
              style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
              <View style={{ width: 8, borderRadius: 4, alignSelf: 'stretch', backgroundColor: c.color, marginRight: 14 }} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontWeight: '900', fontSize: 14, color: TEXT }}>{c.name}</Text>
                  <View style={{ backgroundColor: c.status === 'Under Construction' ? '#FFF7ED' : '#F0FDF4', borderWidth: 1, borderColor: c.status === 'Under Construction' ? '#FED7AA' : '#BBF7D0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 }}>
                    <Text style={{ color: c.status === 'Under Construction' ? '#EA580C' : GREEN, fontSize: 10, fontWeight: '700' }}>{c.status}</Text>
                  </View>
                </View>
                <Text style={{ color: TEXT, fontSize: 13, fontWeight: '600' }}>{c.from} → {c.to}</Text>
                <View style={{ flexDirection: 'row', marginTop: 6, gap: 12 }}>
                  <Text style={{ fontSize: 11, color: TEXT2 }}>📏 {c.km}</Text>
                  <Text style={{ fontSize: 11, color: TEXT2 }}>🚉 {c.stations} stations</Text>
                  <Text style={{ fontSize: 11, color: TEXT2 }}>📅 Est. {c.year}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 16, color: MUTED }}>{expanded === c.id ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {expanded === c.id && (
              <View style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingHorizontal: 16, paddingBottom: 14 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: MUTED, marginTop: 12, marginBottom: 8, letterSpacing: 1 }}>ALL STATIONS ({c.stops.length})</Text>
                {c.stops.map((stop, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 }}>
                    <View style={{ width: 22, alignItems: 'center', marginRight: 10 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.color, marginTop: 3 }} />
                      {i < c.stops.length - 1 && <View style={{ width: 2, height: 14, backgroundColor: c.color + '44', marginTop: 2 }} />}
                    </View>
                    <Text style={{ fontSize: 13, color: i === 0 || i === c.stops.length - 1 ? TEXT : TEXT2, fontWeight: i === 0 || i === c.stops.length - 1 ? '800' : '400', flex: 1 }}>{stop}</Text>
                    {i === 0 && <Text style={{ fontSize: 10, color: GREEN, fontWeight: '700' }}>START</Text>}
                    {i === c.stops.length - 1 && <Text style={{ fontSize: 10, color: ACCENT, fontWeight: '700' }}>END</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── ABOUT SCREEN ─────────────────────────────────────────────
function AboutScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: BG }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: PRIMARY_DARK, alignItems: 'center', paddingVertical: 30 }}>
        <MetroLogo size={140} />
        <Text style={{ fontSize: 22, fontWeight: '900', color: WHITE, marginTop: 16 }}>Metro Saathi</Text>
        <Text style={{ color: '#93C5FD', marginTop: 4, fontSize: 13 }}>Version 1.5 · 100% Offline</Text>
      </View>
      <View style={{ padding: 14 }}>
        <View style={{ backgroundColor: WHITE, borderRadius: 14, padding: 16, elevation: 2, marginBottom: 14 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: MUTED, letterSpacing: 1, marginBottom: 12 }}>WHAT'S INSIDE</Text>
          {[
            ['🧭', 'Route Finder', 'BFS offline algorithm — fastest route with all interchanges'],
            ['₹', 'Fare & Tickets', 'Token, Smart Card, Airport Express, Tourist Card info'],
            ['🗺️', 'Interactive Map', 'Color-coded map of all 9 lines with station detail'],
            ['📋', '268+ Stations', 'Complete station database with facilities information'],
            ['🕐', 'Metro Timings', 'First/last metro & peak/off-peak frequency for all lines'],
            ['🏛️', 'Tourist Guide', '20 top Delhi attractions with nearest metro & route'],
            ['🚧', 'Phase 4 Info', 'All 6 upcoming corridors with full station lists'],
            ['📌', 'Tips & Rules', 'Metro rules, etiquette, and emergency helpline numbers'],
          ].map(([icon, name, desc], i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: i < 7 ? 1 : 0, borderBottomColor: '#F1F5F9' }}>
              <Text style={{ fontSize: 22, marginRight: 14, width: 30 }}>{icon as string}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: TEXT }}>{name as string}</Text>
                <Text style={{ fontSize: 12, color: TEXT2, marginTop: 2, lineHeight: 18 }}>{desc as string}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ backgroundColor: WHITE, borderRadius: 14, padding: 20, elevation: 2, alignItems: 'center', marginBottom: 14 }}>
          <Image source={MY_PHOTO} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: PRIMARY, marginBottom: 14 }} />
          <Text style={{ fontSize: 20, fontWeight: '900', color: TEXT }}>Mukesh Kumar</Text>
          <Text style={{ color: TEXT2, marginTop: 6, fontSize: 13 }}>Developer · Metro Saathi App</Text>
          <View style={{ backgroundColor: '#EEF2FF', borderRadius: 10, padding: 14, marginTop: 16, width: '100%' }}>
            <Text style={{ color: PRIMARY, fontSize: 12, textAlign: 'center', lineHeight: 20, fontWeight: '600' }}>
              {'All data sourced from official DMRC information.\nFor real-time updates visit dmrcofficial.com'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────
const TITLES: Record<string, string> = {
  home: 'Metro Saathi', map: 'Metro Map', route: 'Route Finder',
  stations: 'All Stations', fare: 'Fare & Tickets', first: 'Metro Timings',
  upcoming: 'Phase 4 Metro', tourist: 'Tourist Guide', tips: 'Tips & Rules', about: 'About',
};

// ─── SERVICES MENU (hamburger) ────────────────────────────────
const MENU_ITEMS = [
  { key: 'route',    icon: '🧭', label: 'Route\nFinder'  },
  { key: 'fare',     icon: '₹',  label: 'Fare &\nTickets' },
  { key: 'map',      icon: '🗺️', label: 'Metro\nMap'     },
  { key: 'stations', icon: '📋', label: 'All\nStations'  },
  { key: 'first',    icon: '🕐', label: 'Metro\nTimings' },
  { key: 'tourist',  icon: '🏛️', label: 'Tourist\nGuide' },
  { key: 'upcoming', icon: '🚧', label: 'Phase 4\nMetro'  },
  { key: 'tips',     icon: '📌', label: 'Tips &\nRules'   },
  { key: 'about',    icon: 'ℹ️', label: 'About\nApp'    },
];

function HamburgerIcon() {
  return (
    <View style={{ gap: 4, justifyContent: 'center', alignItems: 'center', width: 18 }}>
      <View style={{ width: 18, height: 2.5, borderRadius: 2, backgroundColor: WHITE }} />
      <View style={{ width: 18, height: 2.5, borderRadius: 2, backgroundColor: WHITE }} />
      <View style={{ width: 18, height: 2.5, borderRadius: 2, backgroundColor: WHITE }} />
    </View>
  );
}

export default function App() {
  const [screen, setScreen]       = useState('splash');
  const [current, setCurrent]     = useState('home');
  const [routeFrom, setRouteFrom] = useState<any>(null);
  const [routeTo, setRouteTo]     = useState<any>(null);
  const [menuOpen, setMenuOpen]   = useState(false);

  const handleRoute = useCallback((station: any, type: string) => {
    if (type === 'from') setRouteFrom(station);
    else setRouteTo(station);
    setCurrent('route');
  }, []);

  const navigate = useCallback((key: string) => {
    setMenuOpen(false);
    setCurrent(key);
  }, []);

  // Hardware back button
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuOpen) { setMenuOpen(false); return true; }
      if (current !== 'home') { setCurrent('home'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [current, menuOpen]);

  if (screen === 'splash') return <SplashScreen onDone={() => setScreen('main')} />;

  const showBack = current !== 'home';
  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_DARK} />

      {/* ── Header ── */}
      <View style={ap.header}>
        {showBack ? (
          <TouchableOpacity onPress={() => setCurrent('home')} style={ap.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={ap.backArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={ap.menuBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <HamburgerIcon />
          </TouchableOpacity>
        )}
        <Text style={ap.title}>{TITLES[current] || 'Metro Saathi'}</Text>
        {!showBack && (
          <View style={ap.live}>
            <View style={ap.liveDot} />
            <Text style={ap.liveTxt}>LIVE</Text>
          </View>
        )}
      </View>

      {/* ── Screens ── */}
      {current === 'home'       && <HomeScreen onNav={setCurrent} />}
      {current === 'map'        && <MapScreen onRoute={handleRoute} />}
      {current === 'route'      && <RouteScreen initFrom={routeFrom} initTo={routeTo} />}
      {current === 'stations'   && <StationsScreen onRoute={handleRoute} />}
      {current === 'fare'       && <FareScreen />}
      {current === 'first'      && <FirstLastScreen />}
      {current === 'upcoming'   && <UpcomingMetroScreen />}
      {current === 'tourist'    && <TouristGuideScreen onRoute={handleRoute} />}
      {current === 'tips'       && <TipsScreen />}
      {current === 'about'      && <AboutScreen />}

      {/* ── Services Menu Modal ── */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={ap.overlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          {/* Bottom sheet — stops tap from closing when tapping inside */}
          <TouchableOpacity activeOpacity={1} style={ap.sheet} onPress={() => {}}>
            {/* Handle bar */}
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: MUTED, letterSpacing: 1.5, marginBottom: 16, textAlign: 'center' }}>
              ALL SERVICES
            </Text>
            {/* 3-column grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {MENU_ITEMS.map(item => (
                <TouchableOpacity key={item.key} onPress={() => navigate(item.key)}
                  activeOpacity={0.75}
                  style={{ width: (width - 48 - 20) / 3, alignItems: 'center',
                           backgroundColor: BG, borderRadius: 14, paddingVertical: 14,
                           borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: TEXT, textAlign: 'center', lineHeight: 15 }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setMenuOpen(false)}
              style={{ marginTop: 18, backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 13, alignItems: 'center' }}>
              <Text style={{ color: WHITE, fontWeight: '800', fontSize: 14 }}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
const ap = StyleSheet.create({
  header:    { backgroundColor: PRIMARY_DARK, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, elevation: 8 },
  title:     { fontSize: 18, fontWeight: '800', color: WHITE, flex: 1, marginLeft: 12 },
  backBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: WHITE, fontSize: 20, fontWeight: 'bold', marginTop: -2 },
  menuBtn:   { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  live:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4, gap: 5 },
  liveDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: WHITE, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 30 },
  liveTxt: { color: '#4ADE80', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});
