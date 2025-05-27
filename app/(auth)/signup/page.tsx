"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const { signUp, loading, error, user: authUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    await signUp(email, password);
    // Similar to login, successful signUp should update user in context.
    // Redirect will be handled by useEffect watching authUser.
  };

  React.useEffect(() => {
    if (authUser) {
      router.push('/'); // Redirect to home if already logged in (e.g., after successful signup)
    }
  }, [authUser, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up to get started with AGENTSLY.AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email_signup" className="text-sm font-medium">Email</label>
              <Input
                id="email_signup"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password_signup" className="text-sm font-medium">Password</label>
              <Input
                id="password_signup"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="confirm_password_signup" className="text-sm font-medium">Confirm Password</label>
              <Input
                id="confirm_password_signup"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {localError && <p className="text-sm text-red-600">{localError}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
