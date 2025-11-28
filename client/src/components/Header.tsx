import React from 'react'

import { useTheme } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

export const Header: React.FC = () => {
  const { theme } = useTheme()
  const logoSrc = theme === "dark" ? "/src/assets/logo-dark.png" : "/src/assets/logo.png"

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container flex h-24 items-center justify-center relative">
        <div className="absolute left-0 flex items-center">
          <a className="flex items-center space-x-2" href="/">
            <img src={logoSrc} alt="Logo" className="h-20 w-20 rounded-full object-cover" />
          </a>
        </div>
        <nav className="flex items-center">
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}
