"use client"

import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { HomeIcon, Sword } from 'lucide-react'

const Navbar = () => {
  const {isSignedIn} = useUser()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-border py-3">
      <div className="container mx-auto flex items-center justify-between">

        { /* LOGO */ }
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1 bg-primary/10 ">
              <Sword className="w-4 h-4 text-primary"/>
            </div>
            <span className="text-xl font-bold font-mono">
              Habit<span className="text-primary">RPG</span>
            </span>
            </Link>
        

        {/* NAVIGATION */}
        <nav className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
              >
                <Sword size={16} />
                <span>Start</span>
              </Link>
              <Link
                href="/home"
                className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
              >
                <HomeIcon size={16} />
                <span>Home</span>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton>
                <Button

                  variant={"outline"}
                  className="border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button>
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
