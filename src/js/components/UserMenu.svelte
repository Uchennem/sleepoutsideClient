<script lang="ts">
  import { logout, userStore } from "../auth.svelte";

  let visible = $state(false);

  function toggleMenu() {
    visible = !visible;
  }

  function closeMenu() {
    visible = false;
  }

  function logoutHandler() {
    logout();
    closeMenu();
  }
</script>

<nav class="user__menu" class:open={visible}>
  <button class="user__button" onclick={toggleMenu} aria-label="user management" title="User Management">
    <img src="/noun-hiker.svg" alt="user icon" />
    {#if userStore.isLoggedIn && userStore.user?.name}
      <span class="user__name">{userStore.user.name}</span>
    {/if}
  </button>
  <div class="user__menu-dropdown" class:open={visible}>
    {#if userStore.isLoggedIn}
      <a href="/profile" onclick={closeMenu}>Profile</a>
      <a href="/orders" onclick={closeMenu}>Orders</a>
      <button class="link-style-button" onclick={logoutHandler}>Logout</button>
    {:else}
      <a href="/login" onclick={closeMenu}>Login</a>
    {/if}
  </div>
</nav>

<style>
  .user__menu {
    align-items: center;
    background: transparent;
    box-shadow: none;
    display: block;
    flex-direction: row;
    height: auto;
    overflow: visible;
    padding: 0;
    position: relative;
    right: auto;
    top: auto;
  }

  .user__button {
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    gap: 0.4rem;
    padding: 0;
  }

  .user__button img {
    width: 24px;
    height: 24px;
  }

  .user__menu-dropdown {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    min-width: 150px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .user__menu-dropdown.open {
    display: flex;
    flex-direction: column;
  }

  .user__menu-dropdown button {
    display: block;
    width: 100%;
    padding: 10px 15px;
    text-decoration: none;
    color: #333;
    border: none;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    background: none;
    text-align: left;
    font: inherit;
  }

  .user__menu-dropdown a {
    display: block;
    width: 100%;
    padding: 10px 15px;
    text-decoration: none;
    color: #333;
    border: none;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    background: none;
    text-align: left;
    font: inherit;
  }

  .user__menu-dropdown button:last-child,
  .user__menu-dropdown a:last-child {
    border-bottom: none;
  }

  .user__menu-dropdown button:hover,
  .user__menu-dropdown a:hover {
    background-color: #f5f5f5;
  }

  .user__name {
    color: #333;
    font-size: 0.9rem;
  }
</style>
