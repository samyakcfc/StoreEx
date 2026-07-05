// StoreEx Frontend Application State
let productsData = {};
let selectedProductId = null;
let currentModalProductId = null;
let currentCart = {};

// i18n Language State
let currentLang = localStorage.getItem("storeex_lang") || "en";

// Localized UI Dictionary (Plain & Simple for Busy Store Workers)
const LOCALIZED_UI = {
    en: {
        logo_subtitle: "Convenience Control & Register",
        nav_floor_map: "Store Floor Map",
        nav_register: "Cashier Register",
        nav_agent: "AI Stock Monitor",
        heading_floor_shelves: "Sales Floor Shelves",
        badge_customer_area: "Customer Area",
        divider_door: "🚪 Backroom Door",
        heading_backroom_inventory: "Backroom Inventory",
        badge_staff_only: "Staff Only",
        title_new_transaction: "New Transaction",
        label_select_product: "Select Product to Scan",
        option_select_item: "Select an item...",
        label_backroom_qty: "Backroom Quantity",
        label_expiry_date: "Expiration Date",
        btn_process_sale: "Process Sale",
        title_transaction_log: "Transaction Log & Notifications",
        system_initialized_msg: "System initialized. Convenience store database loaded.",
        title_agent_control: "Agent Control Center",
        agent_title: "Gemini Stock Intelligence",
        agent_subtitle: "Autonomous Inventory Monitoring",
        label_agent_state: "Agent State",
        label_llm_engine: "LLM Engine",
        label_last_audit: "Last Audit Run",
        btn_run_scan: "⚡ Run Manual Scan",
        title_active_alerts: "Active Alert Stream",
        title_exec_summary: "Executive Health Summary",
        agent_summary_placeholder: "No active scan data. Please trigger a scan to analyze inventory.",
        text_waiting_scan: "Waiting for scan execution...",
        label_modal_backroom_stock: "Backroom Stock",
        label_modal_deliveries: "Total Deliveries",
        label_modal_sales: "Total Sales",
        title_modal_status: "Current Status",
        title_modal_action: "Required Action",
        title_modal_receive: "Receive Delivery",
        btn_receive_stock: "Receive Stock",
        // Dynamic labels & warnings
        stock_qty_label: "Stock Qty",
        backroom_qty_label: "Backroom Qty",
        healthy_badge: "Healthy",
        stock_warning_badge: "Stock Warning",
        expiry_warning_badge: "Expiry Warning",
        status_indicator_healthy: "Healthy",
        status_indicator_alert: "Alert",
        status_indicator_critical: "Critical",
        empty_alerts_message: "All clear! The agent did not find any critical stock or expiry issues.",
        scan_initiated_toast: "🤖 Agent Inventory Audit Initiated...",
        agent_btn_scanning: "Agent Scanning...",
        alert_item_detail_unavailable: "Product details not available for: ",
        error_stock_out: "Error: Item is out of stock in the backroom!",
        error_insufficient_stock: "Error: Not enough stock in the backroom!",
        toast_replenish_success: "Stock replenished: Received +{qty} units of {name}.",
        toast_sale_success: "💳 Sale Processed: Sold {qty} x {name}!",
        toast_valid_qty_error: "Please enter a valid stock quantity.",
        log_replenish_msg: "Received delivery of +{qty} units of {name}. Backroom quantity is now {backroom_qty}.",
        log_sale_msg: "Sold {qty} units of {name}. Backroom quantity is now {backroom_qty}.",
        urgency_score_label: "Urgency Score:",
        recommendation_label: "Recommendation",
        label_quantity: "Quantity",
        btn_add_item: "Add",
        title_current_sale: "Current Transaction Items",
        text_empty_cart: "No items added to this transaction yet.",
        toast_cart_empty: "Please add at least one item to the transaction.",
        toast_transaction_success: "💳 Transaction Processed: {count} type(s) of items sold!"
    },
    es: {
        logo_subtitle: "Control y Caja de la Tienda",
        nav_floor_map: "Mapa de la Tienda",
        nav_register: "Caja Registradora",
        nav_agent: "Monitor de Stock IA",
        heading_floor_shelves: "Estantes de Venta",
        badge_customer_area: "Área de Clientes",
        divider_door: "🚪 Puerta de Depósito",
        heading_backroom_inventory: "Depósito de Mercadería",
        badge_staff_only: "Solo Personal",
        title_new_transaction: "Nueva Venta",
        label_select_product: "Elige un producto para escanear",
        option_select_item: "Elige un producto...",
        label_backroom_qty: "Cantidad en Depósito",
        label_expiry_date: "Fecha de Vencimiento",
        btn_process_sale: "Confirmar Venta",
        title_transaction_log: "Historial de Caja y Avisos",
        system_initialized_msg: "Sistema encendido. Inventario de la tienda cargado.",
        title_agent_control: "Panel de Control de IA",
        agent_title: "Inteligencia de Stock Gemini",
        agent_subtitle: "Control Automático de Inventario",
        label_agent_state: "Estado del Monitor",
        label_llm_engine: "Motor de IA",
        label_last_audit: "Último Análisis",
        btn_run_scan: "⚡ Analizar Ahora",
        title_active_alerts: "Alertas de Stock y Vencimiento",
        title_exec_summary: "Resumen de Salud de la Tienda",
        agent_summary_placeholder: "Sin datos. Haz clic en 'Analizar Ahora' para revisar el stock.",
        text_waiting_scan: "Esperando a que la IA analice el stock...",
        label_modal_backroom_stock: "En Depósito",
        label_modal_deliveries: "Entregas Totales",
        label_modal_sales: "Ventas Totales",
        title_modal_status: "Estado Actual",
        title_modal_action: "Acción Requerida",
        title_modal_receive: "Ingresar Pedido",
        btn_receive_stock: "Recibir Carga",
        // Dynamic labels & warnings
        stock_qty_label: "En Tienda",
        backroom_qty_label: "En Depósito",
        healthy_badge: "Controlado",
        stock_warning_badge: "Poco Stock",
        expiry_warning_badge: "Por Vencer",
        status_indicator_healthy: "Sano",
        status_indicator_alert: "Alerta",
        status_indicator_critical: "Crítico",
        empty_alerts_message: "¡Todo en orden! El monitor no encontró problemas de stock ni vencimiento.",
        scan_initiated_toast: "🤖 Iniciando análisis de inventario con IA...",
        agent_btn_scanning: "IA Analizando...",
        alert_item_detail_unavailable: "Detalles no disponibles para: ",
        error_stock_out: "Error: ¡No hay unidades de este producto en el depósito!",
        error_insufficient_stock: "Error: ¡No hay suficiente stock en el depósito!",
        toast_replenish_success: "Mercadería recibida: +{qty} unidades de {name}.",
        toast_sale_success: "💳 Venta procesada: ¡Se vendió {qty} x {name}!",
        toast_valid_qty_error: "Por favor, ingresa una cantidad válida de stock.",
        log_replenish_msg: "Llegó un pedido de +{qty} unidades de {name}. Total en depósito: {backroom_qty}.",
        log_sale_msg: "Vendido: {qty} unidades de {name}. Quedan {backroom_qty} en depósito.",
        expiry_alert_desc: "vence en {days} día(s) ({date}). No lo cobres sin ponerle la etiqueta de oferta.",
        expiry_alert_title: "⚠️ AVISO: ¡Producto por Vencer!",
        urgency_score_label: "Urgencia:",
        recommendation_label: "Recomendación",
        label_quantity: "Cantidad",
        btn_add_item: "Agregar",
        title_current_sale: "Artículos de la Transacción Actual",
        text_empty_cart: "Aún no se han agregado artículos a esta transacción.",
        toast_cart_empty: "Por favor, agregue al menos un artículo a la transacción.",
        toast_transaction_success: "💳 Transacción procesada: ¡{count} tipo(s) de artículos vendidos!"
    },
    hi: {
        logo_subtitle: "स्टोर कंट्रोल और कैश काउंटर",
        nav_floor_map: "स्टोर का नक्शा",
        nav_register: "कैश रजिस्टर",
        nav_agent: "AI स्टॉक मॉनिटर",
        heading_floor_shelves: "बिक्री काउंटर",
        badge_customer_area: "ग्राहक क्षेत्र",
        divider_door: "🚪 गोदाम का दरवाजा",
        heading_backroom_inventory: "गोदाम का स्टॉक",
        badge_staff_only: "केवल स्टाफ के लिए",
        title_new_transaction: "नया बिल बनाएं",
        label_select_product: "स्कैन करने के लिए सामान चुनें",
        option_select_item: "कोई आइटम चुनें...",
        label_backroom_qty: "गोदाम में मात्रा",
        label_expiry_date: "एक्सपायरी तारीख",
        btn_process_sale: "बिल पक्का करें",
        title_transaction_log: "लेनदेन का इतिहास और सूचनाएं",
        system_initialized_msg: "सिस्टम चालू हो गया है। स्टोर का डेटा लोड कर लिया गया है।",
        title_agent_control: "AI कंट्रोल सेंटर",
        agent_title: "जेमिनी स्टॉक इंटेलिजेंस",
        agent_subtitle: "स्टॉक की ऑटोमैटिक निगरानी",
        label_agent_state: "AI की स्थिति",
        label_llm_engine: "AI इंजन",
        label_last_audit: "आखिरी बार जांच",
        btn_run_scan: "⚡ अभी जांचें",
        title_active_alerts: "स्टॉक और एक्सपायरी अलर्ट",
        title_exec_summary: "स्टोर के स्टॉक का हाल",
        agent_summary_placeholder: "जांच का कोई डेटा नहीं है। स्टॉक जांचने के लिए 'अभी जांचें' बटन दबाएं।",
        text_waiting_scan: "AI जांच शुरू होने का इंतजार है...",
        label_modal_backroom_stock: "गोदाम स्टॉक",
        label_modal_deliveries: "कुल आवक",
        label_modal_sales: "कुल बिक्री",
        title_modal_status: "अभी की स्थिति",
        title_modal_action: "जरूरी काम",
        title_modal_receive: "नया माल चढ़ाएं",
        btn_receive_stock: "स्टॉक दर्ज करें",
        // Dynamic labels & warnings
        stock_qty_label: "दुकान स्टॉक",
        backroom_qty_label: "गोदाम स्टॉक",
        healthy_badge: "बढ़िया",
        stock_warning_badge: "कम स्टॉक",
        expiry_warning_badge: "एक्सपायरी अलर्ट",
        status_indicator_healthy: "बढ़िया",
        status_indicator_alert: "अलर्ट",
        status_indicator_critical: "गंभीर",
        empty_alerts_message: "सब ठीक है! AI को स्टॉक या एक्सपायरी में कोई गड़बड़ी नहीं मिली।",
        scan_initiated_toast: "🤖 AI से स्टॉक की जांच शुरू हो रही है...",
        agent_btn_scanning: "जांच चल रही है...",
        alert_item_detail_unavailable: "इस आइटम की जानकारी नहीं मिली: ",
        error_stock_out: "गलती: गोदाम में यह सामान खत्म हो चुका है!",
        error_insufficient_stock: "गलती: गोदाम में पर्याप्त स्टॉक नहीं है!",
        toast_replenish_success: "स्टॉक दर्ज हुआ: +{qty} पीस {name} मिले।",
        toast_sale_success: "💳 बिक्री दर्ज: {qty} पीस {name} बिका!",
        toast_valid_qty_error: "कृपया सही संख्या भरें।",
        log_replenish_msg: "+{qty} पीस {name} का नया माल मिला। गोदाम में अब कुल {backroom_qty} पीस हैं।",
        log_sale_msg: "{qty} पीस {name} बिका। गोदाम में अब {backroom_qty} पीस बचे हैं।",
        expiry_alert_desc: "यह सामान {days} दिन(ओं) में ({date}) एक्सपायर होने वाला है। इसे बेचने से पहले छूट का स्टिकर जरूर देख लें।",
        expiry_alert_title: "⚠️ एक्सपायरी अलर्ट: जल्दी बिकने वाला माल!",
        urgency_score_label: "अति-आवश्यकता:",
        recommendation_label: "सुझाव",
        label_quantity: "मात्रा",
        btn_add_item: "जोड़ें",
        title_current_sale: "वर्तमान लेनदेन की वस्तुएं",
        text_empty_cart: "इस लेनदेन में अभी तक कोई वस्तु नहीं जोड़ी गई है।",
        toast_cart_empty: "कृपया लेनदेन में कम से कम एक वस्तु जोड़ें।",
        toast_transaction_success: "💳 लेनदेन सफल: {count} प्रकार की वस्तुएं बेची गईं!"
    }
};

// Product Icon Mapping
const productIcons = {
    milk: "🥛",
    bread: "🍞",
    vegetables: "🥬",
    chips: "🥔",
    chocolates: "🍫"
};

// ----------------------------------------------------
// i18n Functions
// ----------------------------------------------------
function changeLanguage(lang) {
    if (lang === currentLang) return;
    setLanguage(lang);
    
    // Refresh both products and agent audits using the updated language
    fetchProducts();
    fetchAgentStatus();
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("storeex_lang", lang);
    
    // Toggle active class on language switcher buttons
    document.getElementById("lang-en-btn")?.classList.toggle("active", lang === "en");
    document.getElementById("lang-es-btn")?.classList.toggle("active", lang === "es");
    document.getElementById("lang-hi-btn")?.classList.toggle("active", lang === "hi");
    
    // Update elements with data-i18n
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (LOCALIZED_UI[lang] && LOCALIZED_UI[lang][key]) {
            el.textContent = LOCALIZED_UI[lang][key];
        }
    });
    
    // Update select dropdown placeholder
    const select = document.getElementById("product-select");
    if (select && select.options.length > 0) {
        select.options[0].textContent = LOCALIZED_UI[lang]["option_select_item"];
    }
}

// ----------------------------------------------------
// Initialization & Tab Navigation
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    setLanguage(currentLang);
    fetchProducts();
    fetchAgentStatus();
    startClock();
    
    // Auto-refresh data every 5 seconds to keep it live
    setInterval(() => {
        fetchProducts();
        fetchAgentStatus();
    }, 5000);
});

function startClock() {
    const clockEl = document.getElementById("system-time");
    const updateTime = () => {
        const now = new Date();
        clockEl.textContent = now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + " " + now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function switchTab(tabName) {
    // Buttons
    const mapBtn = document.getElementById("tab-map-btn");
    const regBtn = document.getElementById("tab-register-btn");
    const agentBtn = document.getElementById("tab-agent-btn");
    
    // Views
    const mapView = document.getElementById("view-map");
    const regView = document.getElementById("view-register");
    const agentView = document.getElementById("view-agent");
    
    // Remove active class from all buttons
    mapBtn?.classList.remove("active");
    regBtn?.classList.remove("active");
    agentBtn?.classList.remove("active");
    
    // Remove active-view class from all views
    mapView?.classList.remove("active-view");
    regView?.classList.remove("active-view");
    agentView?.classList.remove("active-view");
    
    if (tabName === "map") {
        mapBtn?.classList.add("active");
        mapView?.classList.add("active-view");
        fetchProducts(); // Refresh map data on switch
    } else if (tabName === "register") {
        regBtn?.classList.add("active");
        regView?.classList.add("active-view");
        populateDropdown();
    } else if (tabName === "agent") {
        agentBtn?.classList.add("active");
        agentView?.classList.add("active-view");
        fetchAgentStatus();
    }
}

// ----------------------------------------------------
// Data Fetching & Rendering
// ----------------------------------------------------
async function fetchProducts() {
    try {
        const response = await fetch(`/api/products?lang=${currentLang}`);
        if (!response.ok) throw new Error("Failed to fetch product data.");
        
        productsData = await response.json();
        
        // Update components based on active screen state
        renderStoreMap();
        
        // If register dropdown has a selected product, update the stats
        if (selectedProductId) {
            updateRegisterStats(selectedProductId);
        }
        
        // If modal is open, refresh its contents in real-time
        if (currentModalProductId) {
            openDetailsModal(currentModalProductId);
        }
        
        // Refresh cart names/details in case language changed
        renderCart();
    } catch (err) {
        console.error("Error loading products:", err);
    }
}

function renderStoreMap() {
    const floorGrid = document.getElementById("store-floor-grid");
    const backroomGrid = document.getElementById("store-backroom-grid");
    
    if (!floorGrid || !backroomGrid) return;
    
    // Save scroll or state if any
    floorGrid.innerHTML = "";
    backroomGrid.innerHTML = "";
    
    // Render each product to floor and backroom
    Object.keys(productsData).forEach(id => {
        const p = productsData[id];
        const icon = productIcons[id] || "📦";
        
        // Localized status indicators
        const statusTexts = {
            green: LOCALIZED_UI[currentLang]["status_indicator_healthy"],
            orange: LOCALIZED_UI[currentLang]["status_indicator_alert"],
            red: LOCALIZED_UI[currentLang]["status_indicator_critical"]
        };
        const statusLabel = statusTexts[p.status] || p.status.toUpperCase();
        
        // --- 1. Render Sales Floor Block ---
        const floorBlock = document.createElement("div");
        floorBlock.className = `shelf-block status-${p.status}`;
        floorBlock.onclick = () => openDetailsModal(id);
        
        floorBlock.innerHTML = `
            <div class="shelf-title-row">
                <div>
                    <h3>${p.name}</h3>
                    <div class="shelf-location">${p.shelf_name}</div>
                </div>
                <span class="shelf-icon">${icon}</span>
            </div>
            <div class="shelf-meta">
                <div class="shelf-stock">
                    <span class="qty-num">${p.backroom_quantity}</span>
                    <span class="qty-label">${LOCALIZED_UI[currentLang]["stock_qty_label"]}</span>
                </div>
                <span class="status-indicator">${statusLabel}</span>
            </div>
        `;
        floorGrid.appendChild(floorBlock);
        
        // --- 2. Render Backroom Block ---
        const backroomBlock = document.createElement("div");
        backroomBlock.className = `shelf-block status-${p.status}`;
        backroomBlock.onclick = () => openDetailsModal(id);
        
        backroomBlock.innerHTML = `
            <div class="shelf-title-row">
                <div>
                    <h3>${p.name}</h3>
                    <div class="shelf-location">${p.backroom_name}</div>
                </div>
                <span class="shelf-icon">📦</span>
            </div>
            <div class="shelf-meta">
                <div class="shelf-stock">
                    <span class="qty-num">${p.backroom_quantity}</span>
                    <span class="qty-label">${LOCALIZED_UI[currentLang]["backroom_qty_label"]}</span>
                </div>
                <span class="status-indicator">${statusLabel}</span>
            </div>
        `;
        backroomGrid.appendChild(backroomBlock);
    });
}

function populateDropdown() {
    const select = document.getElementById("product-select");
    if (!select) return;
    
    // Preserve currently selected index value if matching
    const currentVal = select.value;
    
    select.innerHTML = `<option value="" disabled selected>${LOCALIZED_UI[currentLang]["option_select_item"]}</option>`;
    
    Object.keys(productsData).forEach(id => {
        const p = productsData[id];
        const option = document.createElement("option");
        option.value = id;
        option.textContent = `${p.name} (${productIcons[id] || "📦"})`;
        select.appendChild(option);
    });
    
    if (currentVal && productsData[currentVal]) {
        select.value = currentVal;
    }
}

// ----------------------------------------------------
// Details Modal Overlay
// ----------------------------------------------------
function openDetailsModal(id) {
    currentModalProductId = id;
    const p = productsData[id];
    if (!p) return;
    
    const modal = document.getElementById("details-modal");
    
    // Color modal overlay border/badge dynamically
    modal.className = `modal-overlay status-${p.status}`;
    
    // Localized Badge Texts
    const badgeText = p.status === 'green' ? LOCALIZED_UI[currentLang]["healthy_badge"] : p.status === 'orange' ? LOCALIZED_UI[currentLang]["stock_warning_badge"] : LOCALIZED_UI[currentLang]["expiry_warning_badge"];
    
    const shelfLabel = currentLang === 'es' ? 'Pasillo' : currentLang === 'hi' ? 'काउंटर' : 'Floor';
    const roomLabel = currentLang === 'es' ? 'Depósito' : currentLang === 'hi' ? 'गोदाम' : 'Room';
    
    // Bind data to DOM
    document.getElementById("modal-status-badge").textContent = badgeText;
    document.getElementById("modal-product-name").textContent = p.name;
    document.getElementById("modal-shelf-location").textContent = `📍 ${shelfLabel}: ${p.shelf_name}`;
    document.getElementById("modal-backroom-location").textContent = `🏢 ${roomLabel}: ${p.backroom_name}`;
    
    document.getElementById("modal-qty").textContent = p.backroom_quantity;
    document.getElementById("modal-deliveries").textContent = p.total_deliveries;
    document.getElementById("modal-sales").textContent = p.total_sales;
    
    document.getElementById("modal-problem").textContent = p.problem;
    document.getElementById("modal-action").textContent = p.action;
    
    // Reset replenishment input field
    document.getElementById("replenish-qty").value = 10;
    
    // Reveal Modal
    modal.classList.remove("hidden");
}

function closeModal() {
    const modal = document.getElementById("details-modal");
    modal.classList.add("hidden");
    currentModalProductId = null;
}

function closeModalOnOutsideClick(event) {
    if (event.target.id === "details-modal") {
        closeModal();
    }
}

// Submit replenishment order
async function submitReplenishment() {
    if (!currentModalProductId) return;
    
    const qtyInput = document.getElementById("replenish-qty");
    const qty = parseInt(qtyInput.value);
    
    if (isNaN(qty) || qty <= 0) {
        showToast(LOCALIZED_UI[currentLang]["toast_valid_qty_error"], true);
        return;
    }
    
    try {
        const response = await fetch(`/api/deliver?lang=${currentLang}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: currentModalProductId, quantity: qty })
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Replenishment failed");
        
        // Localized Toast and Activity log messages
        const tMsg = LOCALIZED_UI[currentLang]["toast_replenish_success"]
            .replace("{qty}", qty).replace("{name}", result.product.name);
        showToast(tMsg);
        
        const lMsg = LOCALIZED_UI[currentLang]["log_replenish_msg"]
            .replace("{qty}", qty).replace("{name}", result.product.name)
            .replace("{backroom_qty}", result.product.backroom_quantity);
        logActivity(lMsg, "system-msg");
        
        fetchProducts(); // updates modal and floor maps in real time
    } catch (err) {
        showToast(err.message, true);
    }
}

// ----------------------------------------------------
// Cashier Register View Logic
// ----------------------------------------------------
function onProductSelectChange() {
    const select = document.getElementById("product-select");
    selectedProductId = select.value;
    
    if (selectedProductId) {
        document.getElementById("add-item-btn").disabled = false;
        updateRegisterStats(selectedProductId);
    } else {
        document.getElementById("add-item-btn").disabled = true;
    }
}

function updateRegisterStats(id) {
    const p = productsData[id];
    if (!p) return;
    
    // Update labels
    document.getElementById("register-backroom-qty").textContent = p.backroom_quantity;
    document.getElementById("register-expiry-date").textContent = p.expiry_date;
    
    // Expiry warnings in BIG Red Text
    const alertBox = document.getElementById("register-expiry-alert");
    
    if (p.status === "red") {
        const alertTitle = LOCALIZED_UI[currentLang]["expiry_alert_title"];
        const alertDesc = LOCALIZED_UI[currentLang]["expiry_alert_desc"]
            .replace("{days}", p.days_to_expiry).replace("{date}", p.expiry_date);
            
        alertBox.innerHTML = `
            <h3>${alertTitle}</h3>
            <p>${p.name} ${alertDesc}</p>
        `;
        alertBox.classList.remove("hidden");
    } else {
        alertBox.classList.add("hidden");
    }
}

// ----------------------------------------------------
// Cart Management Logic
// ----------------------------------------------------
function addToSale() {
    if (!selectedProductId) return;
    
    const p = productsData[selectedProductId];
    if (!p) return;
    
    const qtyInput = document.getElementById("product-qty");
    const qty = parseInt(qtyInput.value) || 1;
    
    if (qty <= 0) {
        showToast(LOCALIZED_UI[currentLang]["toast_valid_qty_error"], true);
        return;
    }
    
    // Check stock availability including what is already in cart
    const alreadyInCart = currentCart[selectedProductId] || 0;
    if (p.backroom_quantity < alreadyInCart + qty) {
        showToast(LOCALIZED_UI[currentLang]["error_insufficient_stock"], true);
        return;
    }
    
    currentCart[selectedProductId] = alreadyInCart + qty;
    
    // Reset inputs
    qtyInput.value = 1;
    const select = document.getElementById("product-select");
    if (select) {
        select.value = "";
    }
    selectedProductId = null;
    document.getElementById("add-item-btn").disabled = true;
    
    // Clear temporary stats display
    document.getElementById("register-backroom-qty").textContent = "--";
    document.getElementById("register-expiry-date").textContent = "--";
    document.getElementById("register-expiry-alert").classList.add("hidden");
    
    renderCart();
}

function removeFromCart(id) {
    if (currentCart[id]) {
        delete currentCart[id];
        renderCart();
    }
}

function renderCart() {
    const list = document.getElementById("cart-list");
    if (!list) return;
    
    list.innerHTML = "";
    
    const keys = Object.keys(currentCart);
    if (keys.length === 0) {
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "empty-cart";
        emptyMsg.id = "empty-cart-msg";
        emptyMsg.setAttribute("data-i18n", "text_empty_cart");
        emptyMsg.textContent = LOCALIZED_UI[currentLang]["text_empty_cart"];
        list.appendChild(emptyMsg);
        
        document.getElementById("process-sale-btn").disabled = true;
        return;
    }
    
    keys.forEach(id => {
        const qty = currentCart[id];
        const p = productsData[id];
        if (!p) return;
        
        const icon = productIcons[id] || "📦";
        
        const item = document.createElement("div");
        item.className = "cart-item";
        item.innerHTML = `
            <div class="cart-item-details">
                <span class="cart-item-icon">${icon}</span>
                <span class="cart-item-name">${p.name}</span>
                <span class="cart-item-qty-badge">x ${qty}</span>
            </div>
            <button class="btn-remove-item" onclick="removeFromCart('${id}')" title="Remove item">
                ❌
            </button>
        `;
        list.appendChild(item);
    });
    
    document.getElementById("process-sale-btn").disabled = false;
}

async function processSale() {
    const keys = Object.keys(currentCart);
    if (keys.length === 0) {
        showToast(LOCALIZED_UI[currentLang]["toast_cart_empty"], true);
        return;
    }
    
    const processBtn = document.getElementById("process-sale-btn");
    processBtn.disabled = true;
    
    try {
        const response = await fetch(`/api/sell_multi?lang=${currentLang}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ items: currentCart })
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Sale failed.");
        
        // Show localized success toast for transaction
        const tMsg = LOCALIZED_UI[currentLang]["toast_transaction_success"]
            .replace("{count}", keys.length);
        showToast(tMsg);
        
        // Log each item sale individually in activity stream
        result.products.forEach(updatedProd => {
            const originalProd = productsData[updatedProd.id];
            const soldQty = currentCart[updatedProd.id];
            
            let colorChangeAlert = "";
            if (originalProd && originalProd.status !== updatedProd.status) {
                colorChangeAlert = ` Status changed to ${updatedProd.status.toUpperCase()}!`;
            }
            
            const lMsg = LOCALIZED_UI[currentLang]["log_sale_msg"]
                .replace("{qty}", soldQty)
                .replace("{name}", updatedProd.name)
                .replace("{backroom_qty}", updatedProd.backroom_quantity) + colorChangeAlert;
            logActivity(lMsg, updatedProd.status === "red" ? "alert-msg" : "sale-msg");
        });
        
        // Clear cart
        currentCart = {};
        renderCart();
        
        // Re-fetch database to sync map positions and tabs
        await fetchProducts();
    } catch (err) {
        showToast(err.message, true);
    } finally {
        processBtn.disabled = false;
    }
}

// ----------------------------------------------------
// UI Notification Logging helpers
// ----------------------------------------------------
function logActivity(text, className = "system-msg") {
    const stream = document.getElementById("log-stream");
    if (!stream) return;
    
    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 5);
    
    const entry = document.createElement("div");
    entry.className = `log-entry ${className}`;
    entry.innerHTML = `
        <span class="time">${timeStr}</span>
        <span class="msg">${text}</span>
    `;
    
    stream.appendChild(entry);
    stream.scrollTop = stream.scrollHeight;
}

function showToast(message, isError = false) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    toast.innerHTML = `
        <span>${isError ? '❌' : '✅'}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Fade out and remove toast after 3.5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ----------------------------------------------------
// AI Stock Monitor Agent Integration
// ----------------------------------------------------
let isAgentScanning = false;

async function fetchAgentStatus() {
    try {
        const response = await fetch(`/api/agent/status?lang=${currentLang}`);
        if (!response.ok) throw new Error("Failed to fetch agent status.");
        
        const data = await response.json();
        
        // Update DOM elements
        const statusBadge = document.getElementById("agent-status-badge");
        const lastRunVal = document.getElementById("agent-last-run");
        const execSummaryText = document.getElementById("agent-executive-summary");
        const scanBtn = document.getElementById("run-agent-scan-btn");
        const btnSpinner = document.getElementById("agent-btn-spinner");
        const btnText = document.getElementById("agent-btn-text");
        const controlPanel = document.querySelector(".control-box");
        
        if (!statusBadge || !lastRunVal || !execSummaryText || !scanBtn) return;
        
        // Handle scanning status and classes
        statusBadge.textContent = data.status;
        statusBadge.className = `status-badge-val ${data.status.toLowerCase()}`;
        
        lastRunVal.textContent = data.last_run ? data.last_run : "--";
        execSummaryText.textContent = data.summary;
        
        if (data.status === "scanning") {
            isAgentScanning = true;
            scanBtn.disabled = true;
            btnSpinner?.classList.remove("hidden");
            btnText.textContent = LOCALIZED_UI[currentLang]["agent_btn_scanning"];
            controlPanel?.classList.add("scanning-state");
        } else {
            isAgentScanning = false;
            scanBtn.disabled = false;
            btnSpinner?.classList.add("hidden");
            btnText.textContent = "⚡ " + LOCALIZED_UI[currentLang]["btn_run_scan"].replace("⚡ ", "");
            controlPanel?.classList.remove("scanning-state");
        }
        
        if (data.status === "error" && data.error) {
            execSummaryText.innerHTML = `<span style="color:var(--color-red)"><strong>Agent Scan Error:</strong> ${data.error}</span>`;
        }
        
        // Render Alerts List
        renderAgentAlerts(data.alerts);
        
    } catch (err) {
        console.error("Error loading agent status:", err);
    }
}

function renderAgentAlerts(alerts) {
    const listContainer = document.getElementById("agent-alerts-list");
    if (!listContainer) return;
    
    if (!alerts || alerts.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-alerts">
                <span class="empty-icon">🤖</span>
                <p>${LOCALIZED_UI[currentLang]["empty_alerts_message"]}</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = "";
    
    alerts.forEach(alert => {
        let locationText = "Unknown location";
        const prodId = alert.product_id;
        const matchingProd = productsData[prodId];
        
        if (matchingProd) {
            const shelfLabel = currentLang === 'es' ? 'Pasillo' : currentLang === 'hi' ? 'काउंटर' : 'Floor';
            const roomLabel = currentLang === 'es' ? 'Depósito' : currentLang === 'hi' ? 'गोदाम' : 'Room';
            locationText = `📍 ${shelfLabel}: ${matchingProd.shelf_name} | 🏢 ${roomLabel}: ${matchingProd.backroom_name}`;
        }
        
        const card = document.createElement("div");
        const priorityClass = `priority-${alert.priority.toLowerCase()}`;
        card.className = `agent-alert-card ${priorityClass}`;
        
        card.onclick = () => {
            if (productsData[prodId]) {
                openDetailsModal(prodId);
            } else {
                showToast(LOCALIZED_UI[currentLang]["alert_item_detail_unavailable"] + alert.product_name, true);
            }
        };
        
        card.innerHTML = `
            <div class="agent-alert-header">
                <div class="agent-alert-title-group">
                    <h3>${alert.product_name}</h3>
                    <div class="agent-alert-loc">${locationText}</div>
                </div>
                <span class="priority-badge">${alert.priority.toUpperCase()}</span>
            </div>
            
            <div class="agent-alert-body">
                <p class="agent-reasoning">${alert.reasoning}</p>
                
                <div class="urgency-container">
                    <span class="urgency-label">${LOCALIZED_UI[currentLang]["urgency_score_label"]} ${alert.urgency_score}%</span>
                    <div class="urgency-track">
                        <div class="urgency-bar" style="width: ${alert.urgency_score}%"></div>
                    </div>
                </div>
                
                <div class="agent-action-box">
                    <span class="action-label">${LOCALIZED_UI[currentLang]["recommendation_label"]}</span>
                    <p class="action-desc">${alert.recommended_action}</p>
                </div>
            </div>
        `;
        
        listContainer.appendChild(card);
    });
}

async function triggerAgentScan() {
    if (isAgentScanning) return;
    
    try {
        const response = await fetch(`/api/agent/scan?lang=${currentLang}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to trigger scan");
        
        showToast(LOCALIZED_UI[currentLang]["scan_initiated_toast"]);
        
        // Immediately fetch status to show scanning state
        fetchAgentStatus();
    } catch (err) {
        showToast(err.message, true);
    }
}
