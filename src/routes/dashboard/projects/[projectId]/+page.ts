import { API_VERSION } from '$app/env/public';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch, params: { projectId } }) => {
	const [projectResponse, documentsResponse] = await Promise.all([
		fetch(`/api/${API_VERSION}/projects/${projectId}`),
		fetch(`/api/${API_VERSION}/projects/${projectId}/documents`)
	]);

	if (!projectResponse.ok) {
		throw error(projectResponse.status, 'Unable to load project');
	}

	if (!documentsResponse.ok) {
		throw error(documentsResponse.status, 'Unable to load project documents');
	}

	const [{ project }, { documents }] = await Promise.all([
		projectResponse.json(),
		documentsResponse.json()
	]);

	return {
		project,
		documents
	};
};
