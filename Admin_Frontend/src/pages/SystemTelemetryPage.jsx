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
          <span className="inline-flex items-center gap-[0.3vw] px-[0.6vw] py-[0.15vw] rounded-full text-[0.66vw] font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#bbf7d0]">
            <span className="w-[0.35vw] h-[0.35vw] rounded-full bg-[#16A34A] status-pulse" />
            ONLINE
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-[0.3vw] px-[0.6vw] py-[0.15vw] rounded-full text-[0.66vw] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-[0.75vw] h-[0.75vw]" />
            DEGRADED
          </span>
        );
      case 'OFFLINE':
      default:
        return (
          <span className="inline-flex items-center gap-[0.3vw] px-[0.6vw] py-[0.15vw] rounded-full text-[0.66vw] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-[0.75vw] h-[0.75vw]" />
            OFFLINE
          </span>
        );
    }
  };

  const getLatencyColor = (latency) => {
    if (latency < 80) return 'text-[#16A34A] font-medium';
    if (latency < 300) return 'text-amber-600 font-medium';
    return 'text-rose-600 font-medium';
  };

  return (
    <div className="space-y-[1.2vw]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.35vw] font-semibold text-gray-800 tracking-tight flex items-center gap-[0.5vw]">
            <Activity className="w-[1.25vw] h-[1.25vw] text-[#ec5137]" />
            <span>Microservices Cluster Telemetry</span>
          </h1>
          <p className="text-[0.74vw] text-gray-500 font-normal mt-[0.25vw]">
            Real-time ping monitor for all 10 FlipiBook microservices and gateway instances
          </p>
        </div>

        <div className="flex items-center gap-[0.65vw]">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-[0.45vw] bg-white border border-gray-200 shadow-xs rounded-[0.5vw] px-[0.7vw] py-[0.35vw] text-[0.75vw]">
            <Radio className={`w-[0.85vw] h-[0.85vw] ${autoRefresh ? 'text-[#16A34A] animate-pulse' : 'text-gray-400'}`} />
            <span className="text-gray-700 font-medium">Auto-poll</span>
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
                className="bg-[#f8f9fa] text-gray-800 text-[0.72vw] rounded px-[0.35vw] py-[0.1vw] border border-gray-200 outline-none ml-[0.2vw] cursor-pointer"
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
            className="flex items-center gap-[0.45vw] px-[0.85vw] py-[0.42vw] rounded-[0.5vw] text-[0.78vw] font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-[0.9vw] h-[0.9vw] text-[#ec5137] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[0.9vw]">
        <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-[0.72vw] font-medium tracking-tight">
            <span>Cluster Services</span>
            <Server className="w-[1vw] h-[1vw] text-blue-500" />
          </div>
          <div className="mt-[0.4vw] flex items-baseline gap-[0.4vw]">
            <span className="text-[1.5vw] font-semibold text-gray-800 leading-tight">{services.length}</span>
            <span className="text-[0.72vw] text-gray-500 font-normal">Nodes registered</span>
          </div>
        </div>

        <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-[0.72vw] font-medium tracking-tight">
            <span>Operational</span>
            <CheckCircle2 className="w-[1vw] h-[1vw] text-[#16A34A]" />
          </div>
          <div className="mt-[0.4vw] flex items-baseline gap-[0.4vw]">
            <span className="text-[1.5vw] font-semibold text-[#16A34A] leading-tight">{onlineCount}</span>
            <span className="text-[0.72vw] text-gray-500 font-normal">/ {services.length} Healthy</span>
          </div>
        </div>

        <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-[0.72vw] font-medium tracking-tight">
            <span>Degraded / Offline</span>
            <XCircle className="w-[1vw] h-[1vw] text-rose-500" />
          </div>
          <div className="mt-[0.4vw] flex items-baseline gap-[0.4vw]">
            <span className="text-[1.5vw] font-semibold text-rose-600 leading-tight">{offlineCount + degradedCount}</span>
            <span className="text-[0.72vw] text-gray-500 font-normal">Nodes require attention</span>
          </div>
        </div>

        <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-[0.72vw] font-medium tracking-tight">
            <span>Avg Response Latency</span>
            <Zap className="w-[1vw] h-[1vw] text-amber-500" />
          </div>
          <div className="mt-[0.4vw] flex items-baseline gap-[0.4vw]">
            <span className="text-[1.5vw] font-semibold text-gray-800 leading-tight">{avgLatency}</span>
            <span className="text-[0.72vw] text-gray-500 font-normal">ms across nodes</span>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[0.9vw]">
        {services.map((svc) => (
          <div
            key={svc.name}
            className={`bg-white rounded-[0.75vw] border p-[1.2vw] shadow-xs transition duration-150 flex flex-col justify-between ${
              svc.status === 'ONLINE'
                ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                : svc.status === 'DEGRADED'
                ? 'border-amber-200 bg-amber-50/20'
                : 'border-rose-200 bg-rose-50/20'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-[0.8vw]">
                <div className="flex items-center gap-[0.75vw]">
                  <div className={`p-[0.6vw] rounded-[0.5vw] border ${
                    svc.status === 'ONLINE'
                      ? 'bg-[#fff1ee] border-[#fecaca] text-[#ec5137]'
                      : svc.status === 'DEGRADED'
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-rose-50 border-rose-200 text-rose-600'
                  }`}>
                    <Cpu className="w-[1.1vw] h-[1.1vw]" />
                  </div>
                  <div>
                    <h3 className="text-[0.88vw] font-medium text-gray-800">
                      {svc.name}
                    </h3>
                    <p className="text-[0.7vw] text-gray-400 font-mono mt-[0.1vw]">
                      Port :{svc.port}
                    </p>
                  </div>
                </div>

                {getStatusBadge(svc.status)}
              </div>

              {/* Endpoint URI */}
              <div className="mt-[0.9vw] p-[0.6vw] rounded-[0.5vw] bg-[#f8f9fa] border border-[#f0f2f5] font-mono text-[0.72vw] text-gray-600 flex items-center justify-between">
                <span className="truncate">{svc.url}</span>
                <span className="text-[0.65vw] uppercase font-medium text-gray-400 tracking-wider">HTTP</span>
              </div>
            </div>

            {/* Diagnostics Footer */}
            <div className="mt-[1vw] pt-[0.6vw] border-t border-gray-100 flex items-center justify-between text-[0.72vw]">
              <div className="flex items-center gap-[0.35vw] text-gray-500 font-mono">
                <Clock className="w-[0.8vw] h-[0.8vw] text-gray-400" />
                <span>Latency:</span>
                <span className={getLatencyColor(svc.latencyMs)}>
                  {svc.latencyMs !== undefined ? `${svc.latencyMs}ms` : '—'}
                </span>
              </div>

              <div className="text-[0.68vw] text-gray-400 font-normal">
                {svc.name === 'admin-service' ? 'Local Host' : 'Loopback Internal'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cluster Diagnostics Card */}
      <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] text-[0.74vw] text-gray-600 space-y-[0.4vw] shadow-sm">
        <div className="flex items-center gap-[0.4vw] text-gray-800 font-medium text-[0.85vw]">
          <ShieldCheck className="w-[1vw] h-[1vw] text-[#16A34A]" />
          <span>High Availability Diagnostic Information</span>
        </div>
        <p className="leading-relaxed font-normal">
          Each microservice implements an independent Express HTTP heartbeat handler mounted at <code className="text-[#ec5137] font-mono font-medium">/health</code>. The API Gateway forwards external requests while the Admin Service performs distributed polling to continuously assess cluster integrity.
        </p>
        <div className="text-gray-400 text-[0.7vw] font-normal">
          Last inspected: {timestamp ? timestamp.toLocaleTimeString() : 'Never'}
        </div>
      </div>
    </div>
  );
}
