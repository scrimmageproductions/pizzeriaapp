import { useState } from "react";
import { AlertTriangle, ArrowRight, PartyPopper } from "lucide-react";
import { useAuthActions } from "../../context/AuthContext";
import { FormField, TextInput } from "../shared/FormField";
import Button from "../shared/Button";

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3a7.4 7.4 0 0 1-11-3.89H1.08v3.09A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.07 14.2a7.2 7.2 0 0 1 0-4.4V6.71H1.08a12 12 0 0 0 0 10.58z" />
    <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.08 6.71l3.99 3.09A7.16 7.16 0 0 1 12 4.75z" />
  </svg>
);

/**
 * "Value-first, account-second": the wizard already built a live store before this ever appears.
 * Closing without signing up is allowed, but since /admin requires auth, that just routes to
 * /login — there's no dead end, only a fork between "claim it now" and "claim it later".
 */
export default function ClaimStoreModal({ open, onClaimed, onDismiss }) {
  const { signUpWithEmail, signUpWithGoogle } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleGoogle = () => {
    setError("");
    const result = signUpWithGoogle();
    if (result.error) setError(result.error);
    else onClaimed();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    setTimeout(() => {
      const result = signUpWithEmail({ email, password, phone });
      setSaving(false);
      if (result.error) setError(result.error);
      else onClaimed();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onDismiss} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in">
        <div className="bg-gradient-to-br from-[#E31837] to-[#c31530] px-6 pb-6 pt-8 text-center text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
            <PartyPopper size={24} />
          </span>
          <h2 className="mt-3 text-xl font-extrabold leading-snug">Your restaurant is ready! 🎉</h2>
          <p className="mt-1 text-sm text-white/85">Create an account to save your progress.</p>
        </div>

        <div className="p-6">
          <button
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400">OR</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <FormField label="Email">
              <TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourpizzeria.com" />
            </FormField>
            <FormField label="Password">
              <TextInput type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </FormField>
            <FormField label="Phone Number (optional)">
              <TextInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
            </FormField>

            {error && (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-red-500">
                <AlertTriangle size={14} className="shrink-0" /> {error}
              </p>
            )}

            <Button type="submit" size="lg" icon={ArrowRight} className="w-full py-3.5" disabled={saving}>
              {saving ? "Saving…" : "Save My Store"}
            </Button>
          </form>

          <button onClick={onDismiss} className="mt-4 w-full text-center text-xs font-semibold text-gray-400 hover:text-gray-600">
            I'll do this later
          </button>
        </div>
      </div>
    </div>
  );
}
