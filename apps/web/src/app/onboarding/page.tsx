
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [restaurantName, setRestaurantName] = useState("");
  const [branchName, setBranchName] = useState("Main Branch");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/restaurants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            restaurant_name: restaurantName.trim(),
            branch_name: branchName.trim(),
            currency_code: currencyCode,
            timezone,
          }),
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.detail || "Unable to create restaurant"
        );
      }

      const result = await response.json();

      if (!result.restaurant_id) {
        throw new Error("Invalid server response");
      }

      window.location.assign("/auth/continue");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          Restaurant Setup
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Set up your restaurant
        </h1>

        <p className="mt-3 text-slate-600">
          Create your restaurant workspace and get started.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="restaurantName"
              className="mb-2 block text-sm font-medium"
            >
              Restaurant Name
            </label>

            <input
              id="restaurantName"
              required
              minLength={2}
              maxLength={100}
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="e.g. Velora"
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="branchName"
              className="mb-2 block text-sm font-medium"
            >
              First Branch Name
            </label>

            <input
              id="branchName"
              required
              minLength={2}
              maxLength={100}
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="currencyCode"
              className="mb-2 block text-sm font-medium"
            >
              Currency
            </label>

            <select
              id="currencyCode"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              <option value="USD">USD — US Dollar</option>
              <option value="BRL">BRL — Brazilian Real</option>
              <option value="EUR">EUR — Euro</option>
              <option value="MXN">MXN — Mexican Peso</option>
              <option value="COP">COP — Colombian Peso</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="mb-2 block text-sm font-medium"
            >
              Time Zone
            </label>

            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              <option value="UTC">UTC</option>
              <option value="America/Sao_Paulo">
                São Paulo
              </option>
              <option value="America/Mexico_City">
                Mexico City
              </option>
              <option value="America/Bogota">
                Bogotá
              </option>
              <option value="America/New_York">
                New York
              </option>
              <option value="Europe/Madrid">
                Madrid
              </option>
            </select>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading
              ? "Creating restaurant..."
              : "Create Restaurant"}
          </button>
        </form>
      </section>
    </main>
  );
}
