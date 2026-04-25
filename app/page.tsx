"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building,
  Heart,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import TextPressure from "@/components/ui/TextPressure";
import StaggeredMenu from "@/components/ui/StaggeredMenu";
import { LogoHorizontal } from "@/components/ui/Logo";
import Silk from "@/components/ui/Silk";
import { useState } from "react";

export default function Index() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Features", ariaLabel: "View features", link: "#" },
    { label: "How it Works", ariaLabel: "Learn how it works", link: "#" },
    { label: "Pricing", ariaLabel: "View pricing", link: "#" },
    { label: "Get Started", ariaLabel: "Go to login", link: "/login" },
  ];

  const socialItems = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] via-white to-[#F3F1FF] text-slate-900 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900 relative">
      {/* Background Effect */}
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <Silk speed={3} scale={0.8} color="#2E1065" noiseIntensity={1.2} />
      </div>

      {/* Navigation */}
      <div className="z-50">
        <StaggeredMenu
          position="right"
          items={menuItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={true}
          menuButtonColor="#1E1B4B"
          openMenuButtonColor="#1E1B4B"
          changeMenuColorOnOpen={true}
          colors={["#E0E7FF", "#2E1065", "#1E1B4B"]}
          accentColor="#911ba6"
          isFixed={true}
          onMenuOpen={() => setIsMenuOpen(true)}
          onMenuClose={() => setIsMenuOpen(false)}
        />
      </div>

      {/* Logo Placeholder */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <LogoHorizontal className="scale-125 origin-left" />
        </div>
      </div>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        {/* Left Column - Copy */}
        <div className="max-w-xl">
          <h1 className="text-6xl lg:text-[5.5rem] font-bold tracking-tight text-[#111827] mb-2 leading-[1.05]">
            Financial planning
          </h1>
          <div
            style={{ position: "relative", height: "120px" }}
            className="mb-6"
          >
            <TextPressure
              text="for real life."
              flex={true}
              alpha={false}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="#911ba6"
              minFontSize={36}
            />
          </div>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
            Navigate your financial future with the Milestone Engine. A dynamic,
            interactive simulation that adapts to your life goals, not just
            static numbers.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center bg-[#2E1065] hover:bg-[#1E1B4B] text-white px-6 py-3.5 rounded-xl font-medium text-base gap-2 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-200 hover:scale-105 hover:-translate-y-0.5"
            >
              Build Your Timeline{" "}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-white text-[#1E1B4B] border border-slate-200 px-6 py-3.5 rounded-xl font-medium text-base hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 hover:border-indigo-200"
            >
              See Demo
            </Link>
          </div>
        </div>

        {/* Right Column - Illustration */}
        <div
          className={`relative w-full max-w-lg mx-auto lg:ml-auto transition-all duration-500 ease-in-out ${
            isMenuOpen
              ? "lg:-translate-x-32 scale-95"
              : "translate-x-0 scale-100"
          }`}
        >
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-100/50 p-8 lg:p-10 border border-slate-100 relative z-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_60px_-12px_rgba(46,16,101,0.15)]">
            <div className="text-xs font-bold tracking-widest text-slate-600 uppercase mb-3">
              Projected Net Worth
            </div>
            <div className="flex items-center gap-4 mb-16">
              <div className="text-5xl font-bold text-slate-900 tracking-tight">
                ₹3.2Cr
              </div>
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
                <div className="flex flex-col items-center group/node cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-white border-[3px] border-[#2E1065] flex items-center justify-center z-10 mb-4 shadow-sm transition-all duration-300 group-hover/node:scale-125 group-hover/node:shadow-md group-hover/node:shadow-indigo-200">
                    <Building className="w-3.5 h-3.5 text-[#2E1065]" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 text-center transition-colors duration-300 group-hover/node:text-[#2E1065]">
                    Apartment
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    2026
                  </div>
                </div>

                {/* Node 2 */}
                <div className="flex flex-col items-center group/node cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-white border-[3px] border-[#2E1065] flex items-center justify-center z-10 mb-4 shadow-sm transition-all duration-300 group-hover/node:scale-125 group-hover/node:shadow-md group-hover/node:shadow-indigo-200">
                    <Heart className="w-3.5 h-3.5 text-[#2E1065]" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 text-center transition-colors duration-300 group-hover/node:text-[#2E1065]">
                    Wedding
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    2028
                  </div>
                </div>

                {/* Node 3 */}
                <div className="flex flex-col items-center group/node cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#F8FAFC] border-[3px] border-slate-300 flex items-center justify-center z-10 mb-4 shadow-sm transition-all duration-300 group-hover/node:scale-125 group-hover/node:shadow-md group-hover/node:border-[#2E1065]">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 transition-colors duration-300 group-hover/node:text-[#2E1065]" />
                  </div>
                  <div className="text-sm font-bold text-slate-500 text-center transition-colors duration-300 group-hover/node:text-[#2E1065]">
                    Business
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    2032
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <LogoHorizontal className="grayscale opacity-50" />

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            <Link
              href="#"
              className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-all duration-300 hover:-translate-y-0.5"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-all duration-300 hover:-translate-y-0.5"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-all duration-300 hover:-translate-y-0.5"
            >
              Security
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-all duration-300 hover:-translate-y-0.5"
            >
              Contact
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-all duration-300 hover:-translate-y-0.5"
            >
              Blog
            </Link>
          </div>

          <div className="text-sm font-medium text-slate-600">
            © 2024 Project Horizon. Premium Digital Assets.
          </div>
        </div>
      </footer>
    </div>
  );
}
