'use client'

import { Expand, Home, Minimize, PillBottle, Stethoscope } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSimSessionContext } from "@/context/SimSessionContext";
import InfoTooltip from "@/components/helpTooltip";

interface HeaderProps {
  tabs?: ReactNode;
}

const Header = ({ tabs }: HeaderProps) => {
  const [isFullscreen, setIsFullScreen] = useState(false)
  const { userId, userRole, isPresim, loading } = useSimSessionContext();
  const router = useRouter()
  const isPreSimMode = isPresim ?? true;
  const modeLabel = isPreSimMode ? "PRE-SIM" : "ACTIVE SIM";
  const modeSubtext = isPreSimMode ? "Preparation Mode" : "Live Simulation";
  const modeClasses = isPreSimMode
    ? "border-violet-200/80 bg-violet-500 text-white shadow-violet-900/30"
    : "border-emerald-200/80 bg-emerald-500 text-white shadow-emerald-900/30";
  const medReferenceTool = 'https://online-lexi-com.ezproxy.gvsu.edu/lco/action/home';

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [])

  const handleHomeClick = () => {
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
          {medReferenceTool && (
            <InfoTooltip content="Lexidrug">
              <Button
                variant='secondary'
                className="p-0 size-7 hover:text-blue-600 hover:ring-2"
                asChild
              >
                <a href={medReferenceTool} target="_blank" rel="noopener noreferrer">
                  <PillBottle />
                </a>
              </Button>
            </InfoTooltip>
          )}
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
  )
}

export default Header
