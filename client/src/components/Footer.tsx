import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground">
          &copy; 2025 AI Meeting Companion. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

// Refactor pass 2: verified component render.
