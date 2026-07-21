/* ============================================
   ELITE FITNESS – MAIN JAVASCRIPT
   All Interactivity | iOS-Compatible
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
//  MAIN APPLICATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {

    // ---- HAMBURGER ----
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('navLinks');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('open');
            this.setAttribute('aria-expanded', navLinks.classList.contains('open'));
        });

        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ---- STICKY NAVBAR & BACK TOP ----
    var navbar = document.getElementById('navbar');
    var backTop = document.getElementById('backTop');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');

        if (window.scrollY > 400) backTop.classList.add('show');
        else backTop.classList.remove('show');
    });

    backTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---- INTERSECTION OBSERVER ----
    var sections = document.querySelectorAll('section');

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                var nums = entry.target.querySelectorAll('.num[data-target]');
                nums.forEach(function(num) {
                    var target = parseFloat(num.dataset.target);
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
        var isFloat = target % 1 !== 0;
        var current = 0;
        var increment = target / 40;
        var timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
        }, 20);
    }

    // ---- BMI CALCULATOR ----
    document.getElementById('calcBmi').addEventListener('click', function() {
        var h = parseFloat(document.getElementById('bmiHeight').value) / 100;
        var w = parseFloat(document.getElementById('bmiWeight').value);
        var numDiv = document.querySelector('#bmiResult .bmi-number');
        var catDiv = document.getElementById('bmiCategory');
        var sugDiv = document.getElementById('bmiSuggestion');

        if (!h || !w || h <= 0 || w <= 0) {
            numDiv.textContent = '⚠️';
            catDiv.textContent = 'Please enter valid height & weight.';
            sugDiv.textContent = '';
            return;
        }

        var bmi = w / (h * h);
        numDiv.textContent = bmi.toFixed(1);

        var category, suggestion;
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

    // ---- TESTIMONIAL CAROUSEL ----
    var track = document.getElementById('testimonialTrack');
    var dots = document.querySelectorAll('#dotsContainer span');
    var currentIndex = 0;
    var totalSlides = dots.length;
    var startX = 0, endX = 0;

    var autoSlide = setInterval(function() {
        goTo((currentIndex + 1) % totalSlides);
    }, 4500);

    function goTo(index) {
        currentIndex = index;
        track.style.transform = 'translateX(-' + index * 100 + '%)';
        dots.forEach(function(d, i) {
            d.classList.toggle('active', i === index);
        });
    }

    dots.forEach(function(d) {
        d.addEventListener('click', function() {
            clearInterval(autoSlide);
            goTo(parseInt(this.dataset.index));
        });
    });

    if (track) {
        track.addEventListener('touchstart', function(e) {
            startX = e.changedTouches[0].screenX;
        });
        track.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].screenX;
            var diff = startX - endX;
            if (Math.abs(diff) > 40) {
                clearInterval(autoSlide);
                if (diff > 0) goTo((currentIndex + 1) % totalSlides);
                else goTo((currentIndex - 1 + totalSlides) % totalSlides);
            }
        });
    }

    // ---- FAQ ACCORDION ----
    document.querySelectorAll('.faq-question').forEach(function(q) {
        q.addEventListener('click', function() {
            var item = this.parentElement;
            var isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(function(el) {
                el.classList.remove('active');
            });
            if (!isActive) item.classList.add('active');
        });
    });

    // ---- COUNTDOWN ----
    var targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    function updateCountdown() {
        var now = new Date().getTime();
        var diff = targetDate - now;

        if (diff <= 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }

        var d = Math.floor(diff / (1000 * 60 * 60 * 24));
        var h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(d).padStart(2, '0');
        document.getElementById('hours').textContent = String(h).padStart(2, '0');
        document.getElementById('minutes').textContent = String(m).padStart(2, '0');
        document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ---- PAYMENT METHOD TOGGLE ----
    document.querySelectorAll('.payment-methods button').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.payment-methods button').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // ---- PARALLAX HERO ----
    if (window.innerWidth > 768) {
        var hero = document.querySelector('.hero');
        window.addEventListener('scroll', function() {
            var scrolled = window.scrollY;
            if (hero) hero.style.backgroundPositionY = scrolled * 0.3 + 'px';
        }, { passive: true });
    }

});