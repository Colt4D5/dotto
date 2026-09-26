<script lang="ts">
	const { data } = $props();
	const { project } = $derived(data);
	let uploadSuccess = $state(false);

    async function handleFileChange(event: SubmitEvent) {
        event.preventDefault();

        const form = event.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const file = formData.get('file');

        if (file instanceof File && file.size > 0) {
            await uploadFile(file);
            form.reset();
            uploadSuccess = true;
        }
	}

	async function uploadFile(file: File) {
    // Get a presigned URL
    const response = await fetch('/api/v1/uploads', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            filename: file.name,
            contentType: file.type
        })
    });

    if (!response.ok) {
        throw new Error('Unable to create an upload URL.');
    }

    const { uploadUrl, key } = await response.json();

    // Upload directly to S3
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

    return key;
}
</script>

<h1>{project.name}</h1>
<p>{project.description}</p>

<form onsubmit={handleFileChange}>
    <input type="file" name="file" />
    <button type="submit">Upload</button>
</form>

{#if uploadSuccess}
    <p role="status">File uploaded successfully.</p>
{/if}
