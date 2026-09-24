import { and, count, desc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index';
import { projects } from '#lib/server/db/schema';

export const DEFAULT_PROJECT_PAGE_SIZE = 20;
export const MAX_PROJECT_PAGE_SIZE = 100;

export type ProjectListOptions = {
	limit?: number;
	offset?: number;
};

export async function getProjectsForUser(
	userId: string,
	{ limit = DEFAULT_PROJECT_PAGE_SIZE, offset = 0 }: ProjectListOptions = {}
) {
	const [userProjects, [{ total }]] = await Promise.all([
		db
			.select()
			.from(projects)
			.where(eq(projects.userId, userId))
			.orderBy(desc(projects.updatedAt), desc(projects.id))
			.limit(limit)
			.offset(offset),
		db.select({ total: count() }).from(projects).where(eq(projects.userId, userId))
	]);

	return {
		projects: userProjects,
		total,
		offset,
		limit,
		remaining: Math.max(total - offset - userProjects.length, 0)
	};
}

export async function getProjectForUser(userId: string, projectId: string) {
	const [project] = await db
		.select()
		.from(projects)
		.where(and(eq(projects.userId, userId), eq(projects.id, projectId)))
		.limit(1);

	return project;
}
