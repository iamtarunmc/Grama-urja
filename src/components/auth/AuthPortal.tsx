"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth, useDatabase } from "@/firebase";
import { ref, set } from "firebase/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap, Leaf, Mail, Lock, Loader2 } from "lucide-react";

export function AuthPortal() {
  const auth = useAuth();
  const db = useDatabase();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const role = email.endsWith("@admin.com") ? "admin" : "resident";
        
        // Use Realtime Database (ref/set) instead of Firestore
        const userRef = ref(db, `users/${userCredential.user.uid}`);
        await set(userRef, {
          email,
          role,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary rounded-2xl overflow-hidden">
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-2xl">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">Grama-Urja</CardTitle>
          <CardDescription className="text-lg">
            {isLogin ? "Welcome back to your local grid" : "Join your village's power network"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 h-12 text-lg rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10 h-12 text-lg rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Zap className="h-5 w-5 mr-2" />}
              {isLogin ? "Log In" : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-primary hover:underline"
            >
              {isLogin ? "Create account" : "Log in"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
