import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Clock, Calendar, Users, Key, Database, 
  Shield, Activity, Save, Plus, Trash2, Layout,
  Layers, Lock, AlertTriangle, Edit2, X, ToggleLeft, ToggleRight,
  CheckCircle2, RefreshCw, Sliders, Palette, Zap, FileSpreadsheet,
  MessageSquare, Briefcase, Eye, ShieldAlert, Sparkles, Download,
  Upload, Image as ImageIcon, Link as LinkIcon, RotateCcw, Check, ShieldCheck, ArrowRight
} from 'lucide-react';
import LogoMairie from './LogoMairie';
import { api } from '../api';
import { Parameter, Holiday, RMO, User, CustomStatusConfig } from '../types';
import UserManagementView from './UserManagementView';
import SessionStatsView from './SessionStatsView';
import { cn } from '../lib/utils';

export default function AdministrationView({ currentUser }: { currentUser: User }) {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'modules' | 'workflow' | 'sla' | 'security' | 'users' | 'rmo' | 'sessions' | 'logs'>('general');
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [rmos, setRmos] = useState<RMO[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Logo management state
  const [logoMode, setLogoMode] = useState<'upload' | 'presets' | 'url'>('upload');
  const [logoInputUrl, setLogoInputUrl] = useState('');
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoSuccessMsg, setLogoSuccessMsg] = useState<string | null>(null);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for general & modules
  const [paramsMap, setParamsMap] = useState<Record<string, string>>({
    app_name: 'DIGICAB • ML',
    mairie_name: 'Mairie de Libreville - République Gabonaise',
    dash_subtitle: 'Tableau de Bord Stratégique',
    port_subtitle: 'Pilotage Stratégique / Cabinet du Maire',
    sync_label: 'Synchronisation de la Gouvernance',
    footer_text: 'Système Intégré de Gestion et de Traçabilité • Cabinet du Maire de Libreville',
    splash_enabled: 'true',
    splash_duration: '3',
    theme_style: 'gold_navy',

    feature_dashboard: 'true',
    feature_portfolio: 'true',
    feature_dossiers: 'true',
    feature_search: 'true',
    feature_committees: 'true',
    feature_chat: 'true',
    feature_reports: 'true',
    feature_presence: 'true',

    dossier_prefix: 'CAB-ML-',
    dossier_require_company: 'false',
    dossier_allow_delete: 'true',
    dossier_ml_validation_required: 'true',

    heure_debut: '08:00',
    heure_fin: '18:00',
    heure_pause_debut: '12:30',
    heure_pause_fin: '13:30',
    work_saturday: 'false',
    delai_moyen_traitement: '48',
    seuil_alerte_echeance: '12',

    session_timeout_minutes: '30',
    session_timeout_after_hours_only: 'true',
    chat_allow_standard_to_manager: 'false',
    security_min_password_length: '6',
    allow_self_registration: 'false'
  });

  // Dynamic lists
  const [circuits, setCircuits] = useState<string[]>([
    'Normal SP', 'Normal SC', 'Digitalisation', 'Express Cabinet', 'Confidentiel ML', 'Direction Générale'
  ]);
  const [priorities, setPriorities] = useState<string[]>([
    'Faible', 'Normale', 'Urgente', 'Très Urgente'
  ]);
  const [statuses, setStatuses] = useState<CustomStatusConfig[]>([
    { code: 'EN_ATTENTE_SIGNATURE', label: 'En attente de signature', color: 'amber' },
    { code: 'EN_COURS', label: 'En cours d\'instruction', color: 'blue' },
    { code: 'TRAITE', label: 'Traité', color: 'emerald' },
    { code: 'TRAITÉ ET VALIDÉ', label: 'Traité et Validé', color: 'green' },
    { code: 'SUSPENDU', label: 'Suspendu', color: 'orange' },
    { code: 'ANNULE', label: 'Annulé', color: 'rose' },
    { code: 'TRANSFERE', label: 'Transféré', color: 'purple' },
    { code: 'ARCHIVE', label: 'Archivé', color: 'slate' },
    { code: 'EN_COPIL', label: 'En Comité COPIL', color: 'indigo' },
    { code: 'EN_COTECH', label: 'En Comité COTECH', color: 'cyan' },
    { code: 'EN_COMEV', label: 'En Comité COMEV', color: 'teal' },
    { code: 'REJETE', label: 'Rejeté', color: 'red' },
    { code: 'EN_CORRECTION', label: 'En correction', color: 'yellow' }
  ]);

  // Modals
  const [isRMOModalOpen, setIsRMOModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [editingRMO, setEditingRMO] = useState<RMO | null>(null);
  const [rmoFormData, setRmoFormData] = useState({ code: '', name: '', displayOrder: 0 });
  const [holidayFormData, setHolidayFormData] = useState<{date: string, type: 'FERIE' | 'ASTREINTE'}>({ date: new Date().toISOString().split('T')[0], type: 'FERIE' });

  // Temp input states for new circuit/priority/status
  const [newCircuit, setNewCircuit] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [newStatus, setNewStatus] = useState<CustomStatusConfig>({ code: '', label: '', color: 'blue' });

  const isManager = ['ADMIN', 'MAIRE', 'SP-ML', 'DC-ML', 'CTML', 'RESPONSABLE'].includes(currentUser.role);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [pData, hData, rData] = await Promise.all([
        api.getParameters(),
        api.getHolidays(),
        api.getRMOs()
      ]);
      setParameters(pData);
      setHolidays(hData);
      setRmos(rData);

      const map: Record<string, string> = {};
      pData.forEach(p => {
        map[p.key] = p.value;
      });

      setParamsMap(prev => ({ ...prev, ...map }));

      // Parse JSON lists if present
      if (map.dossier_circuits) {
        try {
          const parsed = JSON.parse(map.dossier_circuits);
          if (Array.isArray(parsed)) setCircuits(parsed);
        } catch (e) {}
      }
      if (map.dossier_priorities) {
        try {
          const parsed = JSON.parse(map.dossier_priorities);
          if (Array.isArray(parsed)) setPriorities(parsed);
        } catch (e) {}
      }
      if (map.dossier_statuses) {
        try {
          const parsed = JSON.parse(map.dossier_statuses);
          if (Array.isArray(parsed)) setStatuses(parsed);
        } catch (e) {}
      }
    } catch (err) {
      console.error("Erreur chargement admin", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        ...paramsMap,
        dossier_circuits: JSON.stringify(circuits),
        dossier_priorities: JSON.stringify(priorities),
        dossier_statuses: JSON.stringify(statuses),
      };

      await api.saveBulkParameters(payload);
      if (paramsMap.custom_logo) {
        localStorage.setItem('digicab_custom_logo', paramsMap.custom_logo);
      } else {
        localStorage.removeItem('digicab_custom_logo');
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      window.dispatchEvent(new CustomEvent('settings-updated'));
    } catch (err: any) {
      alert("Erreur lors de la sauvegarde : " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Êtes-vous certain de vouloir réinitialiser l'ensemble des paramètres aux valeurs officielles par défaut ?")) return;
    setSaving(true);
    try {
      localStorage.removeItem('digicab_custom_logo');
      await api.resetParameters();
      await loadAllData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      window.dispatchEvent(new CustomEvent('settings-updated'));
    } catch (err: any) {
      alert("Erreur de réinitialisation : " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Specific Logo Actions
  const handleLogoFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("Le fichier est trop volumineux. La taille maximale recommandée est de 15 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setParamsMap(prev => ({ ...prev, custom_logo: dataUrl }));
        setLogoSuccessMsg("Fichier image chargé ! Cliquez sur « Appliquer ce Logo » pour sauvegarder.");
        setTimeout(() => setLogoSuccessMsg(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogoDirect = async (logoVal?: string) => {
    setLogoSaving(true);
    const targetVal = logoVal !== undefined ? logoVal : (paramsMap.custom_logo || '');
    try {
      await api.updateParameter('custom_logo', targetVal);
      if (targetVal) {
        localStorage.setItem('digicab_custom_logo', targetVal);
      } else {
        localStorage.removeItem('digicab_custom_logo');
      }
      setParamsMap(prev => ({ ...prev, custom_logo: targetVal }));
      window.dispatchEvent(new CustomEvent('settings-updated'));
      setLogoSuccessMsg(targetVal ? "Logo institutionnel enregistré avec succès !" : "Blason officiel vectoriel rétabli avec succès !");
      setTimeout(() => setLogoSuccessMsg(null), 3500);
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement du logo : " + (err.message || err));
    } finally {
      setLogoSaving(false);
    }
  };

  const handleRestoreOfficialLogo = async () => {
    if (!window.confirm("Rétablir le blason officiel vectoriel de la Mairie de Libreville (avec lions-marins d'or et drapeaux tricolores) ?")) return;
    await handleSaveLogoDirect('');
  };

  const toggleParam = (key: string) => {
    const current = paramsMap[key] === 'true';
    setParamsMap(prev => ({ ...prev, [key]: current ? 'false' : 'true' }));
  };

  // Circuits manipulation
  const handleAddCircuit = () => {
    if (!newCircuit.trim()) return;
    if (circuits.includes(newCircuit.trim())) return;
    setCircuits([...circuits, newCircuit.trim()]);
    setNewCircuit('');
  };
  const handleRemoveCircuit = (c: string) => {
    setCircuits(circuits.filter(item => item !== c));
  };

  // Priorities manipulation
  const handleAddPriority = () => {
    if (!newPriority.trim()) return;
    if (priorities.includes(newPriority.trim())) return;
    setPriorities([...priorities, newPriority.trim()]);
    setNewPriority('');
  };
  const handleRemovePriority = (p: string) => {
    setPriorities(priorities.filter(item => item !== p));
  };

  // Statuses manipulation
  const handleAddStatus = () => {
    if (!newStatus.code.trim() || !newStatus.label.trim()) return;
    const formattedCode = newStatus.code.trim().toUpperCase().replace(/\s+/g, '_');
    if (statuses.some(s => s.code === formattedCode)) {
      alert("Ce code de statut existe déjà !");
      return;
    }
    setStatuses([...statuses, { ...newStatus, code: formattedCode }]);
    setNewStatus({ code: '', label: '', color: 'blue' });
  };
  const handleRemoveStatus = (code: string) => {
    setStatuses(statuses.filter(s => s.code !== code));
  };

  // RMO Handlers
  const openRMOModal = (rmo?: RMO) => {
    if (rmo) {
      setEditingRMO(rmo);
      setRmoFormData({ code: rmo.code, name: rmo.name, displayOrder: rmo.displayOrder });
    } else {
      setEditingRMO(null);
      setRmoFormData({ code: '', name: '', displayOrder: rmos.length + 1 });
    }
    setIsRMOModalOpen(true);
  };

  const handleRMOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRMO) {
        await api.updateRMO(editingRMO.id, rmoFormData);
      } else {
        await api.createRMO(rmoFormData);
      }
      setIsRMOModalOpen(false);
      setEditingRMO(null);
      setRmoFormData({ code: '', name: '', displayOrder: 0 });
      const r = await api.getRMOs();
      setRmos(r);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteRMO = async (id: number) => {
    if (!confirm("Supprimer cette unité RMO ?")) return;
    try {
      await api.deleteRMO(id);
      const r = await api.getRMOs();
      setRmos(r);
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Holidays
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addHoliday(holidayFormData);
      setIsHolidayModalOpen(false);
      const h = await api.getHolidays();
      setHolidays(h);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (!confirm("Supprimer cet évènement du calendrier ?")) return;
    try {
      await api.deleteHoliday(id);
      const h = await api.getHolidays();
      setHolidays(h);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const subTabs = [
    { id: 'general', label: '1. Identité & Visuel', icon: Layout, desc: 'Nom, Mairie, Slogans & Écran d\'accueil' },
    { id: 'modules', label: '2. Modules & Feature Flags', icon: Zap, desc: 'Activer / Désactiver les fonctionnalités' },
    { id: 'workflow', label: '3. Dossiers & Workflows', icon: Sliders, desc: 'Préfixes, Circuits, Priorités & Statuts' },
    { id: 'sla', label: '4. Horaires & Délais SLA', icon: Clock, desc: 'Heures ouvrées, Pauses, Samedis & Fériés' },
    { id: 'security', label: '5. Sécurité & Sessions', icon: Lock, desc: 'Déconnexion auto & Restrictions chat' },
    { id: 'users', label: '6. Utilisateurs & Droits', icon: Shield, desc: 'Comptes & Permissions granulaires' },
    { id: 'rmo', label: '7. Unités RMO', icon: Layers, desc: 'Directions & Organigramme' },
    ...(isManager ? [{ id: 'sessions', label: '8. Présence & Temps', icon: Activity, desc: 'Statistiques de connexion' }] : []),
    { id: 'logs', label: '9. Audit & Traçabilité', icon: Database, desc: 'Historique des actions système' },
  ];

  return (
    <div className="p-6 md:p-8 h-full flex flex-col gap-6 bg-slate-50 overflow-hidden font-sans">
      {/* Top Header with Save and Reset Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-gold/30 shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-navy text-gold rounded-xl shadow-lg">
            <Settings size={28} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-serif font-black text-navy uppercase tracking-tight">Centre de Personnalisation Globale</h2>
              <span className="bg-gold text-navy text-[0.65rem] font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest">ADMIN FULL-CONTROL</span>
            </div>
            <p className="text-[0.7rem] font-bold text-text-muted uppercase tracking-[3px] mt-1">
              Configuration intégrale des modules, workflows, identités et règles métier
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/digicab_project.zip"
            download="digicab_project.zip"
            className="px-4 py-2.5 rounded-xl border border-gold/40 bg-gold/10 text-navy hover:bg-gold/20 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            title="Télécharger l'archive ZIP du code source pour Antigravity"
          >
            <Download size={14} className="text-gold" />
            Télécharger ZIP
          </a>

          <button
            onClick={handleResetDefaults}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            title="Rétablir la configuration standard d'usine"
          >
            <RefreshCw size={14} />
            Réinitialiser Défauts
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-navy text-gold hover:bg-navy-light font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl hover:scale-105"
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Enregistrement...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-400" />
                Modifications Appliquées !
              </>
            ) : (
              <>
                <Save size={16} />
                Enregistrer Tout
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border shrink-0",
                isActive 
                  ? "bg-navy text-gold border-gold shadow-lg transform scale-102" 
                  : "bg-white text-navy/70 border-slate-200 hover:bg-slate-100 hover:text-navy"
              )}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* 1. IDENTITÉ VISUELLE & AFFICHAGE */}
        {activeSubTab === 'general' && (
          <div className="space-y-6">
            {/* MODULE GESTION & CHANGEMENT DU LOGO */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gold/40 space-y-6">
              {/* Header with Title and Current Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-navy text-gold rounded-xl shadow-md">
                    <ImageIcon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-black text-navy text-lg uppercase tracking-tight">Logo & Armoiries de l'Application</h3>
                      <span className="bg-gold/20 text-navy font-bold text-[0.65rem] uppercase px-2 py-0.5 rounded-md border border-gold/30">
                        OFFICIEL
                      </span>
                    </div>
                    <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                      Personnalisez le blason et le logo visibles sur la barre latérale, le splash, la connexion et les filigranes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!paramsMap.custom_logo ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-200">
                      <ShieldCheck size={14} className="text-amber-600" />
                      Blason Officiel SVG Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-200">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Logo Personnalisé Actif
                    </span>
                  )}
                </div>
              </div>

              {logoSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{logoSuccessMsg}</span>
                  </div>
                  <button onClick={() => setLogoSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Main Content Grid: Left Options & Right Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left (7 cols): Controls & Sources */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Mode Tabs */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setLogoMode('upload')}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                        logoMode === 'upload' 
                          ? "bg-navy text-gold shadow-sm" 
                          : "text-slate-600 hover:text-navy hover:bg-slate-200/50"
                      )}
                    >
                      <Upload size={14} />
                      Téléverser Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoMode('presets')}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                        logoMode === 'presets' 
                          ? "bg-navy text-gold shadow-sm" 
                          : "text-slate-600 hover:text-navy hover:bg-slate-200/50"
                      )}
                    >
                      <Shield size={14} />
                      Préréglages Mairie
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoMode('url')}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                        logoMode === 'url' 
                          ? "bg-navy text-gold shadow-sm" 
                          : "text-slate-600 hover:text-navy hover:bg-slate-200/50"
                      )}
                    >
                      <LinkIcon size={14} />
                      Lien URL
                    </button>
                  </div>

                  {/* Mode 1: Upload */}
                  {logoMode === 'upload' && (
                    <div className="space-y-3">
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                        onDragLeave={() => setIsDraggingLogo(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingLogo(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleLogoFile(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3",
                          isDraggingLogo 
                            ? "border-gold bg-gold/10 scale-[1.01]" 
                            : "border-slate-300 hover:border-gold bg-slate-50/70 hover:bg-slate-50"
                        )}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleLogoFile(e.target.files[0]);
                            }
                          }}
                        />
                        <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center text-navy">
                          <Upload size={24} className="text-navy group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-navy uppercase tracking-wide">
                            Glissez-déposez votre logo ici ou <span className="text-gold underline">parcourez</span>
                          </p>
                          <p className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider mt-1">
                            PNG, SVG, JPG, WEBP • Résolution recommandée : 512x512 ou supérieure
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Presets */}
                  {logoMode === 'presets' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setParamsMap(prev => ({ ...prev, custom_logo: '' }));
                          setLogoSuccessMsg("Blason officiel sélectionné ! Cliquez sur « Appliquer ce Logo ».");
                        }}
                        className={cn(
                          "p-3 rounded-xl border text-left flex items-center gap-3 transition-all",
                          !paramsMap.custom_logo
                            ? "border-gold bg-gold/10 ring-2 ring-gold/40 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:bg-white"
                        )}
                      >
                        <div className="w-12 h-12 rounded-lg bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0">
                          <LogoMairie className="w-10 h-10" src="" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-navy leading-tight">Blason Officiel SVG</div>
                          <div className="text-[0.65rem] text-slate-500 mt-0.5">Armoiries vectorielles pures de Libreville</div>
                          {!paramsMap.custom_logo && (
                            <span className="text-[0.6rem] font-black text-gold uppercase tracking-wider block mt-1">Actif</span>
                          )}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setParamsMap(prev => ({ ...prev, custom_logo: '/Logo.mairie.png' }));
                          setLogoSuccessMsg("Fichier image officiel sélectionné ! Cliquez sur « Appliquer ce Logo ».");
                        }}
                        className={cn(
                          "p-3 rounded-xl border text-left flex items-center gap-3 transition-all",
                          paramsMap.custom_logo === '/Logo.mairie.png'
                            ? "border-gold bg-gold/10 ring-2 ring-gold/40 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:bg-white"
                        )}
                      >
                        <div className="w-12 h-12 rounded-lg bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0">
                          <img src="/Logo.mairie.png" alt="Logo.mairie.png" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-navy leading-tight">Image Logo.mairie.png</div>
                          <div className="text-[0.65rem] text-slate-500 mt-0.5">Fichier PNG fourni par le Cabinet</div>
                          {paramsMap.custom_logo === '/Logo.mairie.png' && (
                            <span className="text-[0.6rem] font-black text-gold uppercase tracking-wider block mt-1">Actif</span>
                          )}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setParamsMap(prev => ({ ...prev, custom_logo: '/logo.svg' }));
                          setLogoSuccessMsg("Fichier logo.svg sélectionné ! Cliquez sur « Appliquer ce Logo ».");
                        }}
                        className={cn(
                          "p-3 rounded-xl border text-left flex items-center gap-3 transition-all",
                          paramsMap.custom_logo === '/logo.svg'
                            ? "border-gold bg-gold/10 ring-2 ring-gold/40 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:bg-white"
                        )}
                      >
                        <div className="w-12 h-12 rounded-lg bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0">
                          <img src="/logo.svg" alt="logo.svg" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-navy leading-tight">Fichier logo.svg</div>
                          <div className="text-[0.65rem] text-slate-500 mt-0.5">Asset SVG vectoriel autonome</div>
                          {paramsMap.custom_logo === '/logo.svg' && (
                            <span className="text-[0.6rem] font-black text-gold uppercase tracking-wider block mt-1">Actif</span>
                          )}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setParamsMap(prev => ({ ...prev, custom_logo: '/logo.png' }));
                          setLogoSuccessMsg("Fichier logo.png sélectionné ! Cliquez sur « Appliquer ce Logo ».");
                        }}
                        className={cn(
                          "p-3 rounded-xl border text-left flex items-center gap-3 transition-all",
                          paramsMap.custom_logo === '/logo.png'
                            ? "border-gold bg-gold/10 ring-2 ring-gold/40 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:bg-white"
                        )}
                      >
                        <div className="w-12 h-12 rounded-lg bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0">
                          <img src="/logo.png" alt="logo.png" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-navy leading-tight">Fichier logo.png</div>
                          <div className="text-[0.65rem] text-slate-500 mt-0.5">Image raster standard</div>
                          {paramsMap.custom_logo === '/logo.png' && (
                            <span className="text-[0.6rem] font-black text-gold uppercase tracking-wider block mt-1">Actif</span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Mode 3: Custom URL */}
                  {logoMode === 'url' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">
                          URL / Chemin de l'image
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={logoInputUrl}
                            onChange={(e) => setLogoInputUrl(e.target.value)}
                            placeholder="https://exemple.com/mon-logo.png ou /images/logo.svg"
                            className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-medium text-navy text-sm focus:bg-white focus:ring-2 focus:ring-gold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!logoInputUrl.trim()) return;
                              setParamsMap(prev => ({ ...prev, custom_logo: logoInputUrl.trim() }));
                              setLogoSuccessMsg("URL appliquée ! Cliquez sur « Appliquer ce Logo » pour sauvegarder.");
                            }}
                            className="px-4 py-2.5 bg-navy text-gold font-black text-xs uppercase tracking-wider rounded-lg hover:bg-navy/90"
                          >
                            Prévisualiser
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for Logo */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveLogoDirect()}
                      disabled={logoSaving}
                      className="px-5 py-2.5 bg-navy hover:bg-navy/90 text-gold font-black text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center gap-2 transition-all border border-gold/40"
                    >
                      {logoSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                      Appliquer & Enregistrer ce Logo
                    </button>

                    <button
                      type="button"
                      onClick={handleRestoreOfficialLogo}
                      disabled={logoSaving}
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 flex items-center gap-2 transition-all shadow-sm"
                    >
                      <RotateCcw size={14} />
                      Restaurer le Blason Officiel
                    </button>
                  </div>
                </div>

                {/* Right (5 cols): Live Preview Across Key Contexts */}
                <div className="lg:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[0.7rem] font-black text-navy uppercase tracking-widest flex items-center gap-1.5">
                      <Eye size={14} className="text-gold" />
                      Aperçu en Conditions Réelles
                    </span>
                    <span className="text-[0.6rem] font-bold text-slate-500 uppercase">
                      Mise à jour en direct
                    </span>
                  </div>

                  {/* Context 1: Sidebar preview */}
                  <div className="bg-[#0B132B] p-4 rounded-xl border border-gold/30 shadow-inner flex items-center gap-3">
                    <LogoMairie className="w-12 h-12 shrink-0" src={paramsMap.custom_logo} />
                    <div className="overflow-hidden">
                      <div className="text-xs font-serif font-black text-gold uppercase tracking-wider truncate">
                        {paramsMap.app_name || 'DIGICAB • ML'}
                      </div>
                      <div className="text-[0.6rem] text-slate-300 font-bold uppercase tracking-widest truncate">
                        {paramsMap.mairie_name || 'Cabinet du Maire'}
                      </div>
                    </div>
                  </div>

                  {/* Context 2: Login Badge preview */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                    <div className="w-16 h-16 bg-navy rounded-full border-2 border-gold flex items-center justify-center shadow-md">
                      <LogoMairie className="w-10 h-10" src={paramsMap.custom_logo} />
                    </div>
                    <div className="ml-4">
                      <div className="text-[0.65rem] font-black text-navy uppercase tracking-wider">Badge de Connexion</div>
                      <div className="text-[0.6rem] text-slate-500">Affiché sur l'écran d'accès sécurisé</div>
                    </div>
                  </div>

                  {/* Context 3: Document header preview */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center space-y-2">
                    <div className="flex justify-center">
                      <LogoMairie className="w-14 h-14" src={paramsMap.custom_logo} />
                    </div>
                    <div className="text-[0.65rem] font-serif font-black text-navy uppercase tracking-widest">
                      RÉPUBLIQUE GABONAISE • VILLE DE LIBREVILLE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deux colonnes existantes : Titres & Textes Institutionnels, et Écran d'Accueil & Thème */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-navy text-gold rounded-lg"><Layout size={20} /></div>
                <div>
                  <h3 className="font-serif font-black text-navy text-lg uppercase">Titres & Textes Institutionnels</h3>
                  <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Personnalisez les noms et mentions</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Nom de l'Application</label>
                  <input
                    type="text"
                    value={paramsMap.app_name || ''}
                    onChange={e => setParamsMap({ ...paramsMap, app_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-navy text-sm focus:bg-white focus:ring-2 focus:ring-gold"
                    placeholder="Ex: DIGICAB • ML"
                  />
                </div>

                <div>
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Entité / Mairie Officielle</label>
                  <input
                    type="text"
                    value={paramsMap.mairie_name || ''}
                    onChange={e => setParamsMap({ ...paramsMap, mairie_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-navy text-sm focus:bg-white focus:ring-2 focus:ring-gold"
                    placeholder="Ex: Mairie de Libreville - République Gabonaise"
                  />
                </div>

                <div>
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Slogan de Synchronisation</label>
                  <input
                    type="text"
                    value={paramsMap.sync_label || ''}
                    onChange={e => setParamsMap({ ...paramsMap, sync_label: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-navy text-sm focus:bg-white focus:ring-2 focus:ring-gold"
                    placeholder="Ex: Synchronisation de la Gouvernance"
                  />
                </div>

                <div>
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Sous-titre Tableau de Bord</label>
                  <input
                    type="text"
                    value={paramsMap.dash_subtitle || ''}
                    onChange={e => setParamsMap({ ...paramsMap, dash_subtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-navy text-sm focus:bg-white focus:ring-2 focus:ring-gold"
                    placeholder="Ex: Tableau de Bord Stratégique"
                  />
                </div>

                <div>
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Sous-titre Portefeuille</label>
                  <input
                    type="text"
                    value={paramsMap.port_subtitle || ''}
                    onChange={e => setParamsMap({ ...paramsMap, port_subtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-navy text-sm focus:bg-white focus:ring-2 focus:ring-gold"
                    placeholder="Ex: Pilotage Stratégique / Cabinet du Maire"
                  />
                </div>

                <div>
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Mention Bas de Page (Footer)</label>
                  <input
                    type="text"
                    value={paramsMap.footer_text || ''}
                    onChange={e => setParamsMap({ ...paramsMap, footer_text: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-navy text-sm focus:bg-white focus:ring-2 focus:ring-gold"
                    placeholder="Ex: Système Intégré de Gestion et de Traçabilité..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-gold text-navy rounded-lg"><Sparkles size={20} /></div>
                <div>
                  <h3 className="font-serif font-black text-navy text-lg uppercase">Écran d'Accueil & Thème</h3>
                  <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Contrôle du Splash screen et de la palette</p>
                </div>
              </div>

              {/* Splash screen controls */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-navy uppercase">Afficher l'Écran d'Accueil (Splash Screen)</span>
                    <p className="text-[0.65rem] text-text-muted font-medium">Affiché au chargement initial avec le blason officiel</p>
                  </div>
                  <button
                    onClick={() => toggleParam('splash_enabled')}
                    className="text-navy hover:text-gold transition-colors"
                  >
                    {paramsMap.splash_enabled === 'true' ? (
                      <ToggleRight size={36} className="text-navy" />
                    ) : (
                      <ToggleLeft size={36} className="text-slate-400" />
                    )}
                  </button>
                </div>

                {paramsMap.splash_enabled === 'true' && (
                  <div>
                    <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">
                      Durée d'affichage du Splash : {paramsMap.splash_duration || '3'} seconde(s)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="1"
                      value={paramsMap.splash_duration || '3'}
                      onChange={e => setParamsMap({ ...paramsMap, splash_duration: e.target.value })}
                      className="w-full accent-navy cursor-pointer"
                    />
                    <div className="flex justify-between text-[0.6rem] text-slate-500 font-bold uppercase mt-1">
                      <span>1 sec (Ultra-rapide)</span>
                      <span>3 sec (Recommandé)</span>
                      <span>6 sec (Cérémonial)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme palette */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="text-xs font-black text-navy uppercase block">Thème Graphique</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'gold_navy', name: 'Or & Marine Impérial', colors: 'from-[#0B132B] to-[#D4AF37]' },
                    { id: 'royal_blue', name: 'Bleu Républicain & Argent', colors: 'from-[#1E3A8A] to-[#94A3B8]' },
                    { id: 'emerald_gold', name: 'Émeraude Institutionnel', colors: 'from-[#064E3B] to-[#F59E0B]' },
                    { id: 'slate_clean', name: 'Ardoise & Épure Moderne', colors: 'from-[#0F172A] to-[#64748B]' }
                  ].map(th => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setParamsMap({ ...paramsMap, theme_style: th.id })}
                      className={cn(
                        "p-3 rounded-xl border text-left flex items-center gap-3 transition-all",
                        paramsMap.theme_style === th.id 
                          ? "border-navy bg-white shadow-md ring-2 ring-gold" 
                          : "border-slate-200 bg-white/60 hover:bg-white"
                      )}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${th.colors} shadow-sm shrink-0`} />
                      <div>
                        <div className="text-xs font-black text-navy leading-tight">{th.name}</div>
                        <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider">{th.id === paramsMap.theme_style ? 'Sélectionné' : 'Activer'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* 2. MODULES & FEATURE FLAGS */}
        {activeSubTab === 'modules' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-navy text-gold rounded-lg"><Zap size={20} /></div>
              <div>
                <h3 className="font-serif font-black text-navy text-lg uppercase">Interrupteurs de Modules (Feature Flags)</h3>
                <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">
                  Activez ou masquez chaque fonctionnalité pour l'ensemble des utilisateurs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'feature_dashboard', title: 'Tableau de Bord Stratégique', desc: 'Indicateurs clés, volumétrie, répartition RMO et délais moyens', icon: Layout },
                { key: 'feature_portfolio', title: 'Portefeuille Exécutif', desc: 'Vue analytique par entité, taux de conversion et entonnoir', icon: FileSpreadsheet },
                { key: 'feature_dossiers', title: 'Gestion des Dossiers Cabinet', desc: 'Création, modification, circuit, fiches et pièces jointes', icon: Briefcase },
                { key: 'feature_search', title: 'Recherche Stratégique Avancée', desc: 'Moteur de recherche multi-critères et filtres pour décideurs', icon: Eye },
                { key: 'feature_committees', title: 'Gouvernance & Comités', desc: 'Gestion des COPIL, COTECH, COMEV et affectation des membres', icon: Users },
                { key: 'feature_chat', title: 'Messagerie Sécurisée', desc: 'Chat instantané hiérarchique et échanges temps réel', icon: MessageSquare },
                { key: 'feature_reports', title: 'Rapports & Audit Logs', desc: 'Traçabilité des transactions et historique des flux', icon: Database },
                { key: 'feature_presence', title: 'Gestion de Présence & Sessions', desc: 'Suivi du temps de travail, sessions actives et statistiques', icon: Clock },
              ].map(f => {
                const Icon = f.icon;
                const isEnabled = paramsMap[f.key] !== 'false';
                return (
                  <div 
                    key={f.key}
                    className={cn(
                      "p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4",
                      isEnabled ? "bg-white border-navy/30 shadow-sm" : "bg-slate-50/70 border-slate-200 opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl text-white", isEnabled ? "bg-navy" : "bg-slate-400")}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-navy text-sm leading-tight">{f.title}</h4>
                          <span className={cn(
                            "text-[0.6rem] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-1",
                            isEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                          )}>
                            {isEnabled ? 'MODULE ACTIF' : 'DÉSACTIVÉ'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleParam(f.key)}
                        className="text-navy hover:text-gold transition-colors shrink-0"
                      >
                        {isEnabled ? (
                          <ToggleRight size={32} className="text-navy" />
                        ) : (
                          <ToggleLeft size={32} className="text-slate-400" />
                        )}
                      </button>
                    </div>

                    <p className="text-[0.7rem] text-slate-500 font-medium leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. DOSSIERS & WORKFLOWS */}
        {activeSubTab === 'workflow' && (
          <div className="space-y-6">
            {/* Règles générales */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-navy text-gold rounded-lg"><Sliders size={20} /></div>
                <div>
                  <h3 className="font-serif font-black text-navy text-lg uppercase">Règles Métier & Numérotation</h3>
                  <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Personnalisez la génération et les contraintes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Préfixe Numéro Dossier</label>
                  <input
                    type="text"
                    value={paramsMap.dossier_prefix || 'CAB-ML-'}
                    onChange={e => setParamsMap({ ...paramsMap, dossier_prefix: e.target.value })}
                    className="w-full bg-white border border-slate-200 p-2 rounded font-mono font-bold text-navy text-sm"
                    placeholder="Ex: CAB-ML-"
                  />
                  <span className="text-[0.6rem] text-slate-400 block mt-1">Exemple : {paramsMap.dossier_prefix || 'CAB-ML-'}2026-0001</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-[0.65rem] font-black text-navy uppercase tracking-widest block">Entreprise Obligatoire</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-600 font-bold">{paramsMap.dossier_require_company === 'true' ? 'Oui (Obligatoire)' : 'Non (Facultatif)'}</span>
                    <button onClick={() => toggleParam('dossier_require_company')}>
                      {paramsMap.dossier_require_company === 'true' ? <ToggleRight size={28} className="text-navy" /> : <ToggleLeft size={28} className="text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-[0.65rem] font-black text-navy uppercase tracking-widest block">Validation Superviseur (ML)</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-600 font-bold">{paramsMap.dossier_ml_validation_required !== 'false' ? 'Exigée (Sécurisé)' : 'Désactivée'}</span>
                    <button onClick={() => toggleParam('dossier_ml_validation_required')}>
                      {paramsMap.dossier_ml_validation_required !== 'false' ? <ToggleRight size={28} className="text-navy" /> : <ToggleLeft size={28} className="text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-[0.65rem] font-black text-navy uppercase tracking-widest block">Suppression par Admin</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-600 font-bold">{paramsMap.dossier_allow_delete !== 'false' ? 'Autorisée' : 'Bloquée'}</span>
                    <button onClick={() => toggleParam('dossier_allow_delete')}>
                      {paramsMap.dossier_allow_delete !== 'false' ? <ToggleRight size={28} className="text-navy" /> : <ToggleLeft size={28} className="text-slate-400" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Circuits & Priorités */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Circuits */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h4 className="font-serif font-black text-navy text-md uppercase flex items-center justify-between">
                  <span>Circuits de Validation ({circuits.length})</span>
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCircuit}
                    onChange={e => setNewCircuit(e.target.value)}
                    placeholder="Nom du nouveau circuit..."
                    className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded text-xs font-bold text-navy"
                  />
                  <button
                    onClick={handleAddCircuit}
                    className="bg-navy text-gold px-3 py-2 rounded text-xs font-black uppercase flex items-center gap-1 hover:bg-navy-light"
                  >
                    <Plus size={14} /> Ajouter
                  </button>
                </div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {circuits.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-xs font-bold text-navy">{c}</span>
                      <button onClick={() => handleRemoveCircuit(c)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priorités */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h4 className="font-serif font-black text-navy text-md uppercase flex items-center justify-between">
                  <span>Niveaux de Priorité ({priorities.length})</span>
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                    placeholder="Libellé priorité (ex: Critique)..."
                    className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded text-xs font-bold text-navy"
                  />
                  <button
                    onClick={handleAddPriority}
                    className="bg-navy text-gold px-3 py-2 rounded text-xs font-black uppercase flex items-center gap-1 hover:bg-navy-light"
                  >
                    <Plus size={14} /> Ajouter
                  </button>
                </div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {priorities.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-xs font-bold text-navy">{p}</span>
                      <button onClick={() => handleRemovePriority(p)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statuts des dossiers */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h4 className="font-serif font-black text-navy text-md uppercase">
                Statuts des Dossiers & Badges ({statuses.length})
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="text"
                  value={newStatus.code}
                  onChange={e => setNewStatus({ ...newStatus, code: e.target.value })}
                  placeholder="Code (ex: EN_AUDIT)"
                  className="bg-white border border-slate-200 p-2 rounded text-xs font-bold text-navy uppercase"
                />
                <input
                  type="text"
                  value={newStatus.label}
                  onChange={e => setNewStatus({ ...newStatus, label: e.target.value })}
                  placeholder="Libellé (ex: En cours d'audit)"
                  className="bg-white border border-slate-200 p-2 rounded text-xs font-bold text-navy"
                />
                <select
                  value={newStatus.color}
                  onChange={e => setNewStatus({ ...newStatus, color: e.target.value })}
                  className="bg-white border border-slate-200 p-2 rounded text-xs font-bold text-navy"
                >
                  <option value="blue">Bleu</option>
                  <option value="emerald">Émeraude / Vert</option>
                  <option value="amber">Ambre / Orange</option>
                  <option value="rose">Rose / Rouge</option>
                  <option value="purple">Violet</option>
                  <option value="slate">Gris / Ardoise</option>
                  <option value="indigo">Indigo</option>
                  <option value="cyan">Cyan</option>
                  <option value="teal">Sarcelle</option>
                </select>
                <button
                  onClick={handleAddStatus}
                  className="bg-navy text-gold font-black px-4 py-2 rounded text-xs uppercase flex items-center justify-center gap-1 hover:bg-navy-light"
                >
                  <Plus size={14} /> Ajouter Statut
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {statuses.map((s, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-navy">{s.label}</div>
                      <span className="text-[0.6rem] font-mono text-slate-400 uppercase">{s.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color === 'emerald' ? '#10B981' : s.color === 'amber' ? '#F59E0B' : s.color === 'rose' ? '#F43F5E' : s.color === 'purple' ? '#A855F7' : '#3B82F6' }} />
                      <button onClick={() => handleRemoveStatus(s.code)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. HORAIRES & DÉLAIS SLA */}
        {activeSubTab === 'sla' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-navy text-gold rounded-lg"><Clock size={20} /></div>
                <div>
                  <h3 className="font-serif font-black text-navy text-lg uppercase">Plages Horaires & Base de Calcul</h3>
                  <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Base de calcul des délais légaux</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Heure de Début</label>
                    <input
                      type="time"
                      value={paramsMap.heure_debut || '08:00'}
                      onChange={e => setParamsMap({ ...paramsMap, heure_debut: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded font-bold text-navy text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Heure de Fin</label>
                    <input
                      type="time"
                      value={paramsMap.heure_fin || '18:00'}
                      onChange={e => setParamsMap({ ...paramsMap, heure_fin: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded font-bold text-navy text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Début Pause Déjeuner</label>
                    <input
                      type="time"
                      value={paramsMap.heure_pause_debut || '12:30'}
                      onChange={e => setParamsMap({ ...paramsMap, heure_pause_debut: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded font-bold text-navy text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Fin Pause Déjeuner</label>
                    <input
                      type="time"
                      value={paramsMap.heure_pause_fin || '13:30'}
                      onChange={e => setParamsMap({ ...paramsMap, heure_pause_fin: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded font-bold text-navy text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-navy uppercase block">Travailler le Samedi (Jour Ouvré)</span>
                    <p className="text-[0.65rem] text-slate-500 font-medium">Inclut le samedi dans le calcul des délais de traitement</p>
                  </div>
                  <button onClick={() => toggleParam('work_saturday')}>
                    {paramsMap.work_saturday === 'true' ? <ToggleRight size={32} className="text-navy" /> : <ToggleLeft size={32} className="text-slate-400" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Délai Référence (Heures)</label>
                    <input
                      type="number"
                      value={paramsMap.delai_moyen_traitement || '48'}
                      onChange={e => setParamsMap({ ...paramsMap, delai_moyen_traitement: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded font-bold text-navy text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Seuil Alerte (Heures)</label>
                    <input
                      type="number"
                      value={paramsMap.seuil_alerte_echeance || '12'}
                      onChange={e => setParamsMap({ ...paramsMap, seuil_alerte_echeance: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded font-bold text-navy text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calendrier Jours Fériés */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold text-navy rounded-lg"><Calendar size={20} /></div>
                  <div>
                    <h3 className="font-serif font-black text-navy text-lg uppercase">Calendrier des Exceptions ({holidays.length})</h3>
                    <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Jours fériés & Astreintes</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHolidayModalOpen(true)}
                  className="bg-navy text-gold px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1 hover:bg-navy-light"
                >
                  <Plus size={14} /> Ajouter
                </button>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {holidays.map(h => (
                  <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-navy">
                        {new Date(h.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <span className={cn(
                        "text-[0.6rem] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5",
                        h.type === 'FERIE' ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {h.type === 'FERIE' ? 'JOUR FÉRIÉ' : 'JOURNÉE D\'ASTREINTE'}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteHoliday(h.id)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. SÉCURITÉ & SESSIONS */}
        {activeSubTab === 'security' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-navy text-gold rounded-lg"><Lock size={20} /></div>
              <div>
                <h3 className="font-serif font-black text-navy text-lg uppercase">Sécurité Globale & Gestion des Sessions</h3>
                <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Paramètres d'authentification et d'inactivité</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-navy uppercase block">Déconnexion Automatique d'Inactivité</span>
                    <p className="text-[0.65rem] text-slate-500 font-medium">Ferme la session active en cas d'absence prolongée</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-navy">{paramsMap.session_timeout_minutes || '30'} minutes</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={paramsMap.session_timeout_minutes || '30'}
                  onChange={e => setParamsMap({ ...paramsMap, session_timeout_minutes: e.target.value })}
                  className="w-full accent-navy"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-navy uppercase block">Activer Déconnexion Uniquement Hors Heures Ouvrées</span>
                  <p className="text-[0.65rem] text-slate-500 font-medium">Déconnexion automatique appliquée après 16h30 / 18h00</p>
                </div>
                <button onClick={() => toggleParam('session_timeout_after_hours_only')}>
                  {paramsMap.session_timeout_after_hours_only === 'true' ? <ToggleRight size={32} className="text-navy" /> : <ToggleLeft size={32} className="text-slate-400" />}
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-navy uppercase block">Autoriser Standard vers Responsable (Chat)</span>
                  <p className="text-[0.65rem] text-slate-500 font-medium">Permet aux agents standards d'initier un chat vers un responsable sans invitation</p>
                </div>
                <button onClick={() => toggleParam('chat_allow_standard_to_manager')}>
                  {paramsMap.chat_allow_standard_to_manager === 'true' ? <ToggleRight size={32} className="text-navy" /> : <ToggleLeft size={32} className="text-slate-400" />}
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-navy uppercase block">Longueur Minimale Mot de Passe</span>
                  <p className="text-[0.65rem] text-slate-500 font-medium">Exigence pour les nouveaux comptes et réinitialisations</p>
                </div>
                <input
                  type="number"
                  min="4"
                  max="16"
                  value={paramsMap.security_min_password_length || '6'}
                  onChange={e => setParamsMap({ ...paramsMap, security_min_password_length: e.target.value })}
                  className="w-20 bg-white border border-slate-200 p-2 rounded font-bold text-navy text-sm text-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. UTILISATEURS & DROITS */}
        {activeSubTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[750px]">
            <UserManagementView currentUser={currentUser} />
          </div>
        )}

        {/* 7. UNITÉS RMO */}
        {activeSubTab === 'rmo' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-navy text-gold rounded-lg"><Layers size={20} /></div>
                <div>
                  <h3 className="font-serif font-black text-navy text-lg uppercase">Unités Responsables (RMO) ({rmos.length})</h3>
                  <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Organigramme & Hiérarchie du Cabinet du Maire</p>
                </div>
              </div>
              <button
                onClick={() => openRMOModal()}
                className="bg-navy text-gold px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-navy-light shadow-md"
              >
                <Plus size={16} /> Nouvelle Unité
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rmos.map(rmo => (
                <div key={rmo.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-gold transition-all relative">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-navy text-gold px-2.5 py-1 rounded text-xs font-black font-mono">{rmo.code}</span>
                    <div className="flex gap-1">
                      <button onClick={() => openRMOModal(rmo)} className="p-1.5 text-slate-400 hover:text-navy rounded hover:bg-white">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeleteRMO(rmo.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-white">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-navy text-sm mb-1">{rmo.name}</h4>
                  <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider">Ordre d'affichage : {rmo.displayOrder}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. SESSIONS & PRÉSENCE */}
        {activeSubTab === 'sessions' && <SessionStatsView />}

        {/* 9. AUDIT & LOGS */}
        {activeSubTab === 'logs' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-navy text-gold rounded-lg"><Database size={20} /></div>
                <div>
                  <h3 className="font-serif font-black text-navy text-lg uppercase">Journal d'Audit & Sécurité Système</h3>
                  <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Traçabilité complète des actions</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (confirm("Purger l'ensemble des journaux d'audit système ?")) {
                    await api.clearLogs();
                    alert("Journaux d'audit purgés.");
                  }
                }}
                className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-black uppercase flex items-center gap-2"
              >
                <Trash2 size={14} /> Purger les Logs
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
              <Activity size={32} className="mx-auto text-navy/40 animate-pulse" />
              <h4 className="font-bold text-navy text-sm">Système de Traçabilité Actif</h4>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                Toutes les créations de dossiers, modifications de statut, transferts hiérarchiques et sessions de connexion sont enregistrées de façon immuable dans la base SQLite sécurisée.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RMO MODAL */}
      <AnimatePresence>
        {isRMOModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRMOModalOpen(false)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border-2 border-gold overflow-hidden"
            >
              <div className="p-5 bg-navy text-gold flex justify-between items-center">
                <h3 className="text-lg font-serif font-black uppercase tracking-tight">
                  {editingRMO ? "Modifier l'Unité" : "Nouvelle Unité RMO"}
                </h3>
                <button onClick={() => setIsRMOModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleRMOSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Code Unité</label>
                  <input 
                    type="text" 
                    required
                    value={rmoFormData.code}
                    onChange={e => setRmoFormData({...rmoFormData, code: e.target.value.toUpperCase()})}
                    placeholder="Ex: DC, SP, SC, COM-FIN..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-navy text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Nom Complet</label>
                  <input 
                    type="text" 
                    required
                    value={rmoFormData.name}
                    onChange={e => setRmoFormData({...rmoFormData, name: e.target.value})}
                    placeholder="Ex: Direction du Cabinet..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-navy text-sm"
                  />
                </div>
                <div>
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Ordre d'Affichage</label>
                  <input 
                    type="number" 
                    required
                    value={rmoFormData.displayOrder}
                    onChange={e => setRmoFormData({...rmoFormData, displayOrder: parseInt(e.target.value) || 1})}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-navy text-sm"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-navy text-gold font-black rounded-xl shadow-lg hover:bg-navy-light transition-all uppercase tracking-widest text-xs mt-2"
                >
                  Enregistrer l'Unité
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* HOLIDAY MODAL */}
        {isHolidayModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHolidayModalOpen(false)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border-2 border-gold overflow-hidden"
            >
              <div className="p-5 bg-navy text-gold flex justify-between items-center">
                <h3 className="text-lg font-serif font-black uppercase tracking-tight">
                  Ajouter une Exception Calendrier
                </h3>
                <button onClick={() => setIsHolidayModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddHoliday} className="p-6 space-y-4">
                <div>
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={holidayFormData.date}
                    onChange={e => setHolidayFormData({...holidayFormData, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-navy text-sm"
                  />
                </div>
                <div>
                  <label className="text-[0.65rem] font-black text-navy uppercase tracking-widest block mb-1">Type d'Exception</label>
                  <select 
                    value={holidayFormData.type}
                    onChange={e => setHolidayFormData({...holidayFormData, type: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-navy text-sm"
                  >
                    <option value="FERIE">JOUR FÉRIÉ / NON OUVRÉ</option>
                    <option value="ASTREINTE">JOURNÉE D'ASTREINTE</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-navy text-gold font-black rounded-xl shadow-lg hover:bg-navy-light transition-all uppercase tracking-widest text-xs mt-2"
                >
                  Enregistrer l'Exception
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
