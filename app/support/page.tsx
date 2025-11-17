"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Search } from "lucide-react"

const faqs = [
  {
    category: "Account & Profile",
    questions: [
      {
        q: "How do I reset my password?",
        a: 'Go to login page, click "Forgot Password" and follow the instructions sent to your email.',
      },
      {
        q: "How can I update my billing information?",
        a: "Visit Settings > Billing to update your payment method and billing address.",
      },
    ],
  },//submit
  {
    category: "Billing & Subscriptions",
    questions: [
      {
        q: "What is the AI Grammar Tutor?",
        a: "Our AI Grammar Tutor provides personalized grammar lessons tailored to your learning level.",
      },
      { q: "Is there a free trial available?", a: "Yes, we offer a 7-day free trial to explore all features." },
    ],
  },
]

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.a.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.questions.length > 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    ;(async () => {
      if (!formData.name || !formData.email || !formData.message) {
        alert("Please fill all fields before submitting.")
        return
      }
      try {
        const res = await fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (res.ok) {
          setSubmitted(true)
          setFormData({ name: '', email: '', message: '' })
          setTimeout(() => setSubmitted(false), 3000)
        } else {
          const data = await res.json()
          console.error('Submit error:', data)
          alert('Failed to submit inquiry. Please try again later.')
        }
      } catch (err) {
        console.error('Submit exception:', err)
        alert('An error occurred while submitting. Please try again later.')
      }
    })()
  }

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navigation />

      <main className="flex-grow py-12 sm:py-20 px-3 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">How Can we help?</h1>
            <p className="text-lg text-slate-600">
              Find answers to your questions or get in touch with our support team
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-12">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FAQs */}
            <div className="lg:col-span-2 space-y-8">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((category, idx) => (
                  <div key={idx}>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{category.category}</h2>
                    <div className="space-y-3">
                      {category.questions.map((item, i) => (
                        <details
                          key={i}
                          className="border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50"
                        >
                          <summary className="font-semibold text-slate-900">{item.q}</summary>
                          <p className="text-slate-600 mt-3">{item.a}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600">No results found. Try a different search.</p>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Can't find an answer?</h3>

              {submitted && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  Thank you! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm"
                />
                <textarea
                  placeholder="Your message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm h-24 resize-none"
                />
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Submit Inquiry
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
