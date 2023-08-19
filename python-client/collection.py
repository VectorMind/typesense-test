import os
from dotenv import load_dotenv
import typesense
import json
import requests

def load_json(fileName):
    return json.load(open(fileName))

def save_json(fileName,data):
    jfile = open(fileName, "w")
    jfile.write(json.dumps(data, indent=4))
    jfile.close()
    print(f"{len(data)} entries saved in {fileName}")
    return

def create_collection(client,schema):
  print("* creating collection")
  client.collections.create(schema)
  return

def create_documents(client,documents):
  print(f"* upserting {len(documents)} documents:")
  #print(client.collections['books'].documents.create(hunger_games_book))
  for document in documents:
    client.collections['books'].documents.upsert(document)
  return

load_dotenv()
api_key = os.getenv('TYPESENSE_API_KEY')
if(api_key is None):
    print("API key not found, provide TYPESENSE_API_KEY variable in .env")
    exit(0)

host = os.getenv('HOST')
port = os.getenv('TYPESENSE_PORT')
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

try:
  books = client.collections['books'].retrieve()
  print("collection 'books' exist deleting old collection")
  client.collections['books'].delete()
except typesense.exceptions.ObjectNotFound as e:
  print(e)
  print("collection 'books' does not exist")

print("* creating new 'books' collection")
schema = load_json("schema.json")
create_collection(client,schema)

print("listing all collections:")
collections = client.collections.retrieve()
for collection in collections:
  print(f" - {collection['name']}")

if os.path.exists("books.json"):
  books = load_json("books.json")
else:
  response = requests.get("https://raw.githubusercontent.com/bvaughn/infinite-list-reflow-examples/master/books.json")
  if response.status_code != 200:
      print(f"Failed to fetch data. Status code: {response.status_code}")
      exit(0)
  data = response.json()
  books = []
  for book in data:
    if("publishedDate" in book):
      del book["publishedDate"]
    if("isbn" in book):
       books.append(book)
    
  save_json("books.json",books)

create_documents(client,books)

print(f"\nexport:")
export_output = client.collections['books'].documents.export()
for line in export_output.splitlines():
  document = json.loads(line)
  print(f" - title: {document['title']}")
