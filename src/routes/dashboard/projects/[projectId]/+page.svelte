<script lang="ts">
	const { data } = $props();
	const { project } = $derived(data);
</script>

<h1>{project.name}</h1>
<p>{project.description}</p>
