import { error } from '@sveltejs/kit';
import { getDocumentsForProject } from '#lib/server/documents';
import { getProjectForUser } from '#lib/server/projects';

export const load = async ({ locals, params: { projectId } }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}
	
	const [projectData, docsData] = await Promise.all([
		getProjectForUser(userId, projectId),
		getDocumentsForProject(userId, projectId)
	]);

	return {
		project: projectData,
		documents: docsData
	};
};
