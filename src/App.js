import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, setDoc, updateDoc, getDoc } from "firebase/firestore";

// ═══════════════════════════════════════════════
// FIREBASE — Base de données en ligne
// ═══════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyBoc32kTFLP3RPYeLpmGOWvu9YIrTLqBOg",
  authDomain: "djamepharmasales.firebaseapp.com",
  projectId: "djamepharmasales",
  storageBucket: "djamepharmasales.firebasestorage.app",
  messagingSenderId: "149656699196",
  appId: "1:149656699196:web:aa780e3dfc8da2ed559e39"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ═══════════════════════════════════════════════
// CONFIGURATION — Commerciales & Admins
// ═══════════════════════════════════════════════
const COMMERCIALES = [
  { nom: "ANNE N'GORAN",      pass: "ANNEDJAME11" },
  { nom: "TIE LOU CLAUDINE",  pass: "LOUDJAME12" },
  { nom: "AICHA LACROSE",     pass: "AICHADJAME13" },
  { nom: "ANNIMATRICE1",      pass: "ANIMDJAME14" },
  { nom: "ANNIMATRICE2",      pass: "ANIMDJAME15" },
];
const ADMINS = [
  { login: "TOURE AWA DIA",        pass: "AWADJAME26" },
  { login: "MOHAMED KONE YASSINE", pass: "YASSINE26@" },
];

// ═══════════════════════════════════════════════
// PRODUITS & PRIX
// ═══════════════════════════════════════════════
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
const iS = { width: "100%", padding: "10px 13px", borderRadius: 9, border: "1.5px solid #cbd5e0", fontSize: 14, background: "white", boxSizing: "border-box", outline: "none" };
const lS = { display: "block", fontSize: 13, fontWeight: 600, color: "#4a5568", marginBottom: 5 };
const tdS = { padding: "10px 14px", borderBottom: "1px solid #edf2f7", verticalAlign: "top" };

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
    const found = ADMINS.find(a => a.login === adminLogin && a.pass === pass);
    if (found) { setError(""); onLogin({ role: "admin", nom: found.login }); }
    else setError("Identifiant ou mot de passe incorrect.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 430 }}>
        <div style={{ textAlign: "center", marginBottom: 32, color: "white" }}>
          <div style={{ fontSize: 56 }}>💊</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 10 }}>DjamePharmaSales</div>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>Suivi des ventes en pharmacie</div>
        </div>

        {!role ? (
          <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ textAlign: "center", fontWeight: 800, fontSize: 17, color: "#1a365d", marginBottom: 24 }}>Choisissez votre profil</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <button onClick={() => { setRole("commerciale"); setError(""); }} style={{ padding: "18px 24px", borderRadius: 14, border: "2px solid #bee3f8", background: "#ebf8ff", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, textAlign: "left" }}>
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
            <button onClick={() => { setRole(null); setError(""); setNom(""); setPass(""); }} style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", fontSize: 13, marginBottom: 18 }}>← Retour</button>
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
              <button onClick={handleComm} style={{ padding: "13px", background: "linear-gradient(135deg,#2b6cb0,#1a365d)", color: "white", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Se connecter</button>
            </div>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <button onClick={() => { setRole(null); setError(""); setAdminLogin(""); setPass(""); }} style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", fontSize: 13, marginBottom: 18 }}>← Retour</button>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#276749", marginBottom: 22 }}>🔐 Connexion Administrateur</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lS}>Identifiant</label>
                <select value={adminLogin} onChange={e => setAdminLogin(e.target.value)} style={iS}>
                  <option value="">-- Sélectionnez --</option>
                  {ADMINS.map(a => <option key={a.login}>{a.login}</option>)}
                </select>
              </div>
              <div>
                <label style={lS}>Mot de passe</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdmin()} style={{ ...iS, paddingRight: 44 }} />
                  <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, opacity: 0.6 }}>{showPass ? "🙈" : "👁️"}</button>
                </div>
              </div>
              {error && <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 8, padding: "10px 14px", color: "#e53e3e", fontSize: 13 }}>⚠️ {error}</div>}
              <button onClick={handleAdmin} style={{ padding: "13px", background: "linear-gradient(135deg,#276749,#2f855a)", color: "white", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Accéder au tableau de bord</button>
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
function CommercialInterface({ user, sales, pharmacies, onSubmit, onLogout }) {
  const [form, setForm] = useState(emptyForm());
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [commTab, setCommTab] = useState("rapport");

  const mesVentes = sales.filter(s => s.commerciale === user.nom);
  const totalForm = form.lignes.reduce((s, l) => s + (parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnitaire) || 0), 0);
  const caAujourdhui = mesVentes.filter(s => s.date === today()).reduce((s, e) => s + e.total, 0);
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

  const handleSubmit = async () => {
    if (!form.pharmacie || !form.date) return alert("Renseignez la date et le nom de la pharmacie.");
    if (form.lignes.some(l => !l.produit || !l.quantite)) return alert("Completez toutes les lignes de produits.");
    setSaving(true);
    await onSubmit({ ...form, commerciale: user.nom, total: totalForm });
    setSaving(false);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setForm(emptyForm()); }, 3000);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", minHeight: "100vh", background: "#edf2f7" }}>
      <div style={{ background: "linear-gradient(135deg,#2b6cb0,#1a365d)", color: "white" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>💊 DjamePharmaSales</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>Bonjour, <b>{user.nom}</b></div>
          </div>
          <button onClick={onLogout} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.6)", background: "transparent", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Deconnexion</button>
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px", display: "flex", gap: 4 }}>
          {[{ id: "rapport", label: "Rapport" }, { id: "stock", label: "Stock pharmacies" }].map(t => (
            <button key={t.id} onClick={() => setCommTab(t.id)} style={{ padding: "9px 18px", border: "none", background: commTab === t.id ? "white" : "transparent", color: commTab === t.id ? "#2b6cb0" : "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: "8px 8px 0 0" }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: 20 }}>
        {commTab === "stock" && (
          <StockCommerciale pharmacies={pharmacies} />
        )}

        {commTab === "rapport" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: "4px solid #2b6cb0" }}>
                <div style={{ fontSize: 11, color: "#718096", fontWeight: 700, textTransform: "uppercase" }}>Mon CA aujourd'hui</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#2b6cb0", marginTop: 8 }}>{fmt(caAujourdhui)} FCFA</div>
              </div>
              <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: "4px solid #6b46c1" }}>
                <div style={{ fontSize: 11, color: "#718096", fontWeight: 700, textTransform: "uppercase" }}>Mon CA total</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#6b46c1", marginTop: 8 }}>{fmt(caTotal)} FCFA</div>
              </div>
            </div>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 18, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 60 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#2b6cb0", marginTop: 16 }}>Rapport envoye !</div>
                <div style={{ color: "#718096", marginTop: 8 }}>Vos ventes ont ete enregistrees. L administrateur les voit maintenant.</div>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: 18, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div style={{ background: "#ebf4ff", padding: "14px 24px", borderBottom: "1px solid #bee3f8" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#1a365d" }}>Nouveau rapport de vente</div>
                  <div style={{ fontSize: 13, color: "#4a5568", marginTop: 2 }}>Remplissez et soumettez en fin de journee</div>
                </div>
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={lS}>Date *</label>
                      <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={iS} />
                    </div>
                    <div>
                      <label style={lS}>Ville / Quartier</label>
                      <input placeholder="ex: Cocody" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} style={iS} />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={lS}>Nom de la pharmacie *</label>
                      <input placeholder="ex: Pharmacie du Plateau" value={form.pharmacie} onChange={e => setForm({ ...form, pharmacie: e.target.value })} style={iS} />
                    </div>
                  </div>

                  <div>
                    <label style={{ ...lS, fontSize: 14, fontWeight: 800, color: "#1a365d" }}>Produits vendus</label>
                    <div style={{ background: "#f7fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 0.8fr 1.3fr 1fr 28px", gap: 8, marginBottom: 8 }}>
                        {["Produit", "Qte", "Prix (FCFA)", "Montant", ""].map(h => (
                          <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#718096", textTransform: "uppercase" }}>{h}</div>
                        ))}
                      </div>
                      {form.lignes.map((l, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "2.5fr 0.8fr 1.3fr 1fr 28px", gap: 8, alignItems: "center", marginBottom: 8 }}>
                          <select value={l.produit} onChange={e => updateLigne(i, "produit", e.target.value)} style={{ ...iS, fontSize: 12 }}>
                            <option value="">-- Choisir --</option>
                            {PRODUITS.map(p => <option key={p}>{p}</option>)}
                          </select>
                          <input type="number" placeholder="0" min="0" value={l.quantite} onChange={e => updateLigne(i, "quantite", e.target.value)} style={{ ...iS, fontSize: 13 }} />
                          <input type="number" value={l.prixUnitaire} readOnly style={{ ...iS, fontSize: 13, background: "#f0f4f8", color: "#2b6cb0", fontWeight: 700, cursor: "not-allowed" }} />
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#276749", textAlign: "right" }}>
                            {l.quantite && l.prixUnitaire ? fmt((parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnitaire) || 0)) + " F" : "—"}
                          </div>
                          {form.lignes.length > 1
                            ? <button onClick={() => removeLigne(i)} style={{ width: 24, height: 24, borderRadius: 5, background: "#fed7d7", border: "none", color: "#e53e3e", cursor: "pointer", fontWeight: 800 }}>x</button>
                            : <div />}
                        </div>
                      ))}
                      <button onClick={addLigne} style={{ marginTop: 4, padding: "7px 0", background: "white", border: "2px dashed #90cdf4", borderRadius: 8, color: "#2b6cb0", fontWeight: 700, cursor: "pointer", width: "100%", fontSize: 13 }}>
                        + Ajouter un produit
                      </button>
                    </div>
                  </div>

                  <div style={{ background: "linear-gradient(135deg,#1a365d,#2b6cb0)", borderRadius: 12, padding: "14px 18px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, opacity: 0.9 }}>Total de la journee</span>
                    <span style={{ fontWeight: 900, fontSize: 22 }}>{fmt(totalForm)} <span style={{ fontSize: 13 }}>FCFA</span></span>
                  </div>

                  <div>
                    <label style={lS}>Remarques (optionnel)</label>
                    <textarea placeholder="Besoins de la pharmacie, ruptures de stock..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...iS, height: 70, resize: "vertical" }} />
                  </div>

                  <button onClick={handleSubmit} disabled={saving} style={{ background: saving ? "#a0aec0" : "linear-gradient(135deg,#1a365d,#2b6cb0)", color: "white", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", width: "100%" }}>
                    {saving ? "Envoi en cours..." : "Soumettre mon rapport"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// INTERFACE ADMINISTRATEUR
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// INTERFACE STOCK PHARMACIES (Admin)
// ═══════════════════════════════════════════════
function StockInterface({ pharmacies, onAddPharmacie, onDeletePharmacie, onAddLivraison, onDeletePharmacieProduit }) {
  const [view, setView] = useState("liste"); // liste | detail | ajouter
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [formPharm, setFormPharm] = useState({ nom: "", ville: "" });
  const [formLiv, setFormLiv] = useState({ produit: "", quantite: "", dateLivraison: today() });
  const [saving, setSaving] = useState(false);

  const filtered = pharmacies.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    (p.ville || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedPharm = pharmacies.find(p => p.id === selected);

  const handleAddPharm = async () => {
    if (!formPharm.nom.trim()) return alert("Entrez le nom de la pharmacie.");
    setSaving(true);
    await onAddPharmacie({ nom: formPharm.nom.trim(), ville: formPharm.ville.trim(), produits: {} });
    setFormPharm({ nom: "", ville: "" });
    setSaving(false);
    setView("liste");
  };

  const handleAddLivraison = async () => {
    if (!formLiv.produit || !formLiv.quantite) return alert("Choisissez un produit et entrez la quantite.");
    const qte = parseInt(formLiv.quantite);
    if (isNaN(qte) || qte <= 0) return alert("Quantite invalide.");
    setSaving(true);
    await onAddLivraison(selected, formLiv.produit, qte);
    setFormLiv({ produit: "", quantite: "", dateLivraison: today() });
    setSaving(false);
  };

  const getStockColor = (restant, initial) => {
    if (restant <= 0) return "#e53e3e";
    const pct = restant / initial;
    if (pct <= 0.2) return "#e53e3e";
    if (pct <= 0.4) return "#dd6b20";
    return "#276749";
  };

  const getStockBg = (restant, initial) => {
    if (restant <= 0) return "#fff5f5";
    const pct = restant / initial;
    if (pct <= 0.2) return "#fff5f5";
    if (pct <= 0.4) return "#fffbeb";
    return "#f0fff4";
  };

  return (
    <div>
      {view === "liste" && (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
            <input
              placeholder="🔍 Rechercher une pharmacie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...iS, flex: 1, minWidth: 200 }}
            />
            <button onClick={() => setView("ajouter")} style={{ padding: "10px 20px", background: "#2b6cb0", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
              + Ajouter une pharmacie
            </button>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 50, background: "white", borderRadius: 14, color: "#a0aec0" }}>
              <div style={{ fontSize: 44 }}>🏥</div>
              <div style={{ marginTop: 12 }}>Aucune pharmacie enregistrée</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Cliquez sur "Ajouter une pharmacie" pour commencer</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {filtered.map(p => {
                const produits = Object.entries(p.produits || {});
                const totalProduits = produits.length;
                const alertes = produits.filter(([, v]) => v.restant <= 0 || (v.initial > 0 && v.restant / v.initial <= 0.2)).length;
                return (
                  <div key={p.id} style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden", border: alertes > 0 ? "2px solid #fed7d7" : "2px solid transparent" }}>
                    <div style={{ padding: "14px 18px", background: alertes > 0 ? "#fff5f5" : "#f7fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#1a365d" }}>🏥 {p.nom}</div>
                        {p.ville && <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>📍 {p.ville}</div>}
                      </div>
                      {alertes > 0 && (
                        <span style={{ background: "#e53e3e", color: "white", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 20 }}>
                          ⚠️ {alertes} alerte{alertes > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: "12px 18px" }}>
                      <div style={{ fontSize: 12, color: "#718096", marginBottom: 8 }}>{totalProduits} produit{totalProduits > 1 ? "s" : ""} en stock</div>
                      {produits.slice(0, 3).map(([nom, v]) => (
                        <div key={nom} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, fontSize: 12 }}>
                          <span style={{ color: "#4a5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{nom}</span>
                          <span style={{ fontWeight: 800, color: getStockColor(v.restant, v.initial), background: getStockBg(v.restant, v.initial), padding: "2px 8px", borderRadius: 6 }}>
                            {v.restant <= 0 ? "RUPTURE" : v.restant + " restant" + (v.restant > 1 ? "s" : "")}
                          </span>
                        </div>
                      ))}
                      {totalProduits > 3 && <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 4 }}>+{totalProduits - 3} autre{totalProduits - 3 > 1 ? "s" : ""} produit{totalProduits - 3 > 1 ? "s" : ""}...</div>}
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button onClick={() => { setSelected(p.id); setView("detail"); }} style={{ flex: 1, padding: "8px", background: "#ebf4ff", color: "#2b6cb0", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                          👁️ Voir le stock
                        </button>
                        <button onClick={() => onDeletePharmacie(p.id, p.nom)} style={{ padding: "8px 12px", background: "#fff5f5", color: "#e53e3e", border: "1px solid #fed7d7", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === "ajouter" && (
        <div style={{ background: "white", borderRadius: 14, padding: 28, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", maxWidth: 500 }}>
          <button onClick={() => setView("liste")} style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", fontSize: 13, marginBottom: 18 }}>← Retour</button>
          <div style={{ fontWeight: 800, fontSize: 17, color: "#1a365d", marginBottom: 22 }}>🏥 Ajouter une pharmacie</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={lS}>Nom de la pharmacie *</label>
              <input placeholder="ex: Pharmacie du Plateau" value={formPharm.nom} onChange={e => setFormPharm({ ...formPharm, nom: e.target.value })} style={iS} />
            </div>
            <div>
              <label style={lS}>Ville / Quartier</label>
              <input placeholder="ex: Cocody, Plateau..." value={formPharm.ville} onChange={e => setFormPharm({ ...formPharm, ville: e.target.value })} style={iS} />
            </div>
            <button onClick={handleAddPharm} disabled={saving} style={{ padding: "13px", background: saving ? "#a0aec0" : "#2b6cb0", color: "white", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Enregistrement..." : "✅ Enregistrer la pharmacie"}
            </button>
          </div>
        </div>
      )}

      {view === "detail" && selectedPharm && (
        <div>
          <button onClick={() => { setView("liste"); setSelected(null); }} style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", fontSize: 13, marginBottom: 18, display: "flex", alignItems: "center", gap: 6 }}>← Retour à la liste</button>

          <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", marginBottom: 18 }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: "#1a365d" }}>🏥 {selectedPharm.nom}</div>
            {selectedPharm.ville && <div style={{ fontSize: 13, color: "#718096", marginTop: 4 }}>📍 {selectedPharm.ville}</div>}
          </div>

          {/* Ajouter une livraison */}
          <div style={{ background: "#ebf4ff", borderRadius: 14, padding: 20, marginBottom: 18, border: "1px solid #bee3f8" }}>
            <div style={{ fontWeight: 800, color: "#1a365d", marginBottom: 14, fontSize: 14 }}>📦 Enregistrer une livraison</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
              <div>
                <label style={lS}>Produit livré</label>
                <select value={formLiv.produit} onChange={e => setFormLiv({ ...formLiv, produit: e.target.value })} style={iS}>
                  <option value="">-- Choisir un produit --</option>
                  {PRODUITS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={lS}>Quantité livrée</label>
                <input type="number" min="1" placeholder="0" value={formLiv.quantite} onChange={e => setFormLiv({ ...formLiv, quantite: e.target.value })} style={iS} />
              </div>
              <button onClick={handleAddLivraison} disabled={saving} style={{ padding: "10px 16px", background: "#2b6cb0", color: "white", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", height: 42 }}>
                {saving ? "..." : "+ Ajouter"}
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#4a5568", marginTop: 8 }}>Si le produit existe déjà, la quantité sera ajoutée au stock actuel.</div>
          </div>

          {/* Tableau stock */}
          <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#1a365d", fontSize: 15 }}>
              📊 Stock actuel — {Object.keys(selectedPharm.produits || {}).length} produit{Object.keys(selectedPharm.produits || {}).length > 1 ? "s" : ""}
            </div>
            {Object.keys(selectedPharm.produits || {}).length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#a0aec0" }}>
                <div style={{ fontSize: 36 }}>📦</div>
                <div style={{ marginTop: 10 }}>Aucune livraison enregistrée</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ background: "#f7fafc" }}>
                    {["Produit", "Dernière livraison", "Qté livrée", "Qté vendue", "Stock restant", "Statut", ""].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: 700, borderBottom: "2px solid #e2e8f0", fontSize: 12 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {Object.entries(selectedPharm.produits || {}).sort((a, b) => a[0].localeCompare(b[0])).map(([nom, v], idx) => {
                      const pct = v.initial > 0 ? (v.restant / v.initial) * 100 : 0;
                      const color = getStockColor(v.restant, v.initial);
                      const bg = getStockBg(v.restant, v.initial);
                      const statut = v.restant <= 0 ? "RUPTURE" : pct <= 20 ? "CRITIQUE" : pct <= 40 ? "FAIBLE" : "OK";
                      const statutColor = v.restant <= 0 ? "#e53e3e" : pct <= 20 ? "#e53e3e" : pct <= 40 ? "#dd6b20" : "#276749";
                      return (
                        <tr key={nom} style={{ background: idx % 2 === 0 ? "white" : "#f7fafc" }}>
                          <td style={{ ...tdS, fontWeight: 600, maxWidth: 180 }}>{nom}</td>
                          <td style={{ ...tdS, fontSize: 12 }}>
                            {v.dernierelivraison ? (
                              <span style={{ background: "#ebf4ff", color: "#2b6cb0", padding: "3px 8px", borderRadius: 6, fontWeight: 600, fontSize: 11 }}>
                                📅 {v.dernierelivraison}
                              </span>
                            ) : <span style={{ color: "#a0aec0", fontSize: 11 }}>—</span>}
                          </td>
                          <td style={{ ...tdS, textAlign: "center", color: "#2b6cb0", fontWeight: 700 }}>{v.initial}</td>
                          <td style={{ ...tdS, textAlign: "center", color: "#6b46c1", fontWeight: 700 }}>{v.initial - v.restant}</td>
                          <td style={{ ...tdS, fontWeight: 900, color: color, fontSize: 15 }}>{v.restant}</td>
                          <td style={tdS}>
                            <div>
                              <span style={{ background: bg, color: statutColor, fontWeight: 800, padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>{statut}</span>
                              <div style={{ height: 5, background: "#e2e8f0", borderRadius: 10, marginTop: 6, width: 80 }}>
                                <div style={{ height: "100%", width: Math.max(0, pct) + "%", background: color, borderRadius: 10 }} />
                              </div>
                            </div>
                          </td>
                          <td style={tdS}>
                            <button onClick={() => onDeletePharmacieProduit(selected, nom)} style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#e53e3e", fontSize: 11 }}>🗑</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// VUE STOCK POUR LA COMMERCIALE (lecture seule)
// ═══════════════════════════════════════════════
function StockCommerciale({ pharmacies }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = pharmacies.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    (p.ville || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedPharm = pharmacies.find(p => p.id === selected);

  const getStockColor = (restant, initial) => {
    if (restant <= 0) return "#e53e3e";
    const pct = restant / initial;
    if (pct <= 0.2) return "#e53e3e";
    if (pct <= 0.4) return "#dd6b20";
    return "#276749";
  };

  if (selected && selectedPharm) return (
    <div>
      <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← Retour</button>
      <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 18, color: "#1a365d" }}>🏥 {selectedPharm.nom}</div>
        {selectedPharm.ville && <div style={{ fontSize: 12, color: "#718096", marginTop: 3 }}>📍 {selectedPharm.ville}</div>}
        <div style={{ fontSize: 12, color: "#2b6cb0", marginTop: 6, fontWeight: 600 }}>👁️ Vue lecture seule — vous ne pouvez pas modifier le stock</div>
      </div>
      <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        {Object.keys(selectedPharm.produits || {}).length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#a0aec0" }}>Aucun produit enregistré pour cette pharmacie</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#f7fafc" }}>
                {["Produit", "Stock restant", "Statut"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: 700, borderBottom: "2px solid #e2e8f0", fontSize: 12 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {Object.entries(selectedPharm.produits || {}).sort((a, b) => a[0].localeCompare(b[0])).map(([nom, v], idx) => {
                  const pct = v.initial > 0 ? (v.restant / v.initial) * 100 : 0;
                  const color = getStockColor(v.restant, v.initial);
                  const statut = v.restant <= 0 ? "RUPTURE" : pct <= 20 ? "CRITIQUE" : pct <= 40 ? "FAIBLE" : "OK";
                  return (
                    <tr key={nom} style={{ background: idx % 2 === 0 ? "white" : "#f7fafc" }}>
                      <td style={{ ...tdS, fontWeight: 600 }}>{nom}</td>
                      <td style={{ ...tdS, fontWeight: 900, color, fontSize: 15 }}>{v.restant <= 0 ? "0" : v.restant}</td>
                      <td style={tdS}>
                        <span style={{ background: v.restant <= 0 ? "#fff5f5" : pct <= 20 ? "#fff5f5" : pct <= 40 ? "#fffbeb" : "#f0fff4", color, fontWeight: 800, padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>{statut}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ background: "#ebf4ff", borderRadius: 10, padding: "10px 16px", marginBottom: 14, fontSize: 13, color: "#2b6cb0", fontWeight: 600 }}>
        👁️ Consultation du stock en lecture seule — vous ne pouvez pas modifier
      </div>
      <input placeholder="🔍 Rechercher une pharmacie..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...iS, marginBottom: 14 }} />
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 14, color: "#a0aec0" }}>Aucune pharmacie trouvée</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(p => {
            const produits = Object.entries(p.produits || {});
            const alertes = produits.filter(([, v]) => v.restant <= 0 || (v.initial > 0 && v.restant / v.initial <= 0.2)).length;
            return (
              <div key={p.id} onClick={() => setSelected(p.id)} style={{ background: "white", borderRadius: 12, padding: "14px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", border: alertes > 0 ? "2px solid #fed7d7" : "2px solid transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#1a365d" }}>🏥 {p.nom}</div>
                  {p.ville && <div style={{ fontSize: 12, color: "#718096" }}>📍 {p.ville}</div>}
                  <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>{produits.length} produit{produits.length > 1 ? "s" : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {alertes > 0 && <div style={{ background: "#e53e3e", color: "white", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 20, marginBottom: 4 }}>⚠️ {alertes} alerte{alertes > 1 ? "s" : ""}</div>}
                  <div style={{ fontSize: 12, color: "#718096" }}>Voir →</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminInterface({ sales, onDelete, onResetAll, onLogout, user, loading, pharmacies, onAddPharmacie, onDeletePharmacie, onAddLivraison, onDeletePharmacieProduit }) {
  const [filterComm, setFilterComm] = useState("Toutes");
  const [filterDate, setFilterDate] = useState("");
  const [activeTab, setActiveTab] = useState("apercu"); // apercu | semaine | mois | produits | stats

  // ── Périodes ──────────────────────────────────
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const getWeekRange = () => {
    const d = new Date(now);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    const start = d.toISOString().split("T")[0];
    d.setDate(d.getDate() + 6);
    const end = d.toISOString().split("T")[0];
    return { start, end };
  };
  const { start: weekStart, end: weekEnd } = getWeekRange();
  const monthStr = now.toISOString().slice(0, 7);

  const salesThisWeek  = sales.filter(s => s.date >= weekStart && s.date <= weekEnd);
  const salesThisMonth = sales.filter(s => s.date && s.date.startsWith(monthStr));

  // ── Données filtrées onglet Aperçu ────────────
  const filtered = sales.filter(s =>
    (filterComm === "Toutes" || s.commerciale === filterComm) &&
    (!filterDate || s.date === filterDate)
  );
  const totalCA = filtered.reduce((s, e) => s + e.total, 0);

  // ── Classement commerciales ───────────────────
  const buildRanking = (dataset) => COMMERCIALES.map(c => {
    const v = dataset.filter(s => s.commerciale === c.nom);
    return { nom: c.nom, total: v.reduce((s, e) => s + e.total, 0), visites: v.length };
  }).sort((a, b) => b.total - a.total);

  const rankingAll   = buildRanking(sales);
  const rankingWeek  = buildRanking(salesThisWeek);
  const rankingMonth = buildRanking(salesThisMonth);

  // ── Top produits ─────────────────────────────
  const buildTopProduits = (dataset) => {
    const map = {};
    dataset.forEach(e => e.lignes && e.lignes.forEach(l => {
      if (!l.produit) return;
      if (!map[l.produit]) map[l.produit] = { qte: 0, ca: 0 };
      map[l.produit].qte += parseFloat(l.quantite) || 0;
      map[l.produit].ca  += (parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnitaire) || 0);
    }));
    return Object.entries(map).map(([nom, v]) => ({ nom, ...v })).sort((a, b) => b.ca - a.ca);
  };

  const topProduitsAll   = buildTopProduits(sales);
  const topProduitsWeek  = buildTopProduits(salesThisWeek);
  const topProduitsMonth = buildTopProduits(salesThisMonth);

  // ── Stats par mois ────────────────────────────
  const statsByMonth = () => {
    const map = {};
    sales.forEach(s => {
      const m = s.date ? s.date.slice(0, 7) : null;
      if (!m) return;
      if (!map[m]) map[m] = { ca: 0, visites: 0 };
      map[m].ca += s.total;
      map[m].visites++;
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0])).map(([mois, v]) => ({ mois, ...v }));
  };
  const monthlyStats = statsByMonth();

  const exportExcel = () => {
    const rows = [];
    filtered.forEach(e => e.lignes && e.lignes.forEach(l => rows.push({
      "Date": e.date, "Commerciale": e.commerciale,
      "Pharmacie": e.pharmacie, "Ville": e.ville || "",
      "Produit": l.produit,
      "Quantité": parseFloat(l.quantite) || 0,
      "Prix unitaire (FCFA)": parseFloat(l.prixUnitaire) || 0,
      "Montant (FCFA)": (parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnitaire) || 0),
      "Remarques": e.notes || "",
    })));
    const ws1 = XLSX.utils.json_to_sheet(rows);
    ws1["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 28 }, { wch: 18 }, { wch: 36 }, { wch: 10 }, { wch: 18 }, { wch: 16 }, { wch: 30 }];
    const summaryRows = rankingAll.map(r => ({
      "Commerciale": r.nom, "Nb visites": r.visites,
      "CA Total (FCFA)": r.total,
      "Moyenne / visite": r.visites ? Math.round(r.total / r.visites) : 0,
    }));
    summaryRows.push({ "Commerciale": "TOTAL GÉNÉRAL", "Nb visites": sales.length, "CA Total (FCFA)": sales.reduce((s, e) => s + e.total, 0), "Moyenne / visite": sales.length ? Math.round(sales.reduce((s, e) => s + e.total, 0) / sales.length) : 0 });
    const ws2 = XLSX.utils.json_to_sheet(summaryRows);
    const topRows = topProduitsAll.map((p, i) => ({ "Rang": i + 1, "Produit": p.nom, "Quantité totale": p.qte, "CA (FCFA)": p.ca }));
    const ws3 = XLSX.utils.json_to_sheet(topRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Détail ventes");
    XLSX.utils.book_append_sheet(wb, ws2, "Résumé commerciales");
    XLSX.utils.book_append_sheet(wb, ws3, "Top produits");
    XLSX.writeFile(wb, "DjamePharmaSales-" + todayStr + ".xlsx");
  };

  const TABS = [
    { id: "apercu",     label: "📊 Aperçu" },
    { id: "semaine",    label: "📅 Cette semaine" },
    { id: "mois",       label: "🗓 Ce mois" },
    { id: "produits",   label: "🏆 Top produits" },
    { id: "stats",      label: "📈 Statistiques" },
    { id: "stocks",     label: "📦 Stocks pharmacies" },
  ];

  const RankingCard = ({ ranking, dataset, title }) => (
    <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 18 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#1a365d", fontSize: 15 }}>
        🏆 {title}
        <span style={{ float: "right", fontSize: 12, fontWeight: 600, color: "#718096" }}>
          CA total : {fmt(dataset.reduce((s, e) => s + e.total, 0))} FCFA
        </span>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {ranking.map((r, i) => {
          const pct = ranking[0].total > 0 ? (r.total / ranking[0].total) * 100 : 0;
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1) + ".";
          return (
            <div key={r.nom}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 14 }}>
                <span>{medal} <b>{r.nom}</b></span>
                <span style={{ fontWeight: 700, color: "#276749" }}>
                  {fmt(r.total)} FCFA
                  <span style={{ color: "#a0aec0", fontWeight: 400, fontSize: 12 }}> ({r.visites} visite{r.visites > 1 ? "s" : ""})</span>
                </span>
              </div>
              <div style={{ height: 10, background: "#e2e8f0", borderRadius: 10 }}>
                <div style={{ height: "100%", width: pct + "%", background: i === 0 ? "linear-gradient(90deg,#f6ad55,#ed8936)" : "linear-gradient(90deg,#2b6cb0,#63b3ed)", borderRadius: 10, transition: "width 0.6s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const TopProduitsCard = ({ topProduits, title }) => (
    <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 18 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#1a365d", fontSize: 15 }}>🛒 {title}</div>
      {topProduits.length === 0 ? (
        <div style={{ textAlign: "center", padding: 30, color: "#a0aec0" }}>Aucune vente sur cette période</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: "#f7fafc" }}>
              {["Rang", "Produit", "Qté vendue", "CA (FCFA)", "% du CA"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: 700, borderBottom: "2px solid #e2e8f0", fontSize: 12 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {topProduits.slice(0, 15).map((p, i) => {
                const totalCAProduits = topProduits.reduce((s, x) => s + x.ca, 0);
                const pct = totalCAProduits > 0 ? ((p.ca / totalCAProduits) * 100).toFixed(1) : 0;
                return (
                  <tr key={p.nom} style={{ background: i % 2 === 0 ? "white" : "#f7fafc" }}>
                    <td style={{ ...tdS, fontWeight: 800, color: i === 0 ? "#d69e2e" : i === 1 ? "#718096" : i === 2 ? "#b7791f" : "#4a5568" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td style={{ ...tdS, fontWeight: 600, maxWidth: 200 }}>{p.nom}</td>
                    <td style={{ ...tdS, textAlign: "center", fontWeight: 700, color: "#2b6cb0" }}>{p.qte}</td>
                    <td style={{ ...tdS, fontWeight: 800, color: "#276749", whiteSpace: "nowrap" }}>{fmt(p.ca)} F</td>
                    <td style={tdS}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 10 }}>
                          <div style={{ height: "100%", width: pct + "%", background: "#276749", borderRadius: 10 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#718096", minWidth: 35 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", minHeight: "100vh", background: "#edf2f7" }}>
      <div style={{ background: "linear-gradient(135deg,#276749,#2f855a)", color: "white" }}>
        <div style={{ maxWidth: 1050, margin: "0 auto", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>💊 DjamePharmaSales — Administration</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>Connecté : <b>{user.nom}</b></div>
          </div>
          <button onClick={onLogout} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.6)", background: "transparent", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Déconnexion</button>
        </div>

        {/* Onglets */}
        <div style={{ maxWidth: 1050, margin: "0 auto", padding: "0 20px", display: "flex", gap: 4, overflowX: "auto" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "10px 16px", border: "none", background: activeTab === tab.id ? "white" : "transparent",
              color: activeTab === tab.id ? "#276749" : "rgba(255,255,255,0.85)",
              fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: "8px 8px 0 0",
              whiteSpace: "nowrap", transition: "all 0.2s"
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1050, margin: "0 auto", padding: 20 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#2b6cb0", fontSize: 16, background: "white", borderRadius: 14 }}>
            ⏳ Chargement des données en temps réel...
          </div>
        ) : (
          <>
            {/* ── ONGLET APERÇU ── */}
            {activeTab === "apercu" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
                  {[
                    { label: "CA total général", value: fmt(sales.reduce((s,e)=>s+e.total,0)) + " FCFA", icon: "💰", color: "#2b6cb0" },
                    { label: "Pharmacies visitées", value: new Set(sales.map(s => s.pharmacie)).size, icon: "🏥", color: "#276749" },
                    { label: "Rapports reçus", value: sales.length, icon: "📋", color: "#6b46c1" },
                  ].map(k => (
                    <div key={k.label} style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: "5px solid " + k.color }}>
                      <div style={{ fontSize: 26 }}>{k.icon}</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: k.color, marginTop: 10 }}>{k.value}</div>
                      <div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{k.label}</div>
                    </div>
                  ))}
                </div>

                <RankingCard ranking={rankingAll} dataset={sales} title="Classement général toutes périodes" />

                {/* Filtres + export + reset */}
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
                  <button onClick={exportExcel} style={{ padding: "9px 18px", background: "#276749", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 800, fontSize: 13 }}>📥 Exporter Excel</button>
                  <button onClick={onResetAll} style={{ padding: "9px 18px", background: "#e53e3e", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 800, fontSize: 13 }}>🗑️ Effacer tout</button>
                </div>

                {/* Tableau */}
                <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#1a365d", fontSize: 15, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>📊 Tous les rapports</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#718096" }}>{filtered.length} rapport{filtered.length > 1 ? "s" : ""}</span>
                  </div>
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 50, color: "#a0aec0" }}><div style={{ fontSize: 44 }}>📭</div><div style={{ marginTop: 12 }}>Aucune vente</div></div>
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
                              <td style={tdS}>{s.lignes && s.lignes.map((l, i) => (
                                <div key={i} style={{ fontSize: 12, color: "#4a5568", lineHeight: 1.8 }}><b>{l.produit}</b> × {l.quantite} — <span style={{ color: "#276749", fontWeight: 600 }}>{fmt((parseFloat(l.quantite)||0)*(parseFloat(l.prixUnitaire)||0))} F</span></div>
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
              </>
            )}

            {/* ── ONGLET SEMAINE ── */}
            {activeTab === "semaine" && (
              <>
                <div style={{ background: "#ebf4ff", borderRadius: 12, padding: "12px 20px", marginBottom: 18, fontSize: 14, color: "#2b6cb0", fontWeight: 600 }}>
                  📅 Semaine du <b>{weekStart}</b> au <b>{weekEnd}</b> — {salesThisWeek.length} rapport{salesThisWeek.length > 1 ? "s" : ""}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
                  {[
                    { label: "CA cette semaine", value: fmt(salesThisWeek.reduce((s,e)=>s+e.total,0)) + " FCFA", icon: "💰", color: "#2b6cb0" },
                    { label: "Pharmacies visitées", value: new Set(salesThisWeek.map(s=>s.pharmacie)).size, icon: "🏥", color: "#276749" },
                    { label: "Rapports reçus", value: salesThisWeek.length, icon: "📋", color: "#6b46c1" },
                  ].map(k => (
                    <div key={k.label} style={{ background: "white", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: "5px solid " + k.color }}>
                      <div style={{ fontSize: 24 }}>{k.icon}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: k.color, marginTop: 8 }}>{k.value}</div>
                      <div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{k.label}</div>
                    </div>
                  ))}
                </div>
                <RankingCard ranking={rankingWeek} dataset={salesThisWeek} title="Classement cette semaine" />
                <TopProduitsCard topProduits={topProduitsWeek} title="Top produits cette semaine" />
              </>
            )}

            {/* ── ONGLET MOIS ── */}
            {activeTab === "mois" && (
              <>
                <div style={{ background: "#f0fff4", borderRadius: 12, padding: "12px 20px", marginBottom: 18, fontSize: 14, color: "#276749", fontWeight: 600 }}>
                  Mois de <b>{new Date(monthStr + "-01").toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</b> — {salesThisMonth.length} rapport{salesThisMonth.length > 1 ? "s" : ""}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
                  {[
                    { label: "CA ce mois", value: fmt(salesThisMonth.reduce((s,e)=>s+e.total,0)) + " FCFA", icon: "💰", color: "#276749" },
                    { label: "Pharmacies visitées", value: new Set(salesThisMonth.map(s=>s.pharmacie)).size, icon: "🏥", color: "#2b6cb0" },
                    { label: "Rapports reçus", value: salesThisMonth.length, icon: "📋", color: "#6b46c1" },
                  ].map(k => (
                    <div key={k.label} style={{ background: "white", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: "5px solid " + k.color }}>
                      <div style={{ fontSize: 24 }}>{k.icon}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: k.color, marginTop: 8 }}>{k.value}</div>
                      <div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{k.label}</div>
                    </div>
                  ))}
                </div>
                <RankingCard ranking={rankingMonth} dataset={salesThisMonth} title="Classement ce mois" />
                <TopProduitsCard topProduits={topProduitsMonth} title="Top produits ce mois" />
              </>
            )}

            {/* ── ONGLET TOP PRODUITS ── */}
            {activeTab === "produits" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
                  <div style={{ background: "white", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: "5px solid #d69e2e", gridColumn: "span 3" }}>
                    <div style={{ fontSize: 14, color: "#718096", fontWeight: 700 }}>🥇 Produit N°1 toutes périodes</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#d69e2e", marginTop: 6 }}>{topProduitsAll[0]?.nom || "—"}</div>
                    <div style={{ fontSize: 13, color: "#276749", fontWeight: 600, marginTop: 4 }}>{fmt(topProduitsAll[0]?.ca || 0)} FCFA — {topProduitsAll[0]?.qte || 0} unités vendues</div>
                  </div>
                </div>
                <TopProduitsCard topProduits={topProduitsAll} title="Classement complet de tous les produits" />
              </>
            )}

            {/* ── ONGLET STOCKS ── */}
            {activeTab === "stocks" && (
              <StockInterface
                pharmacies={pharmacies}
                onAddPharmacie={onAddPharmacie}
                onDeletePharmacie={onDeletePharmacie}
                onAddLivraison={onAddLivraison}
                onDeletePharmacieProduit={onDeletePharmacieProduit}
              />
            )}

            {/* ── ONGLET STATISTIQUES ── */}
            {activeTab === "stats" && (
              <>
                <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 18 }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#1a365d", fontSize: 15 }}>📈 Évolution du CA par mois</div>
                  {monthlyStats.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "#a0aec0" }}>Aucune donnée disponible</div>
                  ) : (
                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {monthlyStats.map((m, i) => {
                        const maxCA = Math.max(...monthlyStats.map(x => x.ca));
                        const pct = maxCA > 0 ? (m.ca / maxCA) * 100 : 0;
                        const moisLabel = new Date(m.mois + "-01").toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
                        return (
                          <div key={m.mois}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                              <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{moisLabel}</span>
                              <span style={{ fontWeight: 700, color: "#276749" }}>{fmt(m.ca)} FCFA <span style={{ color: "#a0aec0", fontWeight: 400 }}>({m.visites} rapport{m.visites > 1 ? "s" : ""})</span></span>
                            </div>
                            <div style={{ height: 12, background: "#e2e8f0", borderRadius: 10 }}>
                              <div style={{ height: "100%", width: pct + "%", background: i === 0 ? "linear-gradient(90deg,#276749,#48bb78)" : "linear-gradient(90deg,#2b6cb0,#63b3ed)", borderRadius: 10, transition: "width 0.6s" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                  <div style={{ background: "white", borderRadius: 14, padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
                    <div style={{ fontWeight: 800, color: "#1a365d", marginBottom: 14, fontSize: 15 }}>🏆 Meilleure commerciale</div>
                    {rankingAll[0] && (
                      <>
                        <div style={{ fontSize: 32 }}>🥇</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#d69e2e", marginTop: 8 }}>{rankingAll[0].nom}</div>
                        <div style={{ fontSize: 14, color: "#276749", fontWeight: 700, marginTop: 4 }}>{fmt(rankingAll[0].total)} FCFA</div>
                        <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>{rankingAll[0].visites} visites — moy. {fmt(rankingAll[0].visites ? rankingAll[0].total / rankingAll[0].visites : 0)} F/visite</div>
                      </>
                    )}
                  </div>
                  <div style={{ background: "white", borderRadius: 14, padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
                    <div style={{ fontWeight: 800, color: "#1a365d", marginBottom: 14, fontSize: 15 }}>🛒 Produit N°1</div>
                    {topProduitsAll[0] && (
                      <>
                        <div style={{ fontSize: 32 }}>⭐</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#d69e2e", marginTop: 8, lineHeight: 1.4 }}>{topProduitsAll[0].nom}</div>
                        <div style={{ fontSize: 14, color: "#276749", fontWeight: 700, marginTop: 4 }}>{fmt(topProduitsAll[0].ca)} FCFA</div>
                        <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>{topProduitsAll[0].qte} unités vendues</div>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ background: "white", borderRadius: 14, padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
                  <div style={{ fontWeight: 800, color: "#1a365d", marginBottom: 14, fontSize: 15 }}>📊 Récapitulatif global</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                    {[
                      { label: "CA total toutes périodes", value: fmt(sales.reduce((s,e)=>s+e.total,0)) + " FCFA" },
                      { label: "Nombre total de rapports", value: sales.length },
                      { label: "Pharmacies différentes visitées", value: new Set(sales.map(s=>s.pharmacie)).size },
                      { label: "Moyenne CA par rapport", value: sales.length ? fmt(sales.reduce((s,e)=>s+e.total,0)/sales.length) + " FCFA" : "—" },
                      { label: "Produits différents vendus", value: topProduitsAll.length },
                      { label: "Meilleur mois", value: monthlyStats[0] ? new Date(monthlyStats[0].mois+"-01").toLocaleDateString("fr-FR",{month:"long",year:"numeric"}) : "—" },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#f7fafc", borderRadius: 10, padding: "12px 16px" }}>
                        <div style={{ fontSize: 11, color: "#718096", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>{s.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#1a365d", marginTop: 6 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [sales, setSales] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Écoute ventes en temps réel
  useEffect(() => {
    const q = query(collection(db, "ventes"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  // Écoute pharmacies/stocks en temps réel
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pharmacies"), (snap) => {
      setPharmacies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Soumettre une vente + décrémenter le stock
  const handleNewSale = async (entry) => {
    try {
      await addDoc(collection(db, "ventes"), { ...entry, timestamp: new Date().toISOString() });
      // Trouver la pharmacie dans la base de stock
      const pharmDoc = pharmacies.find(p => p.nom.toLowerCase().trim() === entry.pharmacie.toLowerCase().trim());
      if (pharmDoc) {
        const produits = { ...pharmDoc.produits };
        entry.lignes.forEach(l => {
          if (produits[l.produit] !== undefined) {
            const qteVendue = parseInt(l.quantite) || 0;
            produits[l.produit] = {
              ...produits[l.produit],
              restant: Math.max(0, produits[l.produit].restant - qteVendue)
            };
          }
        });
        await updateDoc(doc(db, "pharmacies", pharmDoc.id), { produits });
      }
    } catch(e) {
      alert("Erreur d'envoi. Vérifiez votre connexion internet.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce rapport ?")) return;
    try { await deleteDoc(doc(db, "ventes", id)); } catch(e) { alert("Erreur de suppression."); }
  };

  const handleResetAll = async () => {
    if (!window.confirm("ATTENTION ! Vous allez supprimer TOUS les rapports. Cette action est irreversible. Etes-vous sur ?")) return;
    if (!window.confirm("Derniere confirmation : effacer TOUTES les données et repartir a zero ?")) return;
    try {
      await Promise.all(sales.map(s => deleteDoc(doc(db, "ventes", s.id))));
      alert("Toutes les données ont été effacées. L application repart a zero !");
    } catch(e) {
      alert("Erreur lors de la réinitialisation.");
    }
  };

  // Ajouter une pharmacie
  const handleAddPharmacie = async (data) => {
    try {
      await addDoc(collection(db, "pharmacies"), { ...data, createdAt: new Date().toISOString() });
    } catch(e) { alert("Erreur lors de l ajout."); }
  };

  // Supprimer une pharmacie
  const handleDeletePharmacie = async (id, nom) => {
    if (!window.confirm("Supprimer la pharmacie " + nom + " et tout son stock ?")) return;
    try { await deleteDoc(doc(db, "pharmacies", id)); } catch(e) { alert("Erreur de suppression."); }
  };

  // Ajouter/mettre à jour une livraison
  const handleAddLivraison = async (pharmId, produit, qte, dateLivraison) => {
    try {
      const pharm = pharmacies.find(p => p.id === pharmId);
      if (!pharm) return;
      const produits = { ...pharm.produits };
      const historique = pharm.historiqueLivraisons ? [...pharm.historiqueLivraisons] : [];
      historique.unshift({ produit, quantite: qte, date: dateLivraison || today(), timestamp: new Date().toISOString() });
      if (produits[produit]) {
        produits[produit] = {
          initial: produits[produit].initial + qte,
          restant: produits[produit].restant + qte,
          dernierelivraison: dateLivraison || today()
        };
      } else {
        produits[produit] = { initial: qte, restant: qte, dernierelivraison: dateLivraison || today() };
      }
      await updateDoc(doc(db, "pharmacies", pharmId), { produits, historiqueLivraisons: historique.slice(0, 50) });
    } catch(e) { alert("Erreur lors de la livraison."); }
  };

  // Supprimer un produit du stock d'une pharmacie
  const handleDeletePharmacieProduit = async (pharmId, produit) => {
    if (!window.confirm("Supprimer " + produit + " du stock ?")) return;
    try {
      const pharm = pharmacies.find(p => p.id === pharmId);
      if (!pharm) return;
      const produits = { ...pharm.produits };
      delete produits[produit];
      await updateDoc(doc(db, "pharmacies", pharmId), { produits });
    } catch(e) { alert("Erreur de suppression."); }
  };

  if (!user) return <LoginScreen onLogin={setUser} />;
  if (user.role === "commerciale")
    return <CommercialInterface user={user} sales={sales} pharmacies={pharmacies} onSubmit={handleNewSale} onLogout={() => setUser(null)} />;
  return <AdminInterface sales={sales} onDelete={handleDelete} onResetAll={handleResetAll} onLogout={() => setUser(null)} user={user} loading={loading} pharmacies={pharmacies} onAddPharmacie={handleAddPharmacie} onDeletePharmacie={handleDeletePharmacie} onAddLivraison={handleAddLivraison} onDeletePharmacieProduit={handleDeletePharmacieProduit} />;
}
