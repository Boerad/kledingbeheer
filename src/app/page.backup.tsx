"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Inloggen mislukt: " + error.message);
      setLoading(false);
      return;
    }

    setLoggedIn(true);
    setLoading(false);
  }

  if (loggedIn) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Kledingbeheer
            </h1>
            <p className="mt-2 text-gray-600">
              Dashboard voetbalvereniging
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">Aantal personen</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Uitgegeven kledingstukken
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Ontbrekende kledingstukken
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Teamtassen met tekorten
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">
          Kledingbeheer
        </h1>

        <p className="mt-2 text-gray-600">
          Voetbalvereniging
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mailadres
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
              placeholder="naam@voorbeeld.nl"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Wachtwoord
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
              placeholder="Je wachtwoord"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Bezig met inloggen..." : "Inloggen"}
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-lg bg-gray-100 p-3 text-sm text-gray-800">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}