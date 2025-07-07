import { db, auth } from './firebase-config.js';
import { updateCartCount } from './main.js';

// DOM Elements
const productsContainer = document.getElementById('products-container');
const categoryTitle = document.getElementById('category-title');
const filterButtons = document.querySelectorAll('.filter-btn');

// Get category from URL
const urlParams = new URLSearchParams(window.location.search);
const categoryParam = urlParams.get('category');

// Set active filter button
function setActiveFilter() {
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === (categoryParam || 'all')) {
            btn.classList.add('active');
        }
    });
}

// Fetch products from Firestore
async function fetchProducts(category = null) {
    productsContainer.innerHTML = '<div class="loader">Loading products...</div>';
    
    try {
        let query = db.collection('products');
        
        if (category && category !== 'all') {
            query = query.where('category', '==', category);
        }
        
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            productsContainer.innerHTML = '<div class="no-products">No products found</div>';
            return;
        }
        
        productsContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const product = doc.data();
            product.id = doc.id;
            renderProduct(product);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        productsContainer.innerHTML = '<div class="error">Error loading products. Please try again.</div>';
    }
}

// Render product card
function renderProduct(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    const availabilityClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
    const availabilityText = product.stock > 0 ? 'In Stock' : 'Out of Stock';
    
    productCard.innerHTML = `
        <div class="product-image">
            <img src="${product.imageUrl || 'images/products/default.jpg'}" alt="${product.name}">
            <span class="availability ${availabilityClass}">${availabilityText}</span>
        </div>
        <div class="product-details">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            
            <div class="product-options">
                <div class="form-group">
                    <label for="size-${product.id}">Size:</label>
                    <select id="size-${product.id}" class="size-select">
                        ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Color:</label>
                    <div class="color-options">
                        ${product.colors.map(color => `
                            <div class="color-option" style="background-color: ${color.code}" data-color="${color.name}" title="${color.name}"></div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                Add to Cart
            </button>
        </div>
    `;
    
    productsContainer.appendChild(productCard);
}

// Add to cart functionality
function setupAddToCartButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            if (!auth.currentUser) {
                alert('Please login to add items to cart');
                window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                return;
            }
            
            const productId = e.target.dataset.id;
            const productCard = e.target.closest('.product-card');
            const sizeSelect = productCard.querySelector('.size-select');
            const selectedSize = sizeSelect.value;
            
            // In a real app, you'd get the selected color from the color options
            const selectedColor = 'Blue'; // Placeholder
            
            addToCart(productId, selectedSize, selectedColor);
        }
    });
}

// Add item to cart
function addToCart(productId, size, color) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => 
        item.productId === productId && item.size === size && item.color === color
    );
    
    if (existingItemIndex >= 0) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            productId,
            size,
            color,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show success message
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'Item added to cart!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Initialize product page
function initProductPage() {
    setActiveFilter();
    
    // Set category title
    if (categoryParam) {
        const title = categoryParam === 'boys' ? 'Boys Collection' : 'Girls Collection';
        if (categoryTitle) categoryTitle.textContent = title;
    }
    
    // Load products for the category
    fetchProducts(categoryParam);
    
    // Setup filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            window.location.href = `products.html?category=${category === 'all' ? '' : category}`;
        });
    });
    
    setupAddToCartButtons();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProductPage); 