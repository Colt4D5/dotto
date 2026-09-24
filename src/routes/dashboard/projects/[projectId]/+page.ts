import { API_VERSION } from '$app/env/public';

export const load = async ({ fetch, params: { projectId } }) => {
  const response = await fetch(`/api/${API_VERSION}/projects/${projectId}`);
  const projects = await response.json();

	return {
		projects: projects
	};
};