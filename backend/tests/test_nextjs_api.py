"""Backend API tests for Next.js Radha Jewellery app."""
import os
import requests
import pytest

BASE_URL = "https://15d414b0-cd88-4d1c-bfc9-35e5cc9f4a8d.preview.emergentagent.com"
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _products(r):
    j = r.json()
    return j.get("products", j) if isinstance(j, dict) else j


# --- Mode ---
def test_mode(client):
    r = client.get(f"{API}/mode")
    assert r.status_code == 200
    assert r.json().get("wordpressConfigured") is False


# --- Products ---
def test_products_list(client):
    r = client.get(f"{API}/products")
    assert r.status_code == 200
    items = _products(r)
    assert isinstance(items, list) and len(items) == 18


def test_products_filter_bestseller(client):
    r = client.get(f"{API}/products?bestseller=true")
    assert r.status_code == 200
    items = _products(r)
    assert len(items) > 0
    for p in items:
        assert p.get("bestseller") or p.get("isBestseller")


def test_products_filter_new(client):
    r = client.get(f"{API}/products?isNew=true")
    assert r.status_code == 200
    items = _products(r)
    assert len(items) > 0


def test_products_filter_category(client):
    r = client.get(f"{API}/products?category=necklaces")
    assert r.status_code == 200
    items = _products(r)
    assert isinstance(items, list) and len(items) > 0
    for p in items:
        assert p.get("category") == "necklaces"


def test_products_filter_subcategory(client):
    r = client.get(f"{API}/products?category=necklaces&subcategory=kundan-sets")
    assert r.status_code == 200
    items = _products(r)
    assert len(items) > 0
    for p in items:
        assert p.get("subcategory") == "kundan-sets"


def test_products_search(client):
    r = client.get(f"{API}/products?search=temple")
    assert r.status_code == 200
    items = _products(r)
    assert isinstance(items, list) and len(items) > 0


def test_product_single(client):
    r = client.get(f"{API}/products/p001")
    assert r.status_code == 200
    p = r.json().get("product") or r.json()
    assert p.get("id") == "p001"
    assert p.get("name") or p.get("title")


def test_product_404(client):
    r = client.get(f"{API}/products/nonexistent-xyz")
    assert r.status_code == 404


# --- Categories ---
def test_categories(client):
    r = client.get(f"{API}/categories")
    assert r.status_code == 200
    cats = r.json().get("categories") or r.json()
    assert isinstance(cats, list) and len(cats) == 3


# --- Auth ---
def test_register_and_me(client):
    payload = {"name": "QA Buyer", "email": f"qa_{os.urandom(3).hex()}@test.com", "password": "secret123"}
    r = client.post(f"{API}/auth/register", json=payload)
    assert r.status_code in (200, 201), r.text

    me = client.get(f"{API}/auth/me")
    assert me.status_code == 200
    user = me.json().get("user") or me.json()
    assert user.get("email") == payload["email"]


def test_me_without_cookie_401():
    fresh = requests.Session()
    r = fresh.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_login_then_me(client):
    email = f"qa_{os.urandom(3).hex()}@test.com"
    client.post(f"{API}/auth/register", json={"name": "A", "email": email, "password": "secret123"})
    client.post(f"{API}/auth/logout")
    r = client.post(f"{API}/auth/login", json={"email": email, "password": "secret123"})
    assert r.status_code == 200
    me = client.get(f"{API}/auth/me")
    assert me.status_code == 200


def test_register_short_password_rejected(client):
    r = client.post(f"{API}/auth/register", json={"name": "X", "email": "short@test.com", "password": "123"})
    assert r.status_code >= 400


# --- Orders ---
def test_orders_requires_auth():
    fresh = requests.Session()
    r = fresh.post(f"{API}/orders", json={"items": [], "shipping": {}})
    assert r.status_code == 401


def test_orders_preview(client):
    email = f"buyer_{os.urandom(3).hex()}@test.com"
    reg = client.post(f"{API}/auth/register", json={"name": "Buyer", "email": email, "password": "secret123"})
    assert reg.status_code in (200, 201)

    order_payload = {
        "items": [{"id": "p001", "slug": "p001", "title": "Test", "price": 999, "qty": 1}],
        "shipping": {
            "fullName": "QA Buyer", "address": "1 Main St", "city": "Mumbai",
            "state": "MH", "pincode": "400001", "phone": "9999999999"
        },
        "paymentMethod": "cod",
    }
    r = client.post(f"{API}/orders", json=order_payload)
    assert r.status_code == 201, r.text
    data = r.json()
    order = data.get("order", data)
    oid = order.get("id") or order.get("orderId") or data.get("id")
    assert oid and "PREVIEW" in str(oid).upper()
