"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Upload, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password";
import { apiUrl } from "@/lib/api";
import axios from "axios";
import { useRouter } from "next/navigation";
export default function RegisterPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [registered, setRegistered] = useState(false);
  useEffect(() => {
    if (!avatar) { setPreview(""); return; }
    const url = URL.createObjectURL(avatar); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (pending) return;
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    form.set("email", email); form.set("password", password);
    if (avatar) form.set("avatar", avatar); else form.delete("avatar");
    setPending(true); setError("");
    try {
      await axios.post(apiUrl("/register"), form, { withCredentials: true });
      setRegistered(true);
      try {
        await axios.post(apiUrl("/login"), { identifier: email, password }, { withCredentials: true });
        router.replace("/"); router.refresh();
      } catch { setError("Your account is ready. Please sign in to continue."); }
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data : undefined;
      setError(typeof message === "string" && message.startsWith("Validation failed:") ? message.replace("Validation failed:", "").trim() : "We couldn’t create your account. Check your details or try a different email and nickname.");
    } finally { setPending(false); }
  }
  return <AuthLayout title="You belong here." subtitle="A few details, and you’re part of the conversation.">
    <form onSubmit={submit} className="register-form" aria-busy={pending}>
      <div className="register-grid">
        <div className="form-field"><Label htmlFor="first-name">First name</Label><Input id="first-name" name="first_name" autoComplete="given-name" required maxLength={15} pattern="[A-Za-z]+" title="Up to 15 letters" /></div>
        <div className="form-field"><Label htmlFor="last-name">Last name</Label><Input id="last-name" name="last_name" autoComplete="family-name" required maxLength={15} pattern="[A-Za-z]+" title="Up to 15 letters" /></div>
      </div>
      <div className="form-field"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></div>
      <PasswordInput id="password" label="Password" value={password} setValue={setPassword} required autoComplete="new-password" />
      <p className="inline-note">Use 8+ characters with uppercase, lowercase, a number and a symbol.</p>
      <div className="form-field"><Label htmlFor="birthday">Date of birth</Label><Input id="birthday" name="date_of_birth" type="date" autoComplete="bday" required max={new Date().toISOString().slice(0,10)} /></div>
      <details className="optional-fields"><summary>Make it yours <span className="inline-note">— optional</span></summary>
        <div className="register-form">
          <div className="form-field"><Label htmlFor="nickname">Nickname</Label><Input id="nickname" name="nickname" maxLength={15} pattern="[A-Za-z0-9]+" placeholder="What should we call you?" /></div>
          <div className="form-field"><Label htmlFor="about">About you</Label><Textarea id="about" name="about_me" maxLength={50} placeholder="A little something about you (50 characters)" /></div>
          <div className="avatar-upload">{preview ? <img src={preview} alt="Your avatar preview" /> : <Upload size={25} aria-hidden="true" />}<div className="form-field"><Label htmlFor="avatar">Profile photo</Label><Input id="avatar" name="avatar" type="file" accept="image/jpeg,image/png,image/gif" onChange={e => { const file=e.target.files?.[0] || null; if (file && file.size > 10*1024*1024) { setError("Choose an image smaller than 10 MB."); e.target.value=""; setAvatar(null); } else {setAvatar(file); setError("");} }} /></div></div>
        </div>
      </details>
      {error && <p className="inline-error" role="alert">{error}</p>}
      <Button className="auth-submit" type="submit" disabled={pending || registered}>{pending ? "Creating your space…" : registered ? "Account created" : "Find my people"}{pending ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowRight size={18} />}</Button>
    </form>
    <div className="auth-switch"><span>Already part of the circle?</span><Link href="/login">Sign in <ArrowUpRight size={16} /></Link></div>
  </AuthLayout>;
}

