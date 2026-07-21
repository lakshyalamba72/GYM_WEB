// ============================================================
//  DATA LAYER (Mock Backend using localStorage)
//  Replace functions with fetch() calls later
// ============================================================

const DB = {
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// ----- Helpers -----
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function today() {
    return new Date().toISOString().split('T')[0];
}

function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
}

// ----- Members -----
function getMembers() {
    return DB.get('members') || [];
}

function getMember(id) {
    return getMembers().find(m => m.id === id);
}

function addMember(data) {
    const members = getMembers();
    const newMember = {
        id: generateId(),
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        studentId: data.studentId || '',
        joined: today(),
        isActive: true
    };
    members.push(newMember);
    DB.set('members', members);
    return newMember;
}

function updateMember(id, updates) {
    const members = getMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;
    members[index] = { ...members[index], ...updates };
    DB.set('members', members);
    return members[index];
}

function deleteMember(id) {
    let members = getMembers();
    members = members.filter(m => m.id !== id);
    DB.set('members', members);
}

// ----- Memberships -----
function getMemberships() {
    return DB.get('memberships') || [];
}

function getMembership(id) {
    return getMemberships().find(m => m.id === id);
}

function getMemberMemberships(memberId) {
    return getMemberships().filter(m => m.memberId === memberId);
}

function getActiveMemberships() {
    return getMemberships().filter(m => m.isActive && m.endDate >= today());
}

function getExpiringMemberships(days = 7) {
    const target = new Date();
    target.setDate(target.getDate() + days);
    const targetStr = target.toISOString().split('T')[0];
    return getMemberships().filter(m => m.isActive && m.endDate === targetStr);
}

function getExpiredMemberships() {
    return getMemberships().filter(m => m.endDate < today() || !m.isActive);
}

function createMembership(data) {
    const memberships = getMemberships();
    const start = today();
    const end = addMonths(start, data.durationMonths);
    const newMembership = {
        id: generateId(),
        memberId: data.memberId,
        type: data.type || 'gym', // 'gym' or 'gym_pt'
        durationMonths: data.durationMonths,
        basePrice: data.basePrice,
        discountApplied: data.discountApplied || 0,
        finalPrice: data.finalPrice,
        startDate: start,
        endDate: end,
        paymentStatus: data.paymentStatus || 'paid',
        razorpayPaymentId: data.razorpayPaymentId || '',
        isActive: true,
        createdAt: today()
    };
    memberships.push(newMembership);
    DB.set('memberships', memberships);
    return newMembership;
}

function updateMembership(id, updates) {
    const memberships = getMemberships();
    const index = memberships.findIndex(m => m.id === id);
    if (index === -1) return null;
    memberships[index] = { ...memberships[index], ...updates };
    DB.set('memberships', memberships);
    return memberships[index];
}

function renewMembership(id, durationMonths, basePrice, discount = 0) {
    const membership = getMembership(id);
    if (!membership) return null;
    const newEnd = addMonths(membership.endDate, durationMonths);
    const finalPrice = basePrice - discount;
    const updated = updateMembership(id, {
        durationMonths,
        basePrice,
        discountApplied: discount,
        finalPrice,
        endDate: newEnd,
        paymentStatus: 'paid',
        isActive: true
    });
    // Add payment history entry
    addPaymentHistory({
        membershipId: id,
        amount: finalPrice,
        status: 'success',
        razorpayPaymentId: 'manual_' + generateId()
    });
    return updated;
}

function cancelMembership(id) {
    return updateMembership(id, { isActive: false });
}

// ----- Discount Codes -----
function getDiscountCodes() {
    return DB.get('discountCodes') || [];
}

function getDiscountCode(code) {
    return getDiscountCodes().find(d => d.code === code && d.isActive);
}

function validateDiscountCode(code) {
    const discount = getDiscountCode(code);
    if (!discount) return null;
    const now = today();
    if (discount.validUntil && discount.validUntil < now) return null;
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) return null;
    return discount;
}

function useDiscountCode(code) {
    const codes = getDiscountCodes();
    const index = codes.findIndex(d => d.code === code);
    if (index === -1) return null;
    codes[index].usedCount = (codes[index].usedCount || 0) + 1;
    DB.set('discountCodes', codes);
    return codes[index];
}

function createDiscountCode(data) {
    const codes = getDiscountCodes();
    const newCode = {
        id: generateId(),
        code: data.code,
        type: data.type || 'fixed', // fixed or percentage
        value: data.value,
        validUntil: data.validUntil || null,
        usageLimit: data.usageLimit || null,
        usedCount: 0,
        isActive: true,
        createdAt: today()
    };
    codes.push(newCode);
    DB.set('discountCodes', codes);
    return newCode;
}

function toggleDiscountCode(id) {
    const codes = getDiscountCodes();
    const index = codes.findIndex(d => d.id === id);
    if (index === -1) return null;
    codes[index].isActive = !codes[index].isActive;
    DB.set('discountCodes', codes);
    return codes[index];
}

// ----- Payment History -----
function getPaymentHistory() {
    return DB.get('paymentHistory') || [];
}

function addPaymentHistory(data) {
    const history = getPaymentHistory();
    const entry = {
        id: generateId(),
        membershipId: data.membershipId,
        amount: data.amount,
        status: data.status || 'success',
        razorpayPaymentId: data.razorpayPaymentId || '',
        date: today()
    };
    history.push(entry);
    DB.set('paymentHistory', history);
    return entry;
}

// ----- Admin -----
function getAdmins() {
    return DB.get('admins') || [];
}

function addAdmin(data) {
    const admins = getAdmins();
    // Simple password hashing mock (for demo)
    const hashedPassword = btoa(data.password); // not secure, just for demo
    const newAdmin = {
        id: generateId(),
        email: data.email,
        password: hashedPassword,
        name: data.name,
        createdAt: today()
    };
    admins.push(newAdmin);
    DB.set('admins', admins);
    return newAdmin;
}

function verifyAdmin(email, password) {
    const admins = getAdmins();
    const admin = admins.find(a => a.email === email && a.password === btoa(password));
    return admin || null;
}

// ----- Initialize with sample data -----
function initSampleData() {
    if (DB.get('initialized')) return;

    // Sample members
    const members = [
        { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210', address: 'Mumbai' },
        { name: 'Priya Patel', email: 'priya@example.com', phone: '+91 98765 43211', address: 'Delhi' }
    ];
    members.forEach(m => addMember(m));

    // Sample memberships
    const allMembers = getMembers();
    const member1 = allMembers[0];
    const member2 = allMembers[1];
    createMembership({
        memberId: member1.id,
        type: 'gym_pt',
        durationMonths: 3,
        basePrice: 4000,
        discountApplied: 0,
        finalPrice: 4000,
        paymentStatus: 'paid'
    });
    createMembership({
        memberId: member2.id,
        type: 'gym',
        durationMonths: 1,
        basePrice: 1500,
        discountApplied: 200,
        finalPrice: 1300,
        paymentStatus: 'paid'
    });

    // Sample discount code
    createDiscountCode({
        code: 'STUDENT200',
        type: 'fixed',
        value: 200,
        validUntil: '2026-12-31',
        usageLimit: 50
    });

    // Sample admin
    addAdmin({ email: 'admin@elitefitness.com', password: 'admin123', name: 'Admin' });

    DB.set('initialized', true);
}

// Run initialization
initSampleData();

// ----- Export for use in other scripts -----
window.DB = {
    getMembers,
    getMember,
    addMember,
    updateMember,
    deleteMember,
    getMemberships,
    getMembership,
    getMemberMemberships,
    getActiveMemberships,
    getExpiringMemberships,
    getExpiredMemberships,
    createMembership,
    updateMembership,
    renewMembership,
    cancelMembership,
    getDiscountCodes,
    validateDiscountCode,
    useDiscountCode,
    createDiscountCode,
    toggleDiscountCode,
    getPaymentHistory,
    addPaymentHistory,
    getAdmins,
    verifyAdmin
};