import React from 'react'

import { useTheme } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

export const Header: React.FC = () => {
  const { theme } = useTheme()
  const logoSrc = theme === "dark" ? "/src/assets/logo-dark.png" : "/src/assets/logo.png"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <img src={logoSrc} alt="Logo" className="h-14 w-14 rounded-full object-cover" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Add search or other nav items here */}
          </div>
          <nav className="flex items-center">
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
