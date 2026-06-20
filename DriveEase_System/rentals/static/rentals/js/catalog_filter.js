/**
 * DriveEase — Advanced Multi-Filter Catalog
 * Supports: category, price_range, year, sort_by
 * UI: Dropdown toolbar + active tags + skeleton loading + flip-in animation
 */
document.addEventListener("DOMContentLoaded", function () {
    const container  = document.getElementById('cars-container');
    const resetBtn   = document.getElementById('reset-filters');
    const activeTags = document.getElementById('active-tags');
    const resultsEl  = document.getElementById('results-count');

    if (!container) return;

    // ── Filter State
    const activeFilters = {
        category:    { value: 'all',     label: 'All' },
        price_range: { value: '',        label: 'Any' },
        year:        { value: 'all',     label: 'All' },
        sort_by:     { value: 'default', label: 'Default' },
    };

    const defaults = {
        category:    { value: 'all',     label: 'All' },
        price_range: { value: '',        label: 'Any' },
        year:        { value: 'all',     label: 'All' },
        sort_by:     { value: 'default', label: 'Default' },
    };

    // ── Dropdown Toggle
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const filterKey = this.id.replace('btn-', '');
            const panel     = document.getElementById('panel-' + filterKey);
            const chevron   = this.querySelector('.filter-chevron');
            const isOpen    = panel.classList.contains('open');

            closeAllDropdowns();

            if (!isOpen) {
                panel.classList.add('open');
                chevron.style.transform = 'rotate(180deg)';
            }
        });
    });

    // ── Close all dropdowns
    function closeAllDropdowns() {
        document.querySelectorAll('.drop-panel').forEach(p => p.classList.remove('open'));
        document.querySelectorAll('.filter-chevron').forEach(c => c.style.transform = '');
    }

    document.addEventListener('click', closeAllDropdowns);
    document.querySelectorAll('.drop-panel').forEach(p => {
        p.addEventListener('click', e => e.stopPropagation());
    });

    // ── Option Click
    document.querySelectorAll('.drop-option').forEach(opt => {
        opt.addEventListener('click', function () {
            const filterKey = this.dataset.filter;
            const value     = this.dataset.value;
            const label     = this.dataset.label;

            // Update selected state
            this.closest('.drop-panel')
                .querySelectorAll('.drop-option')
                .forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');

            // Update button label
            document.getElementById('sel-' + filterKey).textContent = label;

            // Toggle gold style on button
            const btn = document.getElementById('btn-' + filterKey);
            const isDefault =
                value === defaults[filterKey].value;
            btn.classList.toggle('has-value', !isDefault);

            // Update state
            activeFilters[filterKey] = { value, label };

            closeAllDropdowns();
            updateActiveTags();
            fetchCars();
        });
    });

    // ── Active Tags
    function updateActiveTags() {
        if (!activeTags) return;

        const tags = [];

        Object.entries(activeFilters).forEach(([key, { value, label }]) => {
            if (value === defaults[key].value) return;
            if (key === 'sort_by') return; // sort ما نعرضه كـ tag

            tags.push(`
                <div class="active-tag">
                    ${label}
                    <button data-key="${key}" title="Remove filter">×</button>
                </div>
            `);
        });

        activeTags.innerHTML = tags.join('');

        // Remove individual tag
        activeTags.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', function () {
                const key = this.dataset.key;
                resetFilter(key);
            });
        });

        // Show/hide reset button
        const hasActive = Object.entries(activeFilters)
            .some(([key, { value }]) => value !== defaults[key].value);
        if (resetBtn) resetBtn.classList.toggle('visible', hasActive);
    }

    // ── Reset single filter
    function resetFilter(key) {
        activeFilters[key] = { ...defaults[key] };

        // Update button UI
        document.getElementById('sel-' + key).textContent = defaults[key].label;
        document.getElementById('btn-' + key).classList.remove('has-value');

        // Update selected option
        const panel = document.getElementById('panel-' + key);
        panel.querySelectorAll('.drop-option').forEach(opt => {
            opt.classList.toggle(
                'selected',
                opt.dataset.value === defaults[key].value
            );
        });

        updateActiveTags();
        fetchCars();
    }

    // ── Reset All
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            Object.keys(activeFilters).forEach(key => resetFilter(key));
        });
    }

    // ── Intersection Observer: Flip-In
    function observeCards() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

        document.querySelectorAll('.car-card').forEach(card => {
            observer.observe(card);
        });
    }

    // ── Skeleton Loading
    function setLoading() {
        if (resultsEl) resultsEl.innerHTML = '';
        container.innerHTML = Array.from({ length: 6 }, () => `
            <div class="col">
                <div class="skeleton-card">
                    <div class="skeleton skeleton-img"></div>
                    <div class="skeleton-body">
                        <div class="skeleton skeleton-badge"></div>
                        <div class="skeleton skeleton-title"></div>
                        <div class="skeleton skeleton-year"></div>
                        <div class="skeleton skeleton-footer"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ── Render Cars
    function renderCars(cars) {
        if (!cars || cars.length === 0) {
            if (resultsEl) resultsEl.innerHTML = '';
            container.innerHTML = `
                <div class="col-12 state-empty">
                    <i class="fa-solid fa-car-tunnel empty-icon"></i>
                    <p>No vehicles match your selected filters.</p>
                </div>`;
            return;
        }

        if (resultsEl) {
            resultsEl.innerHTML =
                `Showing <strong>${cars.length} vehicle${cars.length !== 1 ? 's' : ''}</strong>`;
        }

        const fragment = document.createDocumentFragment();

        cars.forEach(car => {
            const imageBlock = car.image_url
                ? `<img src="${car.image_url}"
                        alt="${car.make} ${car.model}"
                        class="car-card-img"
                        loading="lazy">`
                : `<div class="car-card-img-fallback">
                       <i class="fa-solid fa-car-side car-card-img-icon"></i>
                   </div>`;

            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
                <div class="car-card h-100">
                    <div class="car-card-image">${imageBlock}</div>
                    <div class="car-card-body">
                        <span class="car-category-badge">
                            <i class="fa-solid fa-tag"></i>${car.category}
                        </span>
                        <h5 class="car-title">${car.make} ${car.model}</h5>
                        <p class="car-year">Model Year &middot; ${car.year}</p>
                        <div class="car-specs-row">
                            <span class="car-spec-chip">
                                <i class="fa-solid fa-gas-pump"></i>Fuel
                            </span>
                            <span class="car-spec-chip">
                                <i class="fa-solid fa-gears"></i>Auto
                            </span>
                            <span class="car-spec-chip">
                                <i class="fa-solid fa-user-group"></i>5 Seats
                            </span>
                        </div>
                        <div class="car-card-footer">
                            <div class="car-price">
                                $${car.rate}<span class="price-unit">/day</span>
                            </div>
                            <a href="/catalog/car/${car.id}/" class="btn-book">
                                View Details
                                <i class="fa-solid fa-circle-info"></i>
                            </a>
                        </div>
                    </div>
                </div>`;
            fragment.appendChild(col);
        });

        container.innerHTML = '';
        container.appendChild(fragment);
        observeCards();
    }

    // ── Fetch
    function fetchCars() {
        setLoading();

        const params = new URLSearchParams();
        if (activeFilters.category.value    !== 'all')     params.set('category_id',  activeFilters.category.value);
        if (activeFilters.price_range.value !== '')        params.set('price_range',  activeFilters.price_range.value);
        if (activeFilters.year.value        !== 'all')     params.set('year',         activeFilters.year.value);
        if (activeFilters.sort_by.value     !== 'default') params.set('sort_by',      activeFilters.sort_by.value);

        fetch(`/catalog/filter/?${params.toString()}`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => renderCars(data.cars))
            .catch(() => {
                container.innerHTML = `
                    <div class="col-12 state-empty">
                        <i class="fa-solid fa-triangle-exclamation empty-icon"></i>
                        <p>Something went wrong. Please try again.</p>
                    </div>`;
            });
    }

    // ── Initialize
    fetchCars();
});