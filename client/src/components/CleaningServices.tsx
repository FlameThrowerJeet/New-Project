import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// @ts-ignore
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const SESSION_DURATION_MINUTES = 90;
const START_TIME = 6 * 60; // 6:00 AM in minutes
const END_TIME = 23 * 60 + 30; // 11:30 PM in minutes

function minutesToTimeString(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

const generateSlots = () => {
  const slots = [];
  for (let t = START_TIME; t + SESSION_DURATION_MINUTES <= END_TIME; t += SESSION_DURATION_MINUTES) {
    const start = t;
    const end = t + SESSION_DURATION_MINUTES;
    slots.push({
      start,
      end,
      label: `${minutesToTimeString(start)} - ${minutesToTimeString(end)}`
    });
  }
  return slots;
};

const slots = generateSlots();

const mockAddresses = [
  'Dream Land City, Hanumangarh',
  'Sector 6, Hanumangarh',
  'Sindhi Colony, Hanumangarh',
  'Custom Address...'
];

const DEFAULT_CENTER = [29.5812, 74.3294]; // Hanumangarh approx

// Mock agent data
const mockAgents = [
  { name: 'Aman Singh', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Priya Sharma', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Ravi Kumar', photo: 'https://randomuser.me/api/portraits/men/45.jpg' },
];

// Mock locality and street data for Hanumangarh
const hanumangarhLocalities = [
  {
    name: 'Sector-6',
    streets: ['Road Number 1', 'Road Number 2', 'Road Number 17', 'Road Number 22']
  },
  {
    name: 'Makkasar',
    streets: ['Main Street', 'Gali No. 3', 'Gali No. 5']
  },
  {
    name: 'Sindhi Colony',
    streets: ['Street 1', 'Street 2', 'Street 3']
  },
  {
    name: 'Dream Land City',
    streets: ['Avenue 1', 'Avenue 2']
  },
  {
    name: 'Hanumangarh Junction',
    streets: ['Station Road', 'Market Road']
  },
  {
    name: 'Other',
    streets: ['Other']
  }
];

// Mock work sessions for agents to pick up
const mockWorkSessions = [
  {
    id: 1,
    userName: 'Rahul Verma',
    userPhone: '9876543210',
    date: new Date(),
    slot: 0,
    locality: 'Sector-6',
    street: 'Road Number 17',
    house: 'C-202',
    landmark: 'Near Chuna Phatak',
    gps: '29.5812,74.3294',
    price: 350
  },
  {
    id: 2,
    userName: 'Anjali Mehta',
    userPhone: '9123456789',
    date: new Date(Date.now() + 86400000),
    slot: 1,
    locality: 'Sindhi Colony',
    street: 'Street 2',
    house: 'B-12',
    landmark: 'Opp. Park',
    gps: '29.5820,74.3300',
    price: 300
  }
];

function LocationSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [marker, setMarker] = useState<{ lat: number, lng: number } | null>(
    value ? { lat: parseFloat(value.split(',')[0]), lng: parseFloat(value.split(',')[1]) } : null
  );
  useMapEvents({
    click(e: { latlng: { lat: number; lng: number } }) {
      setMarker(e.latlng);
      onChange(`${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}`);
    }
  });
  if (
    marker &&
    typeof marker.lat === 'number' &&
    typeof marker.lng === 'number' &&
    isFinite(marker.lat) &&
    isFinite(marker.lng)
  ) {
    const position = [Number(marker.lat), Number(marker.lng)] as [number, number];
    return <Marker position={position} />;
  }
  return null;
}

const CleaningServices: React.FC = () => {
  const [tab, setTab] = useState<'hire' | 'become'>('hire');
  // Step-by-step states
  const [date, setDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [gps, setGps] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  // Hire an Agent states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  // Become an Agent states
  const [agentDate, setAgentDate] = useState<Date | null>(null);
  const [agentSlots, setAgentSlots] = useState<number[]>([]);
  const [agentLocalities, setAgentLocalities] = useState<string[]>([]);
  const [agentSelectedSessions, setAgentSelectedSessions] = useState<number[]>([]);
  const [agentSuccess, setAgentSuccess] = useState(false);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && selectedSlot !== null && name && phone && address && gps) {
      setSuccess(true);
    }
  };

  const handleApplyAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentDate && agentSlots.length > 0 && agentLocalities.length > 0) {
      setAgentSuccess(true);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', background: 'rgba(16,32,16,0.95)', borderRadius: 12, boxShadow: '0 0 24px #0f08', padding: 32, color: '#0f0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Cleaning Services</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => setTab('hire')} style={{ padding: '8px 24px', borderRadius: 6, border: 'none', background: tab === 'hire' ? '#0f0' : '#222', color: tab === 'hire' ? '#111' : '#0f0', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}>Hire an Agent</button>
        <button onClick={() => setTab('become')} style={{ padding: '8px 24px', borderRadius: 6, border: 'none', background: tab === 'become' ? '#0f0' : '#222', color: tab === 'become' ? '#111' : '#0f0', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}>Become an Agent</button>
      </div>
      {tab === 'hire' ? (
        success ? (
          <div style={{ color: '#0f0', textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
            Booking Confirmed!<br />Our agent will contact you soon.<br /><br />
            <button style={{ marginTop: 16, background: '#0f0', color: '#111', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }} onClick={() => setSuccess(false)}>Book Another</button>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); setSuccess(true); }}>
            {/* Step 1: Date Picker */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6 }}>1. Select Date:</label>
              {/* @ts-ignore */}
              <DatePicker
                selected={date}
                onChange={(d: Date | null) => { setDate(d); setSelectedSlot(null); setGps(''); setSelectedAgent(null); }}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                minDate={new Date()}
                todayButton="Today"
                highlightDates={[new Date()]}
                required
                className="react-datepicker__input-text"
                wrapperClassName="react-datepicker-wrapper"
                popperPlacement="bottom"
                showPopperArrow={false}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #0f0', background: '#111', color: '#0f0', cursor: 'pointer' }}
              />
            </div>
            {/* Step 2: Session Dropdown */}
            {date !== null && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#0f0' }}>2. Select Session:</label>
                <select value={selectedSlot ?? ''} onChange={e => { setSelectedSlot(Number(e.target.value)); setGps(''); setSelectedAgent(null); }} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #0f0', background: '#111', color: '#0f0' }}>
                  <option value="">Select a session</option>
                  {slots.map((slot, idx) => (
                    <option key={slot.label} value={idx}>{slot.label}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Step 3: Map */}
            {date !== null && selectedSlot !== null && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6 }}>3. Select Location (Ping on Map):</label>
                  <div style={{ width: '100%', height: 220, marginBottom: 6 }}>
                    <MapContainer center={[DEFAULT_CENTER[0], DEFAULT_CENTER[1]]} zoom={15} style={{ width: '100%', height: 200, borderRadius: 6, border: '1px solid #0f0' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationSelector value={gps} onChange={setGps} />
                    </MapContainer>
                  </div>
                  <input type="text" value={gps} onChange={e => setGps(e.target.value)} placeholder="GPS coordinates (lat,lon)" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #0f0', background: '#111', color: '#0f0' }} />
                </div>
                {/* Step 3.1: Locality Selection */}
                {gps && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>4. Select Locality:</label>
                    <select value={selectedLocality} onChange={e => { setSelectedLocality(e.target.value); setSelectedStreet(''); }} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #0f0', background: '#111', color: '#0f0' }}>
                      <option value="">Select Locality</option>
                      {hanumangarhLocalities.map(loc => (
                        <option key={loc.name} value={loc.name}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Step 3.2: Street Selection */}
                {gps && selectedLocality && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>5. Select Street:</label>
                    <select value={selectedStreet} onChange={e => setSelectedStreet(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #0f0', background: '#111', color: '#0f0' }}>
                      <option value="">Select Street</option>
                      {hanumangarhLocalities.find(loc => loc.name === selectedLocality)?.streets.map(street => (
                        <option key={street} value={street}>{street}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Step 3.3: House/Flat Number and Landmark */}
                {gps && selectedLocality && selectedStreet && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>6. House/Flat Number:</label>
                    <input type="text" value={houseNumber} onChange={e => setHouseNumber(e.target.value)} required placeholder="e.g. C-202" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #0f0', background: '#111', color: '#0f0' }} />
                    <label style={{ display: 'block', marginBottom: 6, marginTop: 8 }}>Landmark (optional):</label>
                    <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="e.g. Near Chuna Phatak" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #0f0', background: '#111', color: '#0f0' }} />
                  </div>
                )}
                {/* Step 3.4: Show Full Address */}
                {gps && selectedLocality && selectedStreet && houseNumber && (
                  <div style={{ marginBottom: 14, color: '#0ff', fontWeight: 'bold' }}>
                    Full Address: {houseNumber}, {selectedLocality}, {selectedStreet}{landmark ? `, ${landmark}` : ''}
                  </div>
                )}
              </>
            )}
            {/* Step 4: Agent Listing */}
            {date !== null && selectedSlot !== null && gps && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#0f0' }}>7. Select Cleaning Agent:</label>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {mockAgents
                    .map((agent, idx) => ({ ...agent, idx }))
                    .sort((a, b) => a.idx - b.idx) // Replace with real session time sort if available
                    .map(agent => (
                      <div key={agent.name} onClick={() => setSelectedAgent(agent.idx)} style={{ cursor: 'pointer', border: selectedAgent === agent.idx ? '2px solid #0f0' : '2px solid #333', borderRadius: 8, padding: 12, background: '#111', color: '#0f0', boxShadow: selectedAgent === agent.idx ? '0 0 8px #0f0' : 'none', textAlign: 'center', width: 120 }}>
                        <img src={agent.photo} alt={agent.name} style={{ width: 60, height: 60, borderRadius: '50%', marginBottom: 8, border: '2px solid #0f0' }} />
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{agent.name}</div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>Available</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {/* Step 5: Payment & Confirmation */}
            {date !== null && selectedSlot !== null && gps && selectedAgent !== null && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>8. Payment:</label>
                <button type="button" style={{ width: '100%', background: '#0f0', color: '#111', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 'bold', fontSize: 16, cursor: 'pointer', marginBottom: 8 }}>Pay with Razorpay (Placeholder)</button>
                <button type="submit" style={{ width: '100%', background: '#0f0', color: '#111', border: 'none', borderRadius: 6, padding: '12px 0', fontWeight: 'bold', fontSize: 18, cursor: 'pointer', marginTop: 8 }}>Confirm Booking</button>
              </div>
            )}
          </form>
        )
      ) : (
        agentSuccess ? (
          <div style={{ color: '#0f0', textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
            Availability/Session(s) Confirmed!<br />You will be notified for bookings.<br /><br />
            <button style={{ marginTop: 16, background: '#0f0', color: '#111', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }} onClick={() => setAgentSuccess(false)}>Post More</button>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); setAgentSuccess(true); }}>
            {/* Step 1: Date Picker */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6 }}>1. Select Date:</label>
              {/* @ts-ignore */}
              <DatePicker
                selected={agentDate}
                onChange={(d: Date | null) => { setAgentDate(d); setAgentSlots([]); setAgentLocalities([]); setAgentSelectedSessions([]); }}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                minDate={new Date()}
                todayButton="Today"
                highlightDates={[new Date()]}
                required
                className="react-datepicker__input-text"
                wrapperClassName="react-datepicker-wrapper"
                popperPlacement="bottom"
                showPopperArrow={false}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #0f0', background: '#111', color: '#0f0', cursor: 'pointer' }}
              />
            </div>
            {/* Step 2: Session(s) Multi-Select */}
            {agentDate && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#0f0' }}>2. Select Session(s):</label>
                <select multiple value={agentSlots.map(String)} onChange={e => {
                  const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                  setAgentSlots(options);
                  setAgentLocalities([]); setAgentSelectedSessions([]);
                }} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #0f0', background: '#111', color: '#0f0', minHeight: 80 }}>
                  {slots.map((slot, idx) => (
                    <option key={slot.label} value={idx}>{slot.label}</option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>(Hold Ctrl/Cmd to select multiple)</div>
              </div>
            )}
            {/* Step 3: Locality Multi-Select */}
            {agentDate && agentSlots.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#0f0' }}>3. Select Localities (you can serve):</label>
                <select multiple value={agentLocalities} onChange={e => {
                  const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                  setAgentLocalities(options);
                  setAgentSelectedSessions([]);
                }} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #0f0', background: '#111', color: '#0f0', minHeight: 80 }}>
                  {hanumangarhLocalities.map(loc => (
                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>(Hold Ctrl/Cmd to select multiple)</div>
              </div>
            )}
            {/* Step 4: Show Available Work Sessions */}
            {agentDate && agentSlots.length > 0 && agentLocalities.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#0f0' }}>4. Available Work Sessions:</label>
                {mockWorkSessions.filter(ws =>
                  ws.date.toDateString() === agentDate.toDateString() &&
                  agentSlots.includes(ws.slot) &&
                  agentLocalities.includes(ws.locality)
                ).length === 0 ? (
                  <div style={{ color: '#aaa', fontSize: 15, marginBottom: 8 }}>
                    No sessions available. <b>Post your availability</b> for these slots.<br />
                    <button type="submit" style={{ marginTop: 8, background: '#0f0', color: '#111', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}>Post Availability</button>
                  </div>
                ) : (
                  <>
                    {mockWorkSessions.filter(ws =>
                      ws.date.toDateString() === agentDate.toDateString() &&
                      agentSlots.includes(ws.slot) &&
                      agentLocalities.includes(ws.locality)
                    ).map(ws => (
                      <div key={ws.id} style={{ border: '2px solid #0f0', borderRadius: 8, padding: 12, marginBottom: 10, background: '#111', color: '#0f0', boxShadow: '0 0 8px #0f0' }}>
                        <input type="checkbox" checked={agentSelectedSessions.includes(ws.id)} onChange={e => {
                          if (e.target.checked) setAgentSelectedSessions([...agentSelectedSessions, ws.id]);
                          else setAgentSelectedSessions(agentSelectedSessions.filter(id => id !== ws.id));
                        }} />
                        <span style={{ fontWeight: 'bold', marginLeft: 8 }}>{ws.userName}</span> ({ws.userPhone})<br />
                        <span style={{ color: '#aaa', fontSize: 13 }}>Session: {slots[ws.slot].label} on {ws.date.toLocaleDateString('en-IN')}</span><br />
                        <span style={{ color: '#aaa', fontSize: 13 }}>Address: {ws.house}, {ws.locality}, {ws.street}{ws.landmark ? `, ${ws.landmark}` : ''}</span><br />
                        <span style={{ color: '#aaa', fontSize: 13 }}>GPS: {ws.gps}</span><br />
                        <span style={{ color: '#0ff', fontWeight: 'bold' }}>₹{ws.price}</span>
                      </div>
                    ))}
                    <button type="submit" style={{ marginTop: 8, background: '#0f0', color: '#111', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}>Accept Selected Sessions</button>
                  </>
                )}
              </div>
            )}
          </form>
        )
      )}
    </div>
  );
};

export default CleaningServices; 