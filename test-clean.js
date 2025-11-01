// Test file with CLEAN code
// This should PASS without issues

/**
 * Calculate the total price of items in a shopping cart
 * @param {Array<{price: number}>} items - Array of items with prices
 * @returns {number} Total price
 * @throws {Error} If items is not an array
 */
function calculateTotal(items) {
  // Input validation
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }
  
  // Safe calculation with error handling
  return items.reduce((total, item) => {
    if (item && typeof item.price === 'number') {
      return total + item.price;
    }
    return total;
  }, 0);
}

/**
 * Fetch data from an API endpoint
 * @param {string} url - The API endpoint URL
 * @returns {Promise<any>} The fetched data
 */
async function fetchData(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

/**
 * Check if an order is valid and ready for processing
 * @param {Object} order - The order object
 * @returns {boolean} True if order is valid
 */
function isValidOrder(order) {
  return Boolean(
    order?.items?.length > 0 &&
    order?.user?.verified
  );
}

module.exports = {
  calculateTotal,
  fetchData,
  isValidOrder
};

