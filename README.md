<div align="center">

# 🚗 DriveEase
### Premium Luxury Car Rental Platform

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-4.x-092E20?style=for-the-badge&logo=django&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)

> **Redefining the luxury automotive rental experience** through advanced digital procurement and an elite, hyper-curated fleet of world-class vehicles.

</div>

---

## ✨ Overview

**DriveEase** is a full-stack luxury car rental web application built with Django. It offers a seamless end-to-end rental experience — from browsing a premium vehicle catalog to completing a secure payment and receiving an automated invoice via email.

The platform is built on **Fat Model** architecture, keeping business logic inside model managers rather than views, resulting in clean, maintainable, and scalable code.

---

## 🖼️ Pages & Features

| Page | Route | Description |
|------|-------|-------------|
| 🔐 Auth | `/` | Combined Login & Registration with toggle animation |
| 🚗 Catalog | `/catalog/` | AJAX-powered fleet with multi-filter toolbar |
| 🔍 Car Details | `/catalog/car/<id>/` | Full vehicle specs and pricing |
| 📅 Booking | `/booking/setup/<id>/` | Date picker with live invoice calculator |
| 💳 Payment | `/booking/payment/<id>/` | Credit card form with invoice summary |
| 📋 My Bookings | `/my-bookings/` | Personal reservation dashboard |
| ℹ️ About | `/about/` | Brand story, timeline, and service pillars |

---

## 🛠️ Tech Stack

### Backend
- **Django 4.x** — MVT framework with Fat Model architecture
- **bcrypt** — Secure password hashing for user authentication
- **django-imagekit** — Automatic WebP image processing & optimization
- **Django Sessions** — Stateful authentication without JWT complexity
- **SendGrid SMTP** — Automated HTML invoice email delivery

### Frontend
- **Bootstrap 5.3** — Responsive grid and utility classes
- **Vanilla JS** — AJAX fetch, Intersection Observer, DocumentFragment rendering
- **CSS Custom Properties** — Obsidian & Gold design system
- **Font Awesome 6** — Icon library
- **Inter (Google Fonts)** — Primary typeface

### Database
- **MySQL** — Production-grade relational database for handling high-concurrency rental transactions
- Optimized for secure relational mapping, asset data integrity, and strict transaction locking

---

## 🗄️ Data Models

### `User` — extends `AbstractUser`
```
username · first_name · last_name · email (unique)
phone · role (Client / Admin) · password (bcrypt)
```

### `CarCategory`
```
category_name · daily_rate
```

### `Car`
```
make · model · year · is_available
image (WebP 800×500, quality 85) · car_category (FK)
```

### `Booking`
```
user (FK) · car (FK) · start_date · end_date
delivery_location · special_requests · total_fees
booking_status (Pending / Confirmed / Cancelled)
```

### `Payment` — OneToOne with Booking
```
booking (O2O) · payment_method · amount_paid · payment_date
```

---

## ⚙️ Key Technical Decisions

### Fat Model Architecture
Business logic lives in model managers — not views. Views act as thin routing layers.

```python
# BookingManager automatically calculates fees, locks the car, and creates the record
booking = Booking.objects.create_booking(request.POST, user_id)

# PaymentManager confirms the booking and dispatches the invoice email atomically
Payment.objects.process_invoice(booking, payment_method, amount_paid)
```

### AJAX Catalog with Multi-Filter
The catalog never reloads the page. All filtering happens via `fetch()` calls to `/catalog/filter/` with dynamic query parameters:

```
/catalog/filter/?category_id=2&price_range=premium&sort_by=price_desc
```

Supported filters: **Category · Price Range · Year · Sort Order**

### Image Optimization Pipeline
Car images are automatically processed on upload via `django-imagekit`:
- Resized to **800×500px**
- Converted to **WebP** format
- Compressed at **85% quality**
- Result: ~80KB per image vs. several MB raw

### Intersection Observer — Flip-In Animation
Cards animate into view as the user scrolls, using the native `IntersectionObserver` API with no external libraries:

```javascript
// Cards start hidden (opacity: 0, translateY: 40px)
// .visible class is added when 10% of the card enters the viewport
observer.observe(card);
```

### Automated Invoice Emails
After payment, `PaymentManager.process_invoice()` renders an HTML email template and dispatches it via SendGrid SMTP automatically.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/driveease.git
cd driveease
```

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment variables
Create a `.env` file in the project root:
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
EMAIL_HOST=smtp.sendgrid.net
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
EMAIL_PORT=587
```

### 5. Apply migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create a superuser (Admin access)
```bash
python manage.py createsuperuser
```

### 7. Run the development server
```bash
python manage.py runserver
```

Visit `http://127.0.0.1:8000` to access DriveEase.

---

## 📁 Project Structure

```
driveease/
├── rentals/
│   ├── models/
│   │   ├── user.py          # AbstractUser + bcrypt + UserManager
│   │   ├── car.py           # Car + CarManager + imagekit
│   │   ├── category.py      # CarCategory with daily_rate
│   │   ├── booking.py       # Booking + BookingManager (fee calc)
│   │   └── payment.py       # Payment + PaymentManager (email dispatch)
│   ├── templates/
│   │   ├── auth.html         # Login / Register (toggled)
│   │   ├── catalog.html      # Fleet with filter toolbar
│   │   ├── car_details.html  # Vehicle detail page
│   │   ├── booking.html      # Booking form + live calculator
│   │   ├── payment.html      # Invoice + payment form
│   │   ├── my_bookings.html  # Reservation dashboard
│   │   ├── about.html        # Brand page
│   │   └── emails/
│   │       └── invoice_email.html
│   ├── static/
│   │   └── rentals/
│   │       ├── css/style.css
│   │       └── js/catalog_filter.js
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── media/
│   └── cars/                 # Uploaded & processed vehicle images
├── manage.py
├── requirements.txt
└── README.md
```

---

## 🎨 Design System

DriveEase uses a custom **Obsidian & Gold** design system defined via CSS custom properties:

```css
--obsidian:       #0f0f13   /* Page background    */
--surface:        #141418   /* Cards & navbar     */
--surface-raised: #1a1a22   /* Elevated elements  */
--gold:           #c9a84c   /* Primary accent     */
--gold-light:     #e0bc6a   /* Hover state        */
--text-primary:   #e4e4e8   /* Main text          */
--text-muted:     #44444f   /* Subtle text        */
```

---

## 📋 Requirements

```
Django>=4.0
bcrypt
Pillow
django-imagekit
```

---

## 👤 Author

**Mahmoud Miqdad**
Full-Stack Developer · React.js · Django . ASP.NET Core
[LinkedIn](https://www.linkedin.com/in/mahmoud-miqdad-677486254/)

---

<div align="center">

*DriveEase — Engineering the Perfect Journey*

</div>
