<template>
  <div class="container mt-5" style="max-width:720px;">
    <div class="auth-card">
      <h2 class="page-title mb-4">Add New Product</h2>

      <div v-if="success" class="flash flash-success" role="status">{{ success }}</div>
      <div v-if="error && !hasErrorsList" class="flash flash-error" role="alert">{{ error }}</div>
      <ul v-if="hasErrorsList" class="flash-list flash-error" role="alert">
        <li v-for="(e, i) in errorsList" :key="i">{{ e.msg || e }}</li>
      </ul>

      <form @submit.prevent="handleSubmit" novalidate>
        <div class="form-row">
          <label for="name">Product name</label>
          <input id="name" v-model.trim="name" type="text" required :aria-describedby="nameError ? 'name-error' : null" />
          <div v-if="nameError" id="name-error" class="field-error">{{ nameError }}</div>
        </div>

        <div class="form-row">
          <label for="price">Price</label>
          <input id="price" v-model.number="price" type="number" min="0" step="0.01" required :aria-describedby="priceError ? 'price-error' : null" />
          <div v-if="priceError" id="price-error" class="field-error">{{ priceError }}</div>
        </div>

        <div class="form-row">
          <label for="category">Category <span style="color:#c62828">*</span></label>
          <select 
            id="category" 
            v-model="category" 
            required 
            style="
              display: block !important;
              width: 100% !important;
              padding: 12px !important;
              border: 2px solid #ddd !important;
              border-radius: 6px !important;
              font-size: 1rem !important;
              background: #fff !important;
              cursor: pointer !important;
              min-height: 45px !important;
              line-height: 1.5 !important;
              color: #333 !important;
            "
          >
            <option value="">-- Select a category --</option>
            <option v-for="cat in categories" :key="cat._id" :value="cat._id">
              {{ cat.name }}
            </option>
          </select>
          <div v-if="categoryError" id="category-error" class="field-error">{{ categoryError }}</div>
          <p v-if="categories.length === 0" class="muted" style="margin-top:8px;">
            ⚠️ No categories available. 
            <router-link to="/categories" v-if="isAdmin">Go to Categories page to add one</router-link>
            <span v-else>Please ask an admin to add categories first.</span>
          </p>
          <p v-else class="muted" style="margin-top:4px;">✓ {{ categories.length }} {{ categories.length === 1 ? 'category' : 'categories' }} available</p>
        </div>

        <div class="form-row">
          <label for="image">Image URL (optional)</label>
          <input id="image" v-model.trim="image" type="text" placeholder="/images/your-file.webp or https://..." />
          <p class="muted">Tip: You can paste a full URL or a relative path like /images/your-file.webp.</p>
        </div>

        <div class="form-row">
          <button type="submit" class="btn-primary" :disabled="isLoading">Create Product</button>
          <router-link class="btn-secondary" style="margin-left:8px;padding:0.55rem 1rem;border-radius:6px;" to="/products">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { apiClient, API_BASE_URL } from '../config/api'

export default {
  name: 'AddProduct',
  data() {
    return {
      name: '',
      price: '',
      category: '',
      image: '',
      categories: [],
      isLoading: false,
      submitted: false,
      success: '',
      error: '',
      errors: null,
      isAdmin: false
    }
  },
  computed: {
    hasErrorsList() { return Array.isArray(this.errors) && this.errors.length > 0 },
    errorsList() { return Array.isArray(this.errors) ? this.errors : [] },
    nameError() { return this.submitted && !this.name.trim() ? 'Name is required' : '' },
    priceError() { return this.submitted && (this.price === '' || this.price === null || isNaN(this.price)) ? 'Valid price is required' : '' },
    categoryError() { return this.submitted && !this.category ? 'Category is required' : '' }
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
        const res = await apiClient.get('/api/categories')
        this.categories = res.data?.data || []
        console.log('✅ Categories loaded:', this.categories)
        console.log('✅ Number of categories:', this.categories.length)
        console.log('✅ First category:', this.categories[0])
        if (this.categories.length === 0) {
          console.warn('⚠️ No categories found in database')
        }
      } catch (err) {
        console.error('❌ Failed to load categories:', err)
        console.error('❌ Error response:', err.response?.data)
        this.error = 'Failed to load categories. Please refresh the page.'
      }
    },
    async handleSubmit() {
      this.submitted = true
      this.success = ''
      this.error = ''
      this.errors = null
      if (this.nameError || this.priceError || this.categoryError) return
      try {
        this.isLoading = true
        const payload = { name: this.name.trim(), price: this.price, category: this.category }
        if (this.image) payload.image = this.image.trim()
        const res = await apiClient.post('/api/products', payload)
        if (res.data?.success) {
          this.success = 'Product created'
          this.$router.push('/products')
        } else {
          this.error = res.data?.message || 'Failed to create product.'
        }
      } catch (err) {
        const data = err.response?.data
        if (Array.isArray(data?.errors)) this.errors = data.errors
        else if (data?.errors && typeof data.errors === 'object') this.errors = data.errors
        else if (data?.message) this.error = data.message
        else this.error = 'Failed to create product. Please try again.'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
/* Use browser's native select dropdown */
.browser-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.browser-select:hover {
  border-color: #0366d6;
}

.browser-select:focus {
  outline: none;
  border-color: #0366d6;
  box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.15);
}

.browser-select option {
  padding: 10px;
  font-size: 1rem;
}
</style>
