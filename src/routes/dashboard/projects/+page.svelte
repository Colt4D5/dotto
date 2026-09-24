<script lang="ts">
  const { data } = $props();
  const { projects } = $derived(data);
</script>

<h1>Projects</h1>

{#if projects && projects.projects.length > 0}
  <ul>
    {#each projects.projects as project (project.id)}
      <li>
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <a href={`/dashboard/projects/${project.id}`}>View Project</a>
      </li>
    {/each}
  </ul>
{:else}
  <p>No projects found.</p>
{/if}
