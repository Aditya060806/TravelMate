import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Home, MessageSquare, Shield, Bell, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [inrAmount, setInrAmount] = useState("25000");
  const rate = 104.52;
  const gbpAmount = inrAmount ? (parseFloat(inrAmount.replace(/,/g, '')) / rate).toFixed(2) : "0.00";

  const quickRooms = [
    { area: "Shoreditch", rent: 850, type: "Double", trust: 94 },
    { area: "Stratford", rent: 720, type: "Single", trust: 98 },
  ];

  const alerts = [
    { type: "exchange", text: "New exchange offer matching your preferences", time: "5m ago" },
    { type: "message", text: "Priya S. sent you a message", time: "1h ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="section-container">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {profile?.displayName?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-muted-foreground">Here's what's happening today</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Calculator */}
              <div className="card-base p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Quick Exchange</h2>
                  <Link to="/exchange" className="text-sm text-primary hover:text-primary/80">
                    View all →
                  </Link>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Send INR</label>
                    <input
                      type="text"
                      value={inrAmount}
                      onChange={(e) => setInrAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      className="bg-transparent text-xl font-semibold text-foreground outline-none w-full"
                    />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 text-right">
                    <label className="text-xs text-muted-foreground mb-1 block">Receive GBP</label>
                    <span className="text-xl font-semibold">£{gbpAmount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-muted-foreground">Rate: ₹{rate}/£</span>
                  <span className="badge-success">
                    <TrendingUp className="w-3 h-3" />
                    +0.3%
                  </span>
                </div>
                </div>
              </div>

              {/* Quick Rooms */}
              <div className="card-base p-5 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-success/10 rounded-full blur-3xl -ml-16 -mb-16" />
                <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Featured Rooms</h2>
                  <Link to="/rooms" className="text-sm text-primary hover:text-primary/80">
                    View all →
                  </Link>
                </div>

                <div className="space-y-3">
                  {quickRooms.map((room, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Home className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium text-sm">{room.area}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{room.type} Room</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">£{room.rent}</div>
                        <span className="text-xs text-success">{room.trust}% trust</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trust Score */}
              <div className="card-base p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl -mr-12 -mt-12" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center border border-success/30 glow-success">
                      <Shield className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gradient-success">{profile?.trustScore || 50}%</div>
                      <div className="text-sm text-muted-foreground">Trust Score</div>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-success to-success/80 rounded-full transition-all shadow-lg"
                      style={{ width: `${profile?.trustScore || 50}%` }}
                    />
                  </div>
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="w-full mt-4 hover:bg-primary/10 hover:border-primary/50 transition-all">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Alerts */}
              <div className="card-base p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold">Alerts</h2>
                </div>
                <div className="space-y-3">
                  {alerts.map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        alert.type === 'exchange' ? 'bg-success/10' : 'bg-primary/10'
                      }`}>
                        {alert.type === 'exchange' 
                          ? <TrendingUp className="w-4 h-4 text-success" />
                          : <MessageSquare className="w-4 h-4 text-primary" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{alert.text}</p>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card-base p-5">
                <h2 className="font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/exchange">
                    <Button variant="outline" size="sm" className="w-full hover:bg-primary/10 hover:border-primary/50 transition-all">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Exchange
                    </Button>
                  </Link>
                  <Link to="/rooms">
                    <Button variant="outline" size="sm" className="w-full hover:bg-primary/10 hover:border-primary/50 transition-all">
                      <Home className="w-3.5 h-3.5" />
                      Find Room
                    </Button>
                  </Link>
                  <Link to="/messages">
                    <Button variant="outline" size="sm" className="w-full hover:bg-primary/10 hover:border-primary/50 transition-all">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Messages
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="w-full hover:bg-primary/10 hover:border-primary/50 transition-all">
                      <Star className="w-3.5 h-3.5" />
                      Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
