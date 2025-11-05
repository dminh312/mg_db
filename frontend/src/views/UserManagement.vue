<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col s12" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div>
          <h3 class="page-title">User Management</h3>
          <p class="muted">Admin Only</p>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col s12">
        <table class="table responsive-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>{{ user.username }}</td>
              <td>
                <span class="badge" :class="user.role === 'admin' ? 'admin' : 'user'">{{ user.role || 'user' }}</span>
              </td>
              <td>
                <button v-if="user.role !== 'admin'" class="btn-secondary" @click="makeAdmin(user._id)">
                  Make Admin
                </button>
                <button class="btn-danger" @click="deleteUser(user._id)" style="margin-left:8px;">
                  <i class="material-icons left">delete</i> Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { apiClient, API_BASE_URL } from '../config/api'

export default {
  name: 'UserManagement',
  data() {
    return {
      users: []
    }
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await apiClient.get('/api/users')
        this.users = response.data.data || []
      } catch (err) {
        console.error('Error loading users:', err)
        alert('Error loading users. Make sure you are an admin.')
      }
    },
    async deleteUser(id) {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await apiClient.delete(`/api/users/${id}`)
          this.fetchUsers()
        } catch (err) {
          alert('Error deleting user: ' + (err.response?.data?.message || err.message))
        }
      }
    },
    async makeAdmin(id) {
      if (confirm('Make this user an admin?')) {
        try {
          await apiClient.put(`/api/users/${id}/role`, {
            role: 'admin'
          })
          this.fetchUsers()
        } catch (err) {
          alert('Error updating user role: ' + (err.response?.data?.message || err.message))
        }
      }
    }
  }
}
</script>
