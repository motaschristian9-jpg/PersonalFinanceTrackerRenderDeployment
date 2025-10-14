import { useState } from "react";

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-gradient-to-br from-white via-green-50 to-green-100 text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-green-200/50 shadow-sm z-50 transition-all duration-300">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <a
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent hover:from-green-700 hover:to-green-800 transition-all duration-300"
          >
            MoneyTracker
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <a
              href="#get-started"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:shadow-lg"
            >
              Sign In
            </a>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1 focus:outline-none"
            aria-label="Toggle menu"
          >
            <div
              className={`w-6 h-0.5 bg-green-600 transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-green-600 transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-green-600 transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></div>
          </button>

          {/* Mobile Menu */}
          <div
            className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-green-200/50 shadow-lg transition-all duration-300 ${
              isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            <nav className="container mx-auto px-6 py-4 space-y-4">
              <a
                href="#get-started"
                onClick={() => setIsMenuOpen(false)}
                className="block text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-full font-medium shadow-lg transition-all duration-300"
              >
                Get Started
              </a>
              <a
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block text-center border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 py-3 rounded-full font-medium transition-all duration-300"
              >
                Sign In
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto grid md:grid-cols-2 gap-12 items-center py-32 px-6 min-h-screen">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-green-300/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/40 to-green-200/30 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              #1 Personal Finance Tracker
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Take Control of Your
              <span className="bg-gradient-to-r from-green-600 via-green-500 to-green-700 bg-clip-text text-transparent">
                {" "}
                Money
              </span>
              <br />
              with Ease
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              MoneyTracker helps you manage income, expenses, budgets, and
              savings—all in one beautifully designed platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#get-started"
              className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-center"
            >
              Get Started Free
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
            <a
              href="#features"
              className="group border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 text-center hover:shadow-lg"
            >
              Learn More
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>

          <div className="flex items-center space-x-8 pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">10K+</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">4.9★</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">$2M+</div>
              <div className="text-sm text-gray-500">Tracked</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 hidden md:block">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-green-200 to-green-300 rounded-3xl blur opacity-30"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-green-100">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dashboard Overview
                  </h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-100">
                    <span className="font-medium text-gray-700">
                      Total Balance
                    </span>
                    <span className="text-2xl font-bold text-green-700">
                      $12,450
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm text-gray-500">Income</div>
                      <div className="text-lg font-bold text-green-600">
                        +$3,200
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm text-gray-500">Expenses</div>
                      <div className="text-lg font-bold text-red-500">
                        -$1,850
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Savings Goal</span>
                      <span className="text-green-600 font-medium">72%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-green-50"></div>
        <div className="relative container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              ✨ Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master your finances with our comprehensive suite of tools
              designed for modern money management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                emoji: "💰",
                title: "Smart Tracking",
                desc: "Automatically categorize and track your income & expenses with AI-powered insights.",
                color: "from-green-500 to-green-600",
              },
              {
                emoji: "📊",
                title: "Budget Monitoring",
                desc: "Set smart budgets and get real-time alerts when you're approaching limits.",
                color: "from-green-600 to-green-700",
              },
              {
                emoji: "🎯",
                title: "Savings Goals",
                desc: "Set and track multiple savings goals with visual progress indicators.",
                color: "from-green-400 to-green-500",
              },
              {
                emoji: "📈",
                title: "Visual Reports",
                desc: "Beautiful charts and reports that make your financial data easy to understand.",
                color: "from-green-700 to-green-800",
              },
              {
                emoji: "🔔",
                title: "Smart Alerts",
                desc: "Never miss important financial milestones with intelligent notifications.",
                color: "from-green-500 to-green-600",
              },
              {
                emoji: "📝",
                title: "Manual Entry",
                desc: "Quickly add your income and expenses with our intuitive input forms.",
                color: "from-green-600 to-green-700",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 border border-green-100 hover:border-green-200 transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.emoji}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-white"></div>
        <div className="relative container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Why Choose MoneyTracker?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands who trust us with their financial journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "✅",
                title: "Simple & Intuitive",
                desc: "Clean interface designed for everyone",
                bg: "from-green-100 to-green-200",
              },
              {
                icon: "🔒",
                title: "Secure & Private",
                desc: "Your data is encrypted and stored securely",
                bg: "from-green-200 to-green-300",
              },
              {
                icon: "⚡",
                title: "Real-Time Updates",
                desc: "Live tracking across all devices",
                bg: "from-green-300 to-green-400",
              },
              {
                icon: "🌍",
                title: "Access Anywhere",
                desc: "Web, mobile, and desktop apps",
                bg: "from-green-400 to-green-500",
              },
            ].map((point, i) => (
              <div
                key={i}
                className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-green-100"
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${point.bg} rounded-full flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {point.icon}
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">
                  {point.title}
                </h3>
                <p className="text-gray-600">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-green-50"></div>
        <div className="relative container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Your journey to financial freedom starts here
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-green-300 to-green-500 transform -translate-y-1/2"></div>

            {[
              {
                step: "1",
                icon: "✍️",
                title: "Create Account",
                desc: "Sign up for free in under 30 seconds. No credit card required.",
              },
              {
                step: "2",
                icon: "💳",
                title: "Add Your Data",
                desc: "Manually add your income and expenses with our simple, intuitive forms.",
              },
              {
                step: "3",
                icon: "📊",
                title: "Track & Optimize",
                desc: "Monitor progress, set goals, and optimize your financial health.",
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl p-8 border border-green-100 transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {item.step}
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center text-3xl mx-auto group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-green-500 to-green-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative container mx-auto text-center text-white">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Ready to Transform Your Financial Future?
              </h2>
              <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
                Join over 10,000 users who are already taking control of their
                money with MoneyTracker.
              </p>
            </div>

            <div className="flex justify-center pt-8">
              <a
                href="/signup"
                className="group bg-white text-green-600 hover:bg-gray-100 px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Start Free Today
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>

            <div className="pt-8 text-sm opacity-75">
              ✨ Completely free forever • No hidden fees • Start tracking
              immediately
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <a
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent"
              >
                MoneyTracker
              </a>
              <p className="text-gray-400 leading-relaxed">
                The smart way to manage your personal finances and build wealth
                for the future.
              </p>
              <div className="flex space-x-4">
                {["Facebook", "Twitter", "Instagram", "LinkedIn"].map(
                  (social) => (
                    <a
                      key={social}
                      href="#"
                      className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                    >
                      <span className="sr-only">{social}</span>
                      <div className="w-4 h-4 bg-gray-400"></div>
                    </a>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6 text-green-400">
                Product
              </h4>
              <ul className="space-y-3 text-gray-400">
                {["Features", "Pricing", "Security", "Integrations"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="hover:text-green-400 transition-colors duration-300"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6 text-green-400">
                Company
              </h4>
              <ul className="space-y-3 text-gray-400">
                {["About Us", "Careers", "Contact", "Blog"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-green-400 transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6 text-green-400">
                Support
              </h4>
              <ul className="space-y-3 text-gray-400">
                {[
                  "Help Center",
                  "Documentation",
                  "Privacy Policy",
                  "Terms of Service",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-green-400 transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 MoneyTracker. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
              <a href="#" className="hover:text-green-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-green-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-green-400 transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
