import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useApp } from "../lib/store";

interface AuthProps {
  mode: "login" | "signup";
}

const FAKE_DOMAINS = [
  "test.com", "example.com", "dummy.com", "fake.com", "asdf.com",
  "123.com", "sample.com", "tempmail.com", "mailinator.com", "yopmail.com",
  "test.in", "example.org", "example.net", "test.org", "dummy.org"
];

function isRealEmail(email: string): boolean {
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) return false;
  const domain = clean.split("@")[1];
  if (!domain || FAKE_DOMAINS.includes(domain)) return false;
  if (clean.startsWith("test@") || clean.startsWith("dummy@") || clean.startsWith("fake@")) return false;
  return true;
}

export default function Auth({ mode }: AuthProps) {
  const { login, signup } = useApp();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (!isRealEmail(email)) {
      setError("Please enter a real, authentic email address (e.g. yourname@gmail.com, outlook.com, or your corporate domain). Dummy and test email domains are not permitted.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long for account security.");
      return;
    }

    if (mode === "signup") {
      const cleanFirst = firstName.trim();
      const cleanLast = lastName.trim();

      if (cleanFirst.length < 2 || cleanLast.length < 2) {
        setError("Please enter your real first and last name (at least 2 letters each).");
        return;
      }

      const dummyNamePattern = /^(test|dummy|asdf|fake|sample|none|user|admin)$/i;
      if (dummyNamePattern.test(cleanFirst) || dummyNamePattern.test(cleanLast)) {
        setError("Dummy names (test, dummy, asdf) are not permitted. Please use your real name.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/dashboard");
      } else {
        await signup(email, password, firstName.trim(), lastName.trim());
        navigate("/onboarding");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid credentials. Please verify your email & password or create an account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-secondary border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[44%] bg-[#0f0f12] p-10 relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-[15px]">ProposalAI</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-3xl font-display text-white leading-tight mb-6">
            "The best part is that my proposals now look as good as my actual work."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">KR</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Kavya R.</p>
              <p className="text-xs text-[#a0a0b0]">UI/UX Designer, Bengaluru</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[["2,400+", "Proposals created"], ["4.2 min", "Avg. time to generate"], ["68%", "Average win rate"]].map(([val, label]) => (
            <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xl font-bold text-white">{val}</p>
              <p className="text-xs text-[#a0a0b0] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Decorative */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground text-[15px]">ProposalAI</span>
            </Link>
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-1.5">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-7">
            {mode === "login"
              ? "Sign in to continue to ProposalAI."
              : "Start creating professional proposals in minutes."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. John" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Last name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Doe" className={inputClass} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                {mode === "login" && (
                  <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className={`${inputClass} pr-10`}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg px-3.5 py-2.5 text-sm text-danger">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? (
              <>Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up free</Link></>
            ) : (
              <>Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
