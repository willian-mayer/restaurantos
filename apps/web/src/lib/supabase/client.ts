
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Faltan las variables de entorno de Supabase en Next.js."
    );
  }

  try {
    const url = new URL(supabaseUrl);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Protocolo inválido");
    }
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL no contiene una URL válida."
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}
