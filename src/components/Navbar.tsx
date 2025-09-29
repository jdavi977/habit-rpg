"use client"

import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { HomeIcon, Sword, Settings, Zap, Star } from 'lucide-react'
import { SidebarTrigger } from './ui/sidebar'

const Navbar = () => {
  const {isSignedIn} = useUser()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cyber-dark/80 backdrop-blur-md border-b border-cyber-line-color py-4 shadow-lg shadow-cyber-glow-primary/10">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue-bright/5 via-transparent to-cyber-blue-bright/5 animate-pulse"></div>
      
      <div className="container mx-auto flex items-center justify-between relative z-10 px-4">

        { /* SIDEBAR TOGGLE & LOGO */ }
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-cyber-blue-bright hover:text-cyber-blue-bright/80 hover:bg-cyber-blue/20 border-cyber-line-color" />
            <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyber-blue-bright/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
              <div className="relative p-2 bg-gradient-to-br from-cyber-blue/20 to-cyber-blue-bright/10 border border-cyber-line-color rounded-lg group-hover:border-cyber-blue-bright/50 transition-all duration-300">
                <Sword className="w-5 h-5 text-cyber-blue-bright group-hover:animate-pulse"/>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono tracking-wider">
                <span className="text-cyber-text-bright">HABIT</span>
                <span className="text-cyber-blue-bright">RPG</span>
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 animate-pulse" />
                <Zap className="w-3 h-3 text-cyber-blue-bright animate-pulse" style={{animationDelay: '0.5s'}} />
              </div>
            </div>
          </Link>
          </div>
          
        

        {/* NAVIGATION */}
        <nav className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link
                href="/home"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-blue/10 border border-cyber-line-color hover:border-cyber-blue-bright/50 hover:bg-cyber-blue/20 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-glow-primary/20"
              >
                <HomeIcon size={18} className="text-cyber-blue-bright group-hover:animate-pulse" />
                <span className="text-cyber-text-bright font-medium group-hover:text-cyber-blue-bright transition-colors">Home</span>
              </Link>
              <Link
                href="/settings"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-blue/10 border border-cyber-line-color hover:border-cyber-blue-bright/50 hover:bg-cyber-blue/20 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-glow-primary/20"
              >
                <Settings size={18} className="text-cyber-blue-bright group-hover:animate-pulse" />
                <span className="text-cyber-text-bright font-medium group-hover:text-cyber-blue-bright transition-colors">Settings</span>
              </Link>
              <div className="ml-2">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 border-2 border-cyber-line-color hover:border-cyber-blue-bright transition-all duration-300",
                      userButtonPopoverCard: "bg-cyber-dark border border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20",
                      userButtonPopoverActionButton: "text-cyber-text-bright hover:bg-cyber-blue/20 hover:text-cyber-blue-bright"
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <SignInButton>
                <Button
                  variant={"outline"}
                  className="border-cyber-line-color text-cyber-text-bright hover:text-cyber-dark hover:bg-cyber-blue-bright hover:border-cyber-blue-bright transition-all duration-300 hover:shadow-lg hover:shadow-cyber-glow-primary/20 font-medium"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-gradient-to-r from-cyber-blue-bright to-cyber-blue text-cyber-dark hover:from-cyber-blue to-cyber-blue-bright transition-all duration-300 hover:shadow-lg hover:shadow-cyber-glow-strong/30 font-medium">
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
