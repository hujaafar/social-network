"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: "current-password" | "new-password";
  value?: string;
  setValue: Dispatch<SetStateAction<string>>;
}

export function PasswordInput({
  id,
  label,
  placeholder = "Enter your password",
  required = false,
  autoComplete = "current-password",
  value,
  setValue,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative group">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="password-field-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-950"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
