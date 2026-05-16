"use client";

import { useState, useMemo } from "react";
import { User, signOut } from "firebase/auth";
import { useAuth, useFirestore, useCollection } from "@/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp, 
  updateDoc 
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Power, PowerOff, Plus, LogOut, Settings, LayoutGrid, Loader2 } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function AdminPanel({ user }: { user: User }) {
  const auth = useAuth();
  const db = useFirestore();
  const [newVillageName, setNewVillageName] = useState("");
  const [adding, setAdding] = useState(false);

  const villagesQuery = useMemo(() => collection(db, "power_status"), [db]);
  const { data: villages = [], loading } = useCollection(villagesQuery);

  const toggleStatus = (id: string, currentStatus: "ON" | "OFF") => {
    const newStatus = currentStatus === "ON" ? "OFF" : "ON";
    const statusRef = doc(db, "power_status", id);
    const timestamp = new Date().toISOString();

    updateDoc(statusRef, {
      status: newStatus,
      updated_at: timestamp
    }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: statusRef.path,
        operation: 'update',
        requestResourceData: { status: newStatus }
      }));
    });

    const logsRef = collection(db, "historical_logs", id, "events");
    addDoc(logsRef, {
      status: newStatus,
      timestamp,
      durationMinutes: 0
    }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: logsRef.path,
        operation: 'create'
      }));
    });
  };

  const addVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVillageName.trim()) return;
    
    setAdding(true);
    const id = newVillageName.toLowerCase().replace(/\s+/g, '-');
    const timestamp = new Date().toISOString();
    
    const villageRef = doc(db, "power_status", id);
    setDoc(villageRef, {
      name: newVillageName,
      status: "ON",
      updated_at: timestamp
    }).then(() => {
      setNewVillageName("");
      setAdding(false);
    }).catch(async () => {
      setAdding(false);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: villageRef.path,
        operation: 'create'
      }));
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
            <p className="text-sm text-muted-foreground font-medium">Logged in as Administrator</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut(auth)} className="rounded-xl">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </header>

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

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Grid Management
          </h2>
          <Badge variant="outline" className="font-bold text-primary border-primary">
            {villages?.length || 0} Villages Active
          </Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {villages?.map((v: any) => (
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
                          Last Updated: {v.updated_at ? new Date(v.updated_at).toLocaleTimeString() : 'N/A'}
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
            {(!villages || villages.length === 0) && (
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
