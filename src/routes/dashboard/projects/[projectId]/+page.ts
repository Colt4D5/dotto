import { API_VERSION } from '$app/env/public';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch, params: { projectId } }) => {
	const response = await fetch(`/api/${API_VERSION}/projects/${projectId}`);

	if (!response.ok) {
		throw error(response.status, 'Unable to load project');
	}

	const { project } = await response.json();

	return {
		project
	};
};
