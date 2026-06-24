'use client'

import { Expand, Home, Minimize, Stethoscope } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useSimSessionContext } from "@/context/SimSessionContext";
import NavigationAlert from "./navigationAlert";
import { completeSession } from "@/actions/simulation";
import { getUserRoute } from "@/utils/routes";
import HomeButtonAlert from "./homeButtonAlert";

interface HeaderProps {
  tabs?: ReactNode;
  sessionId: string;
}

const Header = ({ tabs, sessionId}: HeaderProps) => {
  const [isFullscreen, setIsFullScreen] = useState(false)
  const { userId, userRole, isPresim, loading, hasUnsavedCharting} = useSimSessionContext();

  const [showWarning, setShowWarning] = useState(false);                // Shows Navigation Alert for Flex Sheet only
  const [homeClickWarning, setHomeClickWarning] = useState(false);      // Used for Home Click Dialog
  const [pendingPath, setPendingPath] = useState<string | null>(null);  // Used to route users

  // Standard router and pathname hooks
  const router = useRouter()
  const pathname = usePathname();

  // Simulation vs. Pre-Simulation status and styling
  const isPreSimMode = isPresim ?? true;
  const modeLabel = isPreSimMode ? "PRE-SIM" : "ACTIVE SIM";
  const modeSubtext = isPreSimMode ? "Preparation Mode" : "Live Simulation";
  const modeClasses = isPreSimMode
    ? "border-violet-200/80 bg-violet-500 text-white shadow-violet-900/30"
    : "border-emerald-200/80 bg-emerald-500 text-white shadow-emerald-900/30";

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [])


  const handleHomeClick = async () => {
    // Get user specific route
    const destination = getUserRoute(userId, userRole)

    // Current Page is Flex Sheet
    const isOnFlexSheetPage = pathname?.includes('/chart/charting');

    // Set destination as pending path
    setPendingPath(destination)

    // If user is on flex sheet and hasn't been saved/filed, show Navigation Alert
    if(hasUnsavedCharting && isOnFlexSheetPage){
      setShowWarning(true);
    }
    // Open Home Click Alert
    else{
      setHomeClickWarning(true);
    }
  }


  const handleConfirmNavigation = async () => {
    
    setShowWarning(false);
  
    // Changes status and completed_at in case_sessions if NOT in pre-sim
    if(!isPreSimMode){
      const response = await completeSession(sessionId)

      // Error handle for response
      if(response.error){
        console.error('Failed to set complete', response)
      }
    }

    if(pendingPath){
      router.push(pendingPath)
    }
  }


  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  return (
    <>
      <header className="shrink-0 border-b border-white/20 h-(--header-height)">
        <div className="flex h-(--header-height) justify-between items-center pl-8 gap-3">
          <div className="flex items-center gap-3">
            <Stethoscope color="white" size={26} strokeWidth={2.5} />
            <Link href="#">
              <h1 className="text-3xl font-bold text-white hover:opacity-90 transition-opacity leading-none">
                <span>Flex</span>
                <span className="font-normal">Chart</span>
              </h1>
            </Link>
            <div
              className={`hidden lg:block rounded-xl border px-3 py-1.5 shadow-lg transition-all duration-200 text-nowrap ${modeClasses}`}
              aria-live="polite"
            >
              <p className="text-[12px] font-bold leading-tight tracking-[0.1em]">
                {loading ? "LOADING..." : modeLabel}
              </p>
              <p className="text-[10px] font-medium leading-tight opacity-95">{modeSubtext}</p>
            </div>
          </div>
          <div className="flex items-end h-full gap-4">
            {tabs}
          </div>
          <div className="flex pr-8 gap-4">
            <Button
              variant='secondary'
              className="p-0 size-7 hover:text-blue-600 hover:ring-2"
              onClick={handleHomeClick}
            >
              <Home />
            </Button>
            <Button
              onClick={toggleFullScreen}
              variant='secondary'
              className="p-0 size-7 hover:text-blue-600 hover:ring-2"
            >
              {!isFullscreen ? (
                <Expand className="!size-4" />
              ) : (
                <Minimize className="!size-4" />
              )}
            </Button>
          </div>
        </div>
      </header>
      <NavigationAlert
        showWarning={showWarning}
        setShowWarning={setShowWarning}
        pendingPath={pendingPath}
        setPendingPath={setPendingPath}
        handleConfirmNavigation={handleConfirmNavigation}
      />
      <HomeButtonAlert
        homeClickWarning={homeClickWarning}
        setHomeClickWarning={setHomeClickWarning}
        pendingPath={pendingPath}
        setPendingPath={setPendingPath}
        handleConfirmNavigation={handleConfirmNavigation}
      />
    </>
  )
}

export default Header
