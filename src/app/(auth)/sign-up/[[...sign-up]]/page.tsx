/**
 * @fileoverview User registration page
 * @module app/(auth)/sign-up/[[...sign-up]]/page
 * 
 * User registration page using Clerk's SignUp component.
 * Public page for new user account creation.
 * Triggers webhook to create user in Supabase database.
 */

import React from 'react'
import { SignUp } from '@clerk/nextjs';

/**
 * Sign up page component
 * 
 * Displays Clerk's registration form for creating new accounts.
 * Collects email, password, and optional username.
 * Automatically creates user profile in database via webhook.
 * 
 * @returns {JSX.Element} Sign up page
 */
const SignUpPage = () => {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <SignUp />
    </main>
  )
}

export default SignUpPage;
