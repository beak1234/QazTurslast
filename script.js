// script.js

// Функция для получения пользователей из localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Функция для сохранения пользователей в localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Функция для получения мест из localStorage
function getPlaces() {
    return JSON.parse(localStorage.getItem('places') || '[]');
}

// Функция для сохранения мест в localStorage
function savePlaces(places) {
    localStorage.setItem('places', JSON.stringify(places));
}

// Функция для получения бронирований из localStorage
function getBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
}

// Функция для сохранения бронирований в localStorage
function saveBookings(bookings) {
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// Регистрация
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const users = getUsers();
        users.push({ username, email, password, status: 'approved' });
        saveUsers(users);

        alert(getTranslation('registrationSuccess'));
        window.location.href = 'dashboard.html';
    });
}

// Вход
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (username === 'AAAA' && password === 'AAAA') {
            window.location.href = 'admin.html';
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.username === username && u.password === password && u.status === 'approved');

        if (user) {
            localStorage.setItem('currentUser', username);
            window.location.href = 'dashboard.html';
        } else {
            alert(getTranslation('invalidData'));
        }
    });
}

// Админ панель
if (document.getElementById('pendingPlaces')) {
    function loadPendingPlaces() {
        const places = getPlaces();
        const pending = places.filter(p => p.status === 'pending');
        const list = document.getElementById('pendingPlaces');
        list.innerHTML = '';

        pending.forEach((place, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${place.name} - ${place.description} (от ${place.user})</span>
                <div>
                    <button onclick="approvePlace(${index})" data-translate="approve">${getTranslation('approve')}</button>
                    <button class="reject" onclick="rejectPlace(${index})" data-translate="reject">${getTranslation('reject')}</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    window.approvePlace = function(index) {
        const places = getPlaces();
        const pending = places.filter(p => p.status === 'pending');
        pending[index].status = 'approved';
        savePlaces(places);
        loadPendingPlaces();
    };

    window.rejectPlace = function(index) {
        const places = getPlaces();
        const pending = places.filter(p => p.status === 'pending');
        places.splice(places.indexOf(pending[index]), 1);
        savePlaces(places);
        loadPendingPlaces();
    };

    function loadPendingBookings() {
        const bookings = getBookings().filter(b => b.status === 'pending' || b.status === 'paid');
        const list = document.getElementById('pendingBookings');
        if (!list) return;
        list.innerHTML = '';

        bookings.forEach(booking => {
            const statusText = booking.status === 'paid' ? 'Оплата подтверждена' : 'Ожидает оплаты';
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${booking.user} — ${booking.hotel} ${booking.category} (${booking.stayFrom} → ${booking.stayTo})</span>
                <div>
                    <span class="booking-status ${booking.status}">${statusText}</span>
                    <button onclick="approveBooking(${booking.id})">Подтвердить</button>
                    <button class="reject" onclick="rejectBooking(${booking.id})">Отклонить</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    window.approveBooking = function(id) {
        const bookings = getBookings();
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;
        booking.status = 'confirmed';
        saveBookings(bookings);
        loadPendingBookings();
    };

    window.rejectBooking = function(id) {
        const bookings = getBookings();
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;
        booking.status = 'rejected';
        saveBookings(bookings);
        loadPendingBookings();
    };

    loadPendingPlaces();
    loadPendingBookings();
}

// Dashboard для пользователей
if (document.getElementById('addPlaceForm')) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
    }

    document.getElementById('profileName').textContent = currentUser;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    document.getElementById('addPlaceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('placeName').value;
        const description = document.getElementById('placeDescription').value;
        const photoFile = document.getElementById('placePhoto').files[0];

        const places = getPlaces();

        const savePlace = (photoData) => {
            places.push({ name, description, user: currentUser, status: 'pending', photo: photoData });
            savePlaces(places);

            alert(getTranslation('placedAdded'));
            document.getElementById('addPlaceForm').reset();
            document.getElementById('placePhotoPreview').innerHTML = '';
        };

        if (photoFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                savePlace(event.target.result);
            };
            reader.readAsDataURL(photoFile);
        } else {
            savePlace(null);
        }
    });

    const placePhotoInput = document.getElementById('placePhoto');
    const placePhotoPreview = document.getElementById('placePhotoPreview');

    if (placePhotoInput && placePhotoPreview) {
        placePhotoInput.addEventListener('change', function() {
            const file = placePhotoInput.files[0];
            if (!file) {
                placePhotoPreview.innerHTML = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                placePhotoPreview.innerHTML = `<img src="${event.target.result}" alt="Фото места">`;
            };
            reader.readAsDataURL(file);
        });
    }

    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');

    function loadAvatar() {
        const avatarData = localStorage.getItem(`avatar_${currentUser}`);
        if (avatarData) {
            avatarPreview.innerHTML = `<img src="${avatarData}" alt="Аватар">`;
        } else {
            avatarPreview.textContent = 'Аватар';
        }
    }

    avatarInput.addEventListener('change', function() {
        const file = avatarInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            localStorage.setItem(`avatar_${currentUser}`, imageData);
            loadAvatar();
        };
        reader.readAsDataURL(file);
    });


    let allPlaces = [];
    let currentPage = 1;
    const pageSize = 12;
    let lastFilteredPlaces = [];

    function getCombinedPlaces() {
        const filePlaces = (window.placesWithCategories || typeof placesWithCategories !== 'undefined' && placesWithCategories || []).map(place => ({ ...place, status: 'approved' }));
        const localPlaces = getPlaces().filter(place => place.status === 'approved');
        return [...filePlaces, ...localPlaces];
    }

    function populateCategoryFilter(places) {
        const filter = document.getElementById('filterCategory');
        if (!filter) return;

        const categories = Array.from(new Set(places.map(place => place.category).filter(Boolean))).sort();
        const options = [`<option value="">${getTranslation('allCategories')}</option>`];
        categories.forEach(category => {
            options.push(`<option value="${category}">${category}</option>`);
        });
        filter.innerHTML = options.join('');
    }

    function renderPaginationControls(totalPages) {
        const container = document.getElementById('pagination');
        if (!container) return;
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        const prevDisabled = currentPage <= 1 ? 'disabled' : '';
        const nextDisabled = currentPage >= totalPages ? 'disabled' : '';
        container.innerHTML = `
            <button id="prevPage" ${prevDisabled}>&larr; Назад</button>
            <span class="page-indicator">${currentPage} / ${totalPages}</span>
            <button id="nextPage" ${nextDisabled}>Далее &rarr;</button>
        `;

        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (prevBtn) prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPlaces(lastFilteredPlaces);
            }
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderPlaces(lastFilteredPlaces);
            }
        });
    }

    function showPlaceDetails(place) {
        const existing = document.getElementById('placeDetailsOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'placeDetailsOverlay';
        overlay.className = 'place-details-overlay';
        overlay.innerHTML = `
            <div class="place-details-card">
                <div class="place-details-header">
                    <h2 class="place-details-title">${place.name}</h2>
                    <button class="place-details-close" aria-label="Закрыть">×</button>
                </div>
                <div class="place-details-body">
                    <div class="place-details-image">${(place.photo || place.image) ? `<img src="${place.photo || place.image}" alt="${place.name}">` : `<div class="place-card-image-placeholder">${place.category || 'Нет фото'}</div>`}</div>
                    <div class="place-details-text">${place.description || getTranslation('noDescription')}</div>
                    <div class="place-details-meta">
                        <span>${getTranslation('user')} ${place.user || '—'}</span>
                        ${place.category ? `<span>${place.category}</span>` : ''}
                        ${typeof place.latitude === 'number' && typeof place.longitude === 'number' ? `<span>${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const closeButton = overlay.querySelector('.place-details-close');
        closeButton?.addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) overlay.remove();
        });
    }

    function renderPlaces(places) {
        const list = document.getElementById('approvedPlaces');
        if (!list) return;

        lastFilteredPlaces = places || [];
        list.innerHTML = '';
        if (!places || places.length === 0) {
            list.innerHTML = `<li class="empty-list">${getTranslation('noPlacesFound')}</li>`;
            const container = document.getElementById('pagination');
            if (container) container.innerHTML = '';
            return;
        }

        const totalPages = Math.max(1, Math.ceil(places.length / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;
        const start = (currentPage - 1) * pageSize;
        const pagePlaces = places.slice(start, start + pageSize);

        pagePlaces.forEach(place => {
            const li = document.createElement('li');
            const card = document.createElement('article');
            card.className = 'place-card';

            const imageUrl = place.photo || place.image || '';
            const imageBlock = document.createElement('div');
            imageBlock.className = 'place-card-image';
            if (imageUrl) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = place.name;
                imageBlock.appendChild(img);
            } else {
                imageBlock.classList.add('place-card-image-placeholder');
                imageBlock.textContent = place.category || getTranslation('noCategory');
            }
            card.appendChild(imageBlock);

            const content = document.createElement('div');
            content.className = 'place-card-content';

            if (place.category) {
                const categoryBadge = document.createElement('span');
                categoryBadge.className = 'place-category';
                categoryBadge.textContent = place.category;
                content.appendChild(categoryBadge);
            }

            const title = document.createElement('h3');
            title.className = 'place-title';
            title.textContent = place.name;
            content.appendChild(title);

            const description = document.createElement('p');
            description.className = 'place-description';
            description.textContent = place.description || '';
            content.appendChild(description);

            const meta = document.createElement('div');
            meta.className = 'place-meta';

            if (typeof place.latitude === 'number' && typeof place.longitude === 'number') {
                const coords = document.createElement('span');
                coords.className = 'place-coords';
                coords.textContent = `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`;
                meta.appendChild(coords);
            }

            const author = document.createElement('span');
            author.textContent = `${getTranslation('user')} ${place.user || '—'}`;
            meta.appendChild(author);

            content.appendChild(meta);
            card.appendChild(content);
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => showPlaceDetails(place));
            li.appendChild(card);
            list.appendChild(li);
        });

        renderPaginationControls(totalPages);
    }

    function updatePlaces() {
        currentPage = 1;
        const searchValue = document.getElementById('searchPlaces')?.value.trim().toLowerCase() || '';
        const categoryValue = document.getElementById('filterCategory')?.value || '';
        const filteredPlaces = allPlaces.filter(place => {
            const matchesSearch = !searchValue || [place.name, place.description, place.category].some(text => text && text.toLowerCase().includes(searchValue));
            const matchesCategory = !categoryValue || place.category === categoryValue;
            return matchesSearch && matchesCategory;
        });
        lastFilteredPlaces = filteredPlaces;
        renderPlaces(filteredPlaces);
    }

    function loadApprovedPlaces() {
        allPlaces = getCombinedPlaces();
        populateCategoryFilter(allPlaces);
        updatePlaces();
    }

    const hotelCategories = [
        { key: 'ST1', title: 'ST1 - Стандарт 1', price: 30000, description: 'Уютный стандартный номер на одного с кондиционером и Wi-Fi.', image: 'img/ST1.1.jpg' },
        { key: 'ST2', title: 'ST2 - Стандарт 2', price: 43000, description: 'Стандартный номер на двоих с комфортом и современной отделкой.', image: 'img/ST2.1.jpg' },
        { key: 'SL1', title: 'SL1 - Стандарт Люкс', price: 43000, description: 'Стандарт люкс с мини-баром, рабочей зоной и современной ванной.', image: 'img/SL1.1.jpg' },
        { key: 'DLX', title: 'DLX - Делюкс', price: 50000, description: 'Просторный номер Делюкс с стильным интерьером и удобной кроватью.', image: 'img/DLX.jpg' },
        { key: 'LX1', title: 'LX1 - Люкс 1', price: 55000, description: 'Люкс с рабочей зоной и комфортной гостиной.', image: 'img/LX1.jpg' },
        { key: 'LX2', title: 'LX2 - Люкс 2', price: 55000, description: 'Улучшенный люкс с диваном и расслабляющей атмосферой.', image: 'img/LX2.1.jpg' },
        { key: 'FLX', title: 'FLX - Семейный Люкс', price: 60000, description: 'Семейный люкс с просторной комнатой для отдыха всей семьи.', image: 'img/FLX1.jpg' },
        { key: 'APL1', title: 'APL1 - Апартаменты 1', price: 100000, description: 'Апартаменты с отдельной гостиной и спальней для комфортного отдыха.', image: 'img/APL1.1.jpg' },
        { key: 'APL2', title: 'APL2 - Апартаменты 2', price: 100000, description: 'Большие апартаменты с кухней и дополнительной зоной отдыха.', image: 'img/APL2.jpg' }
    ];

    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    function renderHotelCards() {
        const container = document.getElementById('hotelCards');
        if (!container) return;

        container.innerHTML = hotelCategories.map(category => `
            <article class="hotel-card">
                <div class="hotel-card-image"><img src="${category.image}" alt="${category.key}"></div>
                <div class="hotel-card-content">
                    <span class="hotel-category">${category.key}</span>
                    <h4>${category.title}</h4>
                    <p>${category.description}</p>
                    <div class="hotel-price">${formatPrice(category.price)} ₸</div>
                    <button type="button" class="button hotel-book-btn" data-category="${category.key}">Забронировать</button>
                </div>
            </article>
        `).join('');

        container.querySelectorAll('.hotel-book-btn').forEach(button => {
            button.addEventListener('click', () => setSelectedCategory(button.dataset.category));
        });
    }

    function getHotelCategory(key) {
        return hotelCategories.find(item => item.key === key) || hotelCategories[0];
    }

    function renderHotelBookingForm(selectedKey = hotelCategories[0].key) {
        const formContainer = document.getElementById('hotelBookingForm');
        if (!formContainer) return;

        formContainer.innerHTML = `
            <form id="bookingForm" class="hotel-form">
                <div class="hotel-form-grid">
                    <label class="hotel-form-group">
                        <span>Категория номера</span>
                        <select id="bookingCategory">${hotelCategories.map(category => `<option value="${category.key}">${category.title}</option>`).join('')}</select>
                    </label>
                    <label class="hotel-form-group">
                        <span>Дата заезда</span>
                        <input type="date" id="bookingFrom" required>
                    </label>
                    <label class="hotel-form-group">
                        <span>Дата выезда</span>
                        <input type="date" id="bookingTo" required>
                    </label>
                    <label class="hotel-form-group">
                        <span>Оплата</span>
                        <select id="bookingPayment" required>
                            <option value="Kaspi">Kaspi</option>
                            <option value="Card">Картой</option>
                        </select>
                    </label>
                    <div id="paymentDetails" class="hotel-form-group fullwidth"></div>
                    <label class="hotel-form-group fullwidth">
                        <span>Комментарий</span>
                        <input type="text" id="bookingNotes" placeholder="Телефон или пожелания">
                    </label>
                </div>
                <div class="hotel-form-summary">Сумма: <strong id="bookingPrice"></strong> ₸</div>
                <button type="submit" class="button">Оплатить и забронировать</button>
            </form>
        `;

        const categorySelect = document.getElementById('bookingCategory');
        const paymentSelect = document.getElementById('bookingPayment');
        const paymentDetails = document.getElementById('paymentDetails');
        const bookingForm = document.getElementById('bookingForm');
        const priceText = document.getElementById('bookingPrice');

        const renderPaymentFields = () => {
            if (!paymentDetails) return;
            if (paymentSelect.value === 'Card') {
                paymentDetails.innerHTML = `
                    <label class="hotel-form-group fullwidth">
                        <span>Владелец карты</span>
                        <input type="text" id="paymentHolder" placeholder="Имя на карте" required>
                    </label>
                    <label class="hotel-form-group fullwidth">
                        <span>Номер карты</span>
                        <input type="text" id="paymentCardNumber" placeholder="1111 2222 3333 4444" required>
                    </label>
                    <label class="hotel-form-group">
                        <span>Срок действия</span>
                        <input type="text" id="paymentExpiry" placeholder="MM/YY" required>
                    </label>
                    <label class="hotel-form-group">
                        <span>CVC</span>
                        <input type="text" id="paymentCVC" placeholder="123" required>
                    </label>
                `;
            } else {
                paymentDetails.innerHTML = `
                    <label class="hotel-form-group fullwidth">
                        <span>Kaspi ID / телефон</span>
                        <input type="text" id="paymentKaspi" placeholder="8777xxxxxxx" required>
                    </label>
                `;
            }
        };

        if (categorySelect) {
            categorySelect.value = selectedKey;
            categorySelect.addEventListener('change', () => updateBookingPrice());
        }

        if (paymentSelect) {
            paymentSelect.addEventListener('change', renderPaymentFields);
        }

        function updateBookingPrice() {
            const selected = getHotelCategory(categorySelect?.value);
            if (priceText) {
                priceText.textContent = formatPrice(selected.price);
            }
        }

        renderPaymentFields();
        updateBookingPrice();

        if (bookingForm) {
            bookingForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const currentUser = localStorage.getItem('currentUser');
                if (!currentUser) {
                    window.location.href = 'index.html';
                    return;
                }

                const categoryKey = document.getElementById('bookingCategory').value;
                const stayFrom = document.getElementById('bookingFrom').value;
                const stayTo = document.getElementById('bookingTo').value;
                const paymentMethod = document.getElementById('bookingPayment').value;
                const notes = document.getElementById('bookingNotes').value;
                const selectedRoom = getHotelCategory(categoryKey);

                if (!stayFrom || !stayTo) {
                    alert('Выберите даты заезда и выезда.');
                    return;
                }

                const fromDate = new Date(stayFrom);
                const toDate = new Date(stayTo);
                if (fromDate >= toDate) {
                    alert('Дата выезда должна быть позже даты заезда.');
                    return;
                }

                const paymentValid = paymentMethod === 'Card'
                    ? document.getElementById('paymentHolder')?.value.trim() && document.getElementById('paymentCardNumber')?.value.trim() && document.getElementById('paymentExpiry')?.value.trim() && document.getElementById('paymentCVC')?.value.trim()
                    : document.getElementById('paymentKaspi')?.value.trim();

                if (!paymentValid) {
                    alert('Введите реквизиты для оплаты.');
                    return;
                }

                const bookings = getBookings();
                bookings.push({
                    id: Date.now(),
                    hotel: 'Irtysh Hotel',
                    category: categoryKey,
                    price: selectedRoom.price,
                    paymentMethod,
                    stayFrom,
                    stayTo,
                    notes,
                    paymentInfo: paymentMethod === 'Card'
                        ? {
                            holder: document.getElementById('paymentHolder')?.value.trim(),
                            cardNumber: document.getElementById('paymentCardNumber')?.value.trim(),
                            expiry: document.getElementById('paymentExpiry')?.value.trim(),
                            cvc: document.getElementById('paymentCVC')?.value.trim()
                        }
                        : {
                            kaspiAccount: document.getElementById('paymentKaspi')?.value.trim()
                        },
                    user: currentUser,
                    status: 'paid',
                    createdAt: new Date().toISOString()
                });
                saveBookings(bookings);
                alert('Оплата подтверждена — бронь создана. Админ проверит и подтвердит бронирование.');
                bookingForm.reset();
                renderPaymentFields();
                updateBookingPrice();
                renderUserBookings();
            });
        }
    }

    function setSelectedCategory(categoryKey) {
        const categorySelect = document.getElementById('bookingCategory');
        if (categorySelect) {
            categorySelect.value = categoryKey;
            categorySelect.dispatchEvent(new Event('change'));
            document.getElementById('bookingFrom')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function renderUserBookings() {
        const currentUser = localStorage.getItem('currentUser');
        const container = document.getElementById('userBookingsList');
        if (!container) return;

        const bookings = getBookings().filter(b => b.user === currentUser).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (bookings.length === 0) {
            container.innerHTML = `<li class="empty-list">У вас нет бронирований.</li>`;
            return;
        }

        container.innerHTML = bookings.map(booking => `
            <li class="booking-item">
                <div>
                    <strong>${booking.hotel} — ${booking.category}</strong>
                    <div>${booking.stayFrom} → ${booking.stayTo}</div>
                    <div>Оплата: ${booking.paymentMethod}</div>
                    <div>Сумма: ${formatPrice(booking.price)} ₸</div>
                </div>
                <span class="booking-status ${booking.status}">${booking.status === 'pending' ? 'Ожидает оплаты' : booking.status === 'paid' ? 'Оплата подтверждена' : booking.status === 'confirmed' ? 'Подтверждено' : 'Отклонено'}</span>
            </li>
        `).join('');
    }

    loadAvatar();
    loadApprovedPlaces();
    renderHotelCards();
    renderHotelBookingForm();
    renderUserBookings();

    const searchInput = document.getElementById('searchPlaces');
    const categoryFilter = document.getElementById('filterCategory');
    if (searchInput) {
        searchInput.addEventListener('input', updatePlaces);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', updatePlaces);
    }

    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const target = item.getAttribute('data-tab');
            tabPanels.forEach(panel => {
                panel.classList.toggle('active', panel.id === target);
            });
        });
    });
}

function initAuthFlipCard() {
    const authCard = document.getElementById('authCard');
    const showLogin = document.getElementById('showLogin');
    const showRegister = document.getElementById('showRegister');
    const toggleToRegister = document.getElementById('toggleToRegister');
    const toggleToLogin = document.getElementById('toggleToLogin');

    if (!authCard) {
        return;
    }

    const setSide = side => {
        if (side === 'register') {
            authCard.classList.add('flip');
            showRegister?.classList.add('active');
            showLogin?.classList.remove('active');
        } else {
            authCard.classList.remove('flip');
            showLogin?.classList.add('active');
            showRegister?.classList.remove('active');
        }
    };

    showLogin?.addEventListener('click', () => setSide('login'));
    showRegister?.addEventListener('click', () => setSide('register'));
    toggleToRegister?.addEventListener('click', () => setSide('register'));
    toggleToLogin?.addEventListener('click', () => setSide('login'));
}

initAuthFlipCard();

// Переключение языков
if (document.getElementById('langToggle')) {
    const langToggle = document.getElementById('langToggle');
    const langMenu = document.getElementById('langMenu');

    langToggle.addEventListener('click', () => {
        langMenu.classList.toggle('active');
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
}