// ============================================================
//  ELITE FITNESS – DASHBOARD JAVASCRIPT
//  Member login, membership view, renew, upgrade, profile edit
// ============================================================

(function() {
    'use strict';

    // ----- Check if logged in -----
    const session = sessionStorage.getItem('eliteMemberSession');
    if (!session) {
        // Not logged in – redirect to login
        window.location.href = 'index.html';
        return;
    }

    const memberData = JSON.parse(session);

    // ----- Load member data -----
    function loadDashboard() {
        const members = window.DB ? window.DB.getMembers() : [];
        const member = members.find(m => m.id === memberData.id);

        if (!member) {
            alert('Member not found. Please login again.');
            sessionStorage.removeItem('eliteMemberSession');
            window.location.href = 'index.html';
            return;
        }

        // Update header
        document.getElementById('memberName').textContent = member.name;
        document.getElementById('memberAvatar').src = member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80';

        // Get memberships
        const memberships = window.DB ? window.DB.getMemberMemberships(member.id) : [];
        const activeMembership = memberships.find(m => m.isActive && m.endDate >= new Date().toISOString().split('T')[0]);

        if (activeMembership) {
            const endDate = new Date(activeMembership.endDate);
            const today = new Date();
            const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

            document.getElementById('daysRemaining').textContent = daysRemaining > 0 ? daysRemaining : 0;
            document.getElementById('memberPlan').textContent = activeMembership.type === 'gym_pt' ? 'Premium + PT' : 'Premium';
            document.getElementById('memberEndDate').textContent = activeMembership.endDate;
            document.getElementById('planType').textContent = activeMembership.type === 'gym_pt' ? 'Premium + PT' : 'Premium';
            document.getElementById('startDate').textContent = activeMembership.startDate;
            document.getElementById('endDate').textContent = activeMembership.endDate;

            const statusBadge = document.getElementById('statusBadge');
            if (daysRemaining > 0) {
                statusBadge.textContent = '✅ Active';
                statusBadge.className = 'status-badge active';
            } else {
                statusBadge.textContent = '❌ Expired';
                statusBadge.className = 'status-badge expired';
            }
        } else {
            document.getElementById('daysRemaining').textContent = '0';
            document.getElementById('memberPlan').textContent = 'None';
            document.getElementById('memberEndDate').textContent = 'N/A';
            document.getElementById('planType').textContent = 'No active membership';
            document.getElementById('startDate').textContent = 'N/A';
            document.getElementById('endDate').textContent = 'N/A';
            document.getElementById('statusBadge').textContent = '⚠️ Inactive';
            document.getElementById('statusBadge').className = 'status-badge expired';
        }

        // Payment history
        const history = window.DB ? window.DB.getPaymentHistory().filter(p => p.membershipId === (activeMembership ? activeMembership.id : '')) : [];
        const historyContainer = document.getElementById('paymentHistoryContainer');
        if (historyContainer) {
            if (history.length === 0) {
                historyContainer.innerHTML = '<p style="color:var(--text-muted);">No payment history yet.</p>';
            } else {
                historyContainer.innerHTML = history.map(p => `
                    <div class="payment-item">
                        <div class="payment-details">
                            <div class="payment-plan">${activeMembership ? (activeMembership.type === 'gym_pt' ? 'Premium + PT' : 'Premium') : 'Plan'}</div>
                            <div class="payment-date">${p.date}</div>
                        </div>
                        <div class="payment-amount">₹${p.amount.toFixed(2)}</div>
                        <span class="payment-status ${p.status}">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
                    </div>
                `).join('');
            }
        }

        // Total spent
        const totalSpent = history.reduce((sum, p) => sum + p.amount, 0);
        document.getElementById('totalSpent').textContent = '₹' + totalSpent.toFixed(2);

        // Profile form
        document.getElementById('profileName').value = member.name;
        document.getElementById('profileEmail').value = member.email;
        document.getElementById('profilePhone').value = member.phone || '';
        document.getElementById('profileAddress').value = member.address || '';
    }

    loadDashboard();

    // ----- PROFILE UPDATE -----
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('profileName').value.trim();
        const phone = document.getElementById('profilePhone').value.trim();
        const address = document.getElementById('profileAddress').value.trim();

        if (!name) {
            alert('Please enter your name.');
            return;
        }

        if (window.DB) {
            window.DB.updateMember(memberData.id, { name, phone, address });
        }

        document.getElementById('memberName').textContent = name;
        alert('✅ Profile updated successfully!');
    });

    // ----- RENEW BUTTON -----
    document.getElementById('renewBtn').addEventListener('click', function() {
        window.location.href = 'index.html#plans';
    });

    // ----- UPGRADE BUTTON -----
    document.getElementById('upgradeBtn').addEventListener('click', function() {
        window.location.href = 'index.html#plans';
    });

    // ----- LOGOUT -----
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('eliteMemberSession');
            window.location.href = 'index.html';
        }
    });

    // ----- APPLY DISCOUNT (Dashboard) -----
    const discountInput = document.getElementById('discountCodeInput');
    const applyBtn = document.getElementById('applyDiscountBtn');
    const msgDiv = document.getElementById('discountMessage');

    if (applyBtn && discountInput) {
        applyBtn.addEventListener('click', function() {
            const code = discountInput.value.trim().toUpperCase();

            if (!code) {
                msgDiv.innerHTML = '<span style="color:#ffa502;">⚠️ Please enter a discount code.</span>';
                return;
            }

            const discount = window.DB ? window.DB.validateDiscountCode(code) : null;

            if (code === 'STUDENT200' || (discount && discount.value === 200)) {
                msgDiv.innerHTML = '<span style="color:var(--accent);">✅ Discount applied! ₹200 off your next renewal.</span>';
            } else {
                msgDiv.innerHTML = '<span style="color:#ff4757;">❌ Invalid code. Please try again.</span>';
            }
        });
    }

    // ----- DOWNLOAD INVOICE -----
    document.getElementById('downloadInvoiceBtn').addEventListener('click', function() {
        alert('Downloading invoice... (PDF will be generated)');
    });

})();