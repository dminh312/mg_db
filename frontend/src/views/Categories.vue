<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col s12" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <h3 class="page-title">Category List</h3>
        <button v-if="isAdmin" class="btn-primary" @click="showAddModal">
          <i class="material-icons left">add</i> Add New Category
        </button>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col s12">
        <table class="table responsive-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th v-if="isAdmin">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category._id">
              <td>{{ category.name }}</td>
              <td>{{ category.description }}</td>
              <td v-if="isAdmin">
                <button class="btn-secondary" @click="editCategory(category)">
                  <i class="material-icons left">edit</i> Edit
                </button>
                <button class="btn-danger" @click="deleteCategory(category._id)" style="margin-left:8px;">
                  <i class="material-icons left">delete</i> Delete
                </button>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td :colspan="isAdmin ? 3 : 2" style="text-align:center;padding:40px;color:#999;">
                <i class="material-icons" style="font-size:48px;display:block;margin-bottom:12px;">inbox</i>
                No categories found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h4 style="margin-bottom:20px;color:#1a1a1a;">{{ isEditMode ? 'Edit Category' : 'Add New Category' }}</h4>
        
        <div v-if="modalError" class="flash flash-error">{{ modalError }}</div>
        <div v-if="modalSuccess" class="flash flash-success">{{ modalSuccess }}</div>

        <form @submit.prevent="saveCategory">
          <div class="form-row">
            <label for="category-name">Category Name *</label>
            <input 
              id="category-name" 
              v-model="categoryForm.name" 
              type="text" 
              required 
              placeholder="e.g., Laptop, Phone, Tablet"
              style="color:#333;font-size:1rem;"
            />
          </div>

          <div class="form-row">
            <label for="category-desc">Description</label>
            <textarea 
              id="category-desc" 
              v-model="categoryForm.description" 
              rows="3"
              placeholder="Optional description"
              style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;color:#333;font-size:1rem;font-family:inherit;"
            ></textarea>
          </div>

          <div class="form-row" style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary">{{ isEditMode ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Categories',
  data() {
    return {
      categories: [],
      isAdmin: false,
      showModal: false,
      isEditMode: false,
      categoryForm: {
        id: null,
        name: '',
        description: ''
      },
      modalError: '',
      modalSuccess: ''
    }
  },
  mounted() {
    this.checkUserRole()
    this.fetchCategories()
  },
  methods: {
    checkUserRole() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      this.isAdmin = user.role === 'admin'
    },
    async fetchCategories() {
      try {
        const response = await axios.get('http://localhost:4000/api/categories', {
          withCredentials: true
        })
        console.log('✅ Categories API response:', response.data)
        this.categories = response.data.data || []
        console.log('✅ Categories loaded:', this.categories)
        console.log('✅ Number of categories:', this.categories.length)
      } catch (err) {
        console.error('❌ Error loading categories:', err)
        console.error('❌ Error response:', err.response?.data)
      }
    },
    async deleteCategory(id) {
      if (confirm('Are you sure you want to delete this category?')) {
        try {
          await axios.delete(`http://localhost:4000/api/categories/${id}`, {
            withCredentials: true
          })
          this.fetchCategories()
        } catch (err) {
          alert('Error deleting category: ' + (err.response?.data?.message || err.message))
        }
      }
    },
    showAddModal() {
      this.isEditMode = false
      this.categoryForm = { id: null, name: '', description: '' }
      this.modalError = ''
      this.modalSuccess = ''
      this.showModal = true
    },
    editCategory(category) {
      this.isEditMode = true
      this.categoryForm = {
        id: category._id,
        name: category.name,
        description: category.description || ''
      }
      this.modalError = ''
      this.modalSuccess = ''
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.categoryForm = { id: null, name: '', description: '' }
      this.modalError = ''
      this.modalSuccess = ''
    },
    async saveCategory() {
      this.modalError = ''
      this.modalSuccess = ''

      if (!this.categoryForm.name.trim()) {
        this.modalError = 'Category name is required'
        return
      }

      try {
        const payload = {
          name: this.categoryForm.name.trim(),
          description: this.categoryForm.description.trim()
        }

        if (this.isEditMode) {
          // Update existing category
          await axios.put(
            `http://localhost:4000/api/categories/${this.categoryForm.id}`,
            payload,
            { withCredentials: true }
          )
          this.modalSuccess = 'Category updated successfully!'
        } else {
          // Create new category
          await axios.post(
            'http://localhost:4000/api/categories',
            payload,
            { withCredentials: true }
          )
          this.modalSuccess = 'Category created successfully!'
        }

        // Refresh the list
        await this.fetchCategories()

        // Close modal after a short delay
        setTimeout(() => {
          this.closeModal()
        }, 1000)
      } catch (err) {
        console.error('❌ Error saving category:', err)
        this.modalError = err.response?.data?.message || 'Failed to save category'
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  padding-top: 80px;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  overflow-y: auto;
}
</style>
