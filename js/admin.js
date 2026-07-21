// ============================================================
//  ELITE FITNESS – ADMIN JAVASCRIPT
//  Admin login, member management, subscription tracking
// ============================================================

(function() {
    'use strict';

    // ----- Check if admin is logged in -----
    const adminSession = sessionStorage.getItem('eliteAdminSession');
    const isAdminPage = window.location.pathname.includes('admin.html');

    if (isAdminPage && !adminSession) {
        // Show login form
        document.getElementById('adminLoginForm').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
        return;
    }

    if (isAdminPage && adminSession) {
        document.getElementById('adminLoginForm').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadAdminDashboard();
    }

    // ----- ADMIN LOGIN -----
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value;

            if (window.DB) {
                const admin = window.DB.verifyAdmin(email, password);
                if (admin) {
                    sessionStorage.setItem('eliteAdminSession', JSON.stringify(admin));
                    window.location.reload();
                } else {
                    document.getElementById('adminLoginError').textContent = 'Invalid email or password.';
                }
            } else {
                // Fallback mock
                if (email === 'admin@elitefitness.com' && password === 'admin123') {
                    sessionStorage.setItem('eliteAdminSession', JSON.stringify({ email, name: 'Admin' }));
                    window.location.reload();
                } else {
                    document.getElementById('adminLoginError').textContent = 'Invalid email or password.';
                }
            }
        });
    }

    // ----- LOAD ADMIN DASHBOARD -----
    function loadAdminDashboard() {
        const members = window.DB ? window.DB.getMembers() : [];
        const memberships = window.DB ? window.DB.getMemberships() : [];

        // Stats
        const totalMembers = members.length;
        const activeMemberships = memberships.filter(m => m.isActive && m.endDate >= new Date().toISOString().split('T')[0]);
        const expiringMemberships = memberships.filter(m => {
            const today = new Date();
            const end = new Date(m.endDate);
            const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
            return m.isActive && diff >= 0 && diff <= 7;
        });
        const expiredMemberships = memberships.filter(m => m.endDate < new Date().toISOString().split('T')[0] || !m.isActive);

        document.getElementById('totalMembers').textContent = totalMembers;
        document.getElementById('activeMemberships').textContent = activeMemberships.length;
        document.getElementById('expiringMemberships').textContent = expiringMemberships.length;
        document.getElementById('expiredMemberships').textContent = expiredMemberships.length;

        // Members table
        const tableBody = document.getElementById('membersTableBody');
        if (tableBody) {
            if (members.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px;">No members yet.</td></tr>';
            } else {
                tableBody.innerHTML = members.map(m => {
                    const memberMemberships = memberships.filter(mm => mm.memberId === m.id);
                    const active = memberMemberships.filter(mm => mm.isActive && mm.endDate >= new Date().toISOString().split('T')[0]);
                    const status = active.length > 0 ? '✅ Active' : '❌ Inactive';
                    return `
                        <tr>
                            <td>${m.name}</td>
                            <td>${m.email}</td>
                            <td>${m.phone || 'N/A'}</td>
                            <td>${active.length > 0 ? active[0].type === 'gym_pt' ? 'Premium + PT' : 'Premium' : 'None'}</td>
                            <td>${active.length > 0 ? active[0].endDate : 'N/A'}</td>
                            <td><span class="status-badge ${active.length > 0 ? 'active' : 'expired'}">${status}</span></td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // Expiring memberships
        const expiringBody = document.getElementById('expiringTableBody');
        if (expiringBody) {
            if (expiringMemberships.length === 0) {
                expiringBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">No memberships expiring in the next 7 days.</td></tr>';
            } else {
                expiringBody.innerHTML = expiringMemberships.map(m => {
                    const member = members.find(mm => mm.id === m.memberId);
                    return `
                        <tr>
                            <td>${member ? member.name : 'Unknown'}</td>
                            <td>${m.type === 'gym_pt' ? 'Premium + PT' : 'Premium'}</td>
                            <td>${m.endDate}</td>
                            <td><button class="btn-primary" style="padding:4px 16px;font-size:0.8rem;" onclick="renewMember('${m.id}')">Renew</button></td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // Expired memberships
        const expiredBody = document.getElementById('expiredTableBody');
        if (expiredBody) {
            if (expiredMemberships.length === 0) {
                expiredBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:20px;">No expired memberships.</td></tr>';
            } else {
                expiredBody.innerHTML = expiredMemberships.map(m => {
                    const member = members.find(mm => mm.id === m.memberId);
                    return `
                        <tr>
                            <td>${member ? member.name : 'Unknown'}</td>
                            <td>${m.type === 'gym_pt' ? 'Premium + PT' : 'Premium'}</td>
                            <td>${m.endDate}</td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // ---- LOGOUT ----
        document.getElementById('adminLogoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.removeItem('eliteAdminSession');
                window.location.reload();
            }
        });
    }

    // ----- RENEW FUNCTION (exposed globally for onclick) -----
    window.renewMember = function(membershipId) {
        if (!window.DB) {
            alert('Database not available. Cannot renew.');
            return;
        }

        const membership = window.DB.getMembership(membershipId);
        if (!membership) {
            alert('Membership not found.');
            return;
        }

        if (confirm('Renew this membership for another ' + membership.durationMonths + ' months?')) {
            window.DB.renewMembership(membershipId, membership.durationMonths, membership.basePrice);
            alert('✅ Membership renewed successfully!');
            loadAdminDashboard();
        }
    };

})();