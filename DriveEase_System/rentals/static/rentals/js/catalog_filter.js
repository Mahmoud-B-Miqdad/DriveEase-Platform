/**
 * DriveEase — Premium Fleet Catalog Filter & Dynamic Grid
 * Manages AJAX fetch cycles to display vehicles filtered by categories asynchronously.
 */
document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('cars-container');
    const buttons   = document.querySelectorAll('.btn-filter');

    if (!container || buttons.length === 0) {
        return; // Safe exit if DOM components are absent
    }

    const resultsCount = document.getElementById('results-count');

    // Set loading spinner state
    function setLoading() {
        if (resultsCount) resultsCount.textContent = '';
        container.innerHTML = `
            <div class="col-12 state-loading">
                <i class="fa-solid fa-spinner spinner-icon"></i>
                <p>Loading luxury fleet...</p>
            </div>`;
    }

function renderCars(cars) {
    if (!cars || cars.length === 0) {
        if (resultsCount) resultsCount.textContent = '';
        container.innerHTML = `
            <div class="col-12 state-empty">
                <i class="fa-solid fa-car-tunnel empty-icon"></i>
                <p>No vehicles available in this category.</p>
            </div>`;
        return;
    }

    if (resultsCount) {
        resultsCount.textContent = `${cars.length} vehicle${cars.length !== 1 ? 's' : ''} found`;
    }

    // ← DocumentFragment بدل innerHTML مباشرة
    const fragment = document.createDocumentFragment();

    cars.forEach(car => {
        const imageBlock = car.image_url
            ? `<img
                   src="${car.image_url}"
                   alt="${car.make} ${car.model}"
                   class="car-card-img"
                   loading="lazy"
               >`
            : `<div class="car-card-img-fallback">
                   <i class="fa-solid fa-car-side car-card-img-icon"></i>
               </div>`;

        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="car-card h-100">
                <div class="car-card-image">
                    ${imageBlock}
                </div>
                <div class="car-card-body">
                    <span class="car-category-badge">
                        <i class="fa-solid fa-tag"></i>${car.category}
                    </span>
                    <h5 class="car-title">${car.make} ${car.model}</h5>
                    <p class="car-year">Model Year &middot; ${car.year}</p>
                    <div class="car-specs-row">
                        <span class="car-spec-chip"><i class="fa-solid fa-gas-pump"></i>Fuel</span>
                        <span class="car-spec-chip"><i class="fa-solid fa-gears"></i>Auto</span>
                        <span class="car-spec-chip"><i class="fa-solid fa-user-group"></i>5 Seats</span>
                    </div>
                    <div class="car-card-footer">
                        <div class="car-price">
                            $${car.rate}<span class="price-unit">/day</span>
                        </div>
                        <a href="/catalog/car/${car.id}/" class="btn-book">
                            View Details <i class="fa-solid fa-circle-info"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
        fragment.appendChild(col);
    });

    // مسح القديم وإضافة الجديد دفعة واحدة
    container.innerHTML = '';
    container.appendChild(fragment);
}

    // Fetch and sync data with backend views API endpoint
    function fetchCars(categoryId = 'all') {
        setLoading();
        fetch(`/catalog/filter/?category_id=${categoryId}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response failure');
                return response.json();
            })
            .then(data => renderCars(data.cars))
            .catch(() => {
                container.innerHTML = `
                    <div class="col-12 state-empty">
                        <i class="fa-solid fa-triangle-exclamation empty-icon"></i>
                        <p>Something went wrong. Please try again.</p>
                    </div>`;
            });
    }

    // Initialize: load all vehicles on start
    fetchCars('all');

    // Attach click events handlers to filters layout buttons
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            fetchCars(this.dataset.category);
        });
    });
});

/**
 * DriveEase — Premium Fleet Catalog Filter & Dynamic Grid
 * Manages AJAX fetch cycles to display vehicles filtered by categories asynchronously.
 */
document.addEventListener("DOMContentLoaded", function () {
    const container    = document.getElementById('cars-container');
    const buttons      = document.querySelectorAll('.btn-filter');
    const resultsCount = document.getElementById('results-count');

    if (!container || buttons.length === 0) return;

    function observeCards() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,  
            rootMargin: '0px 0px -30px 0px' 
        });

        document.querySelectorAll('.car-card').forEach(card => {
            observer.observe(card);
        });
    }

    // Set loading spinner state
function setLoading() {
    if (resultsCount) resultsCount.textContent = '';

    const skeletons = Array.from({ length: 6 }, () => `
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

    container.innerHTML = skeletons;
}

    // Render vehicle cards grid dynamically
    function renderCars(cars) {
        if (!cars || cars.length === 0) {
            if (resultsCount) resultsCount.textContent = '';
            container.innerHTML = `
                <div class="col-12 state-empty">
                    <i class="fa-solid fa-car-tunnel empty-icon"></i>
                    <p>No vehicles available in this category.</p>
                </div>`;
            return;
        }

        if (resultsCount) {
            resultsCount.textContent = `${cars.length} vehicle${cars.length !== 1 ? 's' : ''} found`;
        }

        const fragment = document.createDocumentFragment();

        cars.forEach(car => {
            const imageBlock = car.image_url
                ? `<img
                       src="${car.image_url}"
                       alt="${car.make} ${car.model}"
                       class="car-card-img"
                       loading="lazy"
                   >`
                : `<div class="car-card-img-fallback">
                       <i class="fa-solid fa-car-side car-card-img-icon"></i>
                   </div>`;

            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
                <div class="car-card h-100">
                    <div class="car-card-image">
                        ${imageBlock}
                    </div>
                    <div class="car-card-body">
                        <span class="car-category-badge">
                            <i class="fa-solid fa-tag"></i>${car.category}
                        </span>
                        <h5 class="car-title">${car.make} ${car.model}</h5>
                        <p class="car-year">Model Year &middot; ${car.year}</p>
                        <div class="car-specs-row">
                            <span class="car-spec-chip"><i class="fa-solid fa-gas-pump"></i>Fuel</span>
                            <span class="car-spec-chip"><i class="fa-solid fa-gears"></i>Auto</span>
                            <span class="car-spec-chip"><i class="fa-solid fa-user-group"></i>5 Seats</span>
                        </div>
                        <div class="car-card-footer">
                            <div class="car-price">
                                $${car.rate}<span class="price-unit">/day</span>
                            </div>
                            <a href="/catalog/car/${car.id}/" class="btn-book">
                                View Details <i class="fa-solid fa-circle-info"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            fragment.appendChild(col);
        });

        container.innerHTML = '';
        container.appendChild(fragment);

        observeCards();
    }

    // Fetch and sync data with backend
    function fetchCars(categoryId = 'all') {
        setLoading();
        fetch(`/catalog/filter/?category_id=${categoryId}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response failure');
                return response.json();
            })
            .then(data => renderCars(data.cars))
            .catch(() => {
                container.innerHTML = `
                    <div class="col-12 state-empty">
                        <i class="fa-solid fa-triangle-exclamation empty-icon"></i>
                        <p>Something went wrong. Please try again.</p>
                    </div>`;
            });
    }

    // Initialize
    fetchCars('all');

    // Filter buttons
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            fetchCars(this.dataset.category);
        });
    });
});