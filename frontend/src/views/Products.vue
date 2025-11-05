<template>
    <div class="products-page">
        <div class="page-header">
            <h1 class="page-title-modern">
                <i class="material-icons">inventory_2</i>
                Products
            </h1>
            <router-link v-if="isAdmin" class="btn-add-modern" to="/products/add">
                <i class="material-icons">add_circle</i>
                <span>Add New Product</span>
            </router-link>
        </div>

        <div class="products-grid">
            <div
                v-for="product in products"
                :key="product._id"
                class="product-card"
            >
                <div class="product-image">
                    <img v-if="product.image" :src="getImageUrl(product.image)" alt="Product image" />
                    <div v-else class="no-image">
                        <i class="material-icons">image_not_supported</i>
                        <span>No Image</span>
                    </div>
                    <div class="product-overlay">
                        <h3 class="product-name">{{ product.name }}</h3>
                    </div>
                </div>
                <div class="product-details">
                    <div class="product-price">${{ product.price }}</div>
                    <div class="product-category">
                        <i class="material-icons">category</i>
                        <span class="category-badge">{{ product.category?.name || 'Uncategorized' }}</span>
                    </div>
                </div>
                <div class="product-actions" v-if="isAdmin">
                    <button class="btn-edit" @click.prevent="editProduct(product)">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="btn-delete" @click.prevent="deleteProduct(product._id)">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { apiClient, API_BASE_URL } from '../config/api'

export default {
    name: 'Products',
    data() {
        return {
            products: [],
            categories: [],
            isAdmin: false
        }
    },
    mounted() {
        this.checkUserRole()
        this.fetchProducts()
        this.fetchCategories()
    },
    methods: {
        checkUserRole() {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            this.isAdmin = user.role === 'admin'
        },
        async fetchProducts() {
            try {
                const response = await apiClient.get('/api/products')
                this.products = response.data.data || []
            } catch (err) {
                console.error('Error loading products:', err)
            }
        },
        async fetchCategories() {
            try {
                const response = await apiClient.get('/api/categories')
                this.categories = response.data.data || []
            } catch (err) {
                console.error('Error loading categories:', err)
            }
        },
        async deleteProduct(id) {
            if (confirm('Are you sure you want to delete this product?')) {
                try {
                    await apiClient.delete(`/api/products/${id}`)
                    this.fetchProducts()
                } catch (err) {
                    alert('Error deleting product: ' + (err.response?.data?.message || err.message))
                }
            }
        },
        getImageUrl(imagePath) {
            if (!imagePath) return ''
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                return imagePath
            }
            return API_BASE_URL + imagePath
        },
        showAddModal() {},
        editProduct(product) {
            this.$router.push(`/products/edit/${product._id}`)
        }
    }
}
</script>

<style scoped>
.products-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title-modern {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.page-title-modern .material-icons {
  font-size: 3rem;
  color: #667eea;
}

.btn-add-modern {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.btn-add-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-add-modern .material-icons {
  font-size: 1.4rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.product-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
  background: #f5f7f9;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  gap: 0.5rem;
}

.no-image .material-icons {
  font-size: 4rem;
  opacity: 0.5;
}

.product-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 1.5rem 1rem 1rem;
}

.product-name {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.product-details {
  padding: 1.25rem;
}

.product-price {
  font-size: 1.75rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.75rem;
}

.product-category {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.95rem;
}

.product-category .material-icons {
  font-size: 1.1rem;
}

.category-badge {
  background: #e8eaf6;
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.25rem 1.25rem;
}

.btn-edit,
.btn-delete {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.65rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #f0f0f0;
  color: #455a64;
}

.btn-edit:hover {
  background: #455a64;
  color: #fff;
}

.btn-delete {
  background: #ffebee;
  color: #c62828;
}

.btn-delete:hover {
  background: #c62828;
  color: #fff;
}

.btn-edit .material-icons,
.btn-delete .material-icons {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .page-title-modern {
    font-size: 2rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}
</style>
