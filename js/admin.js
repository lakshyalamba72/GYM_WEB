// ============================================================
//  ELITE FITNESS – ADMIN JAVASCRIPT
//  Updated with per‑month student discount and price preview
// ============================================================

(function() {
    'use strict';

    // ----- DOM refs -----
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
        const adminNameEl = document.getElementById('adminName');
        if (adminNameEl) adminNameEl.textContent = adminName;

        const today = new Date().toISOString().split('T')[0];

        // ---- STATS ----
        const activeMemberships = memberships.filter(m => m.isActive && m.endDate >= today);
        const expiringMemberships = memberships.filter(m => {
            const end = new Date(m.endDate);
            const now = new Date();
            const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            return m.isActive && diff >= 0 && diff <= 7;
        });
        const expiredMemberships = memberships.filter(m => m.endDate < today || !m.isActive);

        const totalMembersEl = document.getElementById('totalMembers');
        const activeMembershipsEl = document.getElementById('activeMemberships');
        const expiringMembershipsEl = document.getElementById('expiringMemberships');
        const expiredMembershipsEl = document.getElementById('expiredMemberships');

        if (totalMembersEl) totalMembersEl.textContent = members.length;
        if (activeMembershipsEl) activeMembershipsEl.textContent = activeMemberships.length;
        if (expiringMembershipsEl) expiringMembershipsEl.textContent = expiringMemberships.length;
        if (expiredMembershipsEl) expiredMembershipsEl.textContent = expiredMemberships.length;

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

                    const statusClass = (daysLeft !== 'Expired' && daysLeft !== 'N/A') ? 'active' : 'expired';

                    return `
                        <tr data-member-id="${m.id}">
                            <td><strong>${m.name}</strong></td>
                            <td>${m.email}</td>
                            <td>${m.phone || 'N/A'}</td>
                            <td>${plan}</td>
                            <td>${hasPT ? '✅ Yes' : '❌ No'}</td>
                            <td>${expiryDate}</td>
                            <td><span class="status-badge ${statusClass}">${daysLeft}</span></td>
                            <td>
                                <div class="admin-actions">
                                    <button class="btn-primary" style="padding:2px 10px;font-size:11px;" onclick="openEditMemberModal('${m.id}')">Edit</button>
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

    // ----- LOGOUT (now uses confirm modal) -----
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showConfirmModal(
                'Are you sure you want to logout?',
                'Logout Confirmation',
                function() {
                    sessionStorage.removeItem('eliteAdminSession');
                    localStorage.removeItem('eliteAdminRemember');
                    window.location.href = 'admin.html';
                }
            );
        });
    }

    // ============================================================
    //  CONFIRM MODAL
    // ============================================================
    let confirmCallback = null;

    window.showConfirmModal = function(message, title, callback) {
        const modal = document.getElementById('confirmModal');
        const msgEl = document.getElementById('confirmMessage');
        const titleEl = document.getElementById('confirmTitle');

        if (titleEl) titleEl.textContent = title || 'Confirm Action';
        if (msgEl) msgEl.textContent = message;

        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        confirmCallback = callback;
    };

    window.closeConfirmModal = function() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        confirmCallback = null;
    };

    const confirmYesBtn = document.getElementById('confirmYesBtn');
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', function() {
            if (typeof confirmCallback === 'function') {
                confirmCallback();
            }
            closeConfirmModal();
        });
    }

    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        confirmModal.addEventListener('click', function(e) {
            if (e.target === this) closeConfirmModal();
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeConfirmModal();
        }
    });

    // ============================================================
    //  GLOBAL FUNCTIONS
    // ============================================================

    // ----- EDIT MEMBER MODAL -----
    window.openEditMemberModal = function(memberId) {
        if (!window.DB) {
            alert('Database not available.');
            return;
        }

        const member = window.DB.getMember(memberId);
        if (!member) {
            alert('Member not found.');
            return;
        }

        document.getElementById('editMemberId').value = memberId;
        document.getElementById('editMemberName').value = member.name || '';
        document.getElementById('editMemberPhone').value = member.phone || '';
        document.getElementById('editMemberAddress').value = member.address || '';

        const modal = document.getElementById('editMemberModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeEditMemberModal = function() {
        const modal = document.getElementById('editMemberModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    const editForm = document.getElementById('editMemberForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const id = document.getElementById('editMemberId').value;
            const name = document.getElementById('editMemberName').value.trim();
            const phone = document.getElementById('editMemberPhone').value.trim();
            const address = document.getElementById('editMemberAddress').value.trim();

            if (!name) {
                alert('Name is required.');
                return;
            }

            if (window.DB) {
                window.DB.updateMember(id, { name, phone, address });
                alert('✅ Member updated successfully.');
                window.closeEditMemberModal();
                window.location.reload();
            } else {
                alert('Database not available.');
            }
        });
    }

    const editModal = document.getElementById('editMemberModal');
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === this) window.closeEditMemberModal();
        });
    }

    // ============================================================
    //  ASSIGN PLAN MODAL (with per-month discount + price preview)
    // ============================================================

    // Helper to update price preview
    function updateAssignPlanSummary() {
        const planType = document.getElementById('assignPlanType').value;
        const duration = parseInt(document.getElementById('assignPlanDuration').value);
        const discountChecked = document.getElementById('assignPlanStudentDiscount').checked;
        const basePrice = window.DB ? window.DB.getBasePrice(duration, planType) : 0;
        const discountPerMonth = discountChecked ? 200 : 0;
        const totalDiscount = discountPerMonth * duration;
        const finalPrice = Math.max(0, basePrice - totalDiscount);

        const previewEl = document.getElementById('assignPlanPricePreview');
        if (previewEl) {
            previewEl.innerHTML = `
                <div style="margin-top:var(--gr-sm);padding:var(--gr-sm);background:var(--bg-body);border-radius:8px;border:1px solid var(--border-light);">
                    <div style="display:flex;justify-content:space-between;font-size:14px;color:var(--text-secondary);">
                        <span>Base Price:</span>
                        <span>₹${basePrice}</span>
                    </div>
                    ${totalDiscount > 0 ? `
                    <div style="display:flex;justify-content:space-between;font-size:14px;color:var(--accent);">
                        <span>Student Discount (₹${discountPerMonth} × ${duration} months):</span>
                        <span>-₹${totalDiscount}</span>
                    </div>
                    ` : ''}
                    <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:var(--text-primary);border-top:1px solid var(--border-light);padding-top:var(--gr-xs);margin-top:var(--gr-xs);">
                        <span>Final Price:</span>
                        <span style="color:var(--accent);">₹${finalPrice}</span>
                    </div>
                </div>
            `;
        }
    }

    window.openAssignPlanModal = function(memberId) {
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
        document.getElementById('assignPlanType').value = 'gym';
        document.getElementById('assignPlanDuration').value = '3';
        document.getElementById('assignPlanStudentDiscount').checked = false;
        updateAssignPlanSummary();

        const modal = document.getElementById('assignPlanModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeAssignPlanModal = function() {
        const modal = document.getElementById('assignPlanModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // Attach event listeners for price preview updates
    const planTypeSelect = document.getElementById('assignPlanType');
    const durationSelect = document.getElementById('assignPlanDuration');
    const discountCheckbox = document.getElementById('assignPlanStudentDiscount');

    if (planTypeSelect) planTypeSelect.addEventListener('change', updateAssignPlanSummary);
    if (durationSelect) durationSelect.addEventListener('change', updateAssignPlanSummary);
    if (discountCheckbox) discountCheckbox.addEventListener('change', updateAssignPlanSummary);

    // Assign Plan Form Submit
    const assignForm = document.getElementById('assignPlanForm');
    if (assignForm) {
        assignForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!window.DB) {
                alert('Database not available.');
                return;
            }

            const memberId = document.getElementById('assignPlanMemberId').value;
            const planType = document.getElementById('assignPlanType').value;
            const durationMonths = parseInt(document.getElementById('assignPlanDuration').value);
            const studentDiscount = document.getElementById('assignPlanStudentDiscount').checked;

            const basePrice = window.DB.getBasePrice(durationMonths, planType);
            const discountPerMonth = studentDiscount ? 200 : 0;
            const totalDiscount = discountPerMonth * durationMonths;
            const finalPrice = Math.max(0, basePrice - totalDiscount);

            const member = window.DB.getMember(memberId);
            if (!member) {
                alert('Member not found.');
                return;
            }

            const memberships = window.DB.getMemberships();
            const existing = memberships.find(m => m.memberId === memberId && m.isActive);

            function proceedAssign() {
                if (existing) {
                    window.DB.cancelMembership(existing.id);
                }
                window.DB.createMembership({
                    memberId: memberId,
                    type: planType,
                    durationMonths: durationMonths,
                    basePrice: basePrice,
                    discountApplied: totalDiscount,
                    finalPrice: finalPrice,
                    paymentStatus: 'paid'
                });
                alert('✅ Plan assigned successfully to ' + member.name + '!');
                window.closeAssignPlanModal();
                window.location.reload();
            }

            if (existing) {
                showConfirmModal(
                    `This member already has an active membership. Cancel it and assign new plan?`,
                    'Cancel Existing Plan?',
                    proceedAssign
                );
            } else {
                proceedAssign();
            }
        });
    }

    const assignModal = document.getElementById('assignPlanModal');
    if (assignModal) {
        assignModal.addEventListener('click', function(e) {
            if (e.target === this) window.closeAssignPlanModal();
        });
    }

    // ----- RENEW MEMBERSHIP -----
    window.renewMember = function(membershipId) {
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

        showConfirmModal(
            `Renew this membership for another ${duration} month(s)? No payment required.`,
            'Renew Membership',
            function() {
                window.DB.renewMembership(membershipId, duration, price, 0);
                alert('✅ Membership renewed successfully!');
                window.location.reload();
            }
        );
    };

    // ----- CANCEL MEMBERSHIP -----
    window.cancelMembership = function(membershipId) {
        if (!window.DB) {
            alert('Database not available.');
            return;
        }

        const membership = window.DB.getMembership(membershipId);
        if (!membership) {
            alert('Membership not found.');
            return;
        }

        showConfirmModal(
            'Are you sure you want to cancel this membership? This cannot be undone.',
            'Cancel Membership',
            function() {
                window.DB.cancelMembership(membershipId);
                alert('✅ Membership cancelled successfully.');
                window.location.reload();
            }
        );
    };

    // ----- TOGGLE PT -----
    window.togglePT = function(membershipId) {
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

        showConfirmModal(
            `${action} Personal Training for ${member ? member.name : 'this member'}?`,
            `${action} PT`,
            function() {
                window.DB.updateMembership(membershipId, { 
                    type: newType,
                    basePrice: newType === 'gym_pt' ? 10000 : 4000,
                    finalPrice: newType === 'gym_pt' ? 10000 : 4000
                });
                alert(`✅ Personal Training ${action === 'Add' ? 'added to' : 'removed from'} membership.`);
                window.location.reload();
            }
        );
    };

})();