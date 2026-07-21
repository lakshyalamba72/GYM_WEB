// ============================================================
//  ELITE FITNESS – STAR MEMBERS JAVASCRIPT
//  Toggle workout split visibility
// ============================================================

document.querySelectorAll('.toggle-split').forEach(function(btn) {
    btn.addEventListener('click', function() {
        const member = this.dataset.member;
        const split = document.getElementById('split-' + member);
        if (split.style.display === 'none') {
            split.style.display = 'block';
            this.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Split';
        } else {
            split.style.display = 'none';
            this.innerHTML = '<i class="fas fa-eye"></i> View Split';
        }
    });
});