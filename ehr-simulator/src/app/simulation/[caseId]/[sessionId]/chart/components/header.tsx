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
    <header className="border-b h-(--header-height)">
      <div className="flex h-(--header-height) justify-between items-center pl-12 gap-2">
        <div className="flex items-center gap-2">
          <Stethoscope color="white" size={26} strokeWidth={2.5} />
          <Link href="#" >
            <h1 className="text-3xl font-bold text-white hover:underline">
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
            className="p-0 size-6 hover:text-blue-600 hover:ring-2"
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