<script lang="ts">
	import { API_VERSION } from '$app/env/public';
	import { refreshAll } from '$app/navigation';

	const { data } = $props();
	const { project, documents } = $derived(data);
	let selectedDocumentId = $state('');
	let uploadSuccess = $state(false);
	let uploadError = $state<string | null>(null);
	let isUploading = $state(false);

	async function handleFileChange(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		const file = formData.get('file');

		uploadSuccess = false;
		uploadError = null;

		if (!(file instanceof File) || file.size === 0) {
			uploadError = 'Select a file to upload.';
			return;
		}

		isUploading = true;

		try {
			const documentId = selectedDocumentId ? Number(selectedDocumentId) : undefined;
			await uploadFile(file, documentId);
			form.reset();
			selectedDocumentId = '';
			uploadSuccess = true;
			await refreshAll();
		} catch (error) {
			uploadError = error instanceof Error ? error.message : 'Unable to upload the file.';
		} finally {
			isUploading = false;
		}
	}

	async function uploadFile(file: File, documentId?: number) {
		const response = await fetch(`/api/${API_VERSION}/uploads`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				projectId: project.id,
				documentId,
				filename: file.name,
				contentType: file.type,
				fileSize: file.size
			})
		});

		if (!response.ok) {
			throw new Error(await getErrorMessage(response, 'Unable to create an upload URL.'));
		}

		const { uploadUrl, documentVersionId } = (await response.json()) as {
			uploadUrl: string;
			documentVersionId: number;
		};

		const uploadResponse = await fetch(uploadUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': file.type
			},
			body: file
		});

		if (!uploadResponse.ok) {
			throw new Error('Unable to upload the file.');
		}

		const completionResponse = await fetch(
			`/api/${API_VERSION}/uploads/${documentVersionId}/complete`,
			{ method: 'POST' }
		);

		if (!completionResponse.ok) {
			throw new Error(
				await getErrorMessage(completionResponse, 'Unable to verify the uploaded file.')
			);
		}
	}

	async function getErrorMessage(response: Response, fallback: string) {
		const body: unknown = await response.json().catch(() => null);

		if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
			return body.message;
		}

		return fallback;
	}
</script>

<h1>{project.name}</h1>
<p>{project.description}</p>

<form onsubmit={handleFileChange} aria-busy={isUploading}>
	<label>
		File
		<input
			type="file"
			name="file"
			accept="application/pdf,text/plain,.pdf,.txt"
			disabled={isUploading}
		/>
	</label>

	<label>
		Document
		<select bind:value={selectedDocumentId} disabled={isUploading}>
			<option value="">Create a new document</option>
			{#each documents as document (document.id)}
				<option value={document.id}>
					Add version to {document.name}
				</option>
			{/each}
		</select>
	</label>

	<button type="submit" disabled={isUploading}>
		{isUploading ? 'Uploading...' : 'Upload'}
	</button>
</form>

{#if uploadSuccess}
	<p role="status">File uploaded successfully.</p>
{/if}

{#if uploadError}
	<p role="alert">{uploadError}</p>
{/if}

<section aria-labelledby="documents-heading">
	<h2 id="documents-heading">Documents</h2>

	{#if documents.length === 0}
		<p>No documents uploaded yet.</p>
	{:else}
		<ul>
			{#each documents as document (document.id)}
				<li>
					<strong>{document.name}</strong>
					<p>{document.documentType}</p>
					{#if document.currentVersion}
						<p>
							Version {document.currentVersion.versionNumber} · {document.currentVersion.status}
							· {document.currentVersion.fileSize} bytes
						</p>
					{:else}
						<p>{document.status}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
