import React, { useState, useMemo } from "react";
import {
  ShieldCheck, ShieldAlert, Store, User, LayoutGrid, Search, Scale, GitCompare,
  MessageSquare, FileText, Truck, Clock, CheckCircle2, XCircle, AlertTriangle,
  Package, Plus, X, ChevronRight, Send, Wallet, TrendingUp, BadgeCheck, Upload,
  CreditCard, Landmark, Smartphone, Banknote, Trash2, Pencil, Link2, Copy, Share2,
  LogOut, Mail, Lock, Phone, UserPlus, LogIn,
} from "lucide-react";

/* ---------------------------------------------------------------
   Alaji Baba — prototype fonctionnel (front-end + logique mockée)
   Trois espaces : Acheteur / Vendeur / Administrateur
   Aucune donnée n'est persistée : tout vit en mémoire (useState).
---------------------------------------------------------------- */

const NAVY = "#2B2B2B";
const ORANGE = "#FF6A00";
const ORANGE_DARK = "#E8560A";

const initialProducts = [
  { id: "p1", name: "Groupe électrogène diesel 20 kVA", seller: "s1", sellerName: "SODEM Industries", price: 2350000, unit: "unité", moq: 1, category: "Énergie",
    specs: { Puissance: "20 kVA", Carburant: "Diesel", Démarrage: "Électrique", Garantie: "12 mois" }, img: "⚡" },
  { id: "p2", name: "Carreaux céramique 60x60 (lot de 20m²)", seller: "s1", sellerName: "SODEM Industries", price: 185000, unit: "lot", moq: 5, category: "Construction",
    specs: { Finition: "Poli", Épaisseur: "9mm", Origine: "Espagne", Résistance: "PEI IV" }, img: "🧱" },
  { id: "p3", name: "Sacs de riz parfumé 25kg", seller: "s2", sellerName: "Yélé Négoce", price: 21000, unit: "sac", moq: 10, category: "Agroalimentaire",
    specs: { Variété: "Basmati", Conditionnement: "25kg", Origine: "Thaïlande", Stockage: "Sec, ventilé" }, img: "🌾" },
  { id: "p4", name: "Panneaux solaires monocristallins 450W", seller: "s2", sellerName: "Yélé Négoce", price: 145000, unit: "panneau", moq: 4, category: "Énergie",
    specs: { Puissance: "450W", Type: "Monocristallin", Garantie: "25 ans", Rendement: "21.5%" }, img: "☀️" },
  { id: "p5", name: "Motopompe agricole 5.5CV", seller: "s3", sellerName: "Faso AgriTech", price: 178000, unit: "unité", moq: 1, category: "Agriculture",
    specs: { Puissance: "5.5 CV", Débit: "36 m³/h", Carburant: "Essence", Garantie: "6 mois" }, img: "🚜" },
];

const initialSellers = [
  { id: "s1", name: "SODEM Industries", status: "verified", docs: ["CNI gérant", "RCCM"], joined: "Mar. 2025", payout: { method: "Mobile Money (Orange)", details: "+225 07 00 00 00 01" } },
  { id: "s2", name: "Yélé Négoce", status: "verified", docs: ["Passeport gérant", "RCCM", "Attestation fiscale"], joined: "Juin 2025", payout: null },
  { id: "s3", name: "Faso AgriTech", status: "pending", docs: ["CNI gérant", "RCCM"], joined: "Il y a 2 jours", payout: null },
];

// Moyens de paiement acceptés côté plateforme (modifiables par l'admin)
const initialPaymentMethods = [
  { id: "m1", name: "Orange Money", type: "Mobile Money", active: true },
  { id: "m2", name: "Wave", type: "Mobile Money", active: true },
  { id: "m3", name: "MTN Mobile Money", type: "Mobile Money", active: true },
  { id: "m4", name: "Virement bancaire", type: "Banque", active: true },
  { id: "m5", name: "Carte bancaire (Visa/Mastercard)", type: "Carte", active: false },
];

const money = (n) => n.toLocaleString("fr-FR") + " F";
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const shopLink = (seller) => `alajibaba.com/boutique/${slugify(seller.name)}`;
const platformLink = "alajibaba.com";

function CopyLink({ link, label }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText("https://" + link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F7F8FA", border: "1px solid #E6E8EC", borderRadius: 7, padding: "8px 10px" }}>
      <Link2 size={14} color={ORANGE} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 12.5, color: NAVY, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{link}</span>
      <Button variant="ghost" style={{ padding: "5px 9px", fontSize: 11.5, flexShrink: 0 }} onClick={doCopy}>{copied ? <><CheckCircle2 size={12} />{label ? "Copié" : "Copié"}</> : <><Copy size={12} />Copier</>}</Button>
    </div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#F1F3F6", fg: "#3B4457" },
    success: { bg: "#E9F7EE", fg: "#1B7A43" },
    warning: { bg: "#FFF4E5", fg: "#B5610C" },
    danger: { bg: "#FDECEC", fg: "#C4302B" },
    orange: { bg: "#FDEBDD", fg: ORANGE },
    navy: { bg: "#E7EBF2", fg: NAVY },
  };
  const t = tones[tone];
  return (
    <span style={{ background: t.bg, color: t.fg, fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Card({ children, style, ...rest }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E6E8EC", borderRadius: 10, ...style }} {...rest}>
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", style, disabled }) {
  const variants = {
    primary: { background: ORANGE, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: NAVY, border: "1px solid #D7DCE4" },
    navy: { background: NAVY, color: "#fff", border: "none" },
    danger: { background: "#fff", color: "#C4302B", border: "1px solid #F3C6C4" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant], padding: "9px 16px", borderRadius: 7, fontSize: 13.5, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: "inherit",
        display: "inline-flex", alignItems: "center", gap: 6, ...style,
      }}
    >
      {children}
    </button>
  );
}

function EscrowTimeline({ order }) {
  const steps = [
    { key: "paid", label: "Paiement reçu (séquestre)" },
    { key: "shipped", label: "Expédié" },
    { key: "delivered", label: "Livré" },
    { key: "released", label: order.disputed ? "Litige en cours" : "Fonds libérés au vendeur" },
  ];
  const idx = steps.findIndex((s) => s.key === order.stage);
  return (
    <div style={{ display: "flex", gap: 0, marginTop: 10 }}>
      {steps.map((s, i) => (
        <div key={s.key} style={{ flex: 1, textAlign: "center", position: "relative" }}>
          <div style={{
            height: 4, background: i <= idx ? (order.disputed && s.key === "released" ? "#C4302B" : ORANGE) : "#E6E8EC",
            marginBottom: 6, borderRadius: 2,
          }} />
          <div style={{ fontSize: 10.5, color: i <= idx ? NAVY : "#9AA3B2", fontWeight: i === idx ? 700 : 500 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------- ACHETEUR ---------------------------- */

function BuyerView({ products, sellers, orders, setOrders, messages, setMessages, view, setView }) {
  const [compare, setCompare] = useState([]);
  const [search, setSearch] = useState("");
  const [rfqProduct, setRfqProduct] = useState(null);
  const [rfqText, setRfqText] = useState("");
  const [chatOpen, setChatOpen] = useState(null);
  const [chatText, setChatText] = useState("");
  const [shopSeller, setShopSeller] = useState(null);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggleCompare = (id) => {
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));
  };

  const buy = (product) => {
    const seller = sellers.find((s) => s.id === product.seller);
    if (seller.status !== "verified") return;
    const order = {
      id: "o" + Math.random().toString(36).slice(2, 7),
      product, sellerId: seller.id, sellerName: seller.name,
      amount: product.price, commission: Math.round(product.price * 0.01),
      stage: "paid", disputed: false, createdAt: "à l'instant", paidOut: false,
    };
    setOrders((o) => [order, ...o]);
    setView("orders");
  };

  const confirmReceipt = (id) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, stage: "released" } : o)));
  const openDispute = (id) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, disputed: true, stage: "released" } : o)));

  const sendRfq = () => {
    if (!rfqText.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), thread: rfqProduct.seller, from: "Vous (Acheteur)", text: `[Demande de devis — ${rfqProduct.name}] ${rfqText}`, type: "rfq" }]);
    setRfqText(""); setRfqProduct(null);
  };
  const sendChat = (sellerId) => {
    if (!chatText.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), thread: sellerId, from: "Vous (Acheteur)", text: chatText }]);
    setChatText("");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["catalog", "Catalogue", LayoutGrid], ["orders", "Mes commandes", Package], ["messages", "Messagerie", MessageSquare]].map(([k, l, Icon]) => (
          <button key={k} onClick={() => setView(k)} style={{
            padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
            background: view === k ? NAVY : "#F1F3F6", color: view === k ? "#fff" : "#3B4457", display: "flex", alignItems: "center", gap: 6,
          }}><Icon size={15} />{l}{k === "orders" && orders.length > 0 && <Badge tone={view === k ? "orange" : "neutral"}>{orders.length}</Badge>}</button>
        ))}
      </div>

      {view === "catalog" && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: "#9AA3B2" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit…"
                style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8, border: "1px solid #D7DCE4", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            {compare.length > 0 && <Badge tone="orange"><GitCompare size={12} /> {compare.length} sélectionné(s) pour comparaison</Badge>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
            {filtered.map((p) => {
              const seller = sellers.find((s) => s.id === p.seller);
              return (
                <Card key={p.id} style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 34, textAlign: "center", background: "#F7F8FA", borderRadius: 8, padding: "14px 0" }}>{p.img}</div>
                  <div style={{ fontSize: 11, color: "#9AA3B2", fontWeight: 600 }}>{p.category}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: ORANGE }}>{money(p.price)} <span style={{ fontSize: 11, fontWeight: 500, color: "#9AA3B2" }}>/ {p.unit} · MOQ {p.moq}</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#3B4457" }}>
                    <span onClick={() => setShopSeller(seller)} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", textDecoration: "underline", textDecorationColor: "transparent" }} onMouseEnter={(e) => e.currentTarget.style.textDecorationColor = ORANGE} onMouseLeave={(e) => e.currentTarget.style.textDecorationColor = "transparent"}>
                      <Store size={13} /> {p.sellerName}
                    </span>
                    {seller.status === "verified" ? <Badge tone="success"><ShieldCheck size={11} />Vérifié</Badge> : <Badge tone="warning"><ShieldAlert size={11} />En attente</Badge>}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                    <Button style={{ flex: 1, fontSize: 12.5, padding: "7px 10px" }} onClick={() => buy(p)} disabled={seller.status !== "verified"}><Wallet size={13} />Acheter (séquestre)</Button>
                    <Button variant="ghost" style={{ padding: "7px 9px" }} onClick={() => toggleCompare(p.id)}><GitCompare size={13} /></Button>
                    <Button variant="ghost" style={{ padding: "7px 9px" }} onClick={() => setRfqProduct(p)}><FileText size={13} /></Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {compare.length > 1 && (
            <Card style={{ marginTop: 20, padding: 16, overflowX: "auto" }}>
              <div style={{ fontWeight: 700, color: NAVY, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Scale size={16} color={ORANGE} />Comparateur de produits</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead><tr>
                  <td style={{ padding: 6, color: "#9AA3B2" }}></td>
                  {compare.map((id) => { const p = products.find((x) => x.id === id); return <td key={id} style={{ padding: 6, fontWeight: 700, color: NAVY }}>{p.name}</td>; })}
                </tr></thead>
                <tbody>
                  <tr style={{ borderTop: "1px solid #EEE" }}><td style={{ padding: 6, color: "#9AA3B2" }}>Prix</td>{compare.map((id) => { const p = products.find((x) => x.id === id); return <td key={id} style={{ padding: 6, fontWeight: 700, color: ORANGE }}>{money(p.price)}</td>; })}</tr>
                  {Object.keys(products.find((x) => x.id === compare[0]).specs).map((k) => (
                    <tr key={k} style={{ borderTop: "1px solid #EEE" }}>
                      <td style={{ padding: 6, color: "#9AA3B2" }}>{k}</td>
                      {compare.map((id) => { const p = products.find((x) => x.id === id); return <td key={id} style={{ padding: 6 }}>{p.specs[k] || "—"}</td>; })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      {view === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.length === 0 && <div style={{ color: "#9AA3B2", fontSize: 14 }}>Aucune commande pour le moment.</div>}
          {orders.map((o) => (
            <Card key={o.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, color: NAVY }}>{o.product.name}</div>
                  <div style={{ fontSize: 12, color: "#9AA3B2" }}>Vendeur : {o.sellerName} · Commande {o.createdAt}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: ORANGE }}>{money(o.amount)}</div>
                  {o.disputed ? <Badge tone="danger"><AlertTriangle size={11} />Litige ouvert</Badge> : o.stage === "released" ? <Badge tone="success"><CheckCircle2 size={11} />Fonds libérés</Badge> : <Badge tone="orange"><Clock size={11} />En séquestre</Badge>}
                </div>
              </div>
              <EscrowTimeline order={o} />
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                {o.stage !== "shipped" && o.stage === "paid" && <Button variant="ghost" onClick={() => setOrders((os) => os.map((x) => x.id === o.id ? { ...x, stage: "shipped" } : x))}><Truck size={13} />(Démo) Marquer expédié</Button>}
                {o.stage === "shipped" && <Button variant="ghost" onClick={() => setOrders((os) => os.map((x) => x.id === o.id ? { ...x, stage: "delivered" } : x))}><Package size={13} />(Démo) Marquer livré</Button>}
                {o.stage === "delivered" && !o.disputed && <>
                  <Button onClick={() => confirmReceipt(o.id)}><CheckCircle2 size={13} />Confirmer réception</Button>
                  <Button variant="danger" onClick={() => openDispute(o.id)}><AlertTriangle size={13} />Ouvrir un litige</Button>
                </>}
                {o.stage === "released" && !o.disputed && <div style={{ fontSize: 12, color: "#1B7A43", display: "flex", alignItems: "center", gap: 5 }}><CheckCircle2 size={13} />Commission plateforme perçue : {money(o.commission)}</div>}
                {o.disputed && <div style={{ fontSize: 12, color: "#C4302B" }}>En attente d'arbitrage par l'administrateur…</div>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {view === "messages" && (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
          <Card style={{ padding: 8 }}>
            {sellers.map((s) => (
              <div key={s.id} onClick={() => setChatOpen(s.id)} style={{ padding: 10, borderRadius: 6, cursor: "pointer", background: chatOpen === s.id ? "#F1F3F6" : "transparent", fontSize: 13.5, fontWeight: 600, color: NAVY }}>{s.name}</div>
            ))}
          </Card>
          <Card style={{ padding: 14, minHeight: 260, display: "flex", flexDirection: "column" }}>
            {!chatOpen ? <div style={{ color: "#9AA3B2", fontSize: 13, margin: "auto" }}>Sélectionnez un vendeur pour discuter (traduction automatique multilingue simulée).</div> : (
              <>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                  {messages.filter((m) => m.thread === chatOpen).length === 0 && <div style={{ color: "#9AA3B2", fontSize: 12.5 }}>Aucun message pour l'instant.</div>}
                  {messages.filter((m) => m.thread === chatOpen).map((m) => (
                    <div key={m.id} style={{ alignSelf: m.from.includes("Vous") ? "flex-end" : "flex-start", background: m.from.includes("Vous") ? "#FDEBDD" : "#F1F3F6", padding: "7px 11px", borderRadius: 10, fontSize: 13, maxWidth: "80%" }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "#9AA3B2", marginBottom: 2 }}>{m.from}</div>{m.text}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Écrire un message…" style={{ flex: 1, padding: "9px 12px", borderRadius: 7, border: "1px solid #D7DCE4", fontSize: 13, fontFamily: "inherit" }} onKeyDown={(e) => e.key === "Enter" && sendChat(chatOpen)} />
                  <Button onClick={() => sendChat(chatOpen)}><Send size={13} /></Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {rfqProduct && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(18,33,58,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <Card style={{ padding: 20, width: 380 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: NAVY }}>Demande de devis</div>
              <X size={16} style={{ cursor: "pointer" }} onClick={() => setRfqProduct(null)} />
            </div>
            <div style={{ fontSize: 12.5, color: "#9AA3B2", marginBottom: 10 }}>{rfqProduct.name} — {rfqProduct.sellerName}</div>
            <textarea value={rfqText} onChange={(e) => setRfqText(e.target.value)} rows={4} placeholder="Quantité souhaitée, délai, personnalisation…"
              style={{ width: "100%", padding: 10, borderRadius: 7, border: "1px solid #D7DCE4", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", resize: "none" }} />
            <Button style={{ marginTop: 10, width: "100%", justifyContent: "center" }} onClick={sendRfq}><Send size={13} />Envoyer la demande</Button>
          </Card>
        </div>
      )}

      {shopSeller && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(18,33,58,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <Card style={{ padding: 20, width: 460, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <div style={{ fontWeight: 800, color: NAVY, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Store size={17} color={ORANGE} />{shopSeller.name}
                  {shopSeller.status === "verified" ? <Badge tone="success"><ShieldCheck size={11} />Vérifié</Badge> : <Badge tone="warning">En attente</Badge>}
                </div>
                <div style={{ fontSize: 12, color: "#9AA3B2", marginTop: 2 }}>Membre depuis {shopSeller.joined}</div>
              </div>
              <X size={16} style={{ cursor: "pointer" }} onClick={() => setShopSeller(null)} />
            </div>
            <div style={{ margin: "14px 0" }}><CopyLink link={shopLink(shopSeller)} /></div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Produits de cette boutique</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {products.filter((p) => p.seller === shopSeller.id).map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#F7F8FA", borderRadius: 7 }}>
                  <div style={{ fontSize: 20 }}>{p.img}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>{p.name}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: ORANGE }}>{money(p.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- VENDEUR ---------------------------- */

function SellerView({ sellers, setSellers, products, setProducts, orders, view, setView, paymentMethods, sellerId }) {
  const me = sellers.find((s) => s.id === sellerId) || sellers[0];
  const myProducts = products.filter((p) => p.seller === me.id);
  const myOrders = orders.filter((o) => o.sellerId === me.id);
  const [newProduct, setNewProduct] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", unit: "unité", moq: 1, category: "" });
  const [payoutForm, setPayoutForm] = useState(me.payout || { method: paymentMethods.find((m) => m.active)?.name || "", details: "" });
  const [payoutSaved, setPayoutSaved] = useState(false);

  const availableBalance = myOrders.filter((o) => o.stage === "released" && !o.disputed && !o.paidOut).reduce((s, o) => s + (o.amount - o.commission), 0);
  const totalWithdrawn = myOrders.filter((o) => o.paidOut).reduce((s, o) => s + (o.amount - o.commission), 0);

  const savePayout = () => {
    if (!payoutForm.method || !payoutForm.details) return;
    setSellers((ss) => ss.map((s) => (s.id === me.id ? { ...s, payout: payoutForm } : s)));
    setPayoutSaved(true);
    setTimeout(() => setPayoutSaved(false), 2000);
  };

  const addProduct = () => {
    if (!form.name || !form.price) return;
    setProducts((ps) => [...ps, { id: "p" + Date.now(), seller: me.id, sellerName: me.name, price: Number(form.price), unit: form.unit, moq: Number(form.moq) || 1, category: form.category || "Divers", specs: {}, img: "📦", name: form.name }]);
    setForm({ name: "", price: "", unit: "unité", moq: 1, category: "" }); setNewProduct(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["overview", "Statut & vérification", ShieldCheck], ["products", "Mes produits", Package], ["orders", "Commandes reçues", Truck], ["payout", "Paiement & retraits", Wallet]].map(([k, l, Icon]) => (
          <button key={k} onClick={() => setView(k)} style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, background: view === k ? NAVY : "#F1F3F6", color: view === k ? "#fff" : "#3B4457", display: "flex", alignItems: "center", gap: 6 }}><Icon size={15} />{l}</button>
        ))}
      </div>

      {view === "overview" && (
        <Card style={{ padding: 20, maxWidth: 520 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: NAVY }}>{me.name}</div>
            {me.status === "verified" ? <Badge tone="success"><BadgeCheck size={12} />Vendeur vérifié</Badge> : <Badge tone="warning"><Clock size={12} />En attente de validation</Badge>}
          </div>
          <div style={{ fontSize: 12.5, color: "#9AA3B2", marginBottom: 14 }}>Membre depuis {me.joined}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Lien de ma boutique</div>
          <div style={{ marginBottom: 14 }}><CopyLink link={shopLink(me)} /></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Documents soumis</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {me.docs.map((d) => <div key={d} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} color="#1B7A43" />{d}</div>)}
          </div>
          <Button variant="ghost"><Upload size={13} />Ajouter un document</Button>
          <div style={{ marginTop: 18, padding: 12, background: "#F7F8FA", borderRadius: 8, fontSize: 12.5, color: "#3B4457" }}>
            Commission plateforme : <strong>1 %</strong> prélevée automatiquement lors de la libération des fonds en séquestre.
          </div>
        </Card>
      )}

      {view === "products" && (
        <div>
          <Button style={{ marginBottom: 14 }} onClick={() => setNewProduct((v) => !v)}><Plus size={14} />Ajouter un produit</Button>
          {newProduct && (
            <Card style={{ padding: 16, marginBottom: 16, maxWidth: 420 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input placeholder="Nom du produit" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: 9, borderRadius: 6, border: "1px solid #D7DCE4", fontFamily: "inherit" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder="Prix (F CFA)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ flex: 1, padding: 9, borderRadius: 6, border: "1px solid #D7DCE4", fontFamily: "inherit" }} />
                  <input placeholder="MOQ" type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} style={{ width: 80, padding: 9, borderRadius: 6, border: "1px solid #D7DCE4", fontFamily: "inherit" }} />
                </div>
                <input placeholder="Catégorie" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ padding: 9, borderRadius: 6, border: "1px solid #D7DCE4", fontFamily: "inherit" }} />
                <Button onClick={addProduct}>Publier le produit</Button>
              </div>
            </Card>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 12 }}>
            {myProducts.map((p) => (
              <Card key={p.id} style={{ padding: 12 }}>
                <div style={{ fontSize: 26 }}>{p.img}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: NAVY, margin: "6px 0 2px" }}>{p.name}</div>
                <div style={{ color: ORANGE, fontWeight: 700, fontSize: 14 }}>{money(p.price)}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {view === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {myOrders.length === 0 && <div style={{ color: "#9AA3B2", fontSize: 14 }}>Aucune commande reçue pour l'instant.</div>}
          {myOrders.map((o) => (
            <Card key={o.id} style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: NAVY, fontSize: 13.5 }}>{o.product.name}</div>
                <div style={{ fontSize: 12, color: "#9AA3B2" }}>Montant séquestré : {money(o.amount)} · Vous recevrez {money(o.amount - o.commission)} après commission</div>
              </div>
              {o.disputed ? <Badge tone="danger">Litige</Badge> : o.paidOut ? <Badge tone="navy">Viré</Badge> : o.stage === "released" ? <Badge tone="success">Prêt à verser</Badge> : <Badge tone="orange">En séquestre</Badge>}
            </Card>
          ))}
        </div>
      )}

      {view === "payout" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><Wallet size={16} color={ORANGE} />Mon moyen de retrait</div>
            <div style={{ fontSize: 12, color: "#9AA3B2", marginBottom: 14 }}>Renseignez ou modifiez à tout moment le compte sur lequel l'administrateur vous verse vos fonds.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <select value={payoutForm.method} onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })} style={{ padding: 9, borderRadius: 6, border: "1px solid #D7DCE4", fontFamily: "inherit", fontSize: 13 }}>
                <option value="">Sélectionner un moyen…</option>
                {paymentMethods.filter((m) => m.active).map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
              <input placeholder="Numéro / IBAN / identifiant du compte" value={payoutForm.details} onChange={(e) => setPayoutForm({ ...payoutForm, details: e.target.value })} style={{ padding: 9, borderRadius: 6, border: "1px solid #D7DCE4", fontFamily: "inherit", fontSize: 13 }} />
              <Button onClick={savePayout}>{payoutSaved ? <><CheckCircle2 size={13} />Enregistré</> : "Enregistrer"}</Button>
            </div>
            {me.payout && <div style={{ marginTop: 14, padding: 10, background: "#F7F8FA", borderRadius: 7, fontSize: 12.5 }}>
              Actuellement enregistré : <strong>{me.payout.method}</strong> — {me.payout.details}
            </div>}
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>Solde</div>
            <div style={{ fontSize: 12, color: "#9AA3B2", marginBottom: 14 }}>Montants libérés du séquestre, nets de la commission de 1 %.</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: ORANGE }}>{money(availableBalance)}</div>
            <div style={{ fontSize: 12, color: "#9AA3B2", marginBottom: 14 }}>en attente de virement par l'administrateur</div>
            <div style={{ fontSize: 13, color: "#3B4457" }}>Déjà viré à ce jour : <strong>{money(totalWithdrawn)}</strong></div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- ADMIN ---------------------------- */

function AdminView({ sellers, setSellers, orders, setOrders, view, setView, paymentMethods, setPaymentMethods }) {
  const pending = sellers.filter((s) => s.status === "pending");
  const disputed = orders.filter((o) => o.disputed);
  const totalCommission = orders.filter((o) => o.stage === "released").reduce((sum, o) => sum + o.commission, 0);
  const inEscrow = orders.filter((o) => o.stage !== "released" || o.disputed).reduce((sum, o) => sum + o.amount, 0);
  const toPayOut = orders.filter((o) => o.stage === "released" && !o.disputed && !o.paidOut).reduce((sum, o) => sum + (o.amount - o.commission), 0);

  const validate = (id, status) => setSellers((ss) => ss.map((s) => (s.id === id ? { ...s, status } : s)));
  const resolveDispute = (id, resolution) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, disputed: false, resolution } : o)));
  const payoutSeller = (sellerId) => setOrders((os) => os.map((o) => (o.sellerId === sellerId && o.stage === "released" && !o.disputed && !o.paidOut ? { ...o, paidOut: true } : o)));

  const [newMethod, setNewMethod] = useState({ name: "", type: "Mobile Money" });
  const addMethod = () => {
    if (!newMethod.name.trim()) return;
    setPaymentMethods((ms) => [...ms, { id: "m" + Date.now(), name: newMethod.name, type: newMethod.type, active: true }]);
    setNewMethod({ name: "", type: "Mobile Money" });
  };
  const toggleMethod = (id) => setPaymentMethods((ms) => ms.map((m) => (m.id === id ? { ...m, active: !m.active } : m)));
  const removeMethod = (id) => setPaymentMethods((ms) => ms.filter((m) => m.id !== id));
  const methodIcon = (type) => (type === "Mobile Money" ? Smartphone : type === "Banque" ? Landmark : CreditCard);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["overview", "Vue d'ensemble", TrendingUp], ["sellers", "Vérification vendeurs", ShieldCheck], ["disputes", "Litiges", Scale], ["payments", "Paiements & retraits", Wallet]].map(([k, l, Icon]) => (
          <button key={k} onClick={() => setView(k)} style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, background: view === k ? NAVY : "#F1F3F6", color: view === k ? "#fff" : "#3B4457", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon size={15} />{l}
            {k === "sellers" && pending.length > 0 && <Badge tone="warning">{pending.length}</Badge>}
            {k === "disputes" && disputed.length > 0 && <Badge tone="danger">{disputed.length}</Badge>}
          </button>
        ))}
      </div>

      {view === "overview" && (
        <div>
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}><Share2 size={15} color={ORANGE} />Lien de la plateforme</div>
            <div style={{ fontSize: 12, color: "#9AA3B2", marginBottom: 10 }}>À partager pour publier ou faire connaître Alaji Baba.</div>
            <CopyLink link={platformLink} />
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
            <Card style={{ padding: 16 }}><div style={{ fontSize: 12, color: "#9AA3B2" }}>Fonds en séquestre</div><div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>{money(inEscrow)}</div></Card>
            <Card style={{ padding: 16 }}><div style={{ fontSize: 12, color: "#9AA3B2" }}>Commissions perçues (1%)</div><div style={{ fontSize: 22, fontWeight: 800, color: ORANGE }}>{money(totalCommission)}</div></Card>
            <Card style={{ padding: 16 }}><div style={{ fontSize: 12, color: "#9AA3B2" }}>Vendeurs vérifiés</div><div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>{sellers.filter((s) => s.status === "verified").length} / {sellers.length}</div></Card>
            <Card style={{ padding: 16 }}><div style={{ fontSize: 12, color: "#9AA3B2" }}>Litiges ouverts</div><div style={{ fontSize: 22, fontWeight: 800, color: disputed.length ? "#C4302B" : NAVY }}>{disputed.length}</div></Card>
          </div>
        </div>
      )}

      {view === "sellers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sellers.map((s) => (
            <Card key={s.id} style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, color: NAVY, display: "flex", alignItems: "center", gap: 8 }}>{s.name}
                  {s.status === "verified" && <Badge tone="success">Vérifié</Badge>}
                  {s.status === "pending" && <Badge tone="warning">En attente</Badge>}
                  {s.status === "rejected" && <Badge tone="danger">Rejeté</Badge>}
                </div>
                <div style={{ fontSize: 12, color: "#9AA3B2" }}>Documents : {s.docs.join(", ")}</div>
              </div>
              {s.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={() => validate(s.id, "verified")}><CheckCircle2 size={13} />Valider</Button>
                  <Button variant="danger" onClick={() => validate(s.id, "rejected")}><XCircle size={13} />Rejeter</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {view === "disputes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {disputed.length === 0 && <div style={{ color: "#9AA3B2", fontSize: 14 }}>Aucun litige en cours.</div>}
          {disputed.map((o) => (
            <Card key={o.id} style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, color: NAVY }}>{o.product.name}</div>
              <div style={{ fontSize: 12, color: "#9AA3B2", marginBottom: 10 }}>Vendeur : {o.sellerName} · Montant en séquestre : {money(o.amount)}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button onClick={() => resolveDispute(o.id, "seller")}>Libérer les fonds au vendeur</Button>
                <Button variant="ghost" onClick={() => resolveDispute(o.id, "buyer")}>Rembourser l'acheteur</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {view === "payments" && (
        <div>
          <Card style={{ padding: 16, marginBottom: 18 }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 2 }}>Total à verser aux vendeurs</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: ORANGE }}>{money(toPayOut)}</div>
          </Card>

          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 8 }}>Retraits vendeurs</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
            {sellers.map((s) => {
              const due = orders.filter((o) => o.sellerId === s.id && o.stage === "released" && !o.disputed && !o.paidOut).reduce((sum, o) => sum + (o.amount - o.commission), 0);
              return (
                <Card key={s.id} style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: NAVY }}>{s.name}</div>
                    {s.payout ? (
                      <div style={{ fontSize: 12, color: "#3B4457", display: "flex", alignItems: "center", gap: 5 }}><Smartphone size={12} />{s.payout.method} — {s.payout.details}</div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#C4302B" }}>Aucun moyen de retrait renseigné par le vendeur</div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontWeight: 700, color: due > 0 ? ORANGE : "#9AA3B2" }}>{money(due)}</div>
                    <Button disabled={due === 0 || !s.payout} onClick={() => payoutSeller(s.id)}><Banknote size={13} />Verser</Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 8 }}>Moyens de paiement de la plateforme</div>
          <div style={{ fontSize: 12, color: "#9AA3B2", marginBottom: 10 }}>Moyens proposés aux acheteurs pour payer et aux vendeurs pour être réglés. Activez, désactivez ou ajoutez-en un.</div>
          <Card style={{ padding: 6 }}>
            {paymentMethods.map((m) => {
              const Icon = methodIcon(m.type);
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 10px", borderBottom: "1px solid #F1F3F6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                    <Icon size={15} color={ORANGE} /><strong>{m.name}</strong><span style={{ color: "#9AA3B2", fontSize: 11.5 }}>{m.type}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {m.active ? <Badge tone="success">Actif</Badge> : <Badge tone="neutral">Inactif</Badge>}
                    <Button variant="ghost" style={{ padding: "5px 9px" }} onClick={() => toggleMethod(m.id)}>{m.active ? "Désactiver" : "Activer"}</Button>
                    <Trash2 size={15} style={{ cursor: "pointer", color: "#C4302B" }} onClick={() => removeMethod(m.id)} />
                  </div>
                </div>
              );
            })}
          </Card>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input placeholder="Nom du moyen de paiement (ex: Moov Money)" value={newMethod.name} onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })} style={{ flex: 1, padding: 9, borderRadius: 6, border: "1px solid #D7DCE4", fontFamily: "inherit", fontSize: 13 }} />
            <select value={newMethod.type} onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })} style={{ padding: 9, borderRadius: 6, border: "1px solid #D7DCE4", fontFamily: "inherit", fontSize: 13 }}>
              <option>Mobile Money</option><option>Banque</option><option>Carte</option>
            </select>
            <Button onClick={addMethod}><Plus size={13} />Ajouter</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- INSCRIPTION / CONNEXION ---------------------------- */

function AuthScreen({ sellers, setSellers, onLogin }) {
  const [tab, setTab] = useState("login");
  const [regType, setRegType] = useState("buyer");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", shopName: "", idDoc: "", bizDoc: "" });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const inputStyle = { width: "100%", padding: 10, borderRadius: 7, border: "1px solid #D7DCE4", fontFamily: "inherit", fontSize: 13.5, boxSizing: "border-box" };

  const submitLogin = () => {
    if (loginEmail === "balalima94@gmail.com" && loginPassword === "93998244Man") {
      onLogin({ role: "admin", sellerId: null });
    } else {
      setLoginError("Identifiants incorrects");
    }
  };

  const submitRegister = () => {
    if (!form.name || !form.email || !form.password) return;
    if (regType === "buyer") {
      onLogin({ role: "buyer", sellerId: null });
    } else {
      if (!form.shopName || !form.idDoc || !form.bizDoc) return;
      const id = "s" + Date.now();
      const newSeller = { id, name: form.shopName, status: "pending", docs: [form.idDoc, form.bizDoc], joined: "à l'instant", payout: null };
      setSellers((ss) => [...ss, newSeller]);
      onLogin({ role: "seller", sellerId: id });
    }
  };

  const quickLogins = [
    { label: "Acheteur (démo)", icon: User, session: { role: "buyer", sellerId: null } },
    { label: "Vendeur — SODEM (vérifié)", icon: Store, session: { role: "seller", sellerId: "s1" } },
    { label: "Vendeur — Faso AgriTech (en attente)", icon: Store, session: { role: "seller", sellerId: "s3" } },  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F6F8", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');`}</style>
      <Card style={{ width: 420, padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, fontFamily: "'Space Grotesk', sans-serif" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 16 }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 19, color: NAVY }}>Alaji Baba</span>
        </div>

        <div style={{ display: "flex", background: "#F1F3F6", borderRadius: 8, padding: 3, marginBottom: 18 }}>
          <button onClick={() => setTab("login")} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", background: tab === "login" ? "#fff" : "transparent", color: tab === "login" ? ORANGE : "#9AA3B2" }}><LogIn size={13} style={{ marginRight: 5, verticalAlign: -2 }} />Connexion</button>
          <button onClick={() => setTab("register")} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", background: tab === "register" ? "#fff" : "transparent", color: tab === "register" ? ORANGE : "#9AA3B2" }}><UserPlus size={13} style={{ marginRight: 5, verticalAlign: -2 }} />Inscription</button>
        </div>

        {tab === "login" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 10, top: 12, color: "#9AA3B2" }} />
                <input placeholder="Adresse e-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={{ ...inputStyle, paddingLeft: 32 }} />
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 10, top: 12, color: "#9AA3B2" }} />
                <input type="password" placeholder="Mot de passe" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={{ ...inputStyle, paddingLeft: 32 }} />
              </div>
            </div>
            <button onClick={submitLogin} style={{ width: "100%", padding: 10, borderRadius: 7, border: "none", background: "#1a2b4c", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 10 }}>Se connecter</button>
          {loginError && <div style={{ color: "red", fontSize: 12, marginBottom: 8 }}>{loginError}</div>}
          <div style={{ fontSize: 11, color: "#9AA3B2", marginBottom: 8 }}>Prototype de démonstration — utilisez un accès rapide ci-dessous :</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {quickLogins.map((q) => (
                <button key={q.label} onClick={() => onLogin(q.session)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 7, border: "1px solid #E6E8EC", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: NAVY, fontFamily: "inherit" }}>
                  <q.icon size={14} color={ORANGE} />{q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "register" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              <button onClick={() => setRegType("buyer")} style={{ flex: 1, padding: "8px 0", borderRadius: 7, border: regType === "buyer" ? `1.5px solid ${ORANGE}` : "1px solid #D7DCE4", background: regType === "buyer" ? "#FDEBDD" : "#fff", color: NAVY, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Je suis acheteur</button>
              <button onClick={() => setRegType("seller")} style={{ flex: 1, padding: "8px 0", borderRadius: 7, border: regType === "seller" ? `1.5px solid ${ORANGE}` : "1px solid #D7DCE4", background: regType === "seller" ? "#FDEBDD" : "#fff", color: NAVY, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Je suis vendeur</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input placeholder="Nom complet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input placeholder="Adresse e-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              <input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              <input type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />

              {regType === "seller" && (
                <>
                  <div style={{ height: 1, background: "#EEE", margin: "6px 0" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, display: "flex", alignItems: "center", gap: 5 }}><ShieldCheck size={13} color={ORANGE} />Vérification vendeur (obligatoire)</div>
                  <input placeholder="Nom de la boutique" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} style={inputStyle} />
                  <label style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: form.idDoc ? NAVY : "#9AA3B2" }}>
                    <CreditCard size={14} />{form.idDoc || "Pièce d'identité (cliquer pour joindre)"}
                    <input type="file" style={{ display: "none" }} onChange={(e) => setForm({ ...form, idDoc: e.target.files[0]?.name || "" })} />
                  </label>
                  <label style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: form.bizDoc ? NAVY : "#9AA3B2" }}>
                    <FileText size={14} />{form.bizDoc || "Document d'entreprise / RCCM (cliquer pour joindre)"}
                    <input type="file" style={{ display: "none" }} onChange={(e) => setForm({ ...form, bizDoc: e.target.files[0]?.name || "" })} />
                  </label>
                  <div style={{ fontSize: 11, color: "#9AA3B2" }}>Votre compte sera activé après validation de ces documents par l'administrateur.</div>
                </>
              )}

              <Button style={{ marginTop: 6, justifyContent: "center" }} onClick={submitRegister}><UserPlus size={14} />Créer mon compte</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------------------- APP ---------------------------- */

export default function App() {
  const [session, setSession] = useState(null); // { role, sellerId }
  const [role, setRole] = useState("buyer");
  const [products, setProducts] = useState(initialProducts);
  const [sellers, setSellers] = useState(initialSellers);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [buyerView, setBuyerView] = useState("catalog");
  const [sellerView, setSellerView] = useState("overview");
  const [adminView, setAdminView] = useState("overview");
  const [activeSellerId, setActiveSellerId] = useState("s1");

  const roles = [
    { key: "buyer", label: "Acheteur", icon: User },
    { key: "seller", label: "Vendeur", icon: Store },
    { key: "admin", label: "Administrateur", icon: ShieldCheck },
  ];

  if (!session) {
    return (
      <AuthScreen
        sellers={sellers}
        setSellers={setSellers}
        onLogin={(s) => {
          setSession(s);
          setRole(s.role);
          if (s.sellerId) setActiveSellerId(s.sellerId);
        }}
      />
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#F5F6F8", minHeight: "100vh", color: NAVY }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');`}</style>

      <div style={{ background: `linear-gradient(90deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: ORANGE, fontSize: 15 }}>A</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>Alaji Baba</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.18)", padding: 4, borderRadius: 9 }}>
            {roles.map((r) => (
              <button key={r.key} onClick={() => setRole(r.key)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 7, border: "none", cursor: "pointer",
                background: role === r.key ? "#fff" : "transparent", color: role === r.key ? ORANGE_DARK : "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
              }}><r.icon size={14} />{r.label}</button>
            ))}
          </div>
          <button onClick={() => setSession(null)} title="Déconnexion" style={{ background: "rgba(255,255,255,0.18)", border: "none", borderRadius: 8, padding: "8px 9px", cursor: "pointer", color: "#fff", display: "flex" }}>
            <LogOut size={15} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 20px 60px" }}>
        <div style={{ fontSize: 11, color: "#9AA3B2", marginBottom: 4, fontWeight: 600, letterSpacing: 0.2 }}>
          Prototype interactif — démonstration du parcours {roles.find((r) => r.key === role).label.toLowerCase()} · aperçu des autres rôles disponible ci-dessus à des fins de démo
        </div>
        {role === "buyer" && <BuyerView products={products} sellers={sellers} orders={orders} setOrders={setOrders} messages={messages} setMessages={setMessages} view={buyerView} setView={setBuyerView} />}
        {role === "seller" && <SellerView sellers={sellers} setSellers={setSellers} products={products} setProducts={setProducts} orders={orders} view={sellerView} setView={setSellerView} paymentMethods={paymentMethods} sellerId={activeSellerId} />}
        {role === "admin" && <AdminView sellers={sellers} setSellers={setSellers} orders={orders} setOrders={setOrders} view={adminView} setView={setAdminView} paymentMethods={paymentMethods} setPaymentMethods={setPaymentMethods} />}
      </div>
    </div>
  );
}
