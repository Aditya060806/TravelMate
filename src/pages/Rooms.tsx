import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Home, Shield, Heart, MessageSquare, X, SlidersHorizontal, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { roomService, RoomListing } from "@/lib/services/roomService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const areas = ["All Areas", "Shoreditch", "Stratford", "Wembley", "Canary Wharf", "Whitechapel", "Hackney", "Camden", "Islington", "Greenwich"];

const Rooms = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [showFilters, setShowFilters] = useState(false);
  const [savedListings, setSavedListings] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 500, max: 1200 });
  const [genderFilter, setGenderFilter] = useState("All");
  const [listings, setListings] = useState<RoomListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newListing, setNewListing] = useState({
    area: "",
    rent: "",
    type: "Single Room" as RoomListing['type'],
    gender: "Any" as RoomListing['gender'],
    moveIn: "",
    tags: "",
    description: "",
  });

  useEffect(() => {
    const unsubscribe = roomService.subscribeToListings((updatedListings) => {
      setListings(updatedListings);
      setLoading(false);
    }, {
      area: selectedArea === "All Areas" ? undefined : selectedArea,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      gender: genderFilter === "All" ? undefined : genderFilter,
    });

    return () => unsubscribe();
  }, [selectedArea, priceRange, genderFilter]);

  const filteredListings = useMemo(() => {
    return listings.filter(room => {
      const matchesSearch = room.area.toLowerCase().includes(search.toLowerCase()) || 
                          room.userDisplayName.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [listings, search]);

  const toggleSaved = (id: string) => {
    setSavedListings(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreateListing = async () => {
    if (!user || !profile) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    if (!newListing.area || !newListing.rent || !newListing.moveIn) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      await roomService.createListing({
        userId: user.uid,
        userDisplayName: profile.displayName,
        userAvatar: profile.photoURL,
        userTrustScore: profile.trustScore,
        area: newListing.area,
        rent: parseFloat(newListing.rent),
        type: newListing.type,
        gender: newListing.gender,
        moveIn: newListing.moveIn,
        tags: newListing.tags ? newListing.tags.split(',').map(t => t.trim()) : [],
        description: newListing.description,
        status: "active",
      });
      toast({ title: "Listing created successfully!" });
      setCreateDialogOpen(false);
      setNewListing({
        area: "",
        rent: "",
        type: "Single Room",
        gender: "Any",
        moveIn: "",
        tags: "",
        description: "",
      });
    } catch (error: any) {
      toast({ title: "Error creating listing", description: error.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleMessage = (listing: RoomListing) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/messages?userId=${listing.userId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="section-container">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Find Your Room</h1>
              <p className="text-muted-foreground">Verified listings from fellow Indian students</p>
            </div>
            {user && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90">
                    <Plus className="w-4 h-4 mr-2" />
                    List Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-effect max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Room Listing</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Area *</Label>
                        <Input
                          placeholder="Shoreditch"
                          value={newListing.area}
                          onChange={(e) => setNewListing({ ...newListing, area: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Rent (£/month) *</Label>
                        <Input
                          type="number"
                          placeholder="850"
                          value={newListing.rent}
                          onChange={(e) => setNewListing({ ...newListing, rent: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Room Type</Label>
                        <select
                          value={newListing.type}
                          onChange={(e) => setNewListing({ ...newListing, type: e.target.value as RoomListing['type'] })}
                          className="w-full h-10 px-3 rounded-md border border-border bg-background"
                        >
                          <option>Single Room</option>
                          <option>Double Room</option>
                          <option>Studio</option>
                          <option>Shared Room</option>
                        </select>
                      </div>
                      <div>
                        <Label>Gender Preference</Label>
                        <select
                          value={newListing.gender}
                          onChange={(e) => setNewListing({ ...newListing, gender: e.target.value as RoomListing['gender'] })}
                          className="w-full h-10 px-3 rounded-md border border-border bg-background"
                        >
                          <option>Any</option>
                          <option>Male Only</option>
                          <option>Female Only</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>Move-in Date *</Label>
                      <Input
                        placeholder="1st Feb or Immediate"
                        value={newListing.moveIn}
                        onChange={(e) => setNewListing({ ...newListing, moveIn: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Tags (comma separated)</Label>
                      <Input
                        placeholder="Bills Included, Near Tube, Student Only"
                        value={newListing.tags}
                        onChange={(e) => setNewListing({ ...newListing, tags: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe the room, location, amenities..."
                        value={newListing.description}
                        onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleCreateListing} disabled={creating} className="w-full">
                      {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Create Listing
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by area or name..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <select 
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="h-10 px-3 rounded-md border border-border bg-background text-sm"
              >
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="card-base p-4 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Filters</span>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Min Budget</label>
                  <Input 
                    type="number" 
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Max Budget</label>
                  <Input 
                    type="number" 
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Gender Preference</label>
                  <select 
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                  >
                    <option value="All">All</option>
                    <option value="Male">Male Only</option>
                    <option value="Female">Female Only</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Listings Grid */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rooms found matching your criteria</p>
              {user && (
                <Button 
                  className="mt-4" 
                  onClick={() => setCreateDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Listing
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-hover p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {room.area}
                      </div>
                      <div className="text-2xl font-bold text-gradient">£{room.rent}<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
                    </div>
                    {room.id && (
                      <button 
                        onClick={() => toggleSaved(room.id!)}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Heart 
                          className={`w-5 h-5 transition-colors ${savedListings.includes(room.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} 
                        />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Home className="w-3.5 h-3.5" />
                    <span>{room.type}</span>
                    <span>•</span>
                    <span>{room.gender}</span>
                  </div>

                  {room.tags && room.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.tags.map((tag, j) => (
                        <span key={j} className="px-2 py-1 rounded bg-secondary/50 text-xs text-muted-foreground border border-border/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-xs font-medium text-primary border border-primary/30">
                        {room.userAvatar ? (
                          <img src={room.userAvatar} alt="" className="w-full h-full rounded-full" />
                        ) : (
                          room.userDisplayName?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{room.userDisplayName}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Shield className="w-3 h-3" />
                          {room.userTrustScore}% trust
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
                      onClick={() => handleMessage(room)}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Rooms;
