import { redirect } from '@sveltejs/kit';
import { LOGIN_PATH } from '#lib';
import { getProjectsForUser } from '#lib/server/projects';

export const load = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		return redirect(302, LOGIN_PATH);
	}

	const projects = await getProjectsForUser(user.id, { limit: 3, offset: 0 });

	return {
		projects
	};
};