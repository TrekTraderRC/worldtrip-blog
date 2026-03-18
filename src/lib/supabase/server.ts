import { createServerClient } from '@supabase/ssr';
import type { APIContext } from 'astro';

export function getSupabaseServerClient(context: APIContext) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          const cookieHeader = context.request.headers.get('cookie') ?? '';
          if (!cookieHeader) return [];

          return cookieHeader
            .split(';')
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => {
              const index = part.indexOf('=');
              const name = index >= 0 ? part.slice(0, index) : part;
              const value = index >= 0 ? part.slice(index + 1) : '';
              return { name, value };
            });
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            context.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}