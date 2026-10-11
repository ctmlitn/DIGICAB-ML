import React, { useState, useEffect } from 'react';
import AppShell from './components/AppShell';
import Login from './components/Login';
import PortfolioView from './components/PortfolioView';
import DossierManagement from './components/DossierManagement';
import AdvancedSearchView from './components/AdvancedSearchView';
import UserManagementView from './components/UserManagementView';
import AdministrationView from './components/AdministrationView';
import CommitteesView from './components/CommitteesView';
import ChatSystem from './components/ChatSystem';
import DashboardView from './components/DashboardView';
import { User } from './types';
import { api } from './api';
import { motion } from 'motion/react';
import LogoMairie from './components/LogoMairie';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appName, setAppName] = useState('DIGICAB • ML');
  const [mairieName, setMairieName] = useState('Mairie de Libreville - République Gabonaise');
  const [settings, setSettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initialized, setInitialized] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const lastActivityRef = React.useRef(Date.now());

  const loadSettings = async () => {
    try {
      const params = await api.getParameters();
      const sMap: any = {};
      params.forEach(p => sMap[p.key] = p.value);
      setSettings(sMap);
      
      if (sMap.app_name) setAppName(sMap.app_name);
      if (sMap.mairie_name) setMairieName(sMap.mairie_name);
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  };

  useEffect(() => {
    loadSettings().then(() => {
      const savedUser = localStorage.getItem('digicab_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setInitialized(true);
    });
    
    window.addEventListener('settings-updated', loadSettings);
  }, []);

  // Timer for splash screen based on settings
  useEffect(() => {
    if (!initialized) return;
    if (settings.splash_enabled === 'false') {
      setShowSplash(false);
      return;
    }
    const duration = (parseInt(settings.splash_duration || '3', 10) || 3) * 1000;
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [initialized, settings.splash_enabled, settings.splash_duration]);

  // Activity Monitor & Auto-Logout based on Admin settings
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      // Throttle activity reporting
      if (user.sessionId) {
        const lastReport = parseInt(localStorage.getItem('last_activity_report') || '0');
        if (Date.now() - lastReport > 60000) {
          api.reportActivity(user.sessionId).catch(console.error);
          localStorage.setItem('last_activity_report', Date.now().toString());
        }
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    const checkTimeout = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const idleTime = Date.now() - lastActivityRef.current;

      const timeoutMinutes = parseInt(settings.session_timeout_minutes || '30', 10) || 30;
      const afterHoursOnly = settings.session_timeout_after_hours_only !== 'false';

      // Work hours check
      const [hEnd, mEnd] = (settings.heure_fin || '18:00').split(':').map(Number);
      const isAfterWork = (hours > hEnd) || (hours === hEnd && minutes >= (mEnd || 0));
      const isOverIdle = idleTime > (timeoutMinutes * 60 * 1000);

      if (afterHoursOnly) {
        if (isAfterWork && isOverIdle) {
          handleLogout();
        }
      } else {
        if (isOverIdle) {
          handleLogout();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(checkTimeout);
    };
  }, [user, settings]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('digicab_user', JSON.stringify(userData));
    localStorage.setItem('last_activity_report', Date.now().toString());
    lastActivityRef.current = Date.now();
  };

  const handleLogout = async () => {
    if (user?.sessionId) {
      await api.logout(user.sessionId).catch(console.error);
    }
    setUser(null);
    localStorage.removeItem('digicab_user');
    localStorage.removeItem('last_activity_report');
  };

  if (!initialized) return null;

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-navy flex flex-col items-center justify-center z-[200]">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className="relative flex flex-col items-center justify-center text-center px-4"
        >
          {/* Logo of the Mairie - Much larger as requested */}
          <LogoMairie className="w-64 h-64 md:w-80 md:h-80 shadow-[0_0_100px_rgba(212,175,55,0.2)]" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center w-full max-w-4xl"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-black text-gold tracking-[0.2em] uppercase leading-tight mb-2">
               {appName}
            </h1>
            <p className="text-white text-[0.6rem] md:text-xs font-bold uppercase tracking-[6px] mb-4">{settings.sync_label || 'Initialisation CAB-ML'}</p>
            <div className="h-0.5 w-32 bg-gold/50 mx-auto mb-4" />
            <p className="text-gold/50 text-[0.6rem] md:text-[0.7rem] font-black uppercase tracking-[4px] italic">
               {mairieName}
            </p>
          </motion.div>
        </motion.div>
        
        <div className="absolute bottom-24 flex flex-col items-center gap-4">
           <motion.div 
             className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/10 shadow-inner"
             initial={{ width: 0 }}
             animate={{ width: 256 }}
             transition={{ duration: 4, ease: "linear" }}
           >
             <div className="h-full bg-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
           </motion.div>
           <p className="text-gold/40 text-[0.55rem] font-bold uppercase tracking-[3px] animate-pulse">Initialisation des protocoles sécurisés...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const isDecisionMaker = ['ADMIN', 'MAIRE', 'SP-ML', 'DC-ML', 'SC-ML', 'CS-ML', 'CTML', 'RESPONSABLE'].includes(user.role);

  return (
    <AppShell 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      appName={appName}
      mairieName={mairieName}
      settings={settings}
    >
      <div className="min-h-full relative">
        {activeTab === 'portfolio' && <PortfolioView settings={settings} />}
        
        {activeTab === 'dashboard' && <DashboardView settings={settings} />}

        {activeTab === 'search' && isDecisionMaker && <AdvancedSearchView user={user} />}

        {activeTab === 'users' && isDecisionMaker && <UserManagementView currentUser={user} />}

        {activeTab === 'dossiers' && <DossierManagement user={user} settings={settings} />}

        {activeTab === 'comite' && <CommitteesView />}

        {activeTab === 'rapports' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-navy">Historique & Rapports</h2>
                  <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Audit Trail & System Logs</p>
                </div>
            </div>
            <div className="bg-surface rounded-lg border border-border-theme shadow-sm overflow-hidden">
                <div className="p-4 bg-bg border-b border-border-theme font-bold text-xs uppercase text-navy tracking-widest">Dernières actions système</div>
                <div className="p-4 text-center text-text-muted italic text-sm">Le module de rapports détaillés est en cours de synchronisation.</div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && user.role === 'ADMIN' && (
          <AdministrationView currentUser={user} />
        )}

        {settings.feature_chat !== 'false' && <ChatSystem currentUser={user} />}
      </div>
    </AppShell>
  );
}
