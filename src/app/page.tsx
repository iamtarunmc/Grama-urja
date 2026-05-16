
"use client";

import { useUser, useDatabase } from "@/firebase";
import { ref, onValue } from "firebase/database";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const { user, loading: authLoading } = useUser();
  const db = useDatabase();
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(false);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }

    setLoadingRole(true);
    const userRef = ref(db, `users/${user.uid}/role`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      setRole(snapshot.val());
      setLoadingRole(false);
    });

    return () => unsubscribe();
  }, [db, user]);

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
