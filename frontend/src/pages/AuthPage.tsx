import { Link, useLocation, useNavigate } from "react-router";
import { useAppDispatch } from "../app/hooks";
import { useEffect, useState } from "react";
import { authApi } from "../api/auth";
import { setCredentials } from "../features/auth/authSlice";
import { AnimatePresence, motion } from "framer-motion";
import FloatingInput from "../components/FloatingInput";

type Tab = "login" | "register";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const tabVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
};

const TABS: { id: Tab; label: string }[] = [
  { id: "login", label: "Sign in" },
  { id: "register", label: "Register" },
];

const AuthPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState<Tab>(
    location.pathname === "/register" ? "register" : "login"
  );
  const [fields, setFields] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      document.title = 'Sign in — Z-Tales'
      return () => { document.title = 'Z-Tales' }
  }, [])

  const setField = (key: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const switchTab = (next: Tab) => {
    setTab(next)
    setError(null)
    setFields({ username: '', email: '', password: '' })
    document.title = `${next === 'login' ? 'Sign in' : 'Register'} — Z-Tales`
}

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { username, email, password } = fields;
      const result =
        tab === "login"
          ? await authApi.login({ email, password })
          : await authApi.register({ username, email, password });

      dispatch(setCredentials(result));
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  const isLogin = tab === "login";

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="text-center mb-8"
      >
        <Link to="/" className="brand-name inline-block mb-1">
          Z-Tales
        </Link>
        <p className="meta-text uppercase tracking-widest">
          The Quiet Room
        </p>
      </motion.div>

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white border border-border px-6 sm:px-10 py-10 sm:py-12"
      >
        <div className="flex border-b border-border mb-8">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className={`flex-1 pb-3 font-sans text-sm font-medium transition-colors duration-200 cursor-pointer ${
                tab === id
                  ? "text-accent border-b-2 border-accent -mb-px"
                  : "text-muted hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div role="alert" aria-live="polite" className="error-banner mb-5">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={tab}
            onSubmit={handleSubmit}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-4"
          >
            {!isLogin && (
              <FloatingInput
                id="username"
                label="Username"
                type="text"
                value={fields.username}
                onChange={setField("username")}
                required
                autoComplete="username"
              />
            )}

            <FloatingInput
              id="email"
              label="Email Address"
              type="email"
              value={fields.email}
              onChange={setField("email")}
              required
              autoComplete="email"
            />

            <FloatingInput
              id="password"
              label="Password"
              type="password"
              value={fields.password}
              onChange={setField("password")}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />

            <button
              className="btn-primary w-full mt-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : "Enter the room"}
            </button>
          </motion.form>
        </AnimatePresence>

        <p className="mt-10 text-center meta-text fine-text uppercase tracking-widest">
          One sanctuary for the read and written word
        </p>
      </motion.div>

      <p className="meta-text fine-text mt-6">
        &copy; {new Date().getFullYear()} Z-Tales
      </p>
    </div>
  );
};

export default AuthPage;