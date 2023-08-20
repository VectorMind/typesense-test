# typesense-test
simple usage of typesense container and client

## Faceting
- https://typesense.org/docs/0.25.0/api/search.html#facet-results
- https://typesense.org/docs/0.25.0/api/search.html#filter-parameters

ideas: could add negation and or logic. For or logic, need to fetch all options with an empty quesry string and keep them fixed in the Facet Filter instead of updating facets from searchResults


## versions
- image: typesense/typesense:0.24.1
- typesense-python: typesnse==0.16.0

# references
books list : https://raw.githubusercontent.com/bvaughn/infinite-list-reflow-examples/master/books.json
