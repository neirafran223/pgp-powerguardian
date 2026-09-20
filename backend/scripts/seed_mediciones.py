import requests
import random
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

# 1. Login para obtener token
print("Haciendo login...")
login = requests.post(f"{BASE_URL}/auth/login", data={
    "username": "admin@pgp.cl",
    "password": "admin123"
})

if login.status_code != 200:
    print(f"Error en login: {login.text}")
    exit(1)

token = login.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"Token obtenido OK")

# 2. Verificar que existe equipo 1
equipo = requests.get(f"{BASE_URL}/equipos/2", headers=headers)
if equipo.status_code != 200:
    print("No existe equipo con ID 1. Crealo primero desde el frontend.")
    exit(1)

print(f"Equipo encontrado: {equipo.json()['nombre']}")

# 3. Ingestar 50 mediciones simuladas (ultimas 24 horas)
print("Ingresando 50 mediciones simuladas...")
now = datetime.utcnow()
exitos = 0
errores = 0

for i in range(50):
    ts = now - timedelta(minutes=30 * (50 - i))
    medicion = {
        "equipo_id": 2,
        "timestamp": ts.isoformat() + "Z",
        "voltaje_l1": round(random.uniform(215, 235), 2),
        "voltaje_l2": round(random.uniform(215, 235), 2),
        "voltaje_l3": round(random.uniform(215, 235), 2),
        "corriente_l1": round(random.uniform(10, 25), 2),
        "corriente_l2": round(random.uniform(10, 25), 2),
        "corriente_l3": round(random.uniform(10, 25), 2),
        "thd": round(random.uniform(1.5, 8.0), 2),
        "frecuencia": round(random.uniform(49.8, 50.2), 2),
        "factor_potencia": round(random.uniform(0.85, 0.99), 3),
        "temperatura_gabinete": round(random.uniform(22, 38), 2),
        "estado_medicion": "normal" if random.random() > 0.1 else "alerta"
    }

    res = requests.post(f"{BASE_URL}/mediciones/", json=medicion, headers=headers)
    if res.status_code == 201:
        exitos += 1
    else:
        errores += 1
        print(f"  Error en medicion {i+1}: {res.text}")

print(f"\nResultado: {exitos} exitosas, {errores} errores")

# 4. Verificar dashboard
print("\nVerificando dashboard...")
dashboard = requests.get(f"{BASE_URL}/dashboard/resumen/2", headers=headers)
if dashboard.status_code == 200:
    data = dashboard.json()
    print(f"  Equipo: {data['equipo']['nombre']}")
    print(f"  Total mediciones: {data['total_mediciones']}")
    ultima = data['ultima_medicion']
    if ultima['timestamp']:
        print(f"  Ultima medicion: {ultima['timestamp']}")
        print(f"  Voltaje L1: {ultima['voltaje_l1']} V")
        print(f"  THD: {ultima['thd']} %")
        print(f"  Frecuencia: {ultima['frecuencia']} Hz")

print("\nPrueba de ingesta completada!")
