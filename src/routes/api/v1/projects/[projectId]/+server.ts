import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProjectsForUser } from '#lib/server/projects';

export const GET: RequestHandler = async ({ locals, params: { projectId } }) => {
  const userId = locals.user?.id;

  if (!userId) {
    throw error(401, 'Unauthorized');
  }

  const projects = await getProjectsForUser(userId);
  const project = projects.find((p) => p.id === Number(projectId));

  if (!project) {
    throw error(404, 'Project not found');
  }

  return new Response(JSON.stringify({ projects: project }));
};