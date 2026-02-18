<script lang="ts">
  let visible = $state(false);

  function toggleMenu() {
    visible = !visible;
  }

  function closeMenu() {
    visible = false;
  }
</script>

<nav class="user__menu" class:open={visible}>
  <button class="user__button" onclick={toggleMenu} aria-label="user management" title="User Management">
    <img src="/noun-hiker.svg" alt="user icon" />
  </button>
  <div class="user__menu-dropdown" class:open={visible}>
    <button onclick={closeMenu}>Login</button>
    <button onclick={closeMenu}>Profile</button>
    <button onclick={closeMenu}>Orders</button>
  </div>
</nav>

<style>
  .user__menu {
    position: relative;
  }

  .user__button {
    background: none;
    border: none;
    cursor: pointer;
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

  .user__menu-dropdown button:last-child {
    border-bottom: none;
  }

  .user__menu-dropdown button:hover {
    background-color: #f5f5f5;
  }
</style>
