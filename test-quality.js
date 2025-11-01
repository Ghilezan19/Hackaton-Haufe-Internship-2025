// Test file with code quality issues
// This should WARN but ALLOW commit

function calculateTotal(items) {
  // 🟡 HIGH: Missing input validation
  let total = 0;
  
  // 🟡 MEDIUM: Potential null pointer
  for (let i = 0; i < items.length; i++) {
    total += items[i].price; // What if items[i] is null?
  }
  
  return total;
}

// 🔵 LOW: Unused variable
const unusedVar = "I'm never used";

// 🟡 MEDIUM: Missing error handling
function fetchData(url) {
  const response = fetch(url);
  return response.json(); // No .catch()
}

// 🟡 MEDIUM: Complex nested logic
function processOrder(order) {
  if (order) {
    if (order.items) {
      if (order.items.length > 0) {
        if (order.user) {
          if (order.user.verified) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

module.exports = { calculateTotal, fetchData, processOrder };

