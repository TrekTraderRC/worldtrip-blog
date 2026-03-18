import type { MiddlewareHandler } from 'astro';
import { getSupabaseServerClient } from './lib/supabase/server';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const supabase = getSupabaseServerClient(context);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.user = user
    ? {
        id: user.id,
        email: user.email,
      }
    : null;

  context.locals.membership = null;
  context.locals.hasPaidAccess = false;

  if (user) {
    const { data: memberships, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && memberships && memberships.length > 0) {
      const now = new Date();

      const activeMembership =
        memberships.find((m) => m.is_lifetime === true) ||
        memberships.find(
          (m) =>
            m.status === 'active' &&
            m.end_at &&
            new Date(m.end_at) > now
        ) ||
        null;

      context.locals.membership = activeMembership ?? null;
      context.locals.hasPaidAccess = Boolean(activeMembership);
    }
  }

  return next();
};