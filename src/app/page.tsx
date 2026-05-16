"use client";

import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function Home() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: userData, loading: docLoading } = useDoc(userDocRef);

  if (authLoading || (user && docLoading)) {
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

  const isAdmin = userData?.role === "admin" || user.email?.endsWith("@admin.com");

  return (
    <div className="min-h-screen bg-background">
      {isAdmin ? (
        <AdminPanel user={user} />
      ) : (
        <Dashboard user={user} />
      )}
    </div>
  );
}
