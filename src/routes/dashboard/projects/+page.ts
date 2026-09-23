import { API_VERSION } from '$app/env/public';

export const load = async ({ fetch }) => {
  const response = await fetch(`/api/${API_VERSION}/projects`);
  const projects = await response.json();

	return {
		projects: projects
	};
};