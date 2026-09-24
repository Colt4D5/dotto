import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProjectsForUser } from '#lib/server/projects';

export const GET: RequestHandler = async ({ locals, url }) => {
  const userId = locals.user?.id;

  if (!userId) {
    throw error(401, 'Unauthorized');
  }

  const projects = await getProjectsForUser(
    userId,
    Number(url.searchParams.get('limit')) || undefined,
    url.searchParams.get('order') === 'asc' ? 'asc' : 'desc'
  );

  return new Response(JSON.stringify({ projects }));
};
