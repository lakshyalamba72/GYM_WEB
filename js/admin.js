// ============================================================
//  ELITE FITNESS – ADMIN JAVASCRIPT
//  Login + Full Dashboard Management + Modal UI
// ============================================================

(function() {
    'use strict';

    // ----- DOM Elements -----
    const loginForm = document.getElementById('adminLoginForm');
    const dashboard = document.getElementById('adminDashboard');
    const loginError = document.getElementById('adminLoginError');

    // ----- TOGGLE PASSWORD VISIBILITY -----
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const passwordInput = document.getElementById('adminPassword');
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    }

    // ----- CHECK REMEMBER ME -----
    function checkRememberMe() {
        const rememberData = localStorage.getItem('eliteAdminRemember');
        if (rememberData) {
            try {
                const data = JSON.parse(rememberData);
                if (data.expires > Date.now()) {
                    sessionStorage.setItem('eliteAdminSession', JSON.stringify(data.admin));
                    return true;
                } else {
                    localStorage.removeItem('eliteAdminRemember');
                }
            } catch (e) {
                localStorage.removeItem('eliteAdminRemember');
            }
        }
        return false;
    }

    // ----- Check if admin is already logged in -----
    let adminSession = sessionStorage.getItem('eliteAdminSession');

    if (!adminSession) {
        if (checkRememberMe()) {
            window.location.reload();
            return;
        }
    }

    if (adminSession) {
        if (loginForm) loginForm.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        loadAdminDashboard();
    } else {
        if (loginForm) loginForm.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }

    // ----- ADMIN LOGIN -----
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value.trim();
            const rememberMe = document.getElementById('rememberMe').checked;

            if (loginError) loginError.textContent = '';

            if (!email || !password) {
                if (loginError) loginError.textContent = '⚠️ Please enter both email and password.';
                return;
            }

            if (window.DB) {
                const admin = window.DB.verifyAdmin(email, password);

                if (admin) {
                    sessionStorage.setItem('eliteAdminSession', JSON.stringify(admin));
                    if (rememberMe) {
                        localStorage.setItem('eliteAdminRemember', JSON.stringify({
                            admin: admin,
                            expires: Date.now() + (30 * 24 * 60 * 60 * 1000)
                        }));
                    }
                    window.location.href = 'admin.html';
                } else {
                    if (loginError) loginError.textContent = '❌ Invalid email or password. Please try again.';
                }
            } else {
                if (email === 'lakshyalamba72@gmail.com' && password === 'lakshya1') {
                    const admin = { email: email, name: 'Admin' };
                    sessionStorage.setItem('eliteAdminSession', JSON.stringify(admin));
                    if (rememberMe) {
                        localStorage.setItem('eliteAdminRemember', JSON.stringify({
                            admin: admin,
                            expires: Date.now() + (30 * 24 * 60 * 60 * 1000)
                        }));
                    }
                    window.location.href = 'admin.html';
                } else {
                    if (loginError) loginError.textContent = '❌ Invalid email or password. Please try again.';
                }
            }
        });
    }

    // ----- LOAD ADMIN DASHBOARD -----
    function loadAdminDashboard() {
        const members = window.DB ? window.DB.getMembers() : [];
        const memberships = window.DB ? window.DB.getMemberships() : [];

        const session = sessionStorage.getItem('eliteAdminSession');
        const adminName = session ? JSON.parse(session).name || 'Admin' : 'Admin';
        document.getElementById('adminName').textContent = adminName;

        const today = new Date().toISOString().split('T')[0];
        const activeMemberships = memberships.filter(m => m.isActive && m.endDate >= today);
        const expiringMemberships = memberships.filter(m => {
            const end = new Date(m.endDate);
            const now = new Date();
            const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            return m.isActive && diff >= 0 && diff <= 7;
        });
        const expiredMemberships = memberships.filter(m => m.endDate < today || !m.isActive);

        document.getElementById('totalMembers').textContent = members.length;
        document.getElementById('activeMemberships').textContent = activeMemberships.length;
        document.getElementById('expiringMemberships').textContent = expiringMemberships.length;
        document.getElementById('expiredMemberships').textContent = expiredMemberships.length;

        // ---- ALL MEMBERS TABLE ----
        const tableBody = document.getElementById('membersTableBody');
        if (tableBody) {
            if (members.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px;">No members yet.</td></tr>';
            } else {
                tableBody.innerHTML = members.map(m => {
                    const memberMemberships = memberships.filter(mm => mm.memberId === m.id);
                    const active = memberMemberships.filter(mm => mm.isActive && mm.endDate >= today);
                    const current = active.length > 0 ? active[0] : null;
                    
                    let daysLeft = 'N/A';
                    let expiryDate = 'N/A';
                    let plan = 'None';
                    let hasPT = false;
                    let membershipId = null;

                    if (current) {
                        expiryDate = current.endDate;
                        plan = current.type === 'gym_pt' ? 'Premium + PT' : 'Premium';
                        hasPT = current.type === 'gym_pt';
                        membershipId = current.id;
                        const end = new Date(current.endDate);
                        const now = new Date();
                        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                        daysLeft = diff > 0 ? diff + ' days' : 'Expired';
                    }

                    return `
                        <tr data-member-id="${m.id}">
                            <td><strong>${m.name}</strong></td>
                            <td>${m.email}</td>
                            <td>${m.phone || 'N/A'}</td>
                            <td>${plan}</td>
                            <td>${hasPT ? '✅ Yes' : '❌ No'}</td>
                            <td>${expiryDate}</td>
                            <td><span class="status-badge ${daysLeft !== 'Expired' && daysLeft !== 'N/A' ? 'active' : 'expired'}">${daysLeft}</span></td>
                            <td>
                                <div class="admin-actions">
                                    <button class="btn-primary" style="padding:2px 10px;font-size:11px;" onclick="editMember('${m.id}')">Edit</button>
                                    <button class="btn-primary" style="padding:2px 10px;font-size:11px;background:var(--accent);" onclick="openAssignPlanModal('${m.id}')">Assign Plan</button>
                                    ${membershipId ? `
                                        <button class="btn-primary" style="padding:2px 10px;font-size:11px;background:#ffa502;" onclick="togglePT('${membershipId}')">${hasPT ? 'Remove PT' : 'Add PT'}</button>
                                        <button class="btn-outline" style="padding:2px 10px;font-size:11px;border-color:#ff4757;color:#ff4757;" onclick="cancelMembership('${membershipId}')">Cancel</button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // ---- EXPIRING TABLE ----
        const expiringBody = document.getElementById('expiringTableBody');
        if (expiringBody) {
            if (expiringMemberships.length === 0) {
                expiringBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">No memberships expiring in the next 7 days.</td></tr>';
            } else {
                expiringBody.innerHTML = expiringMemberships.map(m => {
                    const member = members.find(mm => mm.id === m.memberId);
                    const end = new Date(m.endDate);
                    const now = new Date();
                    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                    return `
                        <tr>
                            <td>${member ? member.name : 'Unknown'}</td>
                            <td>${m.type === 'gym_pt' ? 'Premium + PT' : 'Premium'}</td>
                            <td>${m.endDate}</td>
                            <td><span style="color:var(--accent);font-weight:700;">${diff} days left</span></td>
                            <td><button class="btn-primary" style="padding:4px 16px;font-size:12px;" onclick="renewMember('${m.id}')">Renew</button></td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // ---- EXPIRED TABLE ----
        const expiredBody = document.getElementById('expiredTableBody');
        if (expiredBody) {
            if (expiredMemberships.length === 0) {
                expiredBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">No expired memberships.</td></tr>';
            } else {
                expiredBody.innerHTML = expiredMemberships.map(m => {
                    const member = members.find(mm => mm.id === m.memberId);
                    return `
                        <tr>
                            <td>${member ? member.name : 'Unknown'}</td>
                            <td>${m.type === 'gym_pt' ? 'Premium + PT' : 'Premium'}</td>
                            <td>${m.endDate}</td>
                            <td><button class="btn-primary" style="padding:4px 16px;font-size:12px;" onclick="renewMember('${m.id}')">Reactivate</button></td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }

    // ----- LOGOUT -----
    document.getElementById('adminLogoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('eliteAdminSession');
            localStorage.removeItem('eliteAdminRemember');
            window.location.href = 'admin.html';
        }
    });

})();

// ============================================================
//  GLOBAL FUNCTIONS
// ============================================================

// ----- ASSIGN PLAN MODAL -----
function openAssignPlanModal(memberId) {
    if (!window.DB) {
        alert('Database not available.');
        return;
    }

    const member = window.DB.getMember(memberId);
    if (!member) {
        alert('Member not found.');
        return;
    }

    document.getElementById('assignPlanMemberId').value = memberId;
    document.getElementById('assignPlanMemberName').innerHTML = 'For: <strong>' + member.name + '</strong>';

    document.getElementById('assignPlanType').value = 'gym';
    document.getElementById('assignPlanDuration').value = '3';
    document.getElementById('assignPlanStudentDiscount').checked = false;

    const modal = document.getElementById('assignPlanModal');
    modal.style.display = 'flex';
}

function closeAssignPlanModal() {
    document.getElementById('assignPlanModal').style.display = 'none';
}

// ----- ASSIGN PLAN FORM -----
document.getElementById('assignPlanForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!window.DB) {
        alert('Database not available.');
        return;
    }

    const memberId = document.getElementById('assignPlanMemberId').value;
    const planType = document.getElementById('assignPlanType').value;
    const durationMonths = parseInt(document.getElementById('assignPlanDuration').value);
    const studentDiscount = document.getElementById('assignPlanStudentDiscount').checked;

    const prices = {
        1: { gym: 1500, gym_pt: 7500 },
        3: { gym: 4000, gym_pt: 10000 },
        6: { gym: 7500, gym_pt: 15000 }
    };

    let basePrice = prices[durationMonths]?.[planType] || 4000;
    let discount = studentDiscount ? 200 : 0;
    let finalPrice = basePrice - discount;

    const member = window.DB.getMember(memberId);
    if (!member) {
        alert('Member not found.');
        return;
    }

    const memberships = window.DB.getMemberships();
    const existing = memberships.find(m => m.memberId === memberId && m.isActive);
    if (existing) {
        if (!confirm(`This member already has an active membership. Cancel it and assign new plan?`)) {
            return;
        }
        window.DB.cancelMembership(existing.id);
    }

    window.DB.createMembership({
        memberId: memberId,
        type: planType,
        durationMonths: durationMonths,
        basePrice: basePrice,
        discountApplied: discount,
        finalPrice: finalPrice,
        paymentStatus: 'paid'
    });

    alert('✅ Plan assigned successfully to ' + member.name + '!');
    closeAssignPlanModal();
    window.location.reload();
});

// ----- Close modal on outside click -----
document.getElementById('assignPlanModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAssignPlanModal();
    }
});

// ----- RENEW MEMBERSHIP -----
function renewMember(membershipId) {
    if (!window.DB) {
        alert('Database not available.');
        return;
    }

    const membership = window.DB.getMembership(membershipId);
    if (!membership) {
        alert('Membership not found.');
        return;
    }

    const duration = membership.durationMonths || 1;
    const price = membership.basePrice || 1500;

    if (confirm(`Renew this membership for another ${duration} month(s)? No payment required.`)) {
        window.DB.renewMembership(membershipId, duration, price, 0);
        alert('✅ Membership renewed successfully!');
        window.location.reload();
    }
}

// ----- CANCEL MEMBERSHIP -----
function cancelMembership(membershipId) {
    if (!window.DB) {
        alert('Database not available.');
        return;
    }

    const membership = window.DB.getMembership(membershipId);
    if (!membership) {
        alert('Membership not found.');
        return;
    }

    if (confirm('Are you sure you want to cancel this membership? This cannot be undone.')) {
        window.DB.cancelMembership(membershipId);
        alert('✅ Membership cancelled successfully.');
        window.location.reload();
    }
}

// ----- TOGGLE PT -----
function togglePT(membershipId) {
    if (!window.DB) {
        alert('Database not available.');
        return;
    }

    const membership = window.DB.getMembership(membershipId);
    if (!membership) {
        alert('Membership not found.');
        return;
    }

    const member = window.DB.getMember(membership.memberId);
    const currentType = membership.type;
    const newType = currentType === 'gym' ? 'gym_pt' : 'gym';
    const action = currentType === 'gym' ? 'Add' : 'Remove';

    if (confirm(`${action} Personal Training for ${member ? member.name : 'this member'}?`)) {
        window.DB.updateMembership(membershipId, { 
            type: newType,
            basePrice: newType === 'gym_pt' ? 10000 : 4000,
            finalPrice: newType === 'gym_pt' ? 10000 : 4000
        });
        alert(`✅ Personal Training ${action === 'Add' ? 'added to' : 'removed from'} membership.`);
        window.location.reload();
    }
}

// ----- EDIT MEMBER -----
function editMember(memberId) {
    if (!window.DB) {
        alert('Database not available.');
        return;
    }

    const member = window.DB.getMember(memberId);
    if (!member) {
        alert('Member not found.');
        return;
    }

    const newName = prompt('Edit Name:', member.name);
    if (newName !== null && newName.trim()) {
        const newPhone = prompt('Edit Phone:', member.phone || '');
        const newAddress = prompt('Edit Address:', member.address || '');
        window.DB.updateMember(memberId, {
            name: newName.trim(),
            phone: newPhone || '',
            address: newAddress || ''
        });
        alert('✅ Member updated successfully.');
        window.location.reload();
    }
}