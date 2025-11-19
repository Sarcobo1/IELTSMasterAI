"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "lucide-react"
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userEmail')
    setIsLoggedIn(false)
    router.push('/login')
  }

  const navItems = [
    { label: "Features", href: "/features" },
    { label: "Writing", href: "/writing-selection" },  
    { label: "Speaking", href: "/speaking-selection" },
    { label: "Reading", href: "/reading-selection" },
    { label: "Listening", href: "/listening-selection" },
    { label: "Grammar Tutor", href: "/grammar-tutor" },
    { label: "Support", href: "/support" },
  ]

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold text-lg sm:text-xl text-slate-900">
            <Image src="/icon.webp" alt="logo" width={40} height={40} className="rounded-md object-cover" />
            <span className="hidden sm:inline">IELTS MasterAI</span>
            <span className="sm:hidden">IA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-700 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="text-xs sm:text-sm px-2 sm:px-4 py-2 bg-transparent flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="text-xs sm:text-sm px-2 sm:px-4 py-2 bg-transparent">
                  Login
                </Button>
              </Link>
            )}
            {/* theme toggle removed */}

            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-slate-200 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm text-slate-700 hover:text-slate-900 transition-colors py-2"
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="block w-full text-sm text-slate-700 hover:text-slate-900 transition-colors py-2 text-left"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="block text-sm text-slate-700 hover:text-slate-900 transition-colors py-2">
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}