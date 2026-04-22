'use client'

import { Expand, Minimize, Stethoscope } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import Link from 'next/link'
import { Button } from "@/components/ui/button";

interface HeaderProps {
  tabs?: ReactNode;
}

const Header = ({ tabs }: HeaderProps) => {
  const [isFullscreen, setIsFullScreen] = useState(false)
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);

  }, [])

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
    <header className="border-b border-white/20 h-(--header-height) bg-black/5 backdrop-blur-[2px]">
      <div className="flex h-(--header-height) justify-between items-center pl-8 gap-3">
        <div className="flex items-center gap-2">
          <Stethoscope color="white" size={26} strokeWidth={2.5} />
          <Link href="#" >
            <h1 className="text-3xl font-bold text-white hover:opacity-90 transition-opacity">
              <span>Flex</span>
              <span className="font-normal">Chart</span>
            </h1>
          </Link>
        </div>
        {tabs}
        <div className="pr-8">
          <Button
            onClick={toggleFullScreen}
            variant='secondary'
            className="p-0 size-7 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 border border-white/70 shadow-sm"
          >
            {!isFullscreen ? (
              <Expand className="!size-4" />
            ) : (
              <Minimize className="!size-4" />
            )
            }

          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header