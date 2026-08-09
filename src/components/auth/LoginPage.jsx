import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Pizza } from "lucide-react";
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

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // A hard navigation (not react-router's navigate()) is deliberate here: logging in can switch
  // to a *different* account's saved store snapshot, which only exists in localStorage — the
  // live ShopContext state in memory was never told about it. A full reload forces ShopProvider
  // to re-read localStorage from scratch, so the newly logged-in owner's data actually shows up
  // instead of whatever (or nothing) was already in memory.
  const handleGoogle = () => {
    setError("");
    const result = loginWithGoogle();
    if (result.error) setError(result.error);
    else window.location.href = "/admin";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = loginWithEmail({ email, password });
      setLoading(false);
      if (result.error) setError(result.error);
      else window.location.href = "/admin";
    }, 300); // brief mock "authenticating" beat — still feels instant
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E31837] text-white shadow-lg shadow-[#E31837]/25">
            <Pizza size={24} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Log in to your DeepDish dashboard.</p>
        </div>

        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <button
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <GoogleIcon /> Sign in with Google
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

            {error && (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-red-500">
                <AlertTriangle size={14} className="shrink-0" /> {error}
              </p>
            )}

            <Button type="submit" size="lg" icon={ArrowRight} className="w-full py-3.5" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/" className="font-bold text-[#E31837] hover:underline">
            Create your store
          </Link>
        </p>
      </div>
    </div>
  );
}
