import type { Metadata } from 'next'
import React from 'react'
import './globals.css'

// #region agent log
if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/layout.tsx:9',message:'RootLayout entry',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{}); }
// #endregion

export const metadata: Metadata = {
  title: 'SlashX - Skill Sharing Platform',
  description: 'Connect, learn, and share skills',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // #region agent log
  if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/layout.tsx:20',message:'RootLayout render',data:{hasChildren:!!children},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{}); }
  // #endregion
  
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
