import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	DEFAULT_PROJECT_PAGE_SIZE,
	getProjectsForUser,
	MAX_PROJECT_PAGE_SIZE
} from '#lib/server/projects';

function parsePaginationValue(
	value: string | null,
	name: 'limit' | 'offset',
	defaultValue: number,
	maxValue?: number
) {
	if (value === null) {
		return defaultValue;
	}

	if (!/^\d+$/.test(value)) {
		throw error(400, `${name} must be a non-negative integer`);
	}

	const parsedValue = Number(value);

	if (!Number.isSafeInteger(parsedValue) || (maxValue !== undefined && parsedValue > maxValue)) {
		throw error(
			400,
			`${name} must be ${maxValue === undefined ? 'a safe integer' : `at most ${maxValue}`}`
		);
	}

	if (name === 'limit' && parsedValue === 0) {
		throw error(400, 'limit must be at least 1');
	}

	return parsedValue;
}

export const GET: RequestHandler = async ({ locals, url }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const limit = parsePaginationValue(
		url.searchParams.get('limit'),
		'limit',
		DEFAULT_PROJECT_PAGE_SIZE,
		MAX_PROJECT_PAGE_SIZE
	);
	const offset = parsePaginationValue(url.searchParams.get('offset'), 'offset', 0);

	const projects = await getProjectsForUser(userId, { limit, offset });

	return new Response(JSON.stringify({ projects }));
};
