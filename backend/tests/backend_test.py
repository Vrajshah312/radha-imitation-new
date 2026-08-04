"""Backend API tests for Radha Jewellery Node/Express + WordPress GraphQL mode toggle."""
import os
import pytest
import requests

BASE = "https://15d414b0-cd88-4d1c-bfc9-35e5cc9f4a8d.preview.emergentagent.com/api"

ADMIN_EMAIL = "admin@radhajewellery.com"
ADMIN_PASSWORD = "Admin@123"


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{BASE}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def customer_token():
    import uuid
    email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{BASE}/auth/register", json={
        "name": "TEST User", "email": email, "password": "Passw0rd!", "phone": "9999999999"
    })
    assert r.status_code in (200, 201), r.text
    data = r.json()
    return data["token"], email


# --- Health & mode ---
def test_health():
    r = requests.get(f"{BASE}/health")
    assert r.status_code == 200
    assert r.json().get("status") in ("ok", "OK") or r.json().get("ok") is True or "ok" in str(r.json()).lower()


def test_mode_endpoint():
    r = requests.get(f"{BASE}/mode")
    assert r.status_code == 200
    d = r.json()
    assert d["defaultMode"] == "demo"
    assert d["wordpressConfigured"] is False
    assert d["mode"] in ("demo", "live")


# --- DEMO mode catalog ---
def _cats(body):
    return body if isinstance(body, list) else body.get("categories", body.get("data", []))


def _products(body):
    return body if isinstance(body, list) else body.get("products", body.get("data", []))


def test_demo_categories():
    r = requests.get(f"{BASE}/categories", headers={"X-Data-Mode": "demo"})
    assert r.status_code == 200
    cats = _cats(r.json())
    assert len(cats) >= 3
    assert any(c.get("subcategories") for c in cats)


def test_demo_products_count():
    r = requests.get(f"{BASE}/products", headers={"X-Data-Mode": "demo"})
    assert r.status_code == 200
    assert len(_products(r.json())) >= 18


@pytest.mark.parametrize("query", [
    "bestseller=true", "isNew=true", "category=earrings", "subcategory=studs", "search=jhumka"
])
def test_demo_product_filters(query):
    r = requests.get(f"{BASE}/products?{query}", headers={"X-Data-Mode": "demo"})
    assert r.status_code == 200
    body = r.json()
    products = body if isinstance(body, list) else body.get("products", body.get("data", []))
    assert isinstance(products, list)


def test_demo_single_product():
    r = requests.get(f"{BASE}/products/p001", headers={"X-Data-Mode": "demo"})
    assert r.status_code == 200
    body = r.json()
    p = body.get("product", body)
    assert p.get("id") == "p001"


def test_live_products_empty():
    r = requests.get(f"{BASE}/products", headers={"X-Data-Mode": "live"})
    assert r.status_code == 200
    assert _products(r.json()) == []


def test_live_categories_empty():
    r = requests.get(f"{BASE}/categories", headers={"X-Data-Mode": "live"})
    assert r.status_code == 200
    assert _cats(r.json()) == []


# --- Auth ---
def test_admin_login(admin_token):
    assert admin_token


def test_auth_me(customer_token):
    token, email = customer_token
    r = requests.get(f"{BASE}/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    got = r.json().get("user", r.json()).get("email", "")
    assert got.lower() == email.lower()


# --- Admin catalog write guard ---
def _new_product_payload():
    import uuid
    return {
        "id": f"TEST_{uuid.uuid4().hex[:6]}",
        "name": "TEST Ring",
        "price": 199,
        "mrp": 299,
        "category": "rings",
        "subcategory": "gold",
        "description": "test",
        "images": ["/a.jpg"],
        "stock": 5,
    }


def test_admin_product_create_blocked_in_live(admin_token):
    r = requests.post(
        f"{BASE}/admin/products",
        json=_new_product_payload(),
        headers={"Authorization": f"Bearer {admin_token}", "X-Data-Mode": "live"},
    )
    assert r.status_code == 409, r.text


def test_admin_product_create_allowed_in_demo(admin_token):
    r = requests.post(
        f"{BASE}/admin/products",
        json=_new_product_payload(),
        headers={"Authorization": f"Bearer {admin_token}", "X-Data-Mode": "demo"},
    )
    assert r.status_code in (200, 201), r.text


def test_admin_inventory_adjust_blocked_in_live(admin_token):
    r = requests.patch(
        f"{BASE}/admin/inventory/p001/adjust",
        json={"delta": 1},
        headers={"Authorization": f"Bearer {admin_token}", "X-Data-Mode": "live"},
    )
    assert r.status_code == 409


# --- Admin non-catalog endpoints ---
@pytest.mark.parametrize("path", ["/admin/stats", "/admin/orders", "/admin/users", "/admin/banners"])
@pytest.mark.parametrize("mode", ["demo", "live"])
def test_admin_noncat_endpoints(admin_token, path, mode):
    r = requests.get(f"{BASE}{path}", headers={"Authorization": f"Bearer {admin_token}", "X-Data-Mode": mode})
    assert r.status_code == 200, f"{path} @ {mode}: {r.status_code} {r.text[:200]}"


# --- Order flow (demo) ---
def test_order_create_and_list(customer_token):
    token, _ = customer_token
    payload = {
        "items": [{"id": "p001", "qty": 1}],
        "shippingAddress": {
            "name": "TEST",
            "phone": "9999999999",
            "line1": "1 Test St",
            "city": "Mumbai",
            "state": "MH",
            "pincode": "400001",
            "country": "IN"
        },
        "paymentMethod": "cod"
    }
    r = requests.post(f"{BASE}/orders", json=payload, headers={"Authorization": f"Bearer {token}", "X-Data-Mode": "demo"})
    assert r.status_code in (200, 201), r.text
    order = r.json()
    assert order.get("id") or order.get("_id") or order.get("order")

    r2 = requests.get(f"{BASE}/orders", headers={"Authorization": f"Bearer {token}", "X-Data-Mode": "demo"})
    assert r2.status_code == 200
    body = r2.json()
    orders = body if isinstance(body, list) else body.get("orders", body.get("data", []))
    assert len(orders) >= 1
