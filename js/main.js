import { auth, db } from './firebase-config.js';

// ========================
// Auth State Management
// ========================
const initAuthState = () => {
  const authLink = document.getElementById('auth-link');
  const cartCount = document.getElementById('cart-count');

  auth.onAuthStateChanged((user) => {
    console.log('Firebase connected! User:', user?.email || 'Not logged in');

    // Update UI based on auth state
    if (authLink) {
      authLink.textContent = user ? 'Logout' : 'Login';
      authLink.href = user ? '#' : 'login.html';
    }

    // Update cart count if logged in
    if (user) {
      updateCartCount();
    } else if (cartCount) {
      cartCount.textContent = '0';
    }

    // Protect authenticated routes
    protectRoutes(user);
  });

  // Handle logout
  if (authLink) {
    authLink.addEventListener('click', (e) => {
      if (auth.currentUser) {
        e.preventDefault();
        auth.signOut()
          .then(() => {
            localStorage.removeItem('cart'); // Clear cart on logout
            window.location.href = 'index.html';
          })
          .catch((error) => {
            console.error('Logout error:', error);
          });
      }
    });
  }
};

// ========================
// Cart Management
// ========================
const updateCartCount = () => {
  try {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error updating cart count:', error);
  }
};

// ========================
// Analytics
// ========================
const trackVisitor = async () => {
  const visitorCounter = document.getElementById('visitor-count');
  if (!visitorCounter) return;

  try {
    const counterRef = db.collection('analytics').doc('visitors');
    
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);
      const newCount = doc.exists ? doc.data().count + 1 : 1;
      transaction[doc.exists ? 'update' : 'set'](counterRef, { count: newCount });
      visitorCounter.textContent = newCount;
    });
  } catch (error) {
    console.error('Error updating visitor count:', error);
    visitorCounter.textContent = '1000+'; // Fallback value
  }
};

// ========================
// Route Protection
// ========================
const protectRoutes = (user) => {
  const protectedRoutes = ['/cart.html', '/checkout.html'];
  const currentPath = window.location.pathname;

  if (protectedRoutes.includes(currentPath) && !user) {
    window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}`;
  }
};

// ========================
// Initialize App
// ========================
const initApp = () => {
  initAuthState();
  updateCartCount();
  trackVisitor();
};

document.addEventListener('DOMContentLoaded', initApp);

// Export for other modules
export { updateCartCount };