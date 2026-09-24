<script lang="ts">
  const { data } = $props();
  const { projects } = $derived(data.projects);
</script>

<h1>{projects.name}</h1>
<p>{projects.description}</p>