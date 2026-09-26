import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import {
	createUploadVersion,
	failUploadVersion,
	MAX_DOCUMENT_SIZE,
	SUPPORTED_DOCUMENT_TYPES
} from '#lib/server/documents';
import { s3, bucket } from '#lib/server/s3';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const POST: RequestHandler = async ({ locals, request }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const body: unknown = await request.json().catch(() => null);

	if (!body || typeof body !== 'object') {
		throw error(400, 'Invalid upload request');
	}

	const { projectId, documentId, filename, contentType, fileSize } = body as Record<
		string,
		unknown
	>;

	if (typeof projectId !== 'string' || !UUID_PATTERN.test(projectId)) {
		throw error(400, 'Invalid project ID');
	}

	if (
		documentId !== undefined &&
		documentId !== null &&
		(typeof documentId !== 'number' || !Number.isSafeInteger(documentId) || documentId < 1)
	) {
		throw error(400, 'Invalid document ID');
	}

	if (typeof filename !== 'string' || !filename.trim() || filename.length > 255) {
		throw error(400, 'A valid filename is required');
	}

	if (typeof contentType !== 'string' || !SUPPORTED_DOCUMENT_TYPES.has(contentType)) {
		throw error(415, 'Unsupported file type');
	}

	if (
		typeof fileSize !== 'number' ||
		!Number.isSafeInteger(fileSize) ||
		fileSize < 1 ||
		fileSize > MAX_DOCUMENT_SIZE
	) {
		throw error(413, 'File size must be between 1 byte and 25 MB');
	}

	const storageKey = `uploads/${projectId}/${crypto.randomUUID()}`;
	const upload = await createUploadVersion({
		userId,
		projectId,
		documentId: typeof documentId === 'number' ? documentId : undefined,
		filename: filename.trim(),
		mimeType: contentType,
		fileSize,
		storageKey
	});

	if (!upload) {
		throw error(404, 'Project or document not found');
	}

	const command = new PutObjectCommand({
		Bucket: bucket,
		Key: storageKey,
		ContentType: contentType
	});

	try {
		const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

		return Response.json({ uploadUrl, ...upload });
	} catch {
		await failUploadVersion(upload.documentVersionId, 'Unable to create upload URL');
		throw error(500, 'Unable to create upload URL');
	}
};
