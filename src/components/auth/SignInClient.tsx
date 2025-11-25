'use client'

import { signIn } from 'next-auth/react'
import { type JSX } from 'react'

export function SignInClient(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-2xl">Sign In</h1>
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => signIn()}
          type="button"
        >
          Sign In
        </button>
      </div>
    </div>
  )
}
