"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await axios.post(
        apiUrl("/login"),
        { identifier: identifier.trim(), password },
        { withCredentials: true },
      );
      router.replace("/");
      router.refresh();
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      setError(
        status === 400 || status === 401
          ? "That email or password doesn’t match. Please try again."
          : "We couldn’t connect right now. Please try again in a moment.",
      );
      setPending(false);
    }
  }
  return (
    <AuthLayout title="YOU’RE IN GOOD COMPANY." subtitle="Sign in and pick up where you left off.">
      <form className="auth-form" onSubmit={handleLogin} aria-busy={pending}>
        <div className="form-field">
          <Label htmlFor="identifier">Email or nickname</Label>
          <Input
            id="identifier"
            name="username"
            autoComplete="username"
            placeholder="Your email or nickname"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>
        <PasswordInput
          id="password"
          label="Password"
          value={password}
          setValue={setPassword}
          required
        />
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="auth-submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in to Common"}
          {pending ? <LoaderCircle className="animate-spin" size={18} /> : <ArrowRight size={18} />}
        </Button>
      </form>
      <div className="auth-switch">
        <span>Not part of the story yet?</span>
        <Link href="/register">
          Create an account <ArrowUpRight size={16} />
        </Link>
      </div>
    </AuthLayout>
  );
}
