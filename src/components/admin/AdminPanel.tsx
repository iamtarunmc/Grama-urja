"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { ref, onValue, set, update } from "firebase/database";
import { useAuth, useDatabase } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Power, PowerOff, Plus, LogOut, Settings, LayoutGrid, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AdminPanel() {
  const auth = useAuth();
  const db = useDatabase();
  const [villages, setVillages] = useState<any[]>([]);
  const [newVillageName, setNewVillageName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;

    const villagesRef = ref(db, 'villages');
    const unsubscribe = onValue(villagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: any) => ({
          id,
          ...val
        }));
        setVillages(list);
      } else {
        setVillages([]);
      }
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Database read error:", err);
      setError("Permission Denied: Please check your Realtime Database 'Rules' tab in Firebase Console. They must allow 'read' and 'write'.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const toggleStatus = (id: string, currentStatus: "ON" | "OFF") => {
    if (!db) return;
    const newStatus = currentStatus === "ON" ? "OFF" : "ON";
    const statusRef = ref(db, `villages/${id}`);
    
    update(statusRef, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    }).catch((err) => {
      console.error("Status update error:", err);
      setError("Failed to update status. Check your Database Rules.");
    });
  };

  const addVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVillageName.trim() || !db) return;
    
    setAdding(true);
    setError(null);

    const id = newVillageName.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
    const villageRef = ref(db, `villages/${id}`);
    
    set(villageRef, {
      name: newVillageName.trim(),
      status: "ON",
      updatedAt: new Date().toISOString()
    })
    .then(() => {
      setNewVillageName("");
      setAdding(false);
    })
    .catch((err) => {
      console.error("Add village error:", err);
      setError("Permission Denied: Ensure your Database Rules allow authenticated users to write to the 'villages' path.");
      setAdding(false);
    });
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
            <p className="text-sm text-muted-foreground font-medium">Grid Management</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => auth && signOut(auth)} className="rounded-xl">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </header>

      {error && (
        <Alert variant="destructive" className="rounded-xl border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold">Database Access Error</AlertTitle>
          <AlertDescription className="mt-2 font-medium">
            {error}
            <div className="mt-4 p-3 bg-white/10 rounded-lg text-xs font-mono">
              Tip: In Firebase Console &rarr; Realtime Database &rarr; Rules, set:<br/>
              {`".read": "auth != null",`}<br/>
              {`".write": "auth != null"`}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2 font-bold">
            <Plus className="h-5 w-5" />
            Add Village
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">Connect a new village to the monitoring system.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={addVillage} className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Village Name (e.g. Tumkur)"
              value={newVillageName}
              onChange={(e) => setNewVillageName(e.target.value)}
              className="h-12 text-lg rounded-xl flex-1 border-2 focus:border-primary"
              disabled={adding}
            />
            <Button type="submit" disabled={adding || !newVillageName.trim()} className="h-12 px-8 rounded-xl font-bold shadow-md">
              {adding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Village"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Live Status Control
          </h2>
          <Badge variant="outline" className="font-bold text-primary border-primary px-3 py-1">
            {villages.length} Villages
          </Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {villages.length > 0 ? (
              villages.map((v) => (
                <Card key={v.id} className="border-2 shadow-sm rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${v.status === 'ON' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                        {v.status === 'ON' ? <Power className="h-6 w-6" /> : <PowerOff className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{v.name}</h3>
                        <Badge className={v.status === 'ON' ? 'bg-primary font-bold' : 'bg-accent font-bold'}>
                          Power {v.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <Switch
                      checked={v.status === "ON"}
                      onCheckedChange={() => toggleStatus(v.id, v.status)}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-accent scale-125"
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/30">
                <div className="flex justify-center mb-4 text-muted-foreground/40">
                  <LayoutGrid className="h-12 w-12" />
                </div>
                <p className="text-muted-foreground font-bold text-lg">No villages connected yet.</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                  Use the "Add Village" form above to start monitoring power in your area.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}