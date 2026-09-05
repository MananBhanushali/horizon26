"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, TrendingUp, Plus, Briefcase, ChevronRight } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";

export default function FirmDashboard() {
  const { clients, addClient, clientAUMs, clientAllocations } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Cumulative firm metrics
  const totalAUM = Object.values(clientAUMs).reduce((acc, aum) => acc + aum, 0);

  // Calculate cumulative allocations across firm
  const aggregateAllocations: Record<string, number> = {};
  Object.values(clientAllocations).forEach(alloc => {
    Object.entries(alloc).forEach(([category, val]) => {
      aggregateAllocations[category] = (aggregateAllocations[category] || 0) + val;
    });
  });

  const getPieSlicePaths = () => {
    const total = totalAUM || 1;
    let startAngle = 0;
    const paths = [];
    const colors = ["#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b"]; // Equity, Debt, Liquid, Gold
    let i = 0;
    for (const [cat, val] of Object.entries(aggregateAllocations)) {
      if (val <= 0) continue;
      const angle = (val / total) * 360;
      paths.push({ category: cat, value: val, startAngle, angle, color: colors[i % colors.length] });
      startAngle += angle;
      i++;
    }
    return paths;
  };

  const pieData = getPieSlicePaths();

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    addClient({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      personaId: "aditya", // Default persona for now
    });
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            Firm Dashboard
          </h1>
          <p className="text-sm text-[var(--color-ink-dim)] mt-1">
            Aggregate view of all managed client portfolios and risk exposure.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[var(--color-pill-dark)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-edge)] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[var(--color-ink-dim)] mb-2 font-medium text-sm">
              <Briefcase className="w-4 h-4" /> Total AUM
            </div>
            <div className="text-3xl font-bold text-[var(--color-ink)]">₹{(totalAUM / 10000000).toFixed(2)}Cr</div>
            <div className="text-xs text-[var(--color-mint-dim)] mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +4.2% this quarter
            </div>
          </div>

          <div className="bg-[var(--color-panel)] border border-[var(--color-edge)] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[var(--color-ink-dim)] mb-2 font-medium text-sm">
              <Users className="w-4 h-4" /> Active Clients
            </div>
            <div className="text-3xl font-bold text-[var(--color-ink)]">{clients.length}</div>
            <div className="text-xs text-[var(--color-ink-dim)] mt-2 font-medium">
              Manage your roster
            </div>
          </div>
        </div>

        {/* Allocation Ring Graph */}
        <div className="bg-[var(--color-panel)] border border-[var(--color-edge)] p-5 rounded-2xl shadow-sm flex flex-col justify-center items-center">
          <div className="text-sm font-medium text-[var(--color-ink-dim)] self-start mb-4">Firm Allocation</div>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-full relative"
                style={{
                  background: `conic-gradient(${pieData.map(d => `${d.color} ${d.startAngle}deg ${d.startAngle + d.angle}deg`).join(", ")})`
                }}
              >
                <div className="absolute inset-2 bg-[var(--color-panel)] rounded-full"></div>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                {pieData.map(d => (
                  <div key={d.category} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }}></div>
                    <div className="text-[var(--color-ink)]">{d.category}</div>
                    <div className="text-[var(--color-ink-dim)] font-medium">{Math.round(d.value / totalAUM * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-[var(--color-ink-dim)]">No assets</div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)] mb-4">Client Roster</h2>
        {clients.length === 0 ? (
          <div className="bg-[var(--color-grid)] border border-[var(--color-edge)] p-8 rounded-2xl text-center">
            <p className="text-[var(--color-ink-dim)]">No clients added yet.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-[var(--color-pill-dark)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90"
            >
              Add your first client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map(client => (
              <Link key={client.id} href={`/client/${client.id}`} className="block">
                <div className="bg-[var(--color-panel)] border border-[var(--color-edge)] p-5 rounded-2xl hover:border-[var(--color-cyan)] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-[var(--color-ink)]">{client.name}</div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-ink-dim)]" />
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex flex-col gap-1">
                       <div className="text-xs text-[var(--color-ink-dim)]">{client.email}</div>
                       <div className="text-[10px] text-[var(--color-mint-dim)] font-medium bg-[var(--color-mint-dim)]/10 px-1.5 py-0.5 rounded w-max">
                         XIRR: {client.personaId === 'aditya' ? '14.2' : client.personaId === 'priya' ? '12.8' : '11.5'}% vs Index: 12.0%
                       </div>
                    </div>
                    <div className="text-sm font-semibold text-[var(--color-mint-dim)]">
                      ₹{((clientAUMs[client.id] || 0) / 10000000).toFixed(2)}Cr
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-edge)] p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-ink)]">Add New Client</h3>
            <form onSubmit={handleAddClient} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase text-[var(--color-ink-dim)]">Client Name</span>
                <input required name="name" type="text" className="rounded-xl border border-[var(--color-edge)] bg-[var(--color-grid)] px-3 py-2 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-cyan)]" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase text-[var(--color-ink-dim)]">Email</span>
                <input required name="email" type="email" className="rounded-xl border border-[var(--color-edge)] bg-[var(--color-grid)] px-3 py-2 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-cyan)]" />
              </label>
              <div className="flex gap-2 justify-end mt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]">Cancel</button>
                <button type="submit" className="bg-[var(--color-pill-dark)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
