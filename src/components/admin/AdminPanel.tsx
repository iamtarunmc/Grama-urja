"use client";

import { useState, useEffect } from "react";
import { User, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, onValue, set, push, serverTimestamp, get } from "firebase/database";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Power, PowerOff, Plus, LogOut, Settings, LayoutGrid, Loader2, MapPin } from "lucide-react";

export function AdminPanel({ user }: { user: User }) {
  const [villages, setVillages] = useState<any[]>([]);
  const [newVillageName, setNewVillageName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const villagesRef = ref(db, "power_status");
    const unsubscribe = onValue(villagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }));
        setVillages(list);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleStatus = async (id: string, currentStatus: "ON" | "OFF") => {
    const newStatus = currentStatus === "ON" ? "OFF" : "ON";
    const timestamp = new Date().toISOString();
    
    // Update live status
    await set(ref(db, `power_status/${id}/status`), newStatus);
    await set(ref(db, `power_status/${id}/updated_at`), timestamp);

    // Add to historical logs for AI
    await push(ref(db, `historical_logs/${id}`), {
      status: newStatus,
      timestamp,
      durationMinutes: 0 // Could calculate from previous timestamp if needed
    });
  };

  const addVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVillageName.trim()) return;
    
    setAdding(true);
    const id = newVillageName.toLowerCase().replace(/\s+/g, '-');
    const timestamp = new Date().toISOString();
    
    await set(ref(db, `power_status/${id}`), {
      name: newVillageName,
      status: "ON",
      updated_at: timestamp
    });

    setNewVillageName("");
    setAdding(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Settings className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Control Center</h1>
            <p className="text-sm text-muted-foreground font-medium">Logged in as Administrator</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut(auth)} className="rounded-xl">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </header>

      {/* Add New Village Card */}
      <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Onboard New Village
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">Add a new village grid to the Grama-Urja system.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={addVillage} className="flex gap-4">
            <Input
              placeholder="Village Name (e.g. Rampur)"
              value={newVillageName}
              onChange={(e) => setNewVillageName(e.target.value)}
              className="h-12 text-lg rounded-xl"
            />
            <Button type="submit" disabled={adding} className="h-12 px-8 rounded-xl font-bold">
              {adding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Add Village"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Village Management List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Grid Management
          </h2>
          <Badge variant="outline" className="font-bold text-primary border-primary">
            {villages.length} Villages Active
          </Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {villages.map((v) => (
              <Card key={v.id} className="border-2 shadow-sm rounded-2xl overflow-hidden transition-all hover:border-primary/50">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${v.status === 'ON' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                      {v.status === 'ON' ? <Power className="h-6 w-6" /> : <PowerOff className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{v.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={v.status === 'ON' ? 'bg-primary' : 'bg-accent'}>
                          Power {v.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">
                          Last Updated: {new Date(v.updated_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Label htmlFor={`status-${v.id}`} className="text-sm font-bold text-muted-foreground hidden sm:block">
                      {v.status === 'ON' ? 'DEACTIVATE' : 'ACTIVATE'}
                    </Label>
                    <Switch
                      id={`status-${v.id}`}
                      checked={v.status === "ON"}
                      onCheckedChange={() => toggleStatus(v.id, v.status)}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-accent"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {villages.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed">
                <p className="text-muted-foreground font-medium">No villages managed yet. Add your first village above.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
