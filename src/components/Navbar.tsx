"use client"

import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { Heart, Sparkles, Star, Coins } from 'lucide-react'
import useAuthClient from './hooks/useAuthClient'
import useUserStats from './hooks/useUserStats'
import { ThemeToggle } from './ThemeToggle'

const Navbar = () => {
  const { client, userId } = useAuthClient();
  const { stats } = useUserStats(client, userId);
  const {isSignedIn} = useUser()

  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border py-4 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-gradient-to-br from-soft-primary/20 to-soft-secondary/10 border border-border rounded-xl group-hover:border-soft-primary/50 transition-all duration-300">
            <Heart className="w-5 h-5 text-soft-primary group-hover:animate-gentle-pulse"/>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span className="text-text-primary">Habit</span>
              <span className="text-soft-primary">RPG</span>
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {isSignedIn ? (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-card-bg-secondary border border-border">
              {/* Gold Display */}
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-soft-accent" />
                <span className="text-soft-accent font-medium text-sm">
                  {stats?.gold || 0}
                </span>
              </div>
              
              {/* Mana Display */}
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-mana" />
                <span className="text-mana font-medium text-sm">
                  {stats?.mana || 0}
                </span>
              </div>
              
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 border border-border hover:border-soft-primary transition-all duration-300",
                    userButtonPopoverCard: "bg-card border border-border shadow-lg",
                    userButtonPopoverActionButton: "text-text-primary hover:bg-card-bg-secondary hover:text-soft-primary"
                  }
                }}
              />
            </div>
            
          ) : (
            <>
              <SignInButton>
                <Button
                  variant="outline"
                  className="border-border text-text-primary hover:text-text-primary hover:bg-card-bg-secondary hover:border-soft-primary transition-all duration-300 font-medium"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-soft-primary text-text-primary hover:bg-soft-primary/90 transition-all duration-300 font-medium">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar