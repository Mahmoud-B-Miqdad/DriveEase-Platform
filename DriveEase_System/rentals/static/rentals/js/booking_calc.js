/**
 * DriveEase — Live Booking Dynamic Invoice Calculator
 * Listens to date selection changes and computes real-time pricing statements.
 */
document.addEventListener("DOMContentLoaded", function () {
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    const durationSpan = document.getElementById('duration_days');
    const totalSpan = document.getElementById('total_price');
    const dailyRateElement = document.getElementById('daily_rate');

    if (!startDateInput || !endDateInput || !durationSpan || !totalSpan || !dailyRateElement) {
        return; // Safe exit if elements are missing from DOM
    }

    const dailyRateText = dailyRateElement.innerText;
    const dailyRate = parseFloat(dailyRateText.replace(/[^0-9.]/g, '')) || 0;

    function calculateTotal() {
        if (!startDateInput.value || !endDateInput.value) {
            durationSpan.innerText = "0";
            totalSpan.innerText = "0";
            return;
        }

        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);

        if (end >= start) {
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; 
            
            durationSpan.innerText = diffDays;
            totalSpan.innerText = (diffDays * dailyRate).toLocaleString();
        } else {
            durationSpan.innerText = "0";
            totalSpan.innerText = "0";
        }
    }

    startDateInput.addEventListener('change', calculateTotal);
    endDateInput.addEventListener('change', calculateTotal);
});