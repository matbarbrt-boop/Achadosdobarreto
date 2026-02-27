const firebaseConfig = {
  apiKey: "AIzaSyD3Yeihv6DVwRibCOI45mgGXEbxFbCuyXI",
  authDomain: "barretoafiliados-cde7f.firebaseapp.com",
  databaseURL: "https://barretoafiliados-cde7f-default-rtdb.firebaseio.com",
  projectId: "barretoafiliados-cde7f",
  storageBucket: "barretoafiliados-cde7f.firebasestorage.app",
  messagingSenderId: "1006742629892",
  appId: "1:1006742629892:web:cf9b22d63cdecc99d68f51"
};

// Inicialização
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Elementos
const productForm = document.getElementById('product-form');
const adminList = document.getElementById('admin-product-list');
const clientGrid = document.getElementById('client-grid');
const searchInput = document.getElementById('search-input');

// --- SALVAR NOVO ITEM (ADMIN) ---
if (productForm) {
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = document.getElementById('btn-publish');
        btn.innerText = "Enviando...";
        btn.disabled = true;

        const file = document.getElementById('p-image').files[0];
        const reader = new FileReader();

        reader.onloadend = function() {
            const newProduct = {
                name: document.getElementById('p-name').value,
                price: document.getElementById('p-price').value,
                promo: document.getElementById('p-promo').value,
                link: document.getElementById('p-link').value,
                image: reader.result,
                timestamp: Date.now()
            };

            database.ref('produtos_barreto').push(newProduct).then(() => {
                productForm.reset();
                btn.innerText = "Publicar Agora";
                btn.disabled = false;
                alert("Sucesso! Item adicionado aos Achados do Barreto.");
            });
        }
        if (file) reader.readAsDataURL(file);
    });
}

// --- ESCUTAR DADOS DO FIREBASE ---
database.ref('produtos_barreto').on('value', (snapshot) => {
    const data = snapshot.val();
    const products = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : [];
    
    if (adminList) renderAdmin(products);
    if (clientGrid) renderClient(products);
});

// --- RENDERIZAR CLIENTE ---
function renderClient(products) {
    if(!clientGrid) return;
    clientGrid.innerHTML = '';
    products.forEach(p => {
        const hasPromo = p.promo && p.promo !== "" && parseFloat(p.promo) < parseFloat(p.price);
        clientGrid.innerHTML += `
            <div class="product-card">
                <div class="product-img" style="background-image: url('${p.image}')"></div>
                <h3>${p.name}</h3>
                <div class="price-tag">
                    ${hasPromo ? `
                        <span class="old-p">R$ ${p.price}</span>
                        <span class="new-p">R$ ${p.promo}</span>
                    ` : `<span class="new-p">R$ ${p.price}</span>`}
                </div>
                <a href="${p.link}" target="_blank" class="buy-link-btn">Ver Promoção</a>
            </div>
        `;
    });
}

// --- RENDERIZAR ADMIN ---
function renderAdmin(products) {
    if(!adminList) return;
    adminList.innerHTML = '';
    products.forEach(p => {
        adminList.innerHTML += `
            <div class="admin-item-card">
                <img src="${p.image}">
                <div style="flex:1">
                    <strong>${p.name}</strong>
                    <p>R$ ${p.promo || p.price}</p>
                </div>
                <button onclick="deleteProduct('${p.id}')" class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
    });
}

// --- BUSCAR ---
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.product-card').forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            card.classList.toggle('hidden', !title.includes(term));
        });
    });
}

// --- DELETAR ---
window.deleteProduct = (id) => {
    if(confirm("Deseja remover este item permanentemente?")) {
        database.ref('produtos_barreto/' + id).remove();
    }
}