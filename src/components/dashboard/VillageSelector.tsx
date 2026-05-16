"use client";

import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { useDatabase } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function VillageSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const db = useDatabase();
  const [villages, setVillages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
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
      setError("Unable to connect to the grid data. Please check your Database Rules.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const filtered = villages.filter((v) => v.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground space-y-1 pb-8">
        <CardTitle className="text-2xl font-bold">Select Village</CardTitle>
        <CardDescription className="text-primary-foreground/80 text-lg">
          Check the live power status of your community.
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

        {error && (
          <Alert variant="destructive" className="mb-6 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length > 0 ? (
              filtered.map((village) => (
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
              ))
            ) : (
              <div className="text-center py-12 px-4 border-2 border-dashed rounded-2xl">
                <p className="text-muted-foreground font-medium mb-2">No villages found.</p>
                <p className="text-sm text-muted-foreground/60">
                  If you are an admin, please use an @admin.com email to add villages.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
