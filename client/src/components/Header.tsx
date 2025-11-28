import React from 'react'

import { useTheme } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

import logoDark from "@/assets/logo-dark.png"
import logoLight from "@/assets/logo.png"

export const Header: React.FC = () => {
  const { theme } = useTheme()
  const logoSrc = theme === "dark" ? logoDark : logoLight

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container flex h-24 items-center justify-between">
        <div className="flex items-center">
          <a className="flex items-center space-x-2" href="/">
            <img src={logoSrc} alt="Logo" className="h-20 w-20 rounded-full object-cover" />
          </a>
        </div>
        <nav className="flex items-center mr-16">
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}
