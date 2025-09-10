"use client"


import { Separator } from '@/components/ui/separator'
import React from 'react'

// function FallbackCard({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
//   return (
//     <div className="bg-white dark:bg-gray-400 rounded-xl shadow p-4">
//       <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</div>
//       <div>{children}</div>
//     </div>
//   )


export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        {/* <Sidebar /> */}

        {/* Content area */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-7">
            {/* Top bar with theme toggle */}
            <div className="flex items-center justify-end">
              {/* <ThemeToggle /> */}
            </div>
            {/* <div className='pl-5'>
              <h2 className="text-2xl font-semibold  text-gray-900 dark:text-gray-100">My Timelines</h2>
              <p className=' text-gray-900 dark:text-gray-100'>You are all set to start your day</p>
              </div> */}
            

            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// function ThemeToggle() {
//   const [enabled, setEnabled] = React.useState(() => {
//     if (typeof window === 'undefined') return false
//     return localStorage.getItem('theme') === 'dark' ||
//       (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
//   })

  // React.useEffect(() => {
  //   const root = window.document.documentElement
  //   if (enabled) {
  //     root.classList.add('dark')
  //     localStorage.setItem('theme', 'dark')
  //   } else {
  //     root.classList.remove('dark')
  //     localStorage.setItem('theme', 'light')
  //   }
  // }, [enabled])

//   return (
//     <div className="flex items-center gap-2">
//       <span className="text-sm text-gray-600 dark:text-gray-300"><Moon /></span>
//       <Switch checked={enabled} onCheckedChange={setEnabled} />
//       <span className="text-sm text-gray-600 dark:text-gray-300"><Sun /></span>
//     </div>
//   )
// }

export function DashboardPage() {
 

  return (
    <DashboardLayout>

      <div>
        <Separator className="my-6" />
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Recent activity and logs will appear here.
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardLayout
