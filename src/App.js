import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

// ═══════════════════════════════════════════════
// CONFIGURATION — Modifiez ici vos commerciales
// ═══════════════════════════════════════════════
const COMMERCIALES = [
  { nom: "Sarah Kouassi",   pass: "sarah123" },
  { nom: "Fatou Diallo",    pass: "fatou123" },
  { nom: "Aminata Traoré",  pass: "aminata123" },
  { nom: "Marie Konan",     pass: "marie123" },
  { nom: "Adjoua Bamba",    pass: "adjoua123" },
];
const ADMIN = { login: "admin", pass: "admin2024" };

const PRODUITS_PRIX = {
  "L'Acrose Anti acne cream 45 ml": 7470,
  "L'Acrose Face cleasing gel 250 ml": 6710,
  "L'Acrose Magic White cream 45": 9400,
  "L'Acrose savon extrait de riz": 3900,
  "L'Acrose Tea tree oil shower gel 400": 6120,
  "L'Acrose Vitamines C Sérum": 11000,
  "L'Acrose White pearl soap": 3900,
  "L'Acrose whitening body milk 500 ml": 10605,
  "L'Acrose Whitening serum30 ml": 8585,
  "L'Acrose creme LIFTANTE": 10500,
  "L'Acrose brume corporelle": 6500,
  "L'Acrose gel de douche au jasmin": 6120,
  "L'Acrose gel de douche À L'huile De Pépins De Grenade": 6120,
  "L'Acrose Hyaluronic serum": 9400,
  "L'Acrose collagene serum": 9400,
  "L'Acrose creme blanchissante (whitening cream)": 8585,
  "Silver Care BDB Chlorhexidine 0,20%": 3000,
  "SILVER CARE BROSSE ONE CARBON": 3900,
  "SILVER CARE PATE SENSITIVE": 2200,
  "SILVER CARE PATE WHITENING": 2200,
  "Helan Agrume latte nutriente lait": 9980,
  "Helan Agrume parfum": 12000,
  "Helan Crème solaire": 9400,
  "Helan Day DD cream": 10300,
  "Helan Di talco lait hydratant": 9980,
  "Helan Di talco Parfum": 12000,
  "Helan Eau micellaire": 8800,
  "Helan linea Bimba pan savon": 2700,
  "Helan linea Bimbi Acqua luigia eau de toilette": 6300,
  "Helan linea Bimbi Bagno fetal gel lavant 250 ml": 6500,
  "Helan linea Bimbi gel lavant 500 ml": 8500,
  "Helan linea Bimbi Natural cleansing lingette": 2900,
  "Helan linea Bimbi Pâte protectrice": 5900,
  "Helan linea Bimbi Silky liquid talk lait": 9980,
  "Helan linea Bimbi Dolcezza lait démaquillant": 8200,
  "Piave brosse Dentonet 6/24": 1500,
  "Piave brosse White & Dunn": 0,
  "Piave four fruits brosse JR 3+": 1900,
  "Piave four fruits kit (Pâte & brosse)": 2800,
  "Piave oxigen brosse hard": 1500,
  "Piave oxigen brosse medium": 1500,
  "Piave oxigen brosse soft": 1500,
  "Silver Care bain de bouche 250 ml": 3000,
  "Silver Care bain de bouche 500 ml": 3000,
  "Silver Care BDB Chlorhexidine 0,12%": 3000,
  "Silver Care brosse H2O Orthodontic": 2800,
  "Silver Care Brosse happy 6/36 mois": 1900,
  "Silver Care Brosse kid 2/6 ans": 1900,
  "Silver Care brosse ONE Sensitive": 3900,
  "Silver Care brosse ONE Whitening": 3900,
  "Silver Care Brosse teen 7/12 ans": 1900,
  "Silver Care brossette fin": 3300,
  "Silver Care brossette extra fin": 3300,
  "Silver Care brossettemedium": 3300,
  "Silver Care brossette large": 3300,
  "Silver Care Fil dentaire": 2000,
  "Silver Care kit (Brosse & Pâte)": 2800,
  "Silver Care Pâte kid": 1300,
  "Silver Care Pâte PHARMA PLUS MEDIUM": 2500,
  "Silver Care Pâte PHARMA PLUS SENSITIVE": 2500,
};
const PRODUITS = Object.keys(PRODUITS_PRIX);

const STORAGE_KEY = "pharmasales_data";

// ═══════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════
const fmt = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));
const today = () => new Date().toISOString().split("T")[0];
const emptyForm = () => ({
  date: today(), pharmacie: "", ville: "",
  lignes: [{ produit: "", quantite: "", prixUnitaire: "" }],
  notes: "",
});

const iS = {
  width: "100%", padding: "10px 13px", borderRadius: 9,
  border: "1.5px solid #cbd5e0", fontSize: 14, background: "white",
  boxSizing: "border-box", outline: "none",
};
const lS = { display: "block", fontSize: 13, fontWeight: 600, color: "#4a5568", marginBottom: 5 };
const tdS = { padding: "10px 14px", borderBottom: "1px solid #edf2f7", verticalAlign: "top" };

// ═══════════════════════════════════════════════
// STOCKAGE LOCAL (localStorage du navigateur)
// ═══════════════════════════════════════════════
const loadSales = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const saveSales = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};

// ═══════════════════════════════════════════════
// ÉCRAN DE CONNEXION
// ═══════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [role, setRole] = useState(null);
  const [nom, setNom] = useState("");
  const [pass, setPass] = useState("");
  const [adminLogin, setAdminLogin] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleComm = () => {
    const found = COMMERCIALES.find(c => c.nom === nom && c.pass === pass);
    if (found) { setError(""); onLogin({ role: "commerciale", nom: found.nom }); }
    else setError("Nom ou mot de passe incorrect.");
  };
  const handleAdmin = () => {
    if (adminLogin === ADMIN.login && pass === ADMIN.pass) { setError(""); onLogin({ role: "admin" }); }
    else setError("Identifiant ou mot de passe incorrect.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 430 }}>
        <div style={{ textAlign: "center", marginBottom: 32, color: "white" }}>
          <div style={{ fontSize: 56 }}>💊</div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 10, letterSpacing: 0.5 }}>DjamePharmaSales</div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 4 }}>Suivi des ventes en pharmacie</div>
        </div>

        {!role ? (
          <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ textAlign: "center", fontWeight: 800, fontSize: 17, color: "#1a365d", marginBottom: 24 }}>
              Choisissez votre profil
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <button onClick={() => { setRole("commerciale"); setError(""); }} style={{ padding: "18px 24px", borderRadius: 14, border: "2px solid #bee3f8", background: "#ebf8ff", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, textAlign: "left", transition: "all 0.2s" }}>
                <span style={{ fontSize: 40 }}>👩‍💼</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#2b6cb0" }}>Commerciale</div>
                  <div style={{ fontSize: 12, color: "#718096", marginTop: 3 }}>Saisir mes ventes du jour</div>
                </div>
              </button>
              <button onClick={() => { setRole("admin"); setError(""); }} style={{ padding: "18px 24px", borderRadius: 14, border: "2px solid #c6f6d5", background: "#f0fff4", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, textAlign: "left" }}>
                <span style={{ fontSize: 40 }}>🔐</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#276749" }}>Administrateur</div>
                  <div style={{ fontSize: 12, color: "#718096", marginTop: 3 }}>Tableau de bord & export Excel</div>
                </div>
              </button>
            </div>
          </div>
        ) : role === "commerciale" ? (
          <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <button onClick={() => { setRole(null); setError(""); setNom(""); setPass(""); }} style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", fontSize: 13, marginBottom: 18, display: "flex", alignItems: "center", gap: 5 }}>← Retour</button>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#2b6cb0", marginBottom: 22 }}>👩‍💼 Connexion Commerciale</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lS}>Votre nom</label>
                <select value={nom} onChange={e => setNom(e.target.value)} style={iS}>
                  <option value="">-- Sélectionnez votre nom --</option>
                  {COMMERCIALES.map(c => <option key={c.nom}>{c.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={lS}>Mot de passe</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleComm()} style={{ ...iS, paddingRight: 44 }} />
                  <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, opacity: 0.6 }}>{showPass ? "🙈" : "👁️"}</button>
                </div>
              </div>
              {error && <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 8, padding: "10px 14px", color: "#e53e3e", fontSize: 13 }}>⚠️ {error}</div>}
              <button onClick={handleComm} style={{ padding: "13px", background: "linear-gradient(135deg,#2b6cb0,#1a365d)", color: "white", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                Se connecter
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <button onClick={() => { setRole(null); setError(""); setAdminLogin(""); setPass(""); }} style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", fontSize: 13, marginBottom: 18, display: "flex", alignItems: "center", gap: 5 }}>← Retour</button>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#276749", marginBottom: 22 }}>🔐 Connexion Administrateur</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lS}>Identifiant</label>
                <input placeholder="admin" value={adminLogin} onChange={e => setAdminLogin(e.target.value)} style={iS} />
              </div>
              <div>
                <label style={lS}>Mot de passe</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdmin()} style={{ ...iS, paddingRight: 44 }} />
                  <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, opacity: 0.6 }}>{showPass ? "🙈" : "👁️"}</button>
                </div>
              </div>
              {error && <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 8, padding: "10px 14px", color: "#e53e3e", fontSize: 13 }}>⚠️ {error}</div>}
              <button onClick={handleAdmin} style={{ padding: "13px", background: "linear-gradient(135deg,#276749,#2f855a)", color: "white", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                Accéder au tableau de bord
              </button>
            </div>
          </div>
        )}
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 20 }}>DjamePharmaSales © 2025</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// INTERFACE COMMERCIALE
// ═══════════════════════════════════════════════
function CommercialInterface({ user, sales, onSubmit, onLogout }) {
  const [form, setForm] = useState(emptyForm());
  const [submitted, setSubmitted] = useState(false);

  const mesVentes = sales.filter(s => s.commerciale === user.nom);
  const totalForm = form.lignes.reduce((s, l) => s + (parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnitaire) || 0), 0);
  const caAujourdhui = mesVentes.filter(s => s.date === today()).reduce((s, e) => s + e.total, 0);
  const ventesAujourdhui = mesVentes.filter(s => s.date === today()).length;
  const caTotal = mesVentes.reduce((s, e) => s + e.total, 0);

  const addLigne = () => setForm(f => ({ ...f, lignes: [...f.lignes, { produit: "", quantite: "", prixUnitaire: "" }] }));
  const removeLigne = (i) => setForm(f => ({ ...f, lignes: f.lignes.filter((_, idx) => idx !== i) }));
  const updateLigne = (i, field, val) => setForm(f => {
    const lignes = [...f.lignes];
    lignes[i] = { ...lignes[i], [field]: val };
    if (field === "produit" && PRODUITS_PRIX[val] !== undefined) {
      lignes[i].prixUnitaire = String(PRODUITS_PRIX[val]);
    }
    return { ...f, lignes };
  });

  const handleSubmit = () => {
    if (!form.pharmacie || !form.date) return alert("⚠️ Renseignez la date et le nom de la pharmacie.");
    if (form.lignes.some(l => !l.produit || !l.quantite || !l.prixUnitaire)) return alert("⚠️ Complétez toutes les lignes de produits.");
    onSubmit({ ...form, commerciale: user.nom, total: totalForm });
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setForm(emptyForm()); }, 3000);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", minHeight: "100vh", background: "#edf2f7" }}>
      <div style={{ background: "linear-gradient(135deg,#2b6cb0,#1a365d)", color: "white" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>💊 DjamePharmaSales</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>Bonjour, <b>{user.nom}</b> 👋</div>
          </div>
          <button onClick={onLogout} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.6)", background: "transparent", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Déconnexion</button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: 20 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: "4px solid #2b6cb0" }}>
            <div style={{ fontSize: 11, color: "#718096", fontWeight: 700, textTransform: "uppercase" }}>Mon CA aujourd'hui</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#2b6cb0", marginTop: 8 }}>{fmt(caAujourdhui)} FCFA</div>
            <div style={{ fontSize: 12, color: "#a0aec0", marginTop: 4 }}>{ventesAujourdhui} visite{ventesAujourdhui > 1 ? "s" : ""}</div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: "4px solid #6b46c1" }}>
            <div style={{ fontSize: 11, color: "#718096", fontWeight: 700, textTransform: "uppercase" }}>Mon CA total</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#6b46c1", marginTop: 8 }}>{fmt(caTotal)} FCFA</div>
            <div style={{ fontSize: 12, color: "#a0aec0", marginTop: 4 }}>{mesVentes.length} visite{mesVentes.length > 1 ? "s" : ""} au total</div>
          </div>
        </div>

        {/* Formulaire */}
        {submitted ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 18, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 60 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#2b6cb0", marginTop: 16 }}>Rapport soumis !</div>
            <div style={{ color: "#718096", marginTop: 8 }}>Vos ventes ont bien été enregistrées.</div>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 18, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ background: "#ebf4ff", padding: "14px 24px", borderBottom: "1px solid #bee3f8" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#1a365d" }}>📋 Nouveau rapport de vente</div>
              <div style={{ fontSize: 13, color: "#4a5568", marginTop: 2 }}>Remplissez et soumettez en fin de journée</div>
            </div>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lS}>📅 Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={iS} />
                </div>
                <div>
                  <label style={lS}>📍 Ville / Quartier</label>
                  <input placeholder="ex: Cocody" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} style={iS} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={lS}>🏥 Nom de la pharmacie *</label>
                  <input placeholder="ex: Pharmacie du Plateau" value={form.pharmacie} onChange={e => setForm({ ...form, pharmacie: e.target.value })} style={iS} />
                </div>
              </div>

              <div>
                <label style={{ ...lS, fontSize: 14, fontWeight: 800, color: "#1a365d" }}>🛒 Produits vendus</label>
                <div style={{ background: "#f7fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1.2fr 1fr 28px", gap: 8, marginBottom: 8 }}>
                    {["Produit", "Qté", "Prix unit. (FCFA)", "Montant", ""].map(h => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</div>
                    ))}
                  </div>
                  {form.lignes.map((l, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1.2fr 1fr 28px", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <select value={l.produit} onChange={e => updateLigne(i, "produit", e.target.value)} style={{ ...iS, fontSize: 12 }}>
                        <option value="">-- Choisir --</option>
                        {PRODUITS.map(p => <option key={p}>{p}</option>)}
                      </select>
                      <input type="number" placeholder="0" min="0" value={l.quantite} onChange={e => updateLigne(i, "quantite", e.target.value)} style={{ ...iS, fontSize: 13 }} />
                      <input type="number" placeholder="0" min="0" value={l.prixUnitaire} readOnly style={{ ...iS, fontSize: 13, background: "#f0f4f8", color: "#2b6cb0", fontWeight: 700, cursor: "not-allowed" }} />
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#276749", textAlign: "right" }}>
                        {l.quantite && l.prixUnitaire ? fmt((parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnitaire) || 0)) + " F" : "—"}
                      </div>
                      {form.lignes.length > 1
                        ? <button onClick={() => removeLigne(i)} style={{ width: 24, height: 24, borderRadius: 5, background: "#fed7d7", border: "none", color: "#e53e3e", cursor: "pointer", fontWeight: 800 }}>✕</button>
                        : <div />}
                    </div>
                  ))}
                  <button onClick={addLigne} style={{ marginTop: 4, padding: "7px 0", background: "white", border: "2px dashed #90cdf4", borderRadius: 8, color: "#2b6cb0", fontWeight: 700, cursor: "pointer", width: "100%", fontSize: 13 }}>
                    + Ajouter un produit
                  </button>
                </div>
              </div>

              <div style={{ background: "linear-gradient(135deg,#1a365d,#2b6cb0)", borderRadius: 12, padding: "14px 18px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, opacity: 0.9 }}>💰 Total de la journée</span>
                <span style={{ fontWeight: 900, fontSize: 22 }}>{fmt(totalForm)} <span style={{ fontSize: 13 }}>FCFA</span></span>
              </div>

              <div>
                <label style={lS}>📝 Remarques (optionnel)</label>
                <textarea placeholder="Besoins de la pharmacie, ruptures de stock..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...iS, height: 70, resize: "vertical" }} />
              </div>

              <button onClick={handleSubmit} style={{ background: "linear-gradient(135deg,#1a365d,#2b6cb0)", color: "white", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 800, cursor: "pointer", width: "100%" }}>
                ✅ Soumettre mon rapport
              </button>
            </div>
          </div>
        )}

        {/* Mes derniers rapports */}
        {mesVentes.length > 0 && (
          <div style={{ marginTop: 20, background: "white", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#1a365d", fontSize: 14 }}>📄 Mes 5 derniers rapports</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: "#f7fafc" }}>
                  {["Date", "Pharmacie", "Produits", "Montant"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", color: "#4a5568", fontWeight: 700, borderBottom: "2px solid #e2e8f0", fontSize: 12 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {mesVentes.slice(0, 5).map((s, idx) => (
                    <tr key={s.id} style={{ background: idx % 2 === 0 ? "white" : "#f7fafc" }}>
                      <td style={tdS}><b>{s.date}</b></td>
                      <td style={tdS}>{s.pharmacie}{s.ville && <div style={{ fontSize: 11, color: "#a0aec0" }}>{s.ville}</div>}</td>
                      <td style={tdS}>{s.lignes.map((l, i) => <div key={i} style={{ fontSize: 11, color: "#4a5568" }}>• {l.produit} × {l.quantite}</div>)}</td>
                      <td style={{ ...tdS, fontWeight: 800, color: "#276749", whiteSpace: "nowrap" }}>{fmt(s.total)} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// INTERFACE ADMINISTRATEUR
// ═══════════════════════════════════════════════
function AdminInterface({ sales, onDelete, onLogout }) {
  const [filterComm, setFilterComm] = useState("Toutes");
  const [filterDate, setFilterDate] = useState("");

  const filtered = sales.filter(s =>
    (filterComm === "Toutes" || s.commerciale === filterComm) &&
    (!filterDate || s.date === filterDate)
  );

  const totalCA = filtered.reduce((s, e) => s + e.total, 0);
  const ranking = COMMERCIALES.map(c => {
    const v = sales.filter(s => s.commerciale === c.nom);
    return { nom: c.nom, total: v.reduce((s, e) => s + e.total, 0), visites: v.length };
  }).sort((a, b) => b.total - a.total);

  const exportExcel = () => {
    const rows = [];
    filtered.forEach(e => e.lignes.forEach(l => rows.push({
      "Date": e.date, "Commerciale": e.commerciale,
      "Nom de la pharmacie": e.pharmacie, "Ville / Quartier": e.ville || "",
      "Nom du produit vendu": l.produit,
      "Quantité vendue": parseFloat(l.quantite) || 0,
      "Prix unitaire (FCFA)": parseFloat(l.prixUnitaire) || 0,
      "Montant (FCFA)": (parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnitaire) || 0),
      "Remarques": e.notes || "",
    })));

    const ws1 = XLSX.utils.json_to_sheet(rows);
    ws1["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 28 }, { wch: 18 }, { wch: 24 }, { wch: 12 }, { wch: 20 }, { wch: 16 }, { wch: 30 }];

    const summaryRows = ranking.map(r => ({
      "Commerciale": r.nom,
      "Nb de visites": r.visites,
      "Nb pharmacies visitées": new Set(sales.filter(s => s.commerciale === r.nom).map(s => s.pharmacie)).size,
      "CA Total (FCFA)": r.total,
      "Moyenne / visite (FCFA)": r.visites ? Math.round(r.total / r.visites) : 0,
    }));
    summaryRows.push({
      "Commerciale": "TOTAL GÉNÉRAL",
      "Nb de visites": sales.length,
      "Nb pharmacies visitées": new Set(sales.map(s => s.pharmacie)).size,
      "CA Total (FCFA)": sales.reduce((s, e) => s + e.total, 0),
      "Moyenne / visite (FCFA)": sales.length ? Math.round(sales.reduce((s, e) => s + e.total, 0) / sales.length) : 0,
    });

    const ws2 = XLSX.utils.json_to_sheet(summaryRows);
    ws2["!cols"] = [{ wch: 24 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 22 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Détail des ventes");
    XLSX.utils.book_append_sheet(wb, ws2, "Résumé par commerciale");
    XLSX.writeFile(wb, `ventes-pharmacies-${today()}.xlsx`);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", minHeight: "100vh", background: "#edf2f7" }}>
      <div style={{ background: "linear-gradient(135deg,#276749,#2f855a)", color: "white" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>💊 DjamePharmaSales — Administration</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>Vue d'ensemble de toutes les ventes</div>
          </div>
          <button onClick={onLogout} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.6)", background: "transparent", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Déconnexion</button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
          {[
            { label: "Chiffre d'affaires", value: fmt(totalCA) + " FCFA", icon: "💰", color: "#2b6cb0" },
            { label: "Pharmacies visitées", value: new Set(filtered.map(s => s.pharmacie)).size, icon: "🏥", color: "#276749" },
            { label: "Rapports reçus", value: filtered.length, icon: "📋", color: "#6b46c1" },
          ].map(k => (
            <div key={k.label} style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: `5px solid ${k.color}` }}>
              <div style={{ fontSize: 26 }}>{k.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: k.color, marginTop: 10 }}>{k.value}</div>
              <div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Classement */}
        <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 18 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#1a365d", fontSize: 15 }}>🏆 Classement des commerciales</div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            {ranking.map((r, i) => {
              const pct = ranking[0].total > 0 ? (r.total / ranking[0].total) * 100 : 0;
              return (
                <div key={r.nom}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 14 }}>
                    <span><span style={{ marginRight: 6 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span><b>{r.nom}</b></span>
                    <span style={{ fontWeight: 700, color: "#276749" }}>{fmt(r.total)} FCFA <span style={{ color: "#a0aec0", fontWeight: 400, fontSize: 12 }}>({r.visites} visite{r.visites > 1 ? "s" : ""})</span></span>
                  </div>
                  <div style={{ height: 8, background: "#e2e8f0", borderRadius: 10 }}>
                    <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg,#2b6cb0,#63b3ed)", borderRadius: 10 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtres + Export */}
        <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 18 }}>
          <div style={{ flex: 1, minWidth: 155 }}>
            <label style={lS}>Filtrer par commerciale</label>
            <select value={filterComm} onChange={e => setFilterComm(e.target.value)} style={iS}>
              <option>Toutes</option>
              {COMMERCIALES.map(c => <option key={c.nom}>{c.nom}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 155 }}>
            <label style={lS}>Filtrer par date</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={iS} />
          </div>
          <button onClick={() => { setFilterComm("Toutes"); setFilterDate(""); }} style={{ padding: "9px 14px", background: "#edf2f7", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, color: "#4a5568", fontSize: 13 }}>✕ Réinitialiser</button>
          <button onClick={exportExcel} style={{ padding: "9px 20px", background: "#276749", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 800, fontSize: 13 }}>
            📥 Exporter Excel (.xlsx)
          </button>
        </div>

        {/* Tableau */}
        <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#1a365d", fontSize: 15, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>📊 Tous les rapports</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#718096" }}>{filtered.length} rapport{filtered.length > 1 ? "s" : ""}</span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 50, color: "#a0aec0" }}>
              <div style={{ fontSize: 44 }}>📭</div>
              <div style={{ marginTop: 12 }}>Aucune vente pour cette sélection</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: "#f7fafc" }}>
                  {["Date", "Commerciale", "Pharmacie", "Produits vendus", "Montant total", "Remarques", ""].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: 700, borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.map((s, idx) => (
                    <tr key={s.id} style={{ background: idx % 2 === 0 ? "white" : "#f7fafc" }}>
                      <td style={tdS}><b>{s.date}</b></td>
                      <td style={tdS}><span style={{ background: "#ebf4ff", color: "#2b6cb0", fontWeight: 700, padding: "3px 8px", borderRadius: 6, fontSize: 12 }}>{s.commerciale}</span></td>
                      <td style={tdS}><div style={{ fontWeight: 600 }}>{s.pharmacie}</div>{s.ville && <div style={{ fontSize: 11, color: "#a0aec0" }}>{s.ville}</div>}</td>
                      <td style={tdS}>{s.lignes.map((l, i) => (
                        <div key={i} style={{ fontSize: 12, color: "#4a5568", lineHeight: 1.8 }}>
                          <b>{l.produit}</b> × {l.quantite} — <span style={{ color: "#276749", fontWeight: 600 }}>{fmt((parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnitaire) || 0))} F</span>
                        </div>
                      ))}</td>
                      <td style={{ ...tdS, fontWeight: 800, color: "#276749", whiteSpace: "nowrap" }}>{fmt(s.total)} FCFA</td>
                      <td style={{ ...tdS, maxWidth: 140, color: "#718096", fontSize: 12 }}>{s.notes || "—"}</td>
                      <td style={tdS}><button onClick={() => onDelete(s.id)} style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#e53e3e", fontSize: 12 }}>🗑</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// APP PRINCIPALE
// ═══════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [sales, setSales] = useState(loadSales);

  const handleNewSale = (entry) => {
    const updated = [{ id: Date.now(), timestamp: new Date().toISOString(), ...entry }, ...sales];
    setSales(updated);
    saveSales(updated);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer ce rapport ?")) return;
    const updated = sales.filter(s => s.id !== id);
    setSales(updated);
    saveSales(updated);
  };

  if (!user) return <LoginScreen onLogin={setUser} />;
  if (user.role === "commerciale")
    return <CommercialInterface user={user} sales={sales} onSubmit={handleNewSale} onLogout={() => setUser(null)} />;
  return <AdminInterface sales={sales} onDelete={handleDelete} onLogout={() => setUser(null)} />;
}
