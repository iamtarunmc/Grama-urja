"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { useAuth, useDatabase } from "@/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, LogOut, RefreshCcw, Power, PowerOff, Clock, Loader2, AlertCircle } from "lucide-react";
import { VillageSelector } from "./VillageSelector";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VillageStatus {
  name: string;
  status: "ON" | "OFF";
  updatedAt: string;
}

export function Dashboard() {
  const auth = useAuth();
  const db = useDatabase();
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);
  const [villageData, setVillageData] = useState<VillageStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("selectedVillageId");
    if (saved) {
      setSelectedVillageId(saved);
    }
  }, []);

  useEffect(() => {
    if (!selectedVillageId || !db) {
      setVillageData(null);
      return;
    }

    setLoading(true);
    const statusRef = ref(db, `villages/${selectedVillageId}`);
    const unsubscribe = onValue(statusRef, (snapshot) => {
      setVillageData(snapshot.val());
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Village data error:", err);
      setError("Permission Denied: Ensure your database rules allow authenticated users to read village data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, selectedVillageId]);

  const handleVillageSelect = (id: string) => {
    setSelectedVillageId(id);
    localStorage.setItem("selectedVillageId", id);
  };

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString([], { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      });
    } catch {
      return ts || 'N/A';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Power className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Grama-Urja</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => auth && signOut(auth)} className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </header>

      {error && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data Sync Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!selectedVillageId ? (
        <VillageSelector onSelect={handleVillageSelect} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border shadow-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Village</p>
                <h2 className="text-2xl font-bold">{villageData?.name || (loading ? "Loading..." : "Unknown Village")}</h2>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedVillageId(null)} className="rounded-xl">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Change Village
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <Card className={cn(
              "overflow-hidden border-none shadow-xl transition-all duration-500",
              villageData?.status === "ON" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
            )}>
              <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                <div className="p-8 rounded-full bg-white/20 power-glow">
                  {villageData?.status === "ON" ? (
                    <Power className="h-24 w-24" strokeWidth={2.5} />
                  ) : (
                    <PowerOff className="h-24 w-24" strokeWidth={2.5} />
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-xl font-medium opacity-90">Current Status</p>
                  <h3 className="text-6xl font-black tracking-tighter uppercase">
                    Power {villageData?.status || "OFFLINE"}
                  </h3>
                </div>

                {villageData?.updatedAt && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/10 rounded-full">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Last Check: {formatTimestamp(villageData.updatedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
