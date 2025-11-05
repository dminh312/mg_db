<script>
export default {
  name: 'App',
  data() {
    return {
      user: null
    }
  },
  mounted() {
    this.loadUser()
    // Listen for storage changes (for logout in other tabs)
    window.addEventListener('storage', this.handleStorageChange)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
  },
  watch: {
    // Watch for route changes and reload user
    '$route'() {
      this.loadUser()
    }
  },
  methods: {
    loadUser() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        this.user = JSON.parse(userStr)
      } else {
        this.user = null
      }
    },
    handleStorageChange(event) {
      if (event.key === 'user') {
        this.loadUser()
      }
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.user = null
      this.$router.push('/login')
    }
  }
}
</script>

<template>
  <div class="app-wrapper">
    <!-- Navigation -->
    <nav v-if="user" class="app-navbar">
      <div class="nav-content">
        <div class="brand-logo">
          <i class="material-icons">shopping_bag</i>
          <span>Dang Cap Market</span>
        </div>
        <ul class="nav-links">
          <li><router-link to="/products"><i class="material-icons">inventory_2</i> Products</router-link></li>
          <li><router-link to="/categories"><i class="material-icons">category</i> Categories</router-link></li>
          <li v-if="user.role === 'admin'"><router-link to="/users"><i class="material-icons">people</i> Users</router-link></li>
        </ul>
        <div class="nav-user">
          <span class="user-info">
            <i class="material-icons">account_circle</i>
            <span class="username">{{ user.username }}</span>
            <span class="badge" :class="user.role === 'admin' ? 'admin' : 'user'">{{ user.role || 'user' }}</span>
          </span>
          <button @click="logout" class="btn-logout">
            <i class="material-icons">logout</i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Page Content with spacing -->
    <div class="page-content" :class="{ 'with-nav': user }">
      <router-view @user-updated="loadUser" />
    </div>
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background: #f5f7f9;
}

.app-navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  gap: 2rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.brand-logo .material-icons {
  font-size: 2rem;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  justify-content: center;
}

.nav-links li a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 1rem;
}

.nav-links li a:hover {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.nav-links li a.router-link-active {
  background: rgba(255,255,255,0.25);
  color: #fff;
  font-weight: 600;
}

.nav-links li a .material-icons {
  font-size: 1.3rem;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: rgba(255,255,255,0.15);
  border-radius: 8px;
}

.username {
  font-weight: 600;
}

.user-info .material-icons {
  font-size: 1.5rem;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-1px);
}

.btn-logout .material-icons {
  font-size: 1.2rem;
}

.page-content {
  min-height: calc(100vh - 70px);
  padding: 2rem;
}

.page-content.with-nav {
  padding-top: 2.5rem;
}

.badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.admin {
  background: #fff;
  color: #667eea;
}

.badge.user {
  background: rgba(255,255,255,0.3);
  color: #fff;
}

@media (max-width: 768px) {
  .nav-content { flex-wrap: wrap; height: auto; padding: 12px 16px; }
  .brand-logo { font-size: 1.2rem; }
  .nav-links { order: 3; width: 100%; gap: 4px; justify-content: flex-start; }
  .nav-links li a { padding: 0.5rem 1rem; font-size: 0.9rem; }
  .username { display: none; }
  .page-content { padding: 16px 12px; }
}
</style>
