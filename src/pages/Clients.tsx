import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Trash, Edit, Users, Building, Mail, Globe } from "lucide-react";
import { useApp } from "../lib/store";
import { CURRENCY_SYMBOLS } from "../types";
import type { Client } from "../types";

function ClientModal({ client, onClose }: { client?: Client; onClose: () => void }) {
  const { createClient, updateClient } = useApp();
  const [name, setName] = useState(client?.name || "");
  const [company, setCompany] = useState(client?.company || "");
  const [email, setEmail] = useState(client?.email || "");
  const [website, setWebsite] = useState(client?.website || "");
  const [phone, setPhone] = useState(client?.phone || "");
  const [notes, setNotes] = useState(client?.notes || "");

  const inputClass = "w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors";

  const handleSave = () => {
    if (!name.trim()) return;
    if (client) {
      updateClient(client.id, { name, company, email, website, phone, notes });
    } else {
      createClient({ name, company, email, website, phone, notes });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
        <h3 className="text-lg font-semibold text-foreground mb-5">{client ? "Edit client" : "Add new client"}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Name <span className="text-danger">*</span></label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Company</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="client@company.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Website</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://company.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Internal notes about this client..." className={`${inputClass} resize-none`} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={handleSave} disabled={!name.trim()} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
            {client ? "Save changes" : "Add client"}
          </button>
          <button onClick={onClose} className="flex-1 border border-border text-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Clients() {
  const { clients, proposals, deleteClient, user } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modalClient, setModalClient] = useState<Client | undefined | "new">(undefined);

  const currency = user?.currency || "INR";
  const sym = CURRENCY_SYMBOLS[currency] || "₹";

  const clientsWithStats = useMemo(() =>
    clients.map((c) => {
      const clientProposals = proposals.filter((p) => p.clientId === c.id || p.clientName === c.name);
      const accepted = clientProposals.filter((p) => p.status === "accepted");
      return {
        ...c,
        proposalCount: clientProposals.length,
        acceptedCount: accepted.length,
        totalValue: accepted.reduce((s, p) => s + p.price, 0),
        lastActivity: clientProposals.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]?.updatedAt,
      };
    }).filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    }),
    [clients, proposals, search]
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setModalClient("new")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>

      {clientsWithStats.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">{search ? `No results for "${search}"` : "No clients yet"}</h3>
          {!search && (
            <button onClick={() => setModalClient("new")} className="mt-3 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              Add first client
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientsWithStats.map((client) => (
            <div key={client.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center font-semibold text-primary text-sm">
                  {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModalClient(client)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteClient(client.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors">
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-0.5">{client.name}</h3>
              {client.company && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <Building className="w-3 h-3" /> {client.company}
                </div>
              )}
              <div className="space-y-1 mb-4">
                {client.email && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" /> {client.email}
                  </div>
                )}
                {client.website && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Globe className="w-3 h-3" /> {client.website.replace("https://", "")}
                  </div>
                )}
              </div>
              <div className="border-t border-border pt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-base font-bold text-foreground">{client.proposalCount}</p>
                  <p className="text-[10px] text-muted-foreground">Proposals</p>
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">{client.acceptedCount}</p>
                  <p className="text-[10px] text-muted-foreground">Accepted</p>
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">{client.totalValue > 0 ? `${sym}${(client.totalValue / 1000).toFixed(0)}k` : "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Won</p>
                </div>
              </div>
              {client.notes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground line-clamp-2">{client.notes}</p>
                </div>
              )}
              <button
                onClick={() => navigate(`/proposals?client=${client.id}`)}
                className="mt-3 w-full text-xs font-medium text-primary hover:underline"
              >
                View proposals →
              </button>
            </div>
          ))}
        </div>
      )}

      {(modalClient === "new" || (typeof modalClient === "object" && modalClient)) && (
        <ClientModal
          client={typeof modalClient === "object" ? modalClient : undefined}
          onClose={() => setModalClient(undefined)}
        />
      )}
    </div>
  );
}
