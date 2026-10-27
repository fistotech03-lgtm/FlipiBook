import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Cpu, 
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import { getMicroservicesHealth } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

export default function SystemTelemetryPage() {
  const { showToast } = useAdmin();
  const [services, setServices] = useState([]);
  const [timestamp, setTimestamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds

  const fetchHealth = async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const res = await getMicroservicesHealth();
      if (res.success) {
        setServices(res.services || []);
        setTimestamp(new Date(res.timestamp || Date.now()));
        if (isManual) showToast('Telemetry metrics refreshed', 'success');
      }
    } catch (err) {
      console.error('Failed to load services telemetry:', err);
      if (isManual) showToast('Could not fetch services health', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    let timer;
    if (autoRefresh) {
      timer = setInterval(() => {
        fetchHealth(false);
      }, refreshInterval * 1000);
    }
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval]);

  const onlineCount = services.filter((s) => s.status === 'ONLINE').length;
  const offlineCount = services.filter((s) => s.status === 'OFFLINE' || s.status === 'TIMEOUT').length;
  const degradedCount = services.filter((s) => s.status === 'DEGRADED').length;
  const avgLatency = services.length
    ? Math.round(
        services.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) / services.length
      )
    : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ONLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-pulse" />
            ONLINE
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            DEGRADED
          </span>
        );
      case 'OFFLINE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            OFFLINE
          </span>
        );
    }
  };

  const getLatencyColor = (latency) => {
    if (latency < 80) return 'text-emerald-600 font-bold';
    if (latency < 300) return 'text-amber-600 font-bold';
    return 'text-rose-600 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#ec5137]" />
            <span>Microservices Cluster Telemetry</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time ping monitor for all 10 FlipiBook microservices and gateway instances
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-2xs rounded-xl px-3 py-1.5 text-xs">
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-slate-700 font-medium">Auto-poll</span>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-[#ec5137] cursor-pointer"
            />
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-slate-50 text-slate-800 text-xs rounded px-1.5 py-0.5 border border-slate-200 outline-none ml-1 cursor-pointer"
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
              </select>
            )}
          </div>

          <button
            onClick={() => fetchHealth(true)}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#ec5137] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Cluster Services</span>
            <Server className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{services.length}</span>
            <span className="text-xs text-slate-500 font-medium">Nodes registered</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Operational</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{onlineCount}</span>
            <span className="text-xs text-slate-500 font-medium">/ {services.length} Healthy</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Degraded / Offline</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{offlineCount + degradedCount}</span>
            <span className="text-xs text-slate-500 font-medium">Nodes require attention</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Avg Response Latency</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{avgLatency}</span>
            <span className="text-xs text-slate-500 font-medium">ms across nodes</span>
          </div>
        </div>
      </div>

      {/* Services Grid (Clean White Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((svc) => (
          <div
            key={svc.name}
            className={`bg-white rounded-2xl border p-5 shadow-xs transition duration-150 flex flex-col justify-between ${
              svc.status === 'ONLINE'
                ? 'border-slate-200/90 hover:border-[#ec5137]/40 hover:shadow-sm'
                : svc.status === 'DEGRADED'
                ? 'border-amber-200 bg-amber-50/20'
                : 'border-rose-200 bg-rose-50/20'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    svc.status === 'ONLINE'
                      ? 'bg-slate-50 border-slate-200 text-[#ec5137]'
                      : svc.status === 'DEGRADED'
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-rose-50 border-rose-200 text-rose-600'
                  }`}>
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {svc.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Port :{svc.port}
                    </p>
                  </div>
                </div>

                {getStatusBadge(svc.status)}
              </div>

              {/* Endpoint URI */}
              <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-600 flex items-center justify-between">
                <span className="truncate">{svc.url}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">HTTP</span>
              </div>
            </div>

            {/* Diagnostics Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Latency:</span>
                <span className={getLatencyColor(svc.latencyMs)}>
                  {svc.latencyMs !== undefined ? `${svc.latencyMs}ms` : '—'}
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                {svc.name === 'admin-service' ? 'Local Host' : 'Loopback Internal'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cluster Diagnostics Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 text-xs text-slate-600 space-y-2 shadow-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>High Availability Diagnostic Information</span>
        </div>
        <p className="leading-relaxed">
          Each microservice implements an independent Express HTTP heartbeat handler mounted at <code className="text-[#ec5137] font-mono font-semibold">/health</code>. The API Gateway forwards external requests while the Admin Service performs distributed polling to continuously assess cluster integrity.
        </p>
        <div className="text-slate-400 text-[11px]">
          Last inspected: {timestamp ? timestamp.toLocaleTimeString() : 'Never'}
        </div>
      </div>
    </div>
  );
}
