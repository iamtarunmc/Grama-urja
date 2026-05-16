"use client";

import { useState, useMemo } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export function VillageSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const db = useFirestore();
  const [search, setSearch] = useState("");

  const villagesQuery = useMemo(() => collection(db, "power_status"), [db]);
  const { data: villages = [], loading } = useCollection(villagesQuery);

  const filtered = (villages || []).filter((v: any) => v.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground space-y-1 pb-8">
        <CardTitle className="text-2xl font-bold">Select Your Village</CardTitle>
        <CardDescription className="text-primary-foreground/80 text-lg">
          Connect to your local grid to monitor live power status.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 -mt-6">
        <div className="bg-white rounded-xl shadow-sm border p-2 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search villages..." 
              className="pl-10 h-12 border-none focus-visible:ring-0 text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length > 0 ? filtered.map((village: any) => (
              <Button
                key={village.id}
                variant="outline"
                className="w-full justify-between h-16 rounded-xl border-2 hover:border-primary hover:bg-primary/5 text-lg font-semibold text-left px-6"
                onClick={() => onSelect(village.id)}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  {village.name}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            )) : (
              <p className="text-center py-8 text-muted-foreground italic">No villages found matching your search.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
