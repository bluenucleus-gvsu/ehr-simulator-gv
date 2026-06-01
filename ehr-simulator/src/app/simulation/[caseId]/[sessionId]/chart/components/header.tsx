'use client'

import { Expand, Home, Minimize, Stethoscope } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSimSessionContext } from "@/context/SimSessionContext";
import { completeCaseSessionFromSessionID } from "@/actions/cases";

interface HeaderProps {
  tabs?: ReactNode;
  sessionId: string;
}

const Header = ({ tabs, sessionId}: HeaderProps) => {
  const [isFullscreen, setIsFullScreen] = useState(false)
  const { userId, userRole, isPresim, loading } = useSimSessionContext();
  const router = useRouter()
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

    // Add submission Logic here unless located somewhere else....
    // Need to change the state of the simulation
    const response = await completeCaseSessionFromSessionID(sessionId)
    console.log(response)


    let destination = '/'
    if (userRole === 'student' && userId) {
      destination = `/user/profile/${userId}`
    } else if (userRole === 'admin') {
      destination = '/admin'
    } else if (userRole === 'faculty' && userId) {
      destination = `/faculty/${userId}`
    } else {
      destination = '/'
    }
    router.push(destination)
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
    <header className="shrink-0 border-b border-white/20 h-(--header-height) bg-black/5 backdrop-blur-[2px]">
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
            className={`rounded-xl border px-3 py-1.5 shadow-lg transition-all duration-200 ${modeClasses}`}
            aria-live="polite"
          >
            <p className="text-[12px] font-bold leading-tight tracking-[0.1em]">
              {loading ? "LOADING..." : modeLabel}
            </p>
            <p className="text-[10px] font-medium leading-tight opacity-95">{modeSubtext}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {tabs}
        </div>
        <div className="flex pr-8 gap-4">
          <Button
            variant='secondary'
            className="p-0 size-6 hover:text-blue-600 hover:ring-2"
            onClick={handleHomeClick}
          >
            <Home />
          </Button>
          <Button
            onClick={toggleFullScreen}
            variant='secondary'
            className="p-0 size-7 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 border border-white/70 shadow-sm"
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
  )
}

export default Header
