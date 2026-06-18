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

    // Set loading spinner state
    function setLoading() {
        container.innerHTML = `
            <div class="col-12 state-loading">
                <i class="fa-solid fa-spinner spinner-icon"></i>
                <p>Loading luxury fleet...</p>
            </div>`;
    }

    // Render vehicle cards grid dynamically
    function renderCars(cars) {
        if (!cars || cars.length === 0) {
            container.innerHTML = `
                <div class="col-12 state-empty">
                    <i class="fa-solid fa-car-tunnel empty-icon"></i>
                    <p>No vehicles available in this category.</p>
                </div>`;
            return;
        }

        container.innerHTML = cars.map(car => `
            <div class="col">
                <div class="car-card h-100">
                    <div class="car-card-body">
                        <span class="car-category-badge">${car.category}</span>
                        <h5 class="car-title">${car.make} ${car.model}</h5>
                        <p class="car-year">Model Year: ${car.year}</p>
                        <div class="car-card-footer">
                            <div class="car-price">
                                $${car.rate}<span class="price-unit">/day</span>
                            </div>
                            <a href="/booking/setup/${car.id}/" class="btn btn-premium btn-sm px-3">Book Now</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
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