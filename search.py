import os
from dotenv import load_dotenv
import typesense
import json

load_dotenv()
client = typesense.Client({
  'api_key': os.getenv('TYPESENSE_API_KEY'),
  'nodes': [{
    'host': os.getenv('HOST'),
    'port': os.getenv('PORT'),
    'protocol': 'https' if (os.getenv('USE_HTTPS')=='true') else 'http'
  }],
  'connection_timeout_seconds': 2
})

search_result = client.collections['books'].documents.search({
    'q': 'hunger',
    'query_by': 'title',
    'filter_by': 'ratings_count:>100',  # trying to override the embedded filter
    'sort_by': 'ratings_count:desc'
})

print("search result:")
print(json.dumps(search_result,indent=4))
