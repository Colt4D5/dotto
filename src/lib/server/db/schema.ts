import {
	pgTable,
	pgEnum,
	serial,
	integer,
	text,
	timestamp,
	index,
	uuid
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const documentStatus = pgEnum('document_status', [
	'UPLOADING',
	'UPLOADED',
	'PROCESSING',
	'READY',
	'FAILED'
]);

export const messageRole = pgEnum('message_role', ['user', 'assistant', 'system']);

export const projects = pgTable(
	'projects',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		description: text('description'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('projects_user_updated_id_idx').on(table.userId, table.updatedAt.desc(), table.id.desc())
	]
);

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export * from './auth.schema';
