import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Star, Shield, Clock, TrendingUp, MessageSquare, Bookmark, BookmarkCheck, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { exchangeService, ExchangeOffer } from "@/lib/services/exchangeService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const Exchange = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [inrAmount, setInrAmount] = useState("50000");
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");
  const [search, setSearch] = useState("");
  const [savedOffers, setSavedOffers] = useState<string[]>([]);
  const [offers, setOffers] = useState<ExchangeOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newOffer, setNewOffer] = useState({
    type: "sell" as "buy" | "sell",
    amount: "",
    rate: "104.5",
  });

  // Calculate average rate from offers or use default
  const avgRate = offers.length > 0 
    ? offers.reduce((sum, o) => sum + o.rate, 0) / offers.length 
    : 104.52;
  const rate = avgRate;
  const gbpAmount = inrAmount ? (parseFloat(inrAmount.replace(/,/g, '')) / rate).toFixed(2) : "0.00";

  useEffect(() => {
    if (!user) return;

    const unsubscribe = exchangeService.subscribeToOffers((updatedOffers) => {
      setOffers(updatedOffers);
      setLoading(false);
    }, filter === "all" ? undefined : { type: filter });

    return () => unsubscribe();
  }, [user, filter]);

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.userDisplayName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const toggleSaved = (id: string) => {
    setSavedOffers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreateOffer = async () => {
    if (!user || !profile) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    if (!newOffer.amount || !newOffer.rate) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      await exchangeService.createOffer({
        userId: user.uid,
        userDisplayName: profile.displayName,
        userAvatar: profile.photoURL,
        userTrustScore: profile.trustScore,
        type: newOffer.type,
        amount: parseFloat(newOffer.amount),
        rate: parseFloat(newOffer.rate),
        status: "active",
        completedTrades: profile.completedExchanges || 0,
      });
      toast({ title: "Offer created successfully!" });
      setCreateDialogOpen(false);
      setNewOffer({ type: "sell", amount: "", rate: "104.5" });
    } catch (error: any) {
      toast({ title: "Error creating offer", description: error.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleContact = (offer: ExchangeOffer) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/messages?userId=${offer.userId}`);
  };

  const getTimeAgo = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "recently";
    }
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

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-5 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Exchange Offer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-effect">
                    <DialogHeader>
                      <DialogTitle>Create Exchange Offer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Type</Label>
                        <Select value={newOffer.type} onValueChange={(v: "buy" | "sell") => setNewOffer({ ...newOffer, type: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sell">Selling INR</SelectItem>
                            <SelectItem value="buy">Buying INR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Amount (INR)</Label>
                        <Input
                          type="number"
                          placeholder="50000"
                          value={newOffer.amount}
                          onChange={(e) => setNewOffer({ ...newOffer, amount: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Rate (₹ per £)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="104.5"
                          value={newOffer.rate}
                          onChange={(e) => setNewOffer({ ...newOffer, rate: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleCreateOffer} disabled={creating} className="w-full">
                        {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Create Offer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading offers...</p>
                  </div>
                ) : filteredOffers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No offers found matching your criteria</p>
                    {user && (
                      <Button 
                        className="mt-4" 
                        onClick={() => setCreateDialogOpen(true)}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Offer
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredOffers.map((offer, i) => (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="card-hover p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-sm font-medium text-primary border border-primary/30">
                            {offer.userAvatar ? (
                              <img src={offer.userAvatar} alt="" className="w-full h-full rounded-full" />
                            ) : (
                              offer.userDisplayName?.charAt(0) || "U"
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{offer.userDisplayName}</span>
                              <span className="badge-success text-xs">
                                <Shield className="w-3 h-3" />
                                {offer.userTrustScore}%
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {offer.completedTrades || 0} trades
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {getTimeAgo(offer.createdAt as Date)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-xs font-medium px-2 py-0.5 rounded mb-1 ${
                            offer.type === "sell" 
                              ? "bg-success/10 text-success border border-success/20" 
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}>
                            {offer.type === "sell" ? "Selling INR" : "Buying INR"}
                          </div>
                          <div className="font-semibold">₹{offer.amount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">@ ₹{offer.rate}/£</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
                          onClick={() => handleContact(offer)}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Contact
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => offer.id && toggleSaved(offer.id)}
                        >
                          {offer.id && savedOffers.includes(offer.id) ? (
                            <BookmarkCheck className="w-4 h-4 text-primary" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))
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
