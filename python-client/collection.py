import os
from dotenv import load_dotenv
import typesense
import json

def create_collection(client):
  print("* creating collection")
  client.collections.create({
      "name": "books",
      "fields": [
          {"name": "title", "type": "string"},
          {"name": "authors", "type": "string[]", "facet": True, "optional": True},
          {"name": "publication_year", "type": "int32", "facet": True, "optional": True},
          {"name": "ratings_count", "type": "int32"},
          {"name": "average_rating", "type": "float", "optional": True},
          {"name": "image_url", "type": "string", "optional": True }
      ],
      "default_sorting_field": "ratings_count"
  })

  return

def create_documents(client):
  print("* upserting documents:")
  hunger_games_book = {
      'id': '1', 'original_publication_year': 2008, 'authors': ['Suzanne Collins'], 'average_rating': 4.34,
      'publication_year': 2008, 'title': 'The Hunger Games',
      'image_url': 'https://images.gr-assets.com/books/1447303603m/2767052.jpg',
      'ratings_count': 4780653
  }

  #print(client.collections['books'].documents.create(hunger_games_book))
  client.collections['books'].documents.upsert(hunger_games_book)
  client.collections['books'].documents.upsert({
      'id': '2', 'title': 'Test example',
      'ratings_count': 512
  })
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
create_collection(client)

print("listing all collections:")
collections = client.collections.retrieve()
for collection in collections:
  print(f" - {collection['name']}")

create_documents(client)

print(f"\nexport:")
export_output = client.collections['books'].documents.export()
for line in export_output.splitlines():
  document = json.loads(line)
  print(f" - title: {document['title']}")
