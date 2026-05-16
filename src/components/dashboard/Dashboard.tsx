"use client";

import { useState, useEffect, useMemo } from "react";
import { User, signOut } from "firebase/auth";
import { useAuth, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, LogOut, RefreshCcw, Power, PowerOff, Clock } from "lucide-react";
import { VillageSelector } from "./VillageSelector";
import { OutagePredictor } from "./OutagePredictor";
import { cn } from "@/lib/utils";

interface VillageStatus {
  name: string;
  status: "ON" | "OFF";
  updated_at: string;
}

export function Dashboard({ user }: { user: User }) {
  const auth = useAuth();
  const db = useFirestore();
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("selectedVillageId");
    if (saved) {
      setSelectedVillageId(saved);
    }
  }, []);

  const villageDocRef = useMemo(() => {
    if (!selectedVillageId) return null;
    return doc(db, "power_status", selectedVillageId);
  }, [db, selectedVillageId]);

  const { data: villageData } = useDoc<VillageStatus>(villageDocRef);

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
        <Button variant="ghost" size="sm" onClick={() => signOut(auth)} className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </header>

      {!selectedVillageId ? (
        <VillageSelector onSelect={handleVillageSelect} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border shadow-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Village</p>
                <h2 className="text-2xl font-bold">{villageData?.name || "Loading..."}</h2>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedVillageId(null)} className="rounded-xl">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Change Village
            </Button>
          </div>

          <Card className={cn(
            "overflow-hidden border-none shadow-xl transition-all duration-500",
            villageData?.status === "ON" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
          )}>
            <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
              <div className={cn(
                "p-8 rounded-full bg-white/20 power-glow",
                villageData?.status === "ON" ? "text-primary-foreground" : "text-accent-foreground"
              )}>
                {villageData?.status === "ON" ? (
                  <Power className="h-24 w-24" strokeWidth={2.5} />
                ) : (
                  <PowerOff className="h-24 w-24" strokeWidth={2.5} />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-xl font-medium opacity-90">Current Status</p>
                <h3 className="text-6xl font-black tracking-tighter uppercase">
                  Power {villageData?.status || "---"}
                </h3>
              </div>

              {villageData?.updated_at && (
                <div className="flex items-center gap-2 px-4 py-2 bg-black/10 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Updated: {formatTimestamp(villageData.updated_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedVillageId && villageData && (
            <OutagePredictor villageId={selectedVillageId} villageName={villageData.name} />
          )}
        </div>
      )}
    </div>
  );
}
