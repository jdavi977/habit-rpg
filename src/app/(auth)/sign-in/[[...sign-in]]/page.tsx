/**
 * @fileoverview User sign-in page
 * @module app/(auth)/sign-in/[[...sign-in]]/page
 * 
 * Authentication page using Clerk's SignIn component.
 * Public page accessible to unauthenticated users.
 * Redirects to dashboard after successful sign-in.
 */

import React from 'react'
import { SignIn } from '@clerk/nextjs';

/**
 * Sign in page component
 * 
 * Displays Clerk's authentication form for user sign-in.
 * Handles email, password, and social OAuth login methods.
 * 
 * @returns {JSX.Element} Sign in page
 */
const SignInPage = () => {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <SignIn />
    </main>
  )
}

export default SignInPage;
