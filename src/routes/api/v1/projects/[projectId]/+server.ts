import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProjectForUser } from '#lib/server/projects';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const GET: RequestHandler = async ({ locals, params: { projectId } }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	if (!UUID_PATTERN.test(projectId)) {
		throw error(400, 'Invalid project ID');
	}

	const project = await getProjectForUser(userId, projectId);

	if (!project) {
		throw error(404, 'Project not found');
	}

	return new Response(JSON.stringify({ project }));
};
