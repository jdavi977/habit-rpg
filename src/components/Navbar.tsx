"use client"

import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'

const Navbar = () => {
  const {isSignedIn} = useUser()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-border py-3">
      <div className="container mx-auto flex items-center justify-between">

        { /* LOGO */ }
        <Link href="/">
          <span>
            HabitRPG
          </span>
        </Link>
        

        {/* NAVIGATION */}
        <nav className="flex items-center gap-3">
          {isSignedIn ? (
            <>
            <Link href="/">
              <span>Home</span>
            </Link>
            <Link href="/profile">
              <span>Profile</span>
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
