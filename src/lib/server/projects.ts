import { eq, desc, asc } from 'drizzle-orm';
import { db } from '#lib/server/db/index';
import { projects } from '#lib/server/db/schema';

export async function getProjectsForUser(userId: string, limit?: number, order: 'asc' | 'desc' = 'asc') {
	let query = db
		.select()
		.from(projects)
		.where(eq(projects.userId, userId))
		.orderBy(order === 'asc' ? asc(projects.updatedAt) : desc(projects.updatedAt))
		.$dynamic();

	if (limit !== undefined && limit !== null) {
		query = query.limit(limit);
	}

	return await query;
}