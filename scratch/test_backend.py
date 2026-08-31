import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:8001/api/payments/plans") as response:
        html = response.read()
        plans = json.loads(html.decode('utf-8'))
        print("Local backend 8001 plans count:", len(plans))
        for p in plans:
            print(p.get("plan_id"), p.get("amount"), p.get("launch_offer"))
except Exception as e:
    print("Error connecting to local 8001:", e)
