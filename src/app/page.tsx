"use client";

import { useUser, useDatabase, useAuth } from "@/firebase";
import { ref, onValue } from "firebase/database";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2, AlertCircle, ExternalLink, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useDatabase();
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(false);

  useEffect(() => {
    if (!user || !db) {
      setRole(null);
      return;
    }

    setLoadingRole(true);
    const userRef = ref(db, `users/${user.uid}/role`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      setRole(snapshot.val());
      setLoadingRole(false);
    }, () => {
      setLoadingRole(false);
    });

    return () => unsubscribe();
  }, [db, user]);

  // Fallback UI for missing Firebase Configuration
  if (!auth || !db) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
        <Card className="max-w-xl w-full shadow-2xl border-t-4 border-t-primary rounded-2xl overflow-hidden">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Settings className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Connect Firebase</CardTitle>
                <CardDescription className="text-lg">Real-time power monitoring requires a valid connection.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-5 rounded-xl space-y-4">
              <p className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Setup Required</p>
              <div className="space-y-2">
                <p className="text-sm">Please add these variables to your <strong>.env</strong> file:</p>
                <pre className="bg-black/5 p-3 rounded-lg font-mono text-xs break-all border overflow-x-auto">
                  NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key{"\n"}
                  NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com/
                </pre>
              </div>
            </div>
            
            <div className="grid gap-4">
              <Button asChild className="w-full h-12 rounded-xl text-lg font-bold">
                <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                  Go to Firebase Console
                  <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Restart your dev server after updating environment variables.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authLoading || loadingRole) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium">Loading Grama-Urja...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPortal />;
  }

  const isAdmin = role === "admin" || user.email?.endsWith("@admin.com");

  return (
    <div className="min-h-screen bg-background font-body">
      {isAdmin ? <AdminPanel /> : <Dashboard />}
    </div>
  );
}
