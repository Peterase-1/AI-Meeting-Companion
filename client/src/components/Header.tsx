import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, LogIn, Clock } from 'lucide-react'
import type { RootState } from '@/store'
import { logout } from '@/features/authSlice'
import { useAuthModal } from '@/contexts/AuthModalContext'

import logo from "@/assets/logo-dark.png"

export const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const { openModal, setMode } = useAuthModal()

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleLoginClick = () => {
    setMode('login')
    openModal()
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-background/80 supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center justify-between">
        <div className="flex items-center">
          <a className="flex items-center space-x-2" href="/">
            <img
              src={logo}
              alt="AI Meeting Companion"
              className="h-20 w-20 rounded-full object-cover invert dark:invert-0"
            />
            <span className="hidden md:block font-bold text-xl text-foreground">
              AI Meeting Companion
            </span>
          </a>
        </div>
        <nav className="flex items-center gap-4">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border border-muted">
                  <AvatarImage src="/avatars/01.png" alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary/10">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              {user ? (
                <>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <a href="/profile?tab=settings" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Update Profile
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/profile?tab=history" className="cursor-pointer">
                      <Clock className="mr-2 h-4 w-4" /> History
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleLoginClick} className="cursor-pointer">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Log in</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div >
    </header >
  )
}
