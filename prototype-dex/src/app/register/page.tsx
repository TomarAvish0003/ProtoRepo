'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/utils/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import DotGrid from '@/blocks/Backgrounds/DotGrid/DotGrid';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: regData, error: regError } = await registerUser(username, email, password);

    if (regError || !regData) {
      setError(regError || 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    // Use the token from registration, or fallback to login if you want
    localStorage.setItem('token', regData.token);
    router.push('/favorites');
  };

  return (
    <main className="relative flex justify-center items-center min-h-screen">
      {/* Animated DotGrid background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br">
        <DotGrid baseColor="#222" activeColor="#00d8ff" />
      </div>
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              className="border border-border bg-background text-foreground rounded px-3 py-2"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="border border-border bg-background text-foreground rounded px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="border border-border bg-background text-foreground rounded px-3 py-2"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div className="text-destructive">{error}</div>}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded font-semibold hover:bg-accent hover:text-accent-foreground transition"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            <div className="mt-2 text-sm text-center w-full">
              Already have an account?{' '}
              <a href="/login" className="text-accent underline hover:text-accent-foreground">
                Login
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
