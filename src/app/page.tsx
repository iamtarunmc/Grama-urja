"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check role in database
        try {
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setIsAdmin(snapshot.val().role === "admin");
          } else {
            // Default to resident if no data
            setIsAdmin(currentUser.email?.endsWith("@admin.com") || false);
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          setIsAdmin(currentUser.email?.endsWith("@admin.com") || false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
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
