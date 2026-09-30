"use client";

import { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import { Bell, Flame, Gauge, ShieldCheck, Siren, Droplets, Radio, Activity } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { db, firebaseConfigured } from "../lib/firebase";

type FireData = {
  smokeValue?: number;
  flameDetected?: boolean;
  fireStatus?: string;
  buzzerStatus?: boolean;
  relayStatus?: boolean;
  pumpStatus?: boolean;
  gsmStatus?: boolean;
  emergencyStatus?: boolean;
  timestamp?: number | string;
};

type Point = { time: string; smoke: number };

const initial: FireData = {};

function formatTime(value?: number | string) {
  if (!value) return "—";
  const date = new Date(typeof value === "number" ? value : Number(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function normalizeBoolean(value: unknown) {
  return value === true || value === 1 || value === "true" || value === "ON" || value === "on";
}

export default function Home() {
  const [data, setData] = useState<FireData>(initial);
  const [history, setHistory] = useState<Point[]>([]);
  const [page, setPage] = useState("Dashboard");
  const [firebaseError, setFirebaseError] = useState("");

  useEffect(() => {
    if (!firebaseConfigured || !db) return;
    const currentRef = ref(db, "fireSafety");
    return onValue(currentRef, snapshot => {
      const value = snapshot.val() as FireData | null;
      if (!value) return;
      setData(value);
      const smoke = Number(value.smokeValue ?? 0);
      setHistory(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString(), smoke }]);
      setFirebaseError("");
    }, error => setFirebaseError(error.message));
  }, []);

  const lastUpdate = data.timestamp ? new Date(Number(data.timestamp)).getTime() : 0;
  const online = Boolean(lastUpdate && Date.now() - lastUpdate < 30000);
  const smoke = Number(data.smokeValue ?? 0);
  const flame = normalizeBoolean(data.flameDetected);
  const status = String(data.fireStatus ?? (flame ? "FIRE DETECTED" : "SAFE")).toUpperCase();
  const danger = status.includes("FIRE") || status.includes("EMERGENCY");
  const warning = status.includes("WARNING");

  const statusClass = danger ? "danger" : warning ? "warning" : "";
  const statusText = online ? status : "DEVICE OFFLINE";

  const alerts = useMemo(() => {
    if (!online) return [{ title: "Device Offline", detail: "No recent ESP32 update received.", type: "warning" }];
    if (danger) return [{ title: "Fire detected!", detail: "Safety response status is active.", type: "danger" }];
    if (warning) return [{ title: "Warning: Smoke level is increasing", detail: "Review the current sensor reading.", type: "warning" }];
    return [{ title: "System is operating normally", detail: "No active fire condition reported by ESP32.", type: "normal" }];
  }, [online, danger, warning]);

  const nav = ["Dashboard", "Sensor Monitoring", "Alerts", "History", "System Information"];

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon"><Flame size={20}/></span><span>Fire Safety IoT</span></div>
        <nav className="nav">
          {nav.map(item => <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}>{item}</button>)}
        </nav>
      </aside>

      <section className="main">
        <header className="header">
          <div><div className="eyebrow">COLLEGE ENGINEERING PROJECT</div><h1>IoT-Based Fire Detection and Safety System</h1></div>
          <div className="device"><span className={`dot ${online ? "" : "offline"}`}/>{online ? "ESP32 Online" : "Device Offline"}</div>
        </header>

        {page !== "Dashboard" ? <div className="card"><h2>{page}</h2><p className="muted">This section is connected to the same live Firebase data source. Use the Dashboard for the live overview.</p></div> : <>
          <div className={`status-banner ${statusClass}`}>
            <div><div className={`status-title ${danger ? "danger-text" : warning ? "warning-text" : "safe"}`}>{statusText}</div><div className="status-sub">Last updated: {formatTime(data.timestamp)}</div></div>
            <span className={`status-pill ${statusClass}`}>{online ? "LIVE MONITORING" : "WAITING FOR DEVICE"}</span>
          </div>

          {firebaseError && <div className="card" style={{marginBottom:15}}><b className="danger-text">Firebase connection error:</b> {firebaseError}</div>}
          {!firebaseConfigured && <div className="card" style={{marginBottom:15}}><b>Firebase is not configured.</b> Add the NEXT_PUBLIC_FIREBASE_* environment variables before connecting the live ESP32 system. No fake sensor values are shown.</div>}

          <div className="grid">
            <div className="card"><h3>SMOKE / GAS</h3><div className="value">{online ? smoke : "—"}</div><div className={smoke > 700 ? "danger-text" : smoke > 400 ? "warning-text" : "safe"}>{online ? (smoke > 700 ? "Critical" : smoke > 400 ? "Warning" : "Normal") : "No live data"}</div></div>
            <div className="card"><h3>FLAME SENSOR</h3><div className={`value ${flame ? "danger-text" : "safe"}`}>{online ? (flame ? "DETECTED" : "CLEAR") : "—"}</div><div className="muted">ESP32 flame input</div></div>
            <div className="card"><h3>FIRE CONFIRMATION</h3><div className={`value ${danger ? "danger-text" : "safe"}`}>{online ? (danger ? "ACTIVE" : "CLEAR") : "—"}</div><div className="muted">Configured by ESP32 logic</div></div>
            <div className="card"><h3>LAST DETECTION</h3><div className="value" style={{fontSize:20}}>{formatTime(data.timestamp)}</div><div className="muted">Firebase timestamp</div></div>
          </div>

          <div className="section-grid">
            <div className="card"><h3>SMOKE / GAS HISTORY</h3><div className="chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={history}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="time" hide/><YAxis/><Tooltip/><Line type="monotone" dataKey="smoke" stroke="#2563eb" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div></div>
            <div className="card"><h3>SAFETY SYSTEM STATUS</h3><div className="actions">
              <div className="action-row"><span className="action-name"><Siren size={15}/> Buzzer</span><span className={`badge ${data.buzzerStatus ? "on" : ""}`}>{data.buzzerStatus ? "ON" : "OFF"}</span></div>
              <div className="action-row"><span className="action-name"><Radio size={15}/> Relay</span><span className={`badge ${data.relayStatus ? "on" : ""}`}>{data.relayStatus ? "ON" : "OFF"}</span></div>
              <div className="action-row"><span className="action-name"><Droplets size={15}/> Water Pump</span><span className={`badge ${data.pumpStatus ? "on" : ""}`}>{data.pumpStatus ? "ON" : "OFF"}</span></div>
              <div className="action-row"><span className="action-name"><Bell size={15}/> GSM Alert</span><span className={`badge ${data.gsmStatus ? "on" : ""}`}>{data.gsmStatus ? "SENT" : "NOT SENT"}</span></div>
              <div className="action-row"><span className="action-name"><ShieldCheck size={15}/> Emergency</span><span className={`badge ${data.emergencyStatus ? "on" : ""}`}>{data.emergencyStatus ? "ACTIVE" : "CLEAR"}</span></div>
            </div></div>
          </div>

          <div className="card alerts"><h3>REAL-TIME ALERTS</h3>{alerts.map((a, i) => <div className="alert" key={i}><div className={`alert-icon ${a.type === "danger" ? "danger" : a.type === "warning" ? "warning" : ""}`}><Activity size={16}/></div><div><strong>{a.title}</strong><span>{a.detail}</span></div></div>)}</div>
          <div className="footer-note">Live data source: Firebase Realtime Database → <b>/fireSafety</b>. Demo values are intentionally not generated.</div>
        </>}
      </section>
    </main>
  );
}
