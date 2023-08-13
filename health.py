import os
from dotenv import load_dotenv
import typesense


load_dotenv()
api_key = os.getenv('TYPESENSE_API_KEY')
if(api_key is None):
    print("API key not found, provide TYPESENSE_API_KEY variable in .env")
    exit(0)

host = os.getenv('HOST')
port = os.getenv('PORT')
protocol = 'https' if (os.getenv('USE_HTTPS')=='true') else 'http'

print(f"connecting typesense client to {protocol}://{host}:{port}")

client = typesense.Client({
  'api_key': api_key,
  'nodes': [{
    'host': host,
    'port': port,
    'protocol': protocol
  }],
  'connection_timeout_seconds': 2
})

health = client.operations.is_healthy()
print(f"health: {health}")
