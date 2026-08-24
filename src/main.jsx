import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Activity, AlertTriangle, ArrowUpRight, Bell, Check, ChevronRight, Clock3, Command, Gauge, MapPin, Menu, MoreHorizontal, Navigation, Radio, Route, Search, Settings, Truck, UserRound, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './styles.css';

const API = 'http://localhost:3001/api';
const DEFAULT_MAP_CENTER = [42.7654, -71.4676];
const currentDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase();
const queue = [
  { id: 'REQ-4812', type: 'Heavy duty tow', location: 'W 42nd St & 11th Ave', age: '2 min', priority: 'Priority' },
  { id: 'REQ-4814', type: 'Flat tire assist', location: 'FDR Dr & E 63rd St', age: '6 min', priority: 'Standard' },
  { id: 'REQ-4815', type: 'Accident recovery', location: 'BQE & Atlantic Ave', age: '9 min', priority: 'Priority' }
];
const statusMeta = {
  'En route': { dot: 'orange', label: 'En route' },
  Available: { dot: 'green', label: 'Available' },
  'On scene': { dot: 'purple', label: 'On scene' },
  Returning: { dot: 'yellow', label: 'Returning' }
};

function truckIcon(color, selected) {
  return L.divIcon({ className: 'truck-marker-wrap', html: `<div class="truck-marker ${selected ? 'selected' : ''}" style="--marker-color:${color}"><span>↗</span></div>`, iconSize: [42, 42], iconAnchor: [21, 21] });
}
function MapFocus({ truck }) {
  const map = useMap();
  useEffect(() => { if (truck) map.flyTo([truck.lat, truck.lng], 13, { duration: 0.8 }); }, [truck, map]);
  return null;
}
function MapActions({ onModeChange, mapMode, onSearch }) {
  const map = useMap();
  return <>
    <div className="map-mode-control">
      <button className={mapMode === 'map' ? 'tool-button active' : 'tool-button'} onClick={() => onModeChange('map')}>Map</button>
      <button className={mapMode === 'satellite' ? 'tool-button active' : 'tool-button'} onClick={() => onModeChange('satellite')}>Satellite</button>
      <button className="tool-icon" onClick={onSearch} aria-label="Search fleet"><Search size={15} /></button>
    </div>
    <button className="locate-button map-locate" onClick={() => map.setView(DEFAULT_MAP_CENTER, 12)}><Navigation size={16} /> Recenter</button>
  </>;
}
function App() {
  const [trucks, setTrucks] = useState([]);
  const [analytics, setAnalytics] = useState({ completed: 34, avgResponse: 11.4, utilization: 78, satisfaction: 4.8 });
  const [selected, setSelected] = useState(null);
  const [activeNav, setActiveNav] = useState('Command center');
  const [queueOpen, setQueueOpen] = useState(true);
  const [mapMode, setMapMode] = useState('map');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const load = async () => {
    const [truckResponse, analyticsResponse] = await Promise.all([fetch(`${API}/trucks`), fetch(`${API}/analytics`)]);
    const nextTrucks = await truckResponse.json();
    setTrucks(nextTrucks);
    setAnalytics(await analyticsResponse.json());
    setSelected((current) => nextTrucks.find((truck) => truck.id === current?.id) || nextTrucks[0]);
  };
  useEffect(() => { load(); const timer = setInterval(load, 5000); return () => clearInterval(timer); }, []);
  const updateStatus = async (status) => {
    if (!selected) return;
    await fetch(`${API}/trucks/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };
  const navigateTo = (label) => {
    setActiveNav(label);
    setMobileNavOpen(false);
    const target = label === 'Command center' ? '.map-panel' : label === 'Dispatch queue' || label === 'Alerts' ? '.queue-panel' : label === 'Fleet' || label === 'Drivers' ? (label === 'Drivers' ? '.driver-panel' : '.status-panel') : label === 'Analytics' ? '.analytics-strip' : '.topbar';
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const available = trucks.filter((truck) => truck.status === 'Available').length;
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Command size={18} /></div><span>haulr</span><small>OPS</small></div>
        <div className="workspace-switch"><div className="workspace-avatar">W</div><div><strong>Weyland</strong><span>Operations team</span></div><ChevronRight size={15} /></div>
        <p className="nav-label">Workspace</p>
        <nav>{[['Command center', Gauge], ['Dispatch queue', Route], ['Fleet', Truck], ['Drivers', UserRound]].map(([label, Icon]) => <button className={activeNav === label ? 'nav-item active' : 'nav-item'} onClick={() => navigateTo(label)} key={label}><Icon size={17} />{label}{label === 'Dispatch queue' && <b>3</b>}</button>)}</nav>
        <p className="nav-label nav-spacer">Manage</p>
        <nav>{[['Analytics', Activity], ['Alerts', Bell], ['Settings', Settings]].map(([label, Icon]) => <button className={activeNav === label ? 'nav-item active' : 'nav-item'} onClick={() => navigateTo(label)} key={label}><Icon size={17} />{label}</button>)}</nav>
        <div className="sidebar-footer"><div className="avatar">MC</div><div><strong>Marcus Cole</strong><span>Dispatcher</span></div><MoreHorizontal size={17} /></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div className="mobile-brand"><div className="brand-mark"><Command size={17} /></div><span>haulr</span></div><button className="mobile-menu" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle navigation"><Menu size={20} /></button><div className="topbar-title"><span className="eyebrow">{currentDate}</span><h1>Good morning, Weyland <span className="wave">✦</span></h1></div><div className="topbar-actions"><div className="live-pill"><i></i>Live operations</div><button className="icon-button"><Bell size={18} /><em></em></button><div className="top-avatar">W</div></div></header>
        <section className="metric-row"><Metric label="Active fleet" value={`${trucks.length}`} detail={`${available} available now`} icon={Truck} tone="orange" /><Metric label="In progress" value="12" detail="+3 since 8:00 AM" icon={Navigation} tone="blue" /><Metric label="Avg. response" value={`${analytics.avgResponse} min`} detail="-1.8 min vs. last week" icon={Clock3} tone="purple" /><Metric label="Jobs completed" value={`${analytics.completed}`} detail="82% of daily target" icon={Check} tone="green" /></section>
        <section className="workspace-grid">
          <div className="map-panel panel"><div className="panel-heading"><div><p className="section-kicker"><span className="pulse-dot"></span>Live fleet map</p><h2>Nashua, NH</h2></div></div><div className="map-wrap"><MapContainer center={DEFAULT_MAP_CENTER} zoom={12} zoomControl={true} scrollWheelZoom={true}><TileLayer attribution='&copy; OpenStreetMap' url={mapMode === 'satellite' ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'} />{selected && <MapFocus truck={selected} />}{trucks.map((truck) => <Marker key={truck.id} position={[truck.lat, truck.lng]} icon={truckIcon(truck.color, selected?.id === truck.id)} eventHandlers={{ click: () => setSelected(truck) }}><Popup><strong>{truck.id} · {truck.name}</strong><br />{truck.driver} · {truck.status}</Popup></Marker>)}<MapActions mapMode={mapMode} onModeChange={setMapMode} onSearch={() => navigateTo('Fleet')} /></MapContainer><div className="map-legend"><span><i className="legend-dot orange"></i>En route</span><span><i className="legend-dot green"></i>Available</span><span><i className="legend-dot purple"></i>On scene</span></div></div></div>
          <div className="queue-panel panel"><div className="panel-heading compact"><div><p className="section-kicker">Needs attention</p><h2>Dispatch queue <span className="count-badge">3</span></h2></div><button className="text-button" onClick={() => setQueueOpen(!queueOpen)}>{queueOpen ? 'Collapse' : 'Expand'} <ChevronRight size={15} className={queueOpen ? 'rotate-90' : ''} /></button></div>{queueOpen && <div className="queue-list">{queue.map((job, index) => <div className="queue-item" key={job.id}><div className="queue-index">0{index + 1}</div><div className="queue-copy"><div><strong>{job.type}</strong><span className={job.priority === 'Priority' ? 'priority-tag' : 'standard-tag'}>{job.priority}</span></div><p><MapPin size={13} />{job.location}</p><small>{job.id} · waiting {job.age}</small></div><button className="assign-button" onClick={() => setSelected(trucks.find((truck) => truck.status === 'Available'))}>Assign <ArrowUpRight size={14} /></button></div>)}</div>}<button className="queue-footer">View all requests <ArrowUpRight size={15} /></button></div>
        </section>
        <section className="lower-grid"><div className="status-panel panel"><div className="panel-heading compact"><div><p className="section-kicker">Fleet overview</p><h2>Truck status</h2></div><button className="filter-button">All trucks <ChevronRight size={14} /></button></div><div className="truck-table"><div className="table-head"><span>UNIT</span><span>DRIVER</span><span>STATUS</span><span>LOCATION</span><span></span></div>{trucks.map((truck) => <button className={`truck-row ${selected?.id === truck.id ? 'row-selected' : ''}`} onClick={() => setSelected(truck)} key={truck.id}><span className="unit-cell"><i style={{ background: truck.color }}></i><strong>{truck.id}</strong><small>{truck.name}</small></span><span className="driver-cell">{truck.driver}</span><span><Status status={truck.status} /></span><span className="location-cell"><MapPin size={13} />{truck.job}</span><ChevronRight size={16} className="row-arrow" /></button>)}</div></div><DriverPanel truck={selected} onStatus={updateStatus} /></section>
        <section className="analytics-strip panel"><div><p className="section-kicker">Performance snapshot</p><h2>Today's pulse</h2></div><div className="pulse-stat"><span className="pulse-icon orange-bg"><Activity size={17} /></span><div><strong>{analytics.utilization}%</strong><small>Fleet utilization</small></div><div className="spark orange-spark"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div className="pulse-stat"><span className="pulse-icon green-bg"><Check size={17} /></span><div><strong>{analytics.satisfaction}/5</strong><small>Customer rating</small></div><div className="rating-bars"><i></i><i></i><i></i><i></i><i></i></div></div><div className="pulse-stat"><span className="pulse-icon blue-bg"><Route size={17} /></span><div><strong>68.2 mi</strong><small>Avg. route length</small></div><span className="up-change">↗ 8.4%</span></div></section>
      </main>
    </div>
  );
}
function Metric({ label, value, detail, icon: Icon, tone }) { return <div className="metric-card"><span className={`metric-icon ${tone}`}><Icon size={18} /></span><div><p>{label}</p><strong>{value}</strong><small className={detail.includes('+') || detail.includes('82') ? 'positive' : ''}>{detail}</small></div><ArrowUpRight className="metric-arrow" size={16} /></div>; }
function Status({ status }) { const meta = statusMeta[status] || statusMeta.Available; return <span className="status"><i className={meta.dot}></i>{meta.label}</span>; }
function DriverPanel({ truck, onStatus }) { if (!truck) return null; return <div className="driver-panel panel"><div className="driver-heading"><div><p className="section-kicker">Selected unit</p><h2>Driver detail</h2></div><button className="icon-button subtle"><MoreHorizontal size={18} /></button></div><div className="driver-identity"><div className="driver-avatar" style={{ background: truck.color }}>{truck.driver.split(' ').map((name) => name[0]).join('')}</div><div><h3>{truck.driver}</h3><p><span className="online-dot"></span>On shift · {truck.id}</p></div><Status status={truck.status} /></div><div className="driver-stats"><div><span>Current job</span><strong>{truck.job}</strong></div><div><span>Fuel level</span><strong>{truck.fuel}%</strong></div><div><span>ETA</span><strong>{truck.eta}</strong></div></div><div className="fuel-track"><span style={{ width: `${truck.fuel}%`, background: truck.color }}></span></div><div className="driver-actions"><button className="secondary-action"><Radio size={15} /> Message</button><button className="primary-action" onClick={() => onStatus(truck.status === 'Available' ? 'En route' : 'Available')}>{truck.status === 'Available' ? 'Dispatch unit' : 'Mark available'} <ArrowUpRight size={15} /></button></div><div className="quick-status"><span>Quick status</span><button onClick={() => onStatus('Available')} className={truck.status === 'Available' ? 'selected-status' : ''}>Available</button><button onClick={() => onStatus('Returning')} className={truck.status === 'Returning' ? 'selected-status' : ''}>Returning</button></div></div>; }

createRoot(document.getElementById('root')).render(<App />);
