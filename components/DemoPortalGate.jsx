'use client'

import { createContext, useContext } from 'react'
import { demoPortalsEnabled } from '@/lib/demo-portals'

// Route blocking happens in middleware.js; this only tells client components whether to link to the portals.
const DemoPortals = createContext(false)
export const useDemoPortals = () => useContext(DemoPortals)

export default function DemoPortalGate({ children }) {
  return <DemoPortals.Provider value={demoPortalsEnabled(process.env.NEXT_PUBLIC_DEMO_PORTALS_ENABLED)}>{children}</DemoPortals.Provider>
}
