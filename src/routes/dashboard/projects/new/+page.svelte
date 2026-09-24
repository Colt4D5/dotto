<script lang="ts">
  const { form } = $props();
  let formEl: HTMLFormElement;
</script>

<h1>New Project</h1>

<form method="POST" bind:this={formEl}>
  <div class="formfield">
    <label for="name">Project Name:</label>
    <input type="text" id="name" name="name" required>
  </div>
  <div class="formfield">
    <label for="description">Project Description:</label>
    <textarea id="description" name="description" required></textarea>
  </div>
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  <button type="submit">Create Project</button>
</form>

<style>
  label {
    display: block;
  }

  .formfield {
    margin-bottom: 1rem;
  }
</style>