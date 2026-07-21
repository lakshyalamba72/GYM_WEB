/* ============================================
   ELITE FITNESS – DASHBOARD JAVASCRIPT
   All Dashboard Interactivity
   ============================================ */

// ============================================
//  BULLETPROOF LOADER
// ============================================

function hideLoader() {
    var loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(hideLoader, 1200);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(hideLoader, 1200);
    });
}

window.addEventListener('load', function() {
    setTimeout(hideLoader, 1200);
});

setTimeout(hideLoader, 3500);

// ============================================
//  DASHBOARD LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', function() {

    // ---- LOGOUT BUTTON ----
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'index.html';
        }
    });

    // ---- RENEW BUTTON ----
    document.getElementById('renewBtn').addEventListener('click', function() {
        alert('Renewal feature coming soon! You will be redirected to payment.');
    });

    // ---- UPGRADE BUTTON ----
    document.getElementById('upgradeBtn').addEventListener('click', function() {
        alert('Upgrade feature coming soon! Choose a higher plan.');
    });

    // ---- APPLY DISCOUNT ----
    document.getElementById('applyDiscountBtn').addEventListener('click', function() {
        var code = document.getElementById('discountCode').value.trim();
        var messageDiv = document.getElementById('discountMessage');

        if (code === 'STUDENT200') {
            messageDiv.innerHTML = '<span style="color:#2ed573;">✅ Discount applied! ₹200 off your next renewal.</span>';
        } else if (code === '') {
            messageDiv.innerHTML = '<span style="color:#ffa502;">⚠️ Please enter a discount code.</span>';
        } else {
            messageDiv.innerHTML = '<span style="color:#ff4757;">❌ Invalid code. Please try again.</span>';
        }
    });

    // ---- DOWNLOAD INVOICE ----
    document.getElementById('downloadInvoiceBtn').addEventListener('click', function() {
        alert('Downloading invoice... (PDF will be generated)');
    });

    // ---- VIEW PAYMENT HISTORY ----
    document.getElementById('viewHistoryBtn').addEventListener('click', function() {
        var historyCard = document.getElementById('paymentHistoryCard');
        historyCard.scrollIntoView({ behavior: 'smooth' });
    });

    // ---- PROFILE FORM SUBMIT ----
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var name = document.getElementById('profileName').value;
        var phone = document.getElementById('profilePhone').value;
        var address = document.getElementById('profileAddress').value;

        if (name.trim() === '' || phone.trim() === '' || address.trim() === '') {
            alert('Please fill in all fields.');
            return;
        }

        // Update the welcome message with the new name
        document.getElementById('memberName').textContent = name;

        alert('✅ Profile updated successfully!');
    });

    // ---- STICKY NAVBAR ----
    var navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(17,17,17,0.98)';
        } else {
            navbar.style.background = 'rgba(17,17,17,0.95)';
        }
    });

});