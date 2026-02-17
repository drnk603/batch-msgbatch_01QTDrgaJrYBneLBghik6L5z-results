(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var app = window.__app;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() { inThrottle = false; }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInit) return;
    app.burgerInit = true;

    var toggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
    var navCollapse = document.querySelector('.navbar-collapse');
    var body = document.body;

    if (!toggle || !navCollapse) return;

    var navLinks = navCollapse.querySelectorAll('.nav-link');

    function openMenu() {
      navCollapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      
      setTimeout(function() {
        var firstLink = navCollapse.querySelector('.nav-link');
        if (firstLink) firstLink.focus();
      }, 100);
    }

    function closeMenu() {
      navCollapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
      toggle.focus();
    }

    function isOpen() {
      return navCollapse.classList.contains('show');
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (isOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen() && !navCollapse.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (isOpen()) {
          closeMenu();
        }
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && isOpen()) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initSmoothScroll() {
    if (app.smoothScrollInit) return;
    app.smoothScrollInit = true;

    function getHeaderHeight() {
      var header = document.querySelector('.l-header');
      return header ? header.offsetHeight : 80;
    }

    function smoothScrollTo(target) {
      var headerHeight = getHeaderHeight();
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo(0, targetPosition);
      }
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (target && target.tagName === 'A') {
        var href = target.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          var sectionId = href.substring(1);
          var section = document.getElementById(sectionId);
          if (section) {
            e.preventDefault();
            smoothScrollTo(section);
            if (window.history && window.history.pushState) {
              window.history.pushState(null, null, href);
            }
          }
        }
      }
    });
  }

  function initScrollSpy() {
    if (app.scrollSpyInit) return;
    app.scrollSpyInit = true;

    var navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (navLinks.length === 0) return;

    var sections = [];
    for (var i = 0; i < navLinks.length; i++) {
      var href = navLinks[i].getAttribute('href');
      if (href && href.length > 1) {
        var section = document.querySelector(href);
        if (section) {
          sections.push({ link: navLinks[i], section: section });
        }
      }
    }

    if (sections.length === 0) return;

    function updateActiveLink() {
      var scrollPos = window.pageYOffset + 100;
      
      for (var i = sections.length - 1; i >= 0; i--) {
        var item = sections[i];
        if (item.section.offsetTop <= scrollPos) {
          for (var j = 0; j < navLinks.length; j++) {
            navLinks[j].classList.remove('active');
            navLinks[j].removeAttribute('aria-current');
          }
          item.link.classList.add('active');
          item.link.setAttribute('aria-current', 'page');
          break;
        }
      }
    }

    window.addEventListener('scroll', throttle(updateActiveLink, 100), { passive: true });
    updateActiveLink();
  }

  function initActiveMenu() {
    if (app.activeMenuInit) return;
    app.activeMenuInit = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav-link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');
      
      if (!linkPath || linkPath.startsWith('#')) continue;

      var isMatch = false;

      if (linkPath === '/' || linkPath === '/index.html') {
        if (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html')) {
          isMatch = true;
        }
      } else if (linkPath.startsWith('/')) {
        if (currentPath === linkPath || currentPath.endsWith(linkPath)) {
          isMatch = true;
        }
      }

      if (isMatch) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    }
  }

  function initImages() {
    if (app.imagesInit) return;
    app.imagesInit = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.hasAttribute('loading')) {
        var isCritical = img.classList.contains('c-logo__img') || img.hasAttribute('data-critical');
        if (!isCritical) {
          img.setAttribute('loading', 'lazy');
        }
      }

      img.addEventListener('error', function(e) {
        var failedImg = e.target;
        failedImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e9ecef"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%236c757d"%3EImage%3C/text%3E%3C/svg%3E';
      });
    }
  }

  function initForms() {
    if (app.formsInit) return;
    app.formsInit = true;

    var forms = document.querySelectorAll('.needs-validation, .c-form');

    function createNotification(message, type) {
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('style', 'position:fixed;top:20px;right:20px;z-index:9999;min-width:250px;max-width:350px;');
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'alert alert-' + type + ' alert-dismissible fade show';
      toast.setAttribute('role', 'alert');
      toast.setAttribute('style', 'margin-bottom:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1);');
      toast.innerHTML = message + '<button type="button" class="btn-close" onclick="this.parentElement.remove()" aria-label="Close">&times;</button>';
      container.appendChild(toast);

      setTimeout(function() {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 5000);
    }

    function validateField(field) {
      var value = field.value.trim();
      var type = field.type;
      var name = field.name || field.id;
      var errorMsg = '';

      if (field.hasAttribute('required') && !value) {
        errorMsg = 'Šis lauks ir obligāts';
      } else if (type === 'email' && value) {
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          errorMsg = 'Lūdzu, ievadiet derīgu e-pasta adresi';
        }
      } else if (type === 'tel' && value) {
        var phonePattern = /^[\+\d\s\(\)\-]{8,20}$/;
        if (!phonePattern.test(value)) {
          errorMsg = 'Lūdzu, ievadiet derīgu tālruņa numuru';
        }
      } else if (field.tagName === 'TEXTAREA' && value && value.length < 10) {
        errorMsg = 'Ziņojumam jābūt vismaz 10 rakstzīmēm';
      } else if (type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
        errorMsg = 'Jums jāpiekrīt, lai turpinātu';
      }

      var feedbackEl = field.parentElement.querySelector('.invalid-feedback');
      if (!feedbackEl) {
        feedbackEl = document.createElement('div');
        feedbackEl.className = 'invalid-feedback';
        field.parentElement.appendChild(feedbackEl);
      }

      if (errorMsg) {
        field.classList.add('is-invalid');
        feedbackEl.textContent = errorMsg;
        feedbackEl.style.display = 'block';
        return false;
      } else {
        field.classList.remove('is-invalid');
        feedbackEl.style.display = 'none';
        return true;
      }
    }

    for (var i = 0; i < forms.length; i++) {
      (function(form) {
        var fields = form.querySelectorAll('input, textarea, select');
        
        for (var j = 0; j < fields.length; j++) {
          fields[j].addEventListener('blur', function() {
            validateField(this);
          });
        }

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          e.stopPropagation();

          var allValid = true;
          var formFields = form.querySelectorAll('input, textarea, select');
          
          for (var k = 0; k < formFields.length; k++) {
            if (!validateField(formFields[k])) {
              allValid = false;
            }
          }

          if (!allValid) {
            createNotification('Lūdzu, aizpildiet visus obligātos laukus pareizi', 'danger');
            return false;
          }

          var submitBtn = form.querySelector('button[type="submit"]');
          var originalText = submitBtn ? submitBtn.innerHTML : '';

          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Nosūta...';
          }

          setTimeout(function() {
            createNotification('Paldies! Jūsu pieprasījums ir nosūtīts veiksmīgi.', 'success');
            
            setTimeout(function() {
              window.location.href = '/thank_you.html';
            }, 1500);
          }, 1000);

          return false;
        });
      })(forms[i]);
    }
  }

  function initScrollToTop() {
    if (app.scrollToTopInit) return;
    app.scrollToTopInit = true;

    var btn = document.querySelector('[data-scroll-top], .scroll-to-top');
    if (!btn) return;

    function toggleButton() {
      if (window.pageYOffset > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', throttle(toggleButton, 200), { passive: true });
    toggleButton();
  }

  function initModals() {
    if (app.modalsInit) return;
    app.modalsInit = true;

    var modalTriggers = document.querySelectorAll('[data-bs-toggle="modal"]');
    
    for (var i = 0; i < modalTriggers.length; i++) {
      modalTriggers[i].addEventListener('click', function(e) {
        e.preventDefault();
        var targetId = this.getAttribute('data-bs-target');
        var modal = document.querySelector(targetId);
        if (modal) {
          modal.classList.add('show');
          modal.style.display = 'block';
          document.body.classList.add('modal-open');
          
          var backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop fade show';
          document.body.appendChild(backdrop);
        }
      });
    }

    var closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
    for (var j = 0; j < closeButtons.length; j++) {
      closeButtons[j].addEventListener('click', function() {
        var modal = this.closest('.modal');
        if (modal) {
          modal.classList.remove('show');
          modal.style.display = 'none';
          document.body.classList.remove('modal-open');
          
          var backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
        }
      });
    }
  }

  function initAccordions() {
    if (app.accordionsInit) return;
    app.accordionsInit = true;

    var accordionButtons = document.querySelectorAll('.accordion-button');
    
    for (var i = 0; i < accordionButtons.length; i++) {
      accordionButtons[i].addEventListener('click', function() {
        var target = this.getAttribute('data-bs-target') || this.getAttribute('aria-controls');
        if (!target) return;
        
        var targetId = target.startsWith('#') ? target.substring(1) : target;
        var collapse = document.getElementById(targetId);
        if (!collapse) return;

        var isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
          this.setAttribute('aria-expanded', 'false');
          collapse.classList.remove('show');
        } else {
          this.setAttribute('aria-expanded', 'true');
          collapse.classList.add('show');
        }
      });
    }
  }

  function initPortfolioFilter() {
    if (app.portfolioFilterInit) return;
    app.portfolioFilterInit = true;

    var filterButtons = document.querySelectorAll('[data-filter]');
    if (filterButtons.length === 0) return;

    for (var i = 0; i < filterButtons.length; i++) {
      filterButtons[i].addEventListener('click', function() {
        var filter = this.getAttribute('data-filter');
        
        for (var j = 0; j < filterButtons.length; j++) {
          filterButtons[j].classList.remove('is-active');
        }
        this.classList.add('is-active');

        var items = document.querySelectorAll('[data-category]');
        for (var k = 0; k < items.length; k++) {
          var item = items[k];
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        }
      });
    }
  }

  function initCountUp() {
    if (app.countUpInit) return;
    app.countUpInit = true;

    var stats = document.querySelectorAll('[data-count]');
    if (stats.length === 0) return;

    function animateCount(element) {
      if (element.classList.contains('counted')) return;
      
      var target = parseInt(element.getAttribute('data-count'));
      var duration = 2000;
      var start = 0;
      var increment = target / (duration / 16);
      
      function updateCount() {
        start += increment;
        if (start < target) {
          element.textContent = Math.floor(start);
          requestAnimationFrame(updateCount);
        } else {
          element.textContent = target;
          element.classList.add('counted');
        }
      }
      
      updateCount();
    }

    var observer = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          animateCount(entries[i].target);
        }
      }
    }, { threshold: 0.5 });

    for (var i = 0; i < stats.length; i++) {
      observer.observe(stats[i]);
    }
  }

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initImages();
    initForms();
    initScrollToTop();
    initModals();
    initAccordions();
    initPortfolioFilter();
    initCountUp();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();
