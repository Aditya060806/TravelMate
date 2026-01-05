import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ArrowDownRight, Shield, Users, Home, MessageSquare, MapPin, Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="section-container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">T</span>
          </div>
          <span className="font-semibold text-lg">TravelMate</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/exchange" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Exchange</Link>
          <Link to="/rooms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Rooms</Link>
          <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Trusted by 5,000+ Indian students in London</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Exchange money. <br />
            <span className="text-gradient">Find your nest.</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mb-8">
            The platform built for Indian students in London. Peer-to-peer INR ⇄ GBP exchange and verified roommate discovery — zero paperwork.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/exchange">
              <Button size="lg">
                Start Exchanging
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/rooms">
              <Button variant="outline" size="lg">Find Roommates</Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-3 gap-8 mt-16 max-w-lg"
        >
          {[
            { value: "£2.5M+", label: "Exchanged Monthly" },
            { value: "1,200+", label: "Active Listings" },
            { value: "98%", label: "Trust Score" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const ExchangePreview = () => {
  const [inrAmount, setInrAmount] = useState("50000");
  const rate = 104.52;
  const gbpAmount = inrAmount ? (parseFloat(inrAmount.replace(/,/g, '')) / rate).toFixed(2) : "0.00";

  return (
    <section className="py-20 border-t border-border">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-3xl font-bold mb-4">Exchange at real rates</h2>
            <p className="text-muted-foreground mb-8">
              Skip the bank fees. Connect directly with other students for peer-to-peer currency exchange.
            </p>
            
            <div className="space-y-4">
              {[
                "Live INR ⇄ GBP rates updated every minute",
                "Escrow protection on every transaction",
                "Community-verified exchange partners",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exchange Calculator */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-muted-foreground">Current Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">₹{rate}</span>
                <span className="badge-success">
                  <TrendingUp className="w-3 h-3" />
                  +0.3%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary">
                <label className="text-xs text-muted-foreground mb-2 block">You Send</label>
                <div className="flex items-center justify-between">
                  <input 
                    type="text" 
                    value={inrAmount}
                    onChange={(e) => setInrAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    className="bg-transparent text-2xl font-semibold text-foreground outline-none w-full"
                  />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-background">
                    <span>🇮🇳</span>
                    <span className="text-sm font-medium">INR</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-primary-foreground rotate-90" />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary">
                <label className="text-xs text-muted-foreground mb-2 block">You Receive</label>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold text-foreground">{gbpAmount}</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-background">
                    <span>🇬🇧</span>
                    <span className="text-sm font-medium">GBP</span>
                  </div>
                </div>
              </div>
            </div>

            <Link to="/exchange" className="block mt-6">
              <Button className="w-full">Find Exchange Partners</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const RoomsPreview = () => {
  const rooms = [
    { area: "Shoreditch", rent: "£850", type: "Double Room", gender: "Any", tags: ["Vegetarian Kitchen", "Student Only"], trust: 94 },
    { area: "Stratford", rent: "£720", type: "Single Room", gender: "Female Only", tags: ["Near Westfield", "Bills Included"], trust: 98 },
    { area: "Wembley", rent: "£680", type: "Double Room", gender: "Male Only", tags: ["Indian Flatmates", "Gym Nearby"], trust: 91 },
  ];

  return (
    <section className="py-20 border-t border-border">
      <div className="section-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Rooms by Indians, for Indians</h2>
            <p className="text-muted-foreground">Verified listings from fellow students. No brokers.</p>
          </div>
          <Link to="/rooms" className="hidden sm:flex">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-hover p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {room.area}
                  </div>
                  <div className="text-2xl font-bold">{room.rent}<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
                </div>
                <span className="badge-success">
                  <Shield className="w-3 h-3" />
                  {room.trust}%
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Home className="w-3.5 h-3.5" />
                <span>{room.type}</span>
                <span>•</span>
                <span>{room.gender}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {room.tags.map((tag, j) => (
                  <span key={j} className="px-2 py-1 rounded bg-secondary text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <MessageSquare className="w-3.5 h-3.5" />
                Message
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link to="/rooms">
            <Button variant="outline" className="w-full">View All Rooms</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const TrustSection = () => {
  const steps = [
    { icon: Users, title: "Complete Profile", desc: "Add your details and preferences" },
    { icon: MessageSquare, title: "Engage & Connect", desc: "Chat with matches and partners" },
    { icon: TrendingUp, title: "Build History", desc: "Successful exchanges boost your score" },
    { icon: Shield, title: "Earn Trust", desc: "Unlock premium features and rates" },
  ];

  return (
    <section className="py-20 border-t border-border">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Trust without paperwork</h2>
          <p className="text-muted-foreground">
            We verify you through behavior, not bureaucracy. No passport uploads. No visa checks.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="card-base p-5 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 border-t border-border">
      <div className="section-container">
        <div className="card-base p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of Indian students who've found their exchange partners and roommates.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg">
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="border-t border-border py-8">
      <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">T</span>
          </div>
          <span className="font-medium text-sm">TravelMate</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Support</a>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 TravelMate</p>
      </div>
    </footer>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ExchangePreview />
      <RoomsPreview />
      <TrustSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
