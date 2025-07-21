'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/app/utils/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import DotGrid from '@/blocks/Backgrounds/DotGrid/DotGrid';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await loginUser(email, password);

    if (error || !data) {
      setError(error || 'Login failed. Please try again.');
      setLoading(false);
      return;
    }

    // Store JWT token (for demo: localStorage; in production, consider httpOnly cookies)
    localStorage.setItem('token', data.token);

    // Redirect to favorites page or home
    router.push('/favorites');
  };

  return (
    <main className="relative flex justify-center items-center min-h-screen .login-bg" style={{ background: "transparent" }}>
      {/* Animated DotGrid background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br">
        <DotGrid baseColor="#222" activeColor="#00d8ff" />
      </div>
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
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
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="mt-2 text-sm text-center w-full">
              Don&apos;t have an account?{' '}
              <a href="/register" className="text-accent underline hover:text-accent-foreground">
                Register
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
