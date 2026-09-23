import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProjectsForUser } from '#lib/server/projects';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.user?.id;

  if (!userId) {
    throw error(401, 'Unauthorized');
  }

  const projects = await getProjectsForUser(userId);

  return new Response(JSON.stringify({ projects }));
};

