"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      router.push("/tasks");
    } catch (err: any) {
      let errorMessage = "Login failed. Please try again.";
      
      // Check for specific API Error structure
      if (err?.status === 401 || err?.code === 'UNAUTHORIZED') {
        errorMessage = "Invalid email or password.";
      } else if (err instanceof Error) {
        // Use the message from the backend if available
        errorMessage = err.message;
      } else if (err?.detail) {
        errorMessage = err.detail;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-xl shadow-indigo-500/20 text-white text-3xl font-bold">
          T
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
        <p className="text-slate-300 mt-2 font-medium">Sign in to your account to continue</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-200 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-100 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all placeholder-slate-500 font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-slate-100">Password</label>
              <a href="#" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Forgot?</a>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all placeholder-slate-500 font-medium"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-4 text-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-200 font-medium text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors underline decoration-2 underline-offset-4">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
