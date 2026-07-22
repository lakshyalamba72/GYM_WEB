// ============================================================
//  ELITE FITNESS – MAIN JAVASCRIPT
//  Theme, Nav, Interactions, BMI, Countdown, Carousel, FAQ
//  + Login‑state aware nav link
// ============================================================

(function() {
    'use strict';

    // ----- THEME TOGGLE (supports click & touch) -----
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

    // ----- INTERSECTION OBSERVER (Fade-in + Counters) -----
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                const nums = entry.target.querySelectorAll('.num[data-target]');
                nums.forEach(function(num) {
                    const target = parseFloat(num.dataset.target);
                    if (!num.dataset.counted) {
                        num.dataset.counted = 'true';
                        animateCounter(num, target);
                    }
                });
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(function(sec) {
        observer.observe(sec);
    });

    function animateCounter(el, target) {
        const isFloat = target % 1 !== 0;
        let current = 0;
        const increment = target / 40;
        const timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
        }, 20);
    }

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

    // ----- COUNTDOWN TIMER (30 days from now) -----
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

    // ----- PARALLAX HERO (Desktop only) -----
    if (window.innerWidth > 768) {
        const hero = document.querySelector('.hero');
        if (hero) {
            window.addEventListener('scroll', function() {
                const scrolled = window.scrollY;
                hero.style.backgroundPositionY = scrolled * 0.3 + 'px';
            }, { passive: true });
        }
    }

    // ============================================================
    //  NEW: UPDATE LOGIN BUTTON BASED ON SESSION
    // ============================================================
    const memberLink = document.querySelector('.nav-cta');
    if (memberLink) {
        const session = sessionStorage.getItem('eliteMemberSession');
        if (session) {
            try {
                const member = JSON.parse(session);
                // Show the member's name or "My Dashboard"
                // Use name if available, else fallback
                const displayName = member.name ? member.name : 'My Dashboard';
                memberLink.textContent = displayName;
                // Keep the href pointing to dashboard.html
                // If you want to change the link to something else, you can set it here.
                // memberLink.href = 'dashboard.html'; // already set
            } catch (e) {
                // If session is invalid, keep as Login
                memberLink.textContent = 'Login';
            }
        } else {
            memberLink.textContent = 'Login';
        }
    }

})();