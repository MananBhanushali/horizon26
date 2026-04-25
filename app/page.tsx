import Link from "next/link";
import { ArrowRight, Building, Heart, Briefcase, TrendingUp } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] via-white to-[#F3F1FF] text-slate-900 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="text-xl font-bold text-[#1E1B4B] tracking-tight">
          Project Horizon
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-[#1E1B4B] transition-colors">Features</Link>
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-[#1E1B4B] transition-colors">How it Works</Link>
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-[#1E1B4B] transition-colors">Pricing</Link>
        </nav>

        <Link 
          href="/login" 
          className="bg-[#2E1065] hover:bg-[#1E1B4B] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Get Started
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        {/* Left Column - Copy */}
        <div className="max-w-xl">
          <h1 className="text-6xl lg:text-[5.5rem] font-bold tracking-tight text-[#111827] mb-6 leading-[1.05]">
            Financial planning<br />for real life.
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
            Navigate your financial future with the Milestone Engine. A dynamic, interactive simulation that adapts to your life goals, not just static numbers.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/login"
              className="inline-flex items-center justify-center bg-[#2E1065] hover:bg-[#1E1B4B] text-white px-6 py-3.5 rounded-xl font-medium text-base gap-2 transition-colors shadow-sm"
            >
              Build Your Timeline <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center bg-white text-[#1E1B4B] border border-slate-200 px-6 py-3.5 rounded-xl font-medium text-base hover:bg-slate-50 transition-colors shadow-sm"
            >
              See Demo
            </Link>
          </div>
        </div>

        {/* Right Column - Illustration */}
        <div className="relative w-full max-w-lg mx-auto lg:ml-auto">
          {/* Interactive Badge */}
          <div className="absolute -top-4 -right-4 bg-[#2E1065] text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-lg z-20">
            Interactive
          </div>
          
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-100/50 p-8 lg:p-10 border border-slate-100 relative z-10">
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-3">
              Projected Net Worth
            </div>
            <div className="flex items-center gap-4 mb-16">
              <div className="text-5xl font-bold text-slate-900 tracking-tight">₹3.2Cr</div>
              <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md text-sm font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                +12.4%
              </div>
            </div>
            
            {/* Timeline Vis */}
            <div className="relative mt-8">
              {/* Line track */}
              <div className="absolute top-4 left-0 right-0 h-2 bg-[#E0E7FF] rounded-full"></div>
              {/* Active line */}
              <div className="absolute top-4 left-0 w-[60%] h-2 bg-[#2E1065] rounded-full"></div>
              
              {/* Nodes container */}
              <div className="relative flex justify-between">
                {/* Node 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white border-[3px] border-[#2E1065] flex items-center justify-center z-10 mb-4 shadow-sm">
                    <Building className="w-3.5 h-3.5 text-[#2E1065]" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 text-center">Apartment</div>
                  <div className="text-xs font-semibold text-slate-500">2026</div>
                </div>
                
                {/* Node 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white border-[3px] border-[#2E1065] flex items-center justify-center z-10 mb-4 shadow-sm">
                    <Heart className="w-3.5 h-3.5 text-[#2E1065]" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 text-center">Wedding</div>
                  <div className="text-xs font-semibold text-slate-500">2028</div>
                </div>
                
                {/* Node 3 */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#F8FAFC] border-[3px] border-slate-300 flex items-center justify-center z-10 mb-4 shadow-sm">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-sm font-bold text-slate-400 text-center">Business</div>
                  <div className="text-xs font-semibold text-slate-400">2032</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-bold text-[#1E1B4B]">
            Project Horizon
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Privacy</Link>
            <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Terms</Link>
            <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Security</Link>
            <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Contact</Link>
            <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Blog</Link>
          </div>
          
          <div className="text-sm font-medium text-slate-500">
            © 2024 Project Horizon. Premium Digital Assets.
          </div>
        </div>
      </footer>
    </div>
  );
}
