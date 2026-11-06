
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Registro recibido. Revisa tu correo para confirmar tu cuenta si se requiere."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Comienza a administrar tu restaurante.
          </p>
        </div>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border p-3 text-slate-900"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full rounded-lg border p-3 text-slate-900"
        />

        <button
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 p-3 text-white disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>

        {message && (
          <p role="status" className="text-sm text-slate-600">
            {message}
          </p>
        )}

        <p className="text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
