// ============================================================
//  ELITE FITNESS – MAIN JAVASCRIPT
//  Theme Toggle (mobile‑friendly) & interactions
// ============================================================

(function() {
    'use strict';

    // ----- THEME TOGGLE (supports both click & touch) -----
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Load saved theme
    let savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
        savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        localStorage.setItem('theme', savedTheme);
    }
    html.setAttribute('data-theme', savedTheme);

    // Update icon visibility on load
    function updateToggleIcons(theme) {
        const sunIcon = themeToggle ? themeToggle.querySelector('.icon-sun') : null;
        const moonIcon = themeToggle ? themeToggle.querySelector('.icon-moon') : null;
        if (sunIcon && moonIcon) {
            if (theme === 'dark') {
                sunIcon.style.display = 'inline';
                moonIcon.style.display = 'none';
            } else {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'inline';
            }
        }
    }
    updateToggleIcons(savedTheme);

    function toggleTheme(e) {
        // Prevent default for touch events
        if (e) e.preventDefault();
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateToggleIcons(next);
    }

    if (themeToggle) {
        // Add both click and touchstart for mobile
        themeToggle.addEventListener('click', toggleTheme);
        themeToggle.addEventListener('touchstart', toggleTheme, { passive: false });
    }

    // ----- HAMBURGER MENU (mobile) -----
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        // Toggle menu on hamburger click/tap
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('open')) {
                if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('open');
                }
            }
        });

        // Close menu on link click (including admin and star members)
        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }

    // ----- STICKY NAVBAR -----
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ----- BACK TO TOP -----
    const backTop = document.getElementById('backTop');
    if (backTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 400) {
                backTop.classList.add('show');
            } else {
                backTop.classList.remove('show');
            }
        });
        backTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ----- SMOOTH SCROLL for anchor links -----
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 70;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });

    // ----- BMI CALCULATOR -----
    const calcBtn = document.getElementById('calcBmi');
    if (calcBtn) {
        calcBtn.addEventListener('click', function() {
            const h = parseFloat(document.getElementById('bmiHeight').value) / 100;
            const w = parseFloat(document.getElementById('bmiWeight').value);
            const numDiv = document.querySelector('#bmiResult .bmi-number');
            const catDiv = document.getElementById('bmiCategory');
            const sugDiv = document.getElementById('bmiSuggestion');

            if (!h || !w || h <= 0 || w <= 0) {
                numDiv.textContent = '⚠️';
                catDiv.textContent = 'Please enter valid height & weight.';
                sugDiv.textContent = '';
                return;
            }

            const bmi = w / (h * h);
            numDiv.textContent = bmi.toFixed(1);

            let category, suggestion;
            if (bmi < 18.5) {
                category = 'Underweight';
                suggestion = 'Consider a balanced diet with healthy calorie surplus. Consult our nutritionist.';
            } else if (bmi < 25) {
                category = 'Normal';
                suggestion = 'Great! Maintain with regular exercise and a balanced diet.';
            } else if (bmi < 30) {
                category = 'Overweight';
                suggestion = 'Focus on HIIT and strength training. Our trainers can help!';
            } else {
                category = 'Obese';
                suggestion = 'We recommend a personalized plan with diet and PT sessions. Start today!';
            }

            catDiv.textContent = 'Category: ' + category;
            sugDiv.textContent = suggestion;
        });
    }

    // ----- COUNTDOWN TIMER -----
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    function updateCountdown() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff <= 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(d).padStart(2, '0');
        document.getElementById('hours').textContent = String(h).padStart(2, '0');
        document.getElementById('minutes').textContent = String(m).padStart(2, '0');
        document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ----- TESTIMONIAL CAROUSEL (mobile‑friendly) -----
    const track = document.getElementById('testimonialTrack');
    const dots = document.querySelectorAll('#dotsContainer span');

    if (track && dots.length) {
        let currentIndex = 0;
        const totalSlides = dots.length;
        let startX = 0, endX = 0;
        let isDragging = false;

        let autoSlide = setInterval(function() {
            if (!isDragging) {
                goTo((currentIndex + 1) % totalSlides);
            }
        }, 4500);

        function goTo(index) {
            currentIndex = index;
            track.style.transition = 'transform 0.5s ease';
            track.style.transform = 'translateX(-' + index * 100 + '%)';
            dots.forEach(function(d, i) {
                d.classList.toggle('active', i === index);
            });
        }

        dots.forEach(function(d) {
            d.addEventListener('click', function() {
                clearInterval(autoSlide);
                goTo(parseInt(this.dataset.index));
                autoSlide = setInterval(function() {
                    goTo((currentIndex + 1) % totalSlides);
                }, 4500);
            });
        });

        // Touch events for swiping
        track.addEventListener('touchstart', function(e) {
            startX = e.changedTouches[0].screenX;
            isDragging = false;
        }, { passive: true });

        track.addEventListener('touchmove', function(e) {
            isDragging = true;
        }, { passive: true });

        track.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].screenX;
            const diff = startX - endX;
            if (Math.abs(diff) > 40) {
                clearInterval(autoSlide);
                if (diff > 0) {
                    goTo((currentIndex + 1) % totalSlides);
                } else {
                    goTo((currentIndex - 1 + totalSlides) % totalSlides);
                }
                autoSlide = setInterval(function() {
                    goTo((currentIndex + 1) % totalSlides);
                }, 4500);
            }
            isDragging = false;
        }, { passive: true });
    }

    // ----- FAQ ACCORDION -----
    document.querySelectorAll('.faq-question').forEach(function(q) {
        q.addEventListener('click', function() {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(function(el) {
                el.classList.remove('active');
            });
            if (!isActive) item.classList.add('active');
        });
    });

    // ----- CHECKOUT: PLAN SELECTION & SUMMARY -----
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    const selectedPlanName = document.getElementById('selectedPlanName');
    const summaryPlanPrice = document.getElementById('summaryPlanPrice');

    const planData = {
        'Starter': { price: 1500, duration: 1 },
        'Pro': { price: 4000, duration: 3 },
        'Elite': { price: 7500, duration: 6 }
    };

    let currentPlan = 'Pro';
    let currentPrice = 4000;
    let currentDiscount = 0;
    let ptAddonActive = false;

    if (planParam && planData[planParam]) {
        currentPlan = planParam;
        currentPrice = planData[planParam].price;
        if (selectedPlanName) selectedPlanName.textContent = currentPlan;
        if (summaryPlanPrice) summaryPlanPrice.textContent = '₹' + currentPrice.toFixed(2);
    }

    function updateSummary() {
        let total = currentPrice;
        let ptPrice = 0;
        let discount = currentDiscount;

        if (ptAddonActive) {
            ptPrice = 6000;
            total += ptPrice;
        }

        if (discount > 0) {
            total -= discount;
        }

        const gst = total * 0.18;
        const finalTotal = total + gst;

        const ptRow = document.getElementById('ptSummaryRow');
        const ptPriceEl = document.getElementById('summaryPtPrice');
        if (ptRow && ptPriceEl) {
            if (ptAddonActive) {
                ptRow.style.display = 'flex';
                ptPriceEl.textContent = '₹' + ptPrice.toFixed(2);
            } else {
                ptRow.style.display = 'none';
            }
        }

        const discountRow = document.getElementById('discountSummaryRow');
        const discountEl = document.getElementById('summaryDiscount');
        if (discountRow && discountEl) {
            if (discount > 0) {
                discountRow.style.display = 'flex';
                discountEl.textContent = '-₹' + discount.toFixed(2);
            } else {
                discountRow.style.display = 'none';
            }
        }

        if (summaryPlanPrice) summaryPlanPrice.textContent = '₹' + currentPrice.toFixed(2);
        document.getElementById('summaryGst').textContent = '₹' + gst.toFixed(2);
        document.getElementById('summaryTotal').textContent = '₹' + finalTotal.toFixed(2);
    }

    // ----- PT ADDON TOGGLE -----
    const ptCheckbox = document.getElementById('ptAddon');
    if (ptCheckbox) {
        ptCheckbox.addEventListener('change', function() {
            ptAddonActive = this.checked;
            updateSummary();
        });
    }

    // ----- DISCOUNT CODE -----
    const discountInput = document.getElementById('discountCodeInput');
    const applyDiscountBtn = document.getElementById('applyDiscountBtn');
    const discountMessage = document.getElementById('discountMessage');

    if (applyDiscountBtn && discountInput) {
        applyDiscountBtn.addEventListener('click', function() {
            const code = discountInput.value.trim().toUpperCase();

            if (!code) {
                discountMessage.innerHTML = '<span style="color:#ffa502;">⚠️ Please enter a discount code.</span>';
                return;
            }

            const discount = window.DB ? window.DB.validateDiscountCode(code) : null;

            if (code === 'STUDENT200' || (discount && discount.value === 200)) {
                currentDiscount = 200;
                discountMessage.innerHTML = '<span style="color:var(--accent);">✅ Discount applied! ₹200 off.</span>';
                updateSummary();
            } else {
                currentDiscount = 0;
                discountMessage.innerHTML = '<span style="color:#ff4757;">❌ Invalid code. Please try again.</span>';
                updateSummary();
            }
        });
    }

    // ----- PAYMENT BUTTON -----
    const proceedBtn = document.getElementById('proceedPaymentBtn');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', function() {
            const total = document.getElementById('summaryTotal').textContent;
            alert('Payment of ' + total + ' processed successfully! (Demo)');
        });
    }

    // ----- PLAN BUTTONS (from membership cards) -----
    document.querySelectorAll('.format-card .btn-primary').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.format-card');
            const planName = card.querySelector('h3').textContent;
            const price = parseFloat(card.querySelector('.price').textContent.replace(/[₹,]/g, ''));
            currentPlan = planName;
            currentPrice = price;
            if (selectedPlanName) selectedPlanName.textContent = planName;
            document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
            updateSummary();
        });
    });

    // Initial summary update
    updateSummary();

})();