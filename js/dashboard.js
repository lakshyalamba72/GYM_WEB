// ============================================================
//  ELITE FITNESS – MEMBER DASHBOARD JAVASCRIPT
//  Login + Dashboard + Profile management
//  Fixed: ensures Lakshya account exists
// ============================================================

(function() {
    'use strict';

    // ----- Ensure Lakshya account exists (even if DB not initialized) -----
    function ensureLakshyaAccount() {
        if (window.DB) {
            var members = window.DB.getMembers();
            var exists = members.some(function(m) {
                return m.email === 'shadowop007x@gmail.com';
            });
            if (!exists) {
                window.DB.addMember({
                    name: 'Lakshya',
                    email: 'shadowop007x@gmail.com',
                    password: 'lakshya123',
                    phone: '+91 98765 43212',
                    address: 'Noida'
                });
                // Give them a membership
                var allMembers = window.DB.getMembers();
                var lakshya = allMembers.find(function(m) { return m.email === 'shadowop007x@gmail.com'; });
                if (lakshya) {
                    window.DB.createMembership({
                        memberId: lakshya.id,
                        type: 'gym_pt',
                        durationMonths: 6,
                        basePrice: 15000,
                        discountApplied: 0,
                        finalPrice: 15000,
                        paymentStatus: 'paid'
                    });
                }
            }
        }
    }

    // ----- DOM refs -----
    var loginForm = document.getElementById('memberLoginForm');
    var dashboard = document.getElementById('memberDashboard');
    var loginError = document.getElementById('memberLoginError');

    // ----- Check if member already logged in -----
    var memberSession = sessionStorage.getItem('eliteMemberSession');

    if (memberSession) {
        document.body.classList.add('logged-in');
        // Ensure account exists
        ensureLakshyaAccount();
        loadMemberDashboard();
    } else {
        document.body.classList.remove('logged-in');
        // Ensure account exists for login attempt
        ensureLakshyaAccount();
    }

    // ----- MEMBER LOGIN -----
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var email = document.getElementById('memberEmail').value.trim();
            var password = document.getElementById('memberPassword').value.trim();

            if (loginError) loginError.textContent = '';

            if (!email || !password) {
                loginError.textContent = '⚠️ Please enter both email and password.';
                return;
            }

            if (window.DB) {
                // Ensure account exists again (just in case)
                ensureLakshyaAccount();
                var member = window.DB.verifyMember(email, password);
                if (member) {
                    sessionStorage.setItem('eliteMemberSession', JSON.stringify(member));
                    document.body.classList.add('logged-in');
                    loadMemberDashboard();
                } else {
                    loginError.textContent = '❌ Invalid email or password. Please try again.';
                }
            } else {
                // Fallback hardcoded (if DB not loaded)
                if (email === 'shadowop007x@gmail.com' && password === 'lakshya123') {
                    var member = { id: 'dummy', name: 'Lakshya', email: email };
                    sessionStorage.setItem('eliteMemberSession', JSON.stringify(member));
                    document.body.classList.add('logged-in');
                    loadMemberDashboard();
                } else {
                    loginError.textContent = '❌ Invalid email or password. Please try again.';
                }
            }
        });
    }

    // ----- LOGOUT -----
    var logoutBtn = document.getElementById('memberLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('eliteMemberSession');
            document.body.classList.remove('logged-in');
            window.location.reload();
        });
    }

    // ----- LOAD MEMBER DASHBOARD -----
    function loadMemberDashboard() {
        var session = sessionStorage.getItem('eliteMemberSession');
        if (!session) return;
        var member = JSON.parse(session);

        // Update header
        document.getElementById('memberName').textContent = member.name;
        document.getElementById('memberAvatar').src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name) + '&background=00C853&color=fff&size=200';

        // Fetch member data from DB
        var dbMember = window.DB ? window.DB.getMember(member.id) : null;
        if (!dbMember && window.DB) {
            // If not found (e.g., dummy session), try to find by email
            var found = window.DB.getMemberByEmail(member.email);
            if (found) {
                sessionStorage.setItem('eliteMemberSession', JSON.stringify(found));
                loadMemberDashboard(); // reload
                return;
            }
        }
        var currentMember = dbMember || member;

        // Get memberships
        var memberships = window.DB ? window.DB.getMemberships() : [];
        var memberMemberships = memberships.filter(function(m) { return m.memberId === currentMember.id; });
        var active = memberMemberships.filter(function(m) {
            return m.isActive && m.endDate >= new Date().toISOString().split('T')[0];
        });
        var current = active.length > 0 ? active[0] : null;

        if (current) {
            var end = new Date(current.endDate);
            var now = new Date();
            var daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            document.getElementById('daysRemaining').textContent = daysRemaining > 0 ? daysRemaining : 0;
            document.getElementById('memberPlan').textContent = current.type === 'gym_pt' ? 'Premium + PT' : 'Premium';
            document.getElementById('memberEndDate').textContent = current.endDate;
            document.getElementById('planType').textContent = current.type === 'gym_pt' ? 'Premium + PT' : 'Premium';
            document.getElementById('startDate').textContent = current.startDate;
            document.getElementById('endDate').textContent = current.endDate;
            var statusBadge = document.getElementById('statusBadge');
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
        var history = window.DB ? window.DB.getPaymentHistory().filter(function(p) { return p.membershipId === (current ? current.id : ''); }) : [];
        var historyContainer = document.getElementById('paymentHistoryContainer');
        if (historyContainer) {
            if (history.length === 0) {
                historyContainer.innerHTML = '<p style="color:var(--text-muted);">No payment history yet.</p>';
            } else {
                historyContainer.innerHTML = history.map(function(p) {
                    return '<div class="payment-item"><div class="payment-details"><div class="payment-plan">' + (current ? (current.type === 'gym_pt' ? 'Premium + PT' : 'Premium') : 'Plan') + '</div><div class="payment-date">' + p.date + '</div></div><div class="payment-amount">₹' + p.amount.toFixed(2) + '</div><span class="payment-status ' + p.status + '">' + p.status.charAt(0).toUpperCase() + p.status.slice(1) + '</span></div>';
                }).join('');
            }
        }

        // Total spent
        var totalSpent = history.reduce(function(sum, p) { return sum + p.amount; }, 0);
        document.getElementById('totalSpent').textContent = '₹' + totalSpent.toFixed(2);

        // Profile form
        document.getElementById('profileName').value = currentMember.name || '';
        document.getElementById('profileEmail').value = currentMember.email || '';
        document.getElementById('profilePhone').value = currentMember.phone || '';
        document.getElementById('profileAddress').value = currentMember.address || '';

        // ----- PROFILE UPDATE -----
        document.getElementById('profileForm').addEventListener('submit', function(e) {
            e.preventDefault();
            var name = document.getElementById('profileName').value.trim();
            var phone = document.getElementById('profilePhone').value.trim();
            var address = document.getElementById('profileAddress').value.trim();
            if (!name) {
                alert('Please enter your name.');
                return;
            }
            if (window.DB) {
                window.DB.updateMember(currentMember.id, { name: name, phone: phone, address: address });
                var updated = window.DB.getMember(currentMember.id);
                if (updated) {
                    sessionStorage.setItem('eliteMemberSession', JSON.stringify(updated));
                }
                document.getElementById('memberName').textContent = name;
                alert('✅ Profile updated successfully!');
            } else {
                alert('Database not available.');
            }
        });
    }

    // ----- RENEW & UPGRADE BUTTONS -----
    var renewBtn = document.getElementById('renewBtn');
    if (renewBtn) {
        renewBtn.addEventListener('click', function() {
            window.location.href = 'index.html#plans';
        });
    }
    var upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function() {
            window.location.href = 'index.html#plans';
        });
    }

    // ----- DISCOUNT CODE (placeholder) -----
    var applyDiscountBtn = document.getElementById('applyDiscountBtn');
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', function() {
            var code = document.getElementById('discountCodeInput').value.trim().toUpperCase();
            var msgDiv = document.getElementById('discountMessage');
            if (!code) {
                msgDiv.innerHTML = '<span style="color:#ffa502;">⚠️ Please enter a discount code.</span>';
                return;
            }
            if (window.DB) {
                var discount = window.DB.validateDiscountCode(code);
                if (discount) {
                    msgDiv.innerHTML = '<span style="color:var(--accent);">✅ Discount applied! ₹' + discount.value + ' off.</span>';
                } else {
                    msgDiv.innerHTML = '<span style="color:#ff4757;">❌ Invalid or expired code.</span>';
                }
            } else {
                msgDiv.innerHTML = '<span style="color:#ff4757;">❌ Code validation not available.</span>';
            }
        });
    }

    // ----- DOWNLOAD INVOICE (placeholder) -----
    var downloadBtn = document.getElementById('downloadInvoiceBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            alert('Downloading invoice... (PDF will be generated)');
        });
    }

})();