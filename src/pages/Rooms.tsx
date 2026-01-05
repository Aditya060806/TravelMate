import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Home, Shield, Heart, MessageSquare, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";

const roomListings = [
  { id: 1, area: "Shoreditch", rent: 850, type: "Double Room", gender: "Any", food: "Vegetarian Kitchen", user: "Priya S.", avatar: "PS", trust: 94, moveIn: "1st Feb", tags: ["Bills Included", "Near Tube"] },
  { id: 2, area: "Stratford", rent: 720, type: "Single Room", gender: "Female Only", food: "No Preference", user: "Ananya K.", avatar: "AK", trust: 98, moveIn: "15th Jan", tags: ["Near Westfield", "Student Only"] },
  { id: 3, area: "Wembley", rent: 680, type: "Double Room", gender: "Male Only", food: "Indian Kitchen", user: "Rahul M.", avatar: "RM", trust: 91, moveIn: "1st Feb", tags: ["Gym Nearby", "Parking"] },
  { id: 4, area: "Canary Wharf", rent: 950, type: "Studio", gender: "Any", food: "No Preference", user: "Vikram P.", avatar: "VP", trust: 88, moveIn: "Immediate", tags: ["Modern Build", "Concierge"] },
  { id: 5, area: "Whitechapel", rent: 700, type: "Single Room", gender: "Any", food: "Vegetarian Kitchen", user: "Sneha R.", avatar: "SR", trust: 96, moveIn: "1st Mar", tags: ["Near Queen Mary", "Quiet Area"] },
  { id: 6, area: "Hackney", rent: 780, type: "Double Room", gender: "Female Only", food: "No Preference", user: "Meera T.", avatar: "MT", trust: 93, moveIn: "15th Feb", tags: ["Creative Area", "Cafes Nearby"] },
];

const areas = ["All Areas", "Shoreditch", "Stratford", "Wembley", "Canary Wharf", "Whitechapel", "Hackney"];

const Rooms = () => {
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [showFilters, setShowFilters] = useState(false);
  const [savedListings, setSavedListings] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 500, max: 1200 });
  const [genderFilter, setGenderFilter] = useState("All");

  const filteredListings = roomListings.filter(room => {
    const matchesSearch = room.area.toLowerCase().includes(search.toLowerCase()) || 
                          room.user.toLowerCase().includes(search.toLowerCase());
    const matchesArea = selectedArea === "All Areas" || room.area === selectedArea;
    const matchesPrice = room.rent >= priceRange.min && room.rent <= priceRange.max;
    const matchesGender = genderFilter === "All" || room.gender.includes(genderFilter) || room.gender === "Any";
    return matchesSearch && matchesArea && matchesPrice && matchesGender;
  });

  const toggleSaved = (id: number) => {
    setSavedListings(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="section-container">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Find Your Room</h1>
            <p className="text-muted-foreground">Verified listings from fellow Indian students</p>
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
                    <div className="text-2xl font-bold">£{room.rent}<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
                  </div>
                  <button 
                    onClick={() => toggleSaved(room.id)}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Heart 
                      className={`w-5 h-5 ${savedListings.includes(room.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} 
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
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

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {room.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{room.user}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="w-3 h-3" />
                        {room.trust}% trust
                      </div>
                    </div>
                  </div>
                  <Button size="sm">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rooms found matching your criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Rooms;
