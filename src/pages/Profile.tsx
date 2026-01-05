import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Star, MessageSquare, Edit2, Camera, LogOut, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, profile, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || "",
    bio: profile?.bio || "",
    university: profile?.university || "",
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast({ title: "Error logging out", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      toast({ title: "Profile updated!" });
    } catch (error) {
      toast({ title: "Error updating profile", variant: "destructive" });
    }
  };

  const stats = [
    { label: "Trust Score", value: profile?.trustScore || 50, icon: Shield, color: "text-success" },
    { label: "Exchanges", value: profile?.completedExchanges || 0, icon: TrendingUp, color: "text-primary" },
    { label: "Reviews", value: profile?.reviewCount || 0, icon: Star, color: "text-warning" },
  ];

  const reviews = [
    { user: "Priya S.", rating: 5, text: "Great exchange experience! Very punctual and professional.", time: "2 weeks ago" },
    { user: "Rahul M.", rating: 5, text: "Smooth transaction, would definitely exchange again.", time: "1 month ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="section-container max-w-4xl">
          {/* Profile Header */}
          <div className="card-base p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl font-semibold text-primary">
                      {profile?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      placeholder="Display Name"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                    <Input
                      placeholder="University"
                      value={formData.university}
                      onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSave}>Save</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-xl font-bold">{profile?.displayName || "User"}</h1>
                      {profile?.isVerified && (
                        <span className="badge-success">
                          <Shield className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-1 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      {user?.email}
                    </p>
                    {profile?.university && (
                      <p className="text-muted-foreground text-sm mb-3">{profile.university}</p>
                    )}
                    {profile?.bio && (
                      <p className="text-sm text-foreground mb-4">{profile.bio}</p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Profile
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleLogout}>
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-base p-4 text-center"
              >
                <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}{stat.label === "Trust Score" && "%"}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="card-base p-5 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Trust Badges
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                { name: "Email Verified", earned: user?.emailVerified },
                { name: "First Exchange", earned: (profile?.completedExchanges || 0) >= 1 },
                { name: "5 Exchanges", earned: (profile?.completedExchanges || 0) >= 5 },
                { name: "Trusted Member", earned: (profile?.trustScore || 0) >= 80 },
              ].map((badge) => (
                <div
                  key={badge.name}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    badge.earned 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {badge.name}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="card-base p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Reviews ({reviews.length})
            </h2>
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{review.user}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.text}</p>
                  <span className="text-xs text-muted-foreground mt-1 block">{review.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
