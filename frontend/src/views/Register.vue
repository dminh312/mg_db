<template>
    <div class="auth-page">
        <main class="auth-card-modern" role="main" aria-labelledby="register-heading">
            <div class="auth-header">
                <h1 id="register-heading">Sign Up Portal</h1>
                <p class="auth-subtitle">Create your account</p>
            </div>

            <div v-if="success" class="flash flash-success" role="status">{{ success }}</div>
            <div v-if="error && !hasErrorsList" class="flash flash-error" role="alert">{{ error }}</div>

            <ul v-if="hasErrorsList" class="flash-list flash-error" role="alert">
                <li v-for="(e, i) in errorsList" :key="i">{{ e.msg || e }}</li>
            </ul>

            <form @submit.prevent="handleRegister" novalidate>
                <div class="form-row">
                    <label for="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        v-model.trim="username"
                        type="text"
                        autocomplete="username"
                        required
                        placeholder="Choose a username"
                        :aria-describedby="usernameErrorText ? 'username-error' : null"
                    />
                    <div v-if="usernameErrorText" id="username-error" class="field-error">{{ usernameErrorText }}</div>
                </div>

                <div class="form-row">
                    <label for="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        v-model="password"
                        type="password"
                        autocomplete="new-password"
                        required
                        placeholder="Create a password"
                        :aria-describedby="passwordErrorText ? 'password-error' : null"
                    />
                    <div v-if="passwordErrorText" id="password-error" class="field-error">{{ passwordErrorText }}</div>
                </div>

                <div class="form-row">
                    <label for="password2">Confirm password</label>
                    <input
                        id="password2"
                        name="password2"
                        v-model="password2"
                        type="password"
                        autocomplete="new-password"
                        required
                        placeholder="Confirm your password"
                        :aria-describedby="password2ErrorText ? 'password2-error' : null"
                    />
                    <div v-if="password2ErrorText" id="password2-error" class="field-error">{{ password2ErrorText }}</div>
                </div>

                <div class="form-row">
                    <button type="submit" class="btn-auth btn-primary-large" :disabled="isLoading">
                        <span v-if="!isLoading">Create Account</span>
                        <span v-else>Creating account...</span>
                    </button>
                </div>

                <p class="auth-footer-text">
                    Already have an account?
                    <router-link to="/login" class="auth-link">Log in</router-link>
                </p>
            </form>
        </main>

        <!-- Brand text on the right -->
        <div class="brand-section">
            <h1 class="brand-title">Dang Cap Market</h1>
            <p class="brand-subtitle">You can find what you need in here</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'Register',
    data() {
        return {
            username: '',
            password: '',
            password2: '',
            isLoading: false,
            submitted: false,
            success: '',
            error: '',
            errors: null
        }
    },
    computed: {
        hasErrorsList() { return Array.isArray(this.errors) && this.errors.length > 0 },
        errorsList() { return Array.isArray(this.errors) ? this.errors : [] },
        usernameErrorText() {
            if (this.submitted && !this.username.trim()) return 'Username is required'
            if (this.errors && !Array.isArray(this.errors) && this.errors.username) {
                return this.errors.username.msg || this.errors.username
            }
            return ''
        },
        passwordErrorText() {
            if (this.submitted && !this.password) return 'Password is required'
            if (this.errors && !Array.isArray(this.errors) && this.errors.password) {
                return this.errors.password.msg || this.errors.password
            }
            return ''
        },
        password2ErrorText() {
            if (this.submitted && this.password !== this.password2) return 'Passwords do not match'
            return ''
        }
    },
    methods: {
        async handleRegister() {
            this.submitted = true
            this.success = ''
            this.error = ''
            this.errors = null
            if (!this.username.trim() || !this.password || this.password !== this.password2) return

            try {
                this.isLoading = true
                const res = await axios.post('http://localhost:4000/api/register', {
                    username: this.username,
                    password: this.password,
                    password2: this.password2
                }, { withCredentials: true })

                if (res.data?.success) {
                    this.success = 'Account created successfully. You can now log in.'
                    setTimeout(() => this.$router.push('/login'), 700)
                } else {
                    this.error = res.data?.message || 'Registration failed.'
                }
            } catch (err) {
                const data = err.response?.data
                if (Array.isArray(data?.errors)) this.errors = data.errors
                else if (data?.errors && typeof data.errors === 'object') this.errors = data.errors
                else if (data?.message) this.error = data.message
                else this.error = 'Registration failed. Please try again.'
            } finally {
                this.isLoading = false
            }
        }
    }
}
</script>

<style scoped>
.auth-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 5%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: auto;
  gap: 4rem;
}

.auth-card-modern {
  max-width: 440px;
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.brand-section {
  color: #fff;
  text-align: right;
  flex: 1;
  padding-right: 3rem;
}

.brand-title {
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.brand-subtitle {
  font-size: 1.5rem;
  margin: 0;
  opacity: 0.95;
  font-weight: 300;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.form-row {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
  text-align: left;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 2px solid #e1e4e8;
  border-radius: 8px;
  font-size: 1rem;
  color: #1a1a1a;
  transition: all 0.2s ease;
  background: #fafbfc;
  box-sizing: border-box;
  font-family: inherit;
}

input[type="text"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

input[type="text"]::placeholder,
input[type="password"]::placeholder {
  color: #999;
  font-size: 1rem;
}

.btn-auth {
  width: 100%;
  padding: 0.95rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary-large {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-primary-large:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary-large:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer-text {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.95rem;
}

.auth-link {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
}

.field-error {
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.flash {
  padding: 0.875rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.flash-success {
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  color: #2e7d32;
}

.flash-error {
  background: #ffebee;
  border: 1px solid #ef9a9a;
  color: #c62828;
}

.flash-list {
  list-style: none;
  padding: 0.875rem;
  margin: 0 0 1rem 0;
  border-radius: 8px;
}

.flash-list.flash-error {
  background: #ffebee;
  border: 1px solid #ef9a9a;
  color: #c62828;
}

.flash-list li {
  margin-bottom: 0.25rem;
}

.flash-list li:last-child {
  margin-bottom: 0;
}
</style>
