import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Star, Shield, Clock, TrendingUp, MessageSquare, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";

const exchangeOffers = [
  { id: 1, user: "Priya S.", avatar: "PS", type: "sell", amount: 50000, rate: 104.2, trust: 96, trades: 42, time: "2m ago" },
  { id: 2, user: "Rahul M.", avatar: "RM", type: "buy", amount: 30000, rate: 104.8, trust: 91, trades: 28, time: "5m ago" },
  { id: 3, user: "Ananya K.", avatar: "AK", type: "sell", amount: 100000, rate: 103.9, trust: 98, trades: 67, time: "8m ago" },
  { id: 4, user: "Vikram P.", avatar: "VP", type: "buy", amount: 75000, rate: 105.1, trust: 88, trades: 15, time: "12m ago" },
  { id: 5, user: "Sneha R.", avatar: "SR", type: "sell", amount: 25000, rate: 104.5, trust: 94, trades: 35, time: "15m ago" },
];

const Exchange = () => {
  const [inrAmount, setInrAmount] = useState("50000");
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");
  const [search, setSearch] = useState("");
  const [savedOffers, setSavedOffers] = useState<number[]>([]);

  const rate = 104.52;
  const gbpAmount = inrAmount ? (parseFloat(inrAmount.replace(/,/g, '')) / rate).toFixed(2) : "0.00";

  const filteredOffers = exchangeOffers.filter(offer => {
    const matchesFilter = filter === "all" || offer.type === filter;
    const matchesSearch = offer.user.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleSaved = (id: number) => {
    setSavedOffers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="section-container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Currency Exchange</h1>
            <p className="text-muted-foreground">Find the best rates from trusted students</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calculator Card */}
            <div className="lg:col-span-1">
              <div className="card-base p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm text-muted-foreground">Live Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">₹{rate}</span>
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
                        className="bg-transparent text-xl font-semibold text-foreground outline-none w-full"
                      />
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-background shrink-0">
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
                      <span className="text-xl font-semibold text-foreground">£{gbpAmount}</span>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-background shrink-0">
                        <span>🇬🇧</span>
                        <span className="text-sm font-medium">GBP</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-5">
                  Create Exchange Offer
                </Button>
              </div>
            </div>

            {/* Offers List */}
            <div className="lg:col-span-2">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name..." 
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {(["all", "buy", "sell"] as const).map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(f)}
                    >
                      {f === "all" ? "All" : f === "buy" ? "Buying INR" : "Selling INR"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Offers */}
              <div className="space-y-3">
                {filteredOffers.map((offer, i) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-hover p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {offer.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{offer.user}</span>
                            <span className="badge-success text-xs">
                              <Shield className="w-3 h-3" />
                              {offer.trust}%
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {offer.trades} trades
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {offer.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-xs font-medium px-2 py-0.5 rounded mb-1 ${
                          offer.type === "sell" 
                            ? "bg-success/10 text-success" 
                            : "bg-primary/10 text-primary"
                        }`}>
                          {offer.type === "sell" ? "Selling INR" : "Buying INR"}
                        </div>
                        <div className="font-semibold">₹{offer.amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">@ ₹{offer.rate}/£</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Contact
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleSaved(offer.id)}
                      >
                        {savedOffers.includes(offer.id) ? (
                          <BookmarkCheck className="w-4 h-4 text-primary" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {filteredOffers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No offers found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Exchange;
