<script lang="ts">
  const { data, children } = $props();
  const { projects } = $derived(data.projects);
</script>

<div id="dashboard-container">
	<div id="dashboard-left">
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
      <li><a href="/dashboard/projects">Projects</a></li>
			<ul>
				{#each projects as project (project.id) }
					<li><a href={`/dashboard/projects/${project.id}`}>{project.name}</a></li>
				{/each}
				<li><a href="/dashboard/projects/new">New Project</a></li>
			</ul>
    </ul>
	</div>
	<div id="dashboard-right">
    {@render children()}
	</div>
</div>


<style>
	#dashboard-container {
		display: flex;
	}

	#dashboard-left {
		background-color: #f0f0f0;
		padding: 10px;
	}

	#dashboard-right {
		flex: 1;
		padding: 10px;
	}
</style>