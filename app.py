import datetime
import os
import threading
import time
import json
from flask import Flask, jsonify, request, render_template
from google import genai
from pydantic import BaseModel, Field
from typing import List

app = Flask(__name__)

# Sample Convenience Store Data with relative dates for robust demonstration
# Current simulated local time is July 3, 2026 (we relative-date from today for reliability)
def init_products():
    today = datetime.date.today()
    return {
        "milk": {
            "name": "Organic Whole Milk",
            "shelf_name": "Aisle A1 - Dairy Fridge",
            "backroom_name": "Walk-in Cooler Row 2",
            "expiry_date": today + datetime.timedelta(days=1), # Expiring soon -> Red
            "low_stock_threshold": 10,
            "total_deliveries": 25,
            "total_sales": 5, # Stock = 20 (Healthy on stock, Red on expiry)
            "healthy_action": "Ensure milk cartons are upright and organized by brand."
        },
        "bread": {
            "name": "Sliced Sourdough Bread",
            "shelf_name": "Aisle B1 - Bakery Rack",
            "backroom_name": "Fresh Bakery Crates",
            "expiry_date": today + datetime.timedelta(days=9), # Expiry ok
            "low_stock_threshold": 5,
            "total_deliveries": 10,
            "total_sales": 9, # Stock = 1 (Low stock -> Orange)
            "healthy_action": "Keep rack clean and pull oldest bags forward."
        },
        "vegetables": {
            "name": "Fresh Organic Spinach",
            "shelf_name": "Aisle A2 - Produce Table",
            "backroom_name": "Produce Chiller Shelf 1",
            "expiry_date": today + datetime.timedelta(days=7), # Expiry ok
            "low_stock_threshold": 5,
            "total_deliveries": 30,
            "total_sales": 10, # Stock = 20 (Healthy -> Green)
            "healthy_action": "Mist with cool water periodically. Check for wilted leaves."
        },
        "chips": {
            "name": "Classic Potato Chips (Family Bag)",
            "shelf_name": "Aisle C1 - Snack Island",
            "backroom_name": "Snack Storage Rack 4",
            "expiry_date": today + datetime.timedelta(days=45), # Expiry ok
            "low_stock_threshold": 8,
            "total_deliveries": 20,
            "total_sales": 18, # Stock = 2 (Low stock -> Orange)
            "healthy_action": "Stack bags neatly and face barcodes forward."
        },
        "chocolates": {
            "name": "Swiss Hazelnut Dark Chocolate",
            "shelf_name": "Aisle C2 - Confectionery",
            "backroom_name": "Air-Conditioned Cabinet 1",
            "expiry_date": today + datetime.timedelta(days=120), # Expiry ok
            "low_stock_threshold": 15,
            "total_deliveries": 50,
            "total_sales": 10, # Stock = 40 (Healthy -> Green)
            "healthy_action": "Check for correct price tag. Keep away from bright spotlights."
        }
    }

PRODUCTS = init_products()

# =====================================================================
# Localization Mappings (Plain & Simple for Busy Store Workers)
# =====================================================================

CURRENT_LANG = "en"

PRODUCT_TRANSLATIONS = {
    "en": {
        "milk": "Organic Whole Milk",
        "bread": "Sliced Sourdough Bread",
        "vegetables": "Fresh Organic Spinach",
        "chips": "Classic Potato Chips (Family Bag)",
        "chocolates": "Swiss Hazelnut Dark Chocolate",
    },
    "es": {
        "milk": "Leche Entera Orgánica",
        "bread": "Pan de Masa Madre en Rodajas",
        "vegetables": "Espinaca Orgánica Fresca",
        "chips": "Papas Fritas Clásicas (Familiar)",
        "chocolates": "Chocolate Negro Suizo con Avellanas",
    },
    "hi": {
        "milk": "ऑर्गेनिक होल मिल्क",
        "bread": "स्लाइस्ड सोरडो ब्रेड",
        "vegetables": "ताज़ा ऑर्गेनिक पालक",
        "chips": "क्लासिक आलू चिप्स (फ़ैमिली पैक)",
        "chocolates": "स्विस हेज़लनट डार्क चॉकलेट",
    }
}

LOCATION_TRANSLATIONS = {
    "en": {
        "shelf_milk": "Aisle A1 - Dairy Fridge",
        "backroom_milk": "Walk-in Cooler Row 2",
        "shelf_bread": "Aisle B1 - Bakery Rack",
        "backroom_bread": "Fresh Bakery Crates",
        "shelf_vegetables": "Aisle A2 - Produce Table",
        "backroom_vegetables": "Produce Chiller Shelf 1",
        "shelf_chips": "Aisle C1 - Snack Island",
        "backroom_chips": "Snack Storage Rack 4",
        "shelf_chocolates": "Aisle C2 - Confectionery",
        "backroom_chocolates": "Air-Conditioned Cabinet 1",
    },
    "es": {
        "shelf_milk": "Pasillo A1 - Heladera de Lácteos",
        "backroom_milk": "Cámara de Frío Fila 2",
        "shelf_bread": "Pasillo B1 - Estante de Panadería",
        "backroom_bread": "Cajón de Pan Fresco",
        "shelf_vegetables": "Pasillo A2 - Mesa de Verduras",
        "backroom_vegetables": "Heladera de Verduras Estante 1",
        "shelf_chips": "Pasillo C1 - Isla de Snacks",
        "backroom_chips": "Estante de Snacks 4",
        "shelf_chocolates": "Pasillo C2 - Dulces",
        "backroom_chocolates": "Gabinete con Aire 1",
    },
    "hi": {
        "shelf_milk": "गलियारा A1 - डेयरी फ्रिज",
        "backroom_milk": "कोल्ड रूम लाइन 2",
        "shelf_bread": "गलियारा B1 - बेकरी रैक",
        "backroom_bread": "ताजा बेकरी क्रेट",
        "shelf_vegetables": "गलियारा A2 - सब्जी टेबल",
        "backroom_vegetables": "सब्जी चिलर रैक 1",
        "shelf_chips": "गलियारा C1 - नमकीन आइलैंड",
        "backroom_chips": "नमकीन रैक 4",
        "shelf_chocolates": "गलियारा C2 - चॉकलेट रैक",
        "backroom_chocolates": "कूलिंग केबिन 1",
    }
}

TEXT_TRANSLATIONS = {
    "en": {
        "healthy_action_milk": "Ensure milk cartons are upright and organized by brand.",
        "healthy_action_bread": "Keep rack clean and pull oldest bags forward.",
        "healthy_action_vegetables": "Mist with cool water periodically. Check for wilted leaves.",
        "healthy_action_chips": "Stack bags neatly and face barcodes forward.",
        "healthy_action_chocolates": "Check for correct price tag. Keep away from bright spotlights.",
        "healthy": "Healthy: Under control",
        "expired_days_ago": "CRITICAL: Expired {days} days ago!",
        "expired_one_day_ago": "CRITICAL: Expired 1 day ago!",
        "expired_today": "CRITICAL: Expires today!",
        "expires_in_days": "WARNING: Expires in {days} days!",
        "expires_in_one_day": "WARNING: Expires in 1 day!",
        "pull_immediate_action": "PULL PRODUCT IMMEDIATELY. Dispose of it safely. Do not sell under any circumstances.",
        "expires_today_action": "Move to checkout desk. Apply 75% markdown sticker. Dispose if unsold by closing.",
        "expires_soon_action": "Apply 50% discount sticker. Move to front of {location} for immediate clearance.",
        "out_of_stock": "ALERT: Out of Stock in Backroom!",
        "out_of_stock_action": "No units left in {location}. Place an urgent replenishment order with supplier.",
        "low_stock": "WARNING: Low Stock ({qty} units left in backroom)!",
        "low_stock_action": "Stock level ({qty}) is below threshold of {threshold}. Pull remaining units from {backroom} to {shelf}, and create a replenishment order.",
        "toast_insufficient_stock_for": "Error: Not enough stock in the backroom for {name}!",
    },
    "es": {
        "healthy_action_milk": "Asegúrate de que los cartones de leche estén parados y ordenados por marca.",
        "healthy_action_bread": "Mantén el estante limpio y pon las bolsas más viejas adelante.",
        "healthy_action_vegetables": "Rocía con agua fría cada tanto. Quita las hojas marchitas.",
        "healthy_action_chips": "Apila las bolsas prolijamente y pon los códigos de barras hacia adelante.",
        "healthy_action_chocolates": "Revisa que el precio esté bien. Aléjalos de las luces calientes.",
        "healthy": "Sano: Todo bajo control",
        "expired_days_ago": "CRÍTICO: ¡Venció hace {days} días!",
        "expired_one_day_ago": "CRÍTICO: ¡Venció hace 1 día!",
        "expired_today": "CRÍTICO: ¡Vence hoy!",
        "expires_in_days": "ADVERTENCIA: ¡Vence en {days} días!",
        "expires_in_one_day": "ADVERTENCIA: ¡Vence en 1 día!",
        "pull_immediate_action": "SACA EL PRODUCTO YA. Tíralo a la basura. No lo vendas por nada del mundo.",
        "expires_today_action": "Llévalo a la caja. Ponle etiqueta de 75% de descuento. Tíralo si no se vende al cerrar.",
        "expires_soon_action": "Ponle etiqueta de 50% de descuento. Ponlo al frente en {location} para que salga rápido.",
        "out_of_stock": "ALERTA: ¡No queda nada en el depósito!",
        "out_of_stock_action": "Sin unidades en {location}. Pide stock urgente al proveedor ya.",
        "low_stock": "ADVERTENCIA: ¡Queda poco! (Solo {qty} en depósito)",
        "low_stock_action": "El stock ({qty}) bajó del límite de {threshold}. Trae lo que quede de {backroom} a {shelf}, y pide más.",
        "toast_insufficient_stock_for": "Error: ¡No hay suficiente stock en el depósito para {name}!",
    },
    "hi": {
        "healthy_action_milk": "दूध के पैकेटों को सीधा खड़ा रखें और ब्रांड के हिसाब से लगाएं।",
        "healthy_action_bread": "रैक को साफ़ रखें और पुराने पैकेटों को आगे की तरफ करें।",
        "healthy_action_vegetables": "समय-समय पर ठंडा पानी छिड़कते रहें। सड़े हुए पत्ते निकाल दें।",
        "healthy_action_chips": "पैकेटों को ढंग से जमाएं और बारकोड आगे की तरफ रखें।",
        "healthy_action_chocolates": "कीमत का टैग चेक करें। तेज रोशनी और गर्मी से दूर रखें।",
        "healthy": "बढ़िया: सब काबू में है",
        "expired_days_ago": "बहुत जरूरी: {days} दिन पहले ही एक्सपायर हो गया!",
        "expired_one_day_ago": "बहुत जरूरी: 1 दिन पहले ही एक्सपायर हो गया!",
        "expired_today": "बहुत जरूरी: आज ही एक्सपायर हो रहा है!",
        "expires_in_days": "चेतावनी: {days} दिनों में एक्सपायर होने वाला है!",
        "expires_in_one_day": "चेतावनी: कल ही एक्सपायर होने वाला है!",
        "pull_immediate_action": "सामान तुरंत हटाओ! इसे सुरक्षित रूप से फेंक दो। किसी भी हाल में बेचना नहीं है।",
        "expires_today_action": "काउंटर पर लाओ। 75% छूट का स्टिकर लगाओ। दुकान बंद होने तक न बिके तो फेंक दो।",
        "expires_soon_action": "50% छूट का स्टिकर लगाओ। तुरंत बेचने के लिए {location} में सबसे आगे रखो।",
        "out_of_stock": "अलर्ट: गोदाम में स्टॉक खत्म!",
        "out_of_stock_action": "{location} में एक भी पीस नहीं है। सप्लायर को तुरंत नया आर्डर भेजो।",
        "low_stock": "चेतावनी: स्टॉक कम है! (गोदाम में केवल {qty} बचे हैं)",
        "low_stock_action": "स्टॉक ({qty}) लिमिट {threshold} से कम है। बचे हुए माल को {backroom} से निकालकर {shelf} पर लाओ, और नया आर्डर डालो।",
        "toast_insufficient_stock_for": "गलती: {name} के लिए गोदाम में पर्याप्त स्टॉक नहीं है!",
    }
}

# =====================================================================
# Stock Monitor Agent using Gemini 2.5 Flash
# =====================================================================

class AlertItem(BaseModel):
    product_id: str = Field(description="The unique ID/key of the product (e.g. 'milk')")
    product_name: str = Field(description="The full readable name of the product")
    priority: str = Field(description="Priority of the alert: 'CRITICAL', 'WARNING', or 'INFO'")
    urgency_score: int = Field(description="Urgency score from 0 (lowest) to 100 (highest) based on expiry threat and stock level combinations")
    reasoning: str = Field(description="A plain language explanation of why this product requires attention and why the urgency is rated this way")
    recommended_action: str = Field(description="A concrete, actionable step the convenience store manager should take immediately")

class AgentAnalysis(BaseModel):
    alerts: List[AlertItem] = Field(description="List of all stock and expiry alerts ranked by urgency/priority")
    summary: str = Field(description="A concise overall summary of the store inventory health")

class StockMonitorAgent:
    def __init__(self, api_key):
        self.client = genai.Client(api_key=api_key)
        self.last_run_timestamp = None
        self.status = "idle"  # idle, scanning, error
        self.summary = "No scan completed yet. Click 'Run Manual Scan' or wait for scheduled run."
        self.alerts = []
        self.error_message = None
        self._lock = threading.Lock()
        
    def get_state(self):
        with self._lock:
            return {
                "last_run": self.last_run_timestamp,
                "status": self.status,
                "summary": self.summary,
                "alerts": self.alerts,
                "error": self.error_message
            }
            
    def run_scan(self, lang="en"):
        with self._lock:
            # If already scanning, don't run again
            if self.status == "scanning":
                return
            self.status = "scanning"
            self.error_message = None
            
        try:
            # Safely capture current database state
            current_data = []
            for prod_id, data in PRODUCTS.items():
                view = compute_product_view(prod_id, data, lang=lang)
                current_data.append({
                    "id": view["id"],
                    "name": view["name"],
                    "shelf_location": view["shelf_name"],
                    "backroom_location": view["backroom_name"],
                    "expiry_date": view["expiry_date"],
                    "days_to_expiry": view["days_to_expiry"],
                    "backroom_quantity": view["backroom_quantity"],
                    "low_stock_threshold": view["low_stock_threshold"],
                    "status": view["status"]
                })
                
            lang_names = {"en": "English", "es": "Spanish", "hi": "Hindi"}
            target_lang = lang_names.get(lang, "English")
            
            prompt = f"""
            You are the StoreEx Stock Monitor Agent, an expert AI agent specializing in retail inventory management.
            Your task is to analyze the current inventory data of our convenience store, reason about product urgency, and generate plain language alerts ranked by priority (CRITICAL, WARNING, INFO).

            CRITICAL: Write all reasoning, recommended actions, and executive health summary in the {target_lang} language. 
            All descriptions must be simple, plain, and direct — written like talking to a busy store worker, not a tech person.

            Current store date context: Today is {datetime.date.today().strftime('%B %d, %Y')}.

            Analyze both expiry dates and stock levels together:
            - CRITICAL alerts include products that are already expired, expiring today/tomorrow (especially if stock is high), or completely out-of-stock items that have high sales velocity or are essential.
            - WARNING alerts include products expiring soon (within 3 days) or items with low stock (at or below threshold).
            - INFO alerts include minor updates, healthy statuses, or general stock maintenance tips.

            Here is the inventory data:
            {json.dumps(current_data, indent=2)}

            Format your analysis as a structured response matching the schema. Rank the alerts list by urgency_score in descending order (highest score first).
            """
            
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=dict(
                    response_mime_type="application/json",
                    response_schema=AgentAnalysis,
                ),
            )
            
            result_data = json.loads(response.text)
            
            with self._lock:
                self.summary = result_data.get("summary", "No summary provided.")
                self.alerts = result_data.get("alerts", [])
                # Ensure they are sorted by urgency_score descending
                self.alerts.sort(key=lambda x: x.get("urgency_score", 0), reverse=True)
                self.status = "idle"
                self.last_run_timestamp = datetime.datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")
                
        except Exception as e:
            print("Error in agent scan:", e)
            with self._lock:
                self.status = "error"
                self.error_message = str(e)

# Instantiate the agent using the provided API key
AGENT_API_KEY = "AIzaSyC2neHd8_rvxzTrLONNBNPXD7d4DMllZQ0"
AGENT = StockMonitorAgent(api_key=AGENT_API_KEY)

def background_agent_loop():
    # Delay initial scan to let server start up
    time.sleep(3)
    while True:
        try:
            print("Background agent running scheduled inventory scan in language:", CURRENT_LANG)
            AGENT.run_scan(lang=CURRENT_LANG)
        except Exception as e:
            print("Error in background agent scheduled run:", e)
        time.sleep(60)

# Start background thread only in the main Werkzeug process to avoid running twice in debug mode
if not app.debug or os.environ.get("WERKZEUG_RUN_MAIN") == "true":
    threading.Thread(target=background_agent_loop, daemon=True).start()

# API Endpoints for Stock Monitor Agent
@app.route("/api/agent/status", methods=["GET"])
def get_agent_status():
    global CURRENT_LANG
    lang = request.args.get('lang', CURRENT_LANG)
    if lang in ["en", "es", "hi"]:
        CURRENT_LANG = lang
    return jsonify(AGENT.get_state())

@app.route("/api/agent/scan", methods=["POST"])
def trigger_agent_scan():
    global CURRENT_LANG
    lang = request.args.get('lang', CURRENT_LANG)
    if lang in ["en", "es", "hi"]:
        CURRENT_LANG = lang
        
    state = AGENT.get_state()
    if state["status"] == "scanning":
        return jsonify({"success": False, "message": "Scan already in progress."}), 400
        
    threading.Thread(target=AGENT.run_scan, args=(lang,)).start()
    return jsonify({"success": True, "message": "Scan initiated."})

def compute_product_view(prod_id, data, lang="en"):
    today = datetime.date.today()
    qty = data["total_deliveries"] - data["total_sales"]
    days_to_expiry = (data["expiry_date"] - today).days
    
    # Fallback to english if not supported
    if lang not in ["en", "es", "hi"]:
        lang = "en"
        
    p_name = PRODUCT_TRANSLATIONS[lang].get(prod_id, data["name"])
    s_name = LOCATION_TRANSLATIONS[lang].get(f"shelf_{prod_id}", data["shelf_name"])
    b_name = LOCATION_TRANSLATIONS[lang].get(f"backroom_{prod_id}", data["backroom_name"])
    
    # Default state (Green/Healthy)
    status = "green"
    problem = TEXT_TRANSLATIONS[lang]["healthy"]
    action = TEXT_TRANSLATIONS[lang].get(f"healthy_action_{prod_id}", data["healthy_action"])
    
    # Priority 1: Expiry warning (Red)
    if days_to_expiry <= 3:
        status = "red"
        if days_to_expiry < 0:
            days_ago = -days_to_expiry
            if days_ago == 1:
                problem = TEXT_TRANSLATIONS[lang]["expired_one_day_ago"]
            else:
                problem = TEXT_TRANSLATIONS[lang]["expired_days_ago"].format(days=days_ago)
            action = TEXT_TRANSLATIONS[lang]["pull_immediate_action"]
        elif days_to_expiry == 0:
            problem = TEXT_TRANSLATIONS[lang]["expired_today"]
            action = TEXT_TRANSLATIONS[lang]["expires_today_action"]
        else:
            if days_to_expiry == 1:
                problem = TEXT_TRANSLATIONS[lang]["expires_in_one_day"]
            else:
                problem = TEXT_TRANSLATIONS[lang]["expires_in_days"].format(days=days_to_expiry)
            action = TEXT_TRANSLATIONS[lang]["expires_soon_action"].format(location=s_name)
            
    # Priority 2: Low Stock warning (Orange)
    elif qty <= data["low_stock_threshold"]:
        status = "orange"
        if qty <= 0:
            problem = TEXT_TRANSLATIONS[lang]["out_of_stock"]
            action = TEXT_TRANSLATIONS[lang]["out_of_stock_action"].format(location=b_name)
        else:
            problem = TEXT_TRANSLATIONS[lang]["low_stock"].format(qty=qty)
            action = TEXT_TRANSLATIONS[lang]["low_stock_action"].format(
                qty=qty, threshold=data["low_stock_threshold"], backroom=b_name, shelf=s_name
            )

    return {
        "id": prod_id,
        "name": p_name,
        "shelf_name": s_name,
        "backroom_name": b_name,
        "expiry_date": data["expiry_date"].strftime("%Y-%m-%d"),
        "days_to_expiry": days_to_expiry,
        "low_stock_threshold": data["low_stock_threshold"],
        "total_deliveries": data["total_deliveries"],
        "total_sales": data["total_sales"],
        "backroom_quantity": qty,
        "status": status,
        "problem": problem,
        "action": action
    }

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/products")
def get_products():
    global CURRENT_LANG
    lang = request.args.get('lang', CURRENT_LANG)
    if lang in ["en", "es", "hi"]:
        CURRENT_LANG = lang
    response = {}
    for prod_id, data in PRODUCTS.items():
        response[prod_id] = compute_product_view(prod_id, data, lang=lang)
    return jsonify(response)

@app.route("/api/sell", methods=["POST"])
def sell_product():
    global CURRENT_LANG
    lang = request.args.get('lang', CURRENT_LANG)
    if lang in ["en", "es", "hi"]:
        CURRENT_LANG = lang
    req_data = request.get_json()
    if not req_data or "id" not in req_data:
        return jsonify({"error": "Missing product ID"}), 400
        
    prod_id = req_data["id"]
    if prod_id not in PRODUCTS:
        return jsonify({"error": "Product not found"}), 404
        
    # Get quantity from request, default to 1
    qty = req_data.get("quantity", 1)
    try:
        qty = int(qty)
        if qty <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "Quantity must be a positive integer"}), 400
        
    # Calculate available stock
    available_stock = PRODUCTS[prod_id]["total_deliveries"] - PRODUCTS[prod_id]["total_sales"]
    if available_stock < qty:
        return jsonify({"error": "Not enough stock in the backroom!"}), 400
        
    # Increment total sales by requested quantity
    PRODUCTS[prod_id]["total_sales"] += qty
    
    # Return updated product info
    updated_info = compute_product_view(prod_id, PRODUCTS[prod_id], lang=lang)
    return jsonify({"success": True, "product": updated_info})

@app.route("/api/sell_multi", methods=["POST"])
def sell_multiple_products():
    global CURRENT_LANG
    lang = request.args.get('lang', CURRENT_LANG)
    if lang in ["en", "es", "hi"]:
        CURRENT_LANG = lang
    req_data = request.get_json()
    if not req_data or "items" not in req_data:
        return jsonify({"error": "Missing items in transaction"}), 400
        
    items = req_data["items"]
    if not isinstance(items, dict):
        return jsonify({"error": "Items must be a dictionary/object"}), 400
        
    if len(items) == 0:
        return jsonify({"error": "Transaction is empty"}), 400
        
    # Validate all items first for atomic consistency
    for prod_id, qty in items.items():
        if prod_id not in PRODUCTS:
            return jsonify({"error": f"Product {prod_id} not found"}), 404
        try:
            qty = int(qty)
            if qty <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return jsonify({"error": f"Invalid quantity for {prod_id}"}), 400
            
        current_stock = PRODUCTS[prod_id]["total_deliveries"] - PRODUCTS[prod_id]["total_sales"]
        if current_stock < qty:
            p_name = PRODUCT_TRANSLATIONS[lang].get(prod_id, PRODUCTS[prod_id]["name"])
            err_template = TEXT_TRANSLATIONS[lang].get("toast_insufficient_stock_for", "Error: Not enough stock for {name}!")
            return jsonify({"error": err_template.format(name=p_name)}), 400
            
    # Apply deductions if all valid
    updated_products = []
    for prod_id, qty in items.items():
        qty = int(qty)
        PRODUCTS[prod_id]["total_sales"] += qty
        updated_info = compute_product_view(prod_id, PRODUCTS[prod_id], lang=lang)
        updated_products.append(updated_info)
        
    return jsonify({"success": True, "products": updated_products})

@app.route("/api/deliver", methods=["POST"])
def deliver_product():
    global CURRENT_LANG
    lang = request.args.get('lang', CURRENT_LANG)
    if lang in ["en", "es", "hi"]:
        CURRENT_LANG = lang
    req_data = request.get_json()
    if not req_data or "id" not in req_data or "quantity" not in req_data:
        return jsonify({"error": "Missing product ID or quantity"}), 400
        
    prod_id = req_data["id"]
    qty = req_data["quantity"]
    if prod_id not in PRODUCTS:
        return jsonify({"error": "Product not found"}), 404
        
    try:
        qty = int(qty)
    except ValueError:
        return jsonify({"error": "Quantity must be an integer"}), 400
        
    PRODUCTS[prod_id]["total_deliveries"] += qty
    updated_info = compute_product_view(prod_id, PRODUCTS[prod_id], lang=lang)
    return jsonify({"success": True, "product": updated_info})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
