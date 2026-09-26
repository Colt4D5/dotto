import {
	pgTable,
	pgEnum,
	serial,
	integer,
	text,
	timestamp,
	index,
	unique,
	uuid,
	customType
} from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const documentStatus = pgEnum('document_status', [
	'UPLOADING',
	'UPLOADED',
	'PROCESSING',
	'READY',
	'FAILED'
]);

export const messageRole = pgEnum('message_role', ['user', 'assistant', 'system']);

export const storageCleanupStatus = pgEnum('storage_cleanup_status', [
	'PENDING',
	'PROCESSING',
	'COMPLETED',
	'FAILED'
]);

const vector = customType<{ data: number[]; driverData: string }>({
	dataType: () => 'vector(1536)',
	toDriver: (value) => `[${value.join(',')}]`,
	fromDriver: (value) => value.slice(1, -1).split(',').filter(Boolean).map(Number)
});

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

export const documents = pgTable(
	'documents',
	{
		id: serial('id').primaryKey(),
		projectId: uuid('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		documentType: text('document_type').notNull(),
		currentVersionId: integer('current_version_id').references(
			(): AnyPgColumn => documentVersions.id,
			{ onDelete: 'set null' }
		),
		status: documentStatus('status').notNull().default('UPLOADING'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('documents_project_id_idx').on(table.projectId)]
);

export const documentVersions = pgTable(
	'document_versions',
	{
		id: serial('id').primaryKey(),
		documentId: integer('document_id')
			.notNull()
			.references(() => documents.id, { onDelete: 'cascade' }),
		versionNumber: integer('version_number').notNull().default(1),
		label: text('label'),
		storageKey: text('storage_key').notNull(),
		mimeType: text('mime_type').notNull(),
		fileSize: integer('file_size').notNull(),
		checksum: text('checksum'),
		status: documentStatus('status').notNull().default('UPLOADING'),
		failureReason: text('failure_reason'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('document_versions_document_id_idx').on(table.documentId),
		unique('document_versions_document_id_version_number_unique').on(
			table.documentId,
			table.versionNumber
		)
	]
);

export const documentContents = pgTable(
	'document_contents',
	{
		id: serial('id').primaryKey(),
		documentVersionId: integer('document_version_id')
			.notNull()
			.references(() => documentVersions.id, { onDelete: 'cascade' }),
		rawText: text('raw_text').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [unique('document_contents_document_version_id_unique').on(table.documentVersionId)]
);

export const documentChunks = pgTable(
	'document_chunks',
	{
		id: serial('id').primaryKey(),
		documentVersionId: integer('document_version_id')
			.notNull()
			.references(() => documentVersions.id, { onDelete: 'cascade' }),
		chunkIndex: integer('chunk_index').notNull(),
		content: text('content').notNull(),
		tokenCount: integer('token_count').notNull(),
		embedding: vector('embedding').notNull()
	},
	(table) => [
		index('document_chunks_document_version_id_idx').on(table.documentVersionId),
		index('document_chunks_embedding_hnsw_idx')
			.using('hnsw', table.embedding.op('vector_cosine_ops'))
			.with({ m: 16, ef_construction: 64 }),
		unique('document_chunks_document_version_id_chunk_index_unique').on(
			table.documentVersionId,
			table.chunkIndex
		)
	]
);

export const storageCleanupJobs = pgTable(
	'storage_cleanup_jobs',
	{
		id: serial('id').primaryKey(),
		storageKey: text('storage_key').notNull(),
		status: storageCleanupStatus('status').notNull().default('PENDING'),
		attempts: integer('attempts').notNull().default(0),
		availableAt: timestamp('available_at', { withTimezone: true }).defaultNow().notNull(),
		completedAt: timestamp('completed_at', { withTimezone: true }),
		lastError: text('last_error'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('storage_cleanup_jobs_available_idx').on(table.status, table.availableAt)]
);

export * from './auth.schema';
