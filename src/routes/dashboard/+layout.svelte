<script lang="ts">
  const { children } = $props();
</script>



<div id="dashboard-container">
	<div id="dashboard-left">
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
      <li><a href="/dashboard/projects">Projects</a></li>
			<ul>
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
		/* min-height: 100dvh; */
	}

	#dashboard-left {
		width: 200px;
		background-color: #f0f0f0;
		padding: 10px;
	}

	#dashboard-right {
		flex: 1;
		padding: 10px;
	}
</style>