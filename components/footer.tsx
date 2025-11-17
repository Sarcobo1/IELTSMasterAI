import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 mb-12">
          {/* Company Info */}
          <div>
            <h4 className="font-bold text-lg mb-4">IELTS MasterAI</h4>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Your personal AI tutor for IELTS preparation. Master speaking, writing, reading, and listening with
              intelligent feedback.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-base mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li>
                <Link href="/features" className="hover:text-white transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/tests" className="hover:text-white transition">
                  Tests
                </Link>
              </li>
              <li>
                <Link href="/grammar" className="hover:text-white transition">
                  Grammar Tutor
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-base mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li>
                <Link href="/support" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-base mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span>support@mastai.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-slate-800 pt-8 flex items-center justify-between flex-col sm:flex-row gap-6">
          <p className="text-gray-400 text-xs">© 2025 IELTS MasterAI. All rights reserved.</p>
          <div className="flex gap-4">
            {/* Configure your social links here */}
            {[
              { Icon: Facebook, href: 'https://facebook.com/yourpage', label: 'Facebook' },
              { Icon: Twitter, href: 'https://twitter.com/yourprofile', label: 'Twitter' },
              { Icon: Instagram, href: 'https://instagram.com/yourprofile', label: 'Instagram' },
              { Icon: Linkedin, href: 'https://www.linkedin.com/company/yourcompany', label: 'LinkedIn' },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <s.Icon size={18} className="text-gray-400 hover:text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
