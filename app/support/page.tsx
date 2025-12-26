"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import { Search, MessageCircle, HelpCircle, BookOpen, CreditCard, Shield, Sparkles, ChevronDown } from "lucide-react"

const faqs = [
  {
    category: "Account & Profile",
    icon: Shield,
    questions: [
      {
        q: "How do I reset my password?",
        a: 'Go to login page, click "Forgot Password" and follow the instructions sent to your email.',
      },
      {
        q: "How can I update my billing information?",
        a: "Visit Settings > Billing to update your payment method and billing address.",
      },
      {
        q: "Can I change my email address?",
        a: "Yes, go to Settings > Profile and update your email. You'll need to verify the new email address.",
      },
      {
        q: "How do I delete my account?",
        a: "Contact our support team via the chat button below, and we'll help you process your account deletion request.",
      },
    ],
  },
  {
    category: "Billing & Subscriptions",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.",
      },
      {
        q: "Is there a free trial available?",
        a: "Yes, we offer a 7-day free trial to explore all features with no credit card required.",
      },
      {
        q: "Can I cancel my subscription anytime?",
        a: "Absolutely! You can cancel your subscription at any time from your account settings. No questions asked.",
      },
      {
        q: "Do you offer refunds?",
        a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.",
      },
    ],
  },
  {
    category: "Features & Learning",
    icon: BookOpen,
    questions: [
      {
        q: "What is the AI Grammar Tutor?",
        a: "Our AI Grammar Tutor provides personalized grammar lessons tailored to your learning level with real-time feedback and corrections.",
      },
      {
        q: "How does the speaking practice work?",
        a: "Record your responses to IELTS speaking questions and receive instant AI-powered feedback on fluency, pronunciation, and vocabulary.",
      },
      {
        q: "Can I track my progress?",
        a: "Yes! Our dashboard provides detailed analytics on your performance across all IELTS sections with improvement suggestions.",
      },
      {
        q: "Are practice tests included?",
        a: "Yes, we provide unlimited full-length practice tests that simulate real IELTS exam conditions.",
      },
    ],
  },
]

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [crispLoaded, setCrispLoaded] = useState(false)

  // Crisp chat'ni faqat shu page'da ko'rsatish
  useEffect(() => {
    // Crisp chat'ni ko'rsatish
    if (window.$crisp) {
      window.$crisp.push(["do", "chat:show"])
    }

    // Component unmount bo'lganda chatni yashirish
    return () => {
      if (window.$crisp) {
        window.$crisp.push(["do", "chat:hide"])
      }
    }
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        alert("Failed to submit message.")
      }
    } catch (error) {
      alert("An error occurred. Please try again later.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white overflow-x-hidden">
      {/* Crisp Chat Script - faqat support page'da */}
      <Script
        id="crisp-chat"
        strategy="afterInteractive"
        onLoad={() => setCrispLoaded(true)}
        dangerouslySetInnerHTML={{
          __html: `
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="3a65cc77-fa81-4e26-bf60-bc344cc9f4e7";
            (function(){
              d=document;
              s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `,
        }}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 -left-40 w-80 h-80 bg-red-600 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 right-20 w-96 h-96 bg-cyan-600 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-sm mb-6">
              <Sparkles size={16} className="text-red-400" />
              <span className="text-sm font-semibold text-red-400">24/7 Support Available</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              How Can We <span className="bg-gradient-to-r from-red-400 to-cyan-400 bg-clip-text text-transparent">Help You?</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Find answers to your questions or chat with our support team
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-red-400 focus:bg-white/20 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* FAQs */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <HelpCircle size={20} className="text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                </div>

                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((category, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <category.icon size={20} className="text-gray-700" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{category.category}</h3>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-gray-100">
                        {category.questions.map((item, i) => {
                          const faqId = `${idx}-${i}`
                          const isOpen = openFaq === faqId
                          
                          return (
                            <div key={i} className="transition-colors hover:bg-gray-50">
                              <button
                                onClick={() => setOpenFaq(isOpen ? null : faqId)}
                                className="w-full text-left p-6 flex items-start justify-between gap-4 cursor-pointer"
                              >
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">{item.q}</h4>
                                  {isOpen && (
                                    <p className="text-gray-600 mt-3 leading-relaxed">{item.a}</p>
                                  )}
                                </div>
                                <ChevronDown
                                  size={20}
                                  className={`text-gray-400 flex-shrink-0 transition-transform mt-1 ${
                                    isOpen ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No results found</p>
                    <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>

              {/* Contact Form */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <MessageCircle size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Still Need Help?</h3>
                  </div>
                  
                  <p className="text-gray-300 mb-6 text-sm">
                    Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
                  </p>

                  {submitted && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 text-green-300 rounded-xl text-sm backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="font-semibold">Message Sent!</span>
                      </div>
                      <p className="text-xs text-green-200 ml-7">We'll get back to you soon.</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:border-red-400 focus:bg-white/20 outline-none transition-all backdrop-blur-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:border-red-400 focus:bg-white/20 outline-none transition-all backdrop-blur-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Your Message</label>
                      <textarea
                        placeholder="Tell us how we can help..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:border-red-400 focus:bg-white/20 outline-none transition-all h-32 resize-none backdrop-blur-sm"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-red-600/50"
                    >
                      Send Message
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs text-gray-400 text-center">
                      Average response time: <span className="text-white font-semibold">2-4 hours</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}