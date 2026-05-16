"use client";

import { useUser, useDatabase } from "@/firebase";
import { ref, onValue } from "firebase/database";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const { user, loading: authLoading } = useUser();
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
    }, (err) => {
      console.error("Error fetching user role:", err);
      setLoadingRole(false);
    });

    return () => unsubscribe();
  }, [db, user]);

  if (!db) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Required</AlertTitle>
          <AlertDescription>
            The Firebase Database URL is missing. Please add <strong>NEXT_PUBLIC_FIREBASE_DATABASE_URL</strong> to your .env file and restart the server.
          </AlertDescription>
        </Alert>
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
    <div className="min-h-screen bg-background">
      {isAdmin ? <AdminPanel /> : <Dashboard />}
    </div>
  );
}
