import { useQuery } from "convex/react";
import { useEffect, useState, type ReactNode } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { api } from "../convex/_generated/api";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoginPromptModal } from "@/components/LoginPromptModal";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useTranslation } from "react-i18next";
import { LiquidBackground } from "@/components/LiquidBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Modal } from "@/components/Modal";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { MobileMenu } from "./components/MobileMenu";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { AdminDashboard } from "@/components/AdminDashboard";
import { ChatInterface } from "./components/ChatInterface";
import { ServiceDirectory } from "./components/ServiceDirectory";
import { RepresentativeFinder } from "./components/RepresentativeFinder";
import { NewsSection } from "@/components/NewsSection";

const TOUR_SEEN_KEY = "salone_hub_tour_seen";

function IsAdmin({ children }: { children: ReactNode }) {
  const admin = useQuery(api.admin.isAdmin);
  if (admin !== true) return null;
  return <>{children}</>;
}

function LoginPage() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const isAuthenticated = loggedInUser !== undefined && loggedInUser !== null;
  const { theme, cycleTheme } = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("returnTo") || "/";
    }
  }, [isAuthenticated]);

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <LiquidBackground />
      <header className="sticky top-0 z-10">
        <div className="glass-surface border-b border-white/20 dark:border-white/10 shadow-sm">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-emerald-500 via-green-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs sm:text-sm">SL</span>
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-bold tracking-tight">SaloneHub</h1>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                    Sierra Leone civic portal
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle theme={theme} onCycle={cycleTheme} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-8">
        <div className="w-full max-w-md">
          <div className="glass-card p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-green-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-white font-bold text-xl">SL</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Welcome to SaloneHub</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in or create an account to get started
              </p>
            </div>

            <SignInForm
              onSuccess={() => {
                const params = new URLSearchParams(window.location.search);
                window.location.href = params.get("returnTo") || "/";
              }}
            />

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-muted-foreground hover:underline"
              >
                ← Back to home
              </a>
            </div>
          </div>
        </div>
      </main>
      <Toaster theme={theme} richColors closeButton />
    </div>
  );
}

function MainApp() {
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof import.meta.env.VITE_CONVEX_URL !== "string" || !import.meta.env.VITE_CONVEX_URL) {
      console.error("Missing VITE_CONVEX_URL environment variable");
    }
  }, []);

  const [activeTab, setActiveTab] = useState<
    "chat" | "services" | "representatives" | "news" | "admin"
  >("services");
  const [tourOpen, setTourOpen] = useState(false);

  const { theme, resolvedTheme, cycleTheme } = useTheme();

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(TOUR_SEEN_KEY);
      if (!seen) setTourOpen(true);
    } catch {
      // ignore
    }
  }, []);

  const onTourOpenChange = (open: boolean) => {
    setTourOpen(open);
    if (!open) {
      try {
        window.localStorage.setItem(TOUR_SEEN_KEY, "1");
      } catch {
        // ignore
      }
    }
  };

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const adminCheck = useQuery(api.admin.isAdmin);
  const isAuthenticated = loggedInUser !== undefined && loggedInUser !== null;

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptFeature, setLoginPromptFeature] = useState("");

  const handleLockedTabClick = (tab: "chat" | "representatives" | "news") => {
    const featureName = tab === "chat"
      ? "the AI Assistant"
      : tab === "representatives"
        ? "find your representative"
        : "civic news";
    setLoginPromptFeature(featureName);
    setShowLoginPrompt(true);
  };

  const handleTabClick = (tab: "chat" | "services" | "representatives" | "news" | "admin") => {
    if (tab === "admin") {
      setActiveTab("admin");
      return;
    }
    if (!isAuthenticated && tab !== "services") {
      handleLockedTabClick(tab);
      return;
    }
    setActiveTab(tab);
  };

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex flex-col">
        <LiquidBackground />
        <header className="sticky top-0 z-10">
          <div className="glass-surface border-b border-white/20 dark:border-white/10 shadow-sm">
            <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex justify-between items-center gap-1 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-emerald-500 via-green-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-white font-bold text-xs sm:text-sm">SL</span>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-xl font-bold tracking-tight truncate">SaloneHub</h1>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Sierra Leone civic portal</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle theme={theme} onCycle={cycleTheme} />
                    <SignOutButton />
                  </div>
                  <MobileMenu theme={theme} onCycle={cycleTheme} />
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </main>
      </div>
    );
  }

  if (activeTab === "admin") {
    if (adminCheck !== true) return null;
    return (
      <div className="min-h-screen flex flex-col">
        <LiquidBackground />
        <header className="sticky top-0 z-10">
          <div className="glass-surface border-b border-white/20 dark:border-white/10 shadow-sm">
            <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex justify-between items-center gap-1 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-emerald-500 via-green-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-white font-bold text-xs sm:text-sm">SL</span>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-xl font-bold tracking-tight truncate">SaloneHub</h1>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Sierra Leone civic portal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 w-full">
          <ErrorBoundary name="AdminDashboard">
            <AdminDashboard onBack={() => setActiveTab("chat")} />
          </ErrorBoundary>
        </main>
      </div>
    );
  }

  const allTabs = ["services", "chat", "representatives", "news"] as const;

  return (
    <HelmetProvider>
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{activeTab === "chat" ? "AI Assistant" : activeTab === "services" ? "Service Directory" : activeTab === "representatives" ? "Representative Finder" : activeTab === "news" ? "News" : "Admin"} — SaloneHub</title>
      </Helmet>
      <LiquidBackground />

      <header className="sticky top-0 z-10">
        <div className="glass-surface border-b border-white/20 dark:border-white/10 shadow-sm">
          <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex justify-between items-center gap-1 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-emerald-500 via-green-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">SL</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold tracking-tight truncate">SaloneHub</h1>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Sierra Leone civic portal</p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <IsAdmin>
                  <button
                    type="button"
                    className="btn-ghost px-2 sm:px-3 text-sm"
                    onClick={() => setActiveTab("admin")}
                    title="Admin panel"
                    aria-label="Admin panel"
                  >
                    ⚙️
                  </button>
                </IsAdmin>
                <button
                  type="button"
                  className="btn-ghost px-2 sm:px-3 text-sm"
                  onClick={() => setTourOpen(true)}
                  title="Quick tour"
                  aria-label="Open quick tour"
                >
                  ?
                </button>
                <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                  <LanguageSwitcher />
                  <ThemeToggle theme={theme} onCycle={cycleTheme} />
                  <SignOutButton />
                </div>
                <MobileMenu theme={theme} onCycle={cycleTheme} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {isAuthenticated && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight mb-1">
                {t("welcomeBack", { name: loggedInUser.name || loggedInUser.email?.split("@")[0] || "Citizen" })}
              </h2>
              <p className="text-muted-foreground">
                {t("welcomePrompt")}
              </p>
            </div>
          )}

          {/* Navigation Tabs - always all 4 */}
          <div className="glass-card p-1.5 mb-4 sm:mb-6 flex gap-1 overflow-x-auto no-scrollbar" role="tablist" aria-label="Main navigation">
            {allTabs.map((tab) => {
              const label =
                tab === "services" ? "📋 " + t("services")
                : tab === "chat" ? "🤖 " + t("chat.title")
                : tab === "representatives" ? "👥 " + t("officials")
                : "📰 " + t("news");
              const isLocked = !isAuthenticated && tab !== "services";
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => handleTabClick(tab)}
                  className={cn(
                    "flex-1 min-w-0 rounded-xl px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold smooth-transition",
                    activeTab === tab
                      ? "bg-white/70 dark:bg-white/10 shadow-sm"
                      : "hover:bg-white/50 dark:hover:bg-white/5 text-muted-foreground",
                  )}
                >
                  {label}{isLocked ? " 🔒" : ""}
                </button>
              );
            })}
          </div>

          {/* Tab Content - all mounted, hidden via CSS for instant switching */}
          <div className="animate-fade-in">
            {/* Services - always mounted (public) */}
            <div className={cn(activeTab !== "services" && "hidden")}>
              <ErrorBoundary name="ServiceDirectory">
                <ServiceDirectory
                  isAuthenticated={isAuthenticated}
                  onLoginPrompt={(feature) => {
                    setLoginPromptFeature(feature);
                    setShowLoginPrompt(true);
                  }}
                />
              </ErrorBoundary>
            </div>

            {/* Auth-required tabs - mounted only when authenticated */}
            {isAuthenticated && (
              <>
                <div className={cn(activeTab !== "chat" && "hidden")}>
                  <ErrorBoundary name="ChatInterface">
                    <ChatInterface />
                  </ErrorBoundary>
                </div>
                <div className={cn(activeTab !== "representatives" && "hidden")}>
                  <ErrorBoundary name="RepresentativeFinder">
                    <RepresentativeFinder />
                  </ErrorBoundary>
                </div>
                <div className={cn(activeTab !== "news" && "hidden")}>
                  <ErrorBoundary name="NewsSection">
                    <NewsSection />
                  </ErrorBoundary>
                </div>
              </>
            )}
          </div>

          <LoginPromptModal
            isOpen={showLoginPrompt}
            onClose={() => setShowLoginPrompt(false)}
            featureName={loginPromptFeature}
            onSignIn={() => {
              setShowLoginPrompt(false);
              window.location.href = "/login";
            }}
          />
        </div>
      </main>

      <Footer />

      <Modal
        open={tourOpen}
        onOpenChange={onTourOpenChange}
        title={t("tour.title")}
      >
        <div className="space-y-4">
          <div className="glass-surface rounded-2xl p-4">
            <div className="font-semibold">{t("tour.whatYouCanDo")}</div>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li><span className="mr-2">🤖</span>{t("tour.aiAssistant")}</li>
              <li><span className="mr-2">📋</span>{t("tour.browseServices")}</li>
              <li><span className="mr-2">👥</span>{t("tour.findOfficials")}</li>
            </ul>
          </div>

          <div className="glass-surface rounded-2xl p-4">
            <div className="font-semibold">{t("tour.proTips")}</div>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li><span className="mr-2">🌓</span>{t("tour.themeToggle")}</li>
              <li><span className="mr-2">✨</span>{t("tour.hoverEffects")}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="btn-primary w-full"
              onClick={() => onTourOpenChange(false)}
            >
              {t("tour.letsGo")}
            </button>
            <button
              className="btn-ghost w-full"
              onClick={() => onTourOpenChange(false)}
            >
              {t("tour.maybeLater")}
            </button>
          </div>
        </div>
      </Modal>

      <Toaster theme={resolvedTheme} richColors closeButton />
    </div>
    </HelmetProvider>
  );
}

export default function App() {
  const [isLoginPage, setIsLoginPage] = useState(
    typeof window !== "undefined" && window.location.pathname === "/login",
  );

  useEffect(() => {
    const handlePopState = () => {
      setIsLoginPage(window.location.pathname === "/login");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (isLoginPage) {
    return <LoginPage />;
  }

  return <MainApp />;
}
