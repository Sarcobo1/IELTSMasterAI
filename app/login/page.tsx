"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import { LogIn } from "lucide-react"
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter();

  // Check current session via API (cookie-based)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            router.replace('/');
            return;
          }
        }
      } catch (e) {
        // ignore
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async () => {
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.replace('/') // cookie set by API
      } else {
        setError(data.error || data.message || "Invalid email or password")
      }
    } catch (err) {
      setError("Server error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-hidden">
      <main className="flex-grow flex items-center justify-center py-12 sm:py-20 px-3 sm:px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
              <LogIn size={28} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2">Welcome Back</h1>
          <p className="text-slate-600 text-center mb-8">Login to access IELTS MasterAI</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 outline-none text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 outline-none text-sm sm:text-base"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm mb-6">{error}</div>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading || checking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold text-sm sm:text-base mb-6"
          >
            {checking ? "Checking session..." : loading ? "Logging in..." : "Login"}
          </Button>

        </div>
      </main>

      <Footer />
    </div>
  )
}