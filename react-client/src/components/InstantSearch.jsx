import * as React from 'react';
import { useState, useEffect} from 'react';
import './InstantSearch.css'
import Pagination from '@mui/material/Pagination';

const per_page = 5

function filter_map_to_string(filterMap){
  if(Object.keys(filterMap).length === 0){
    return ''
  }
  let result = ''
  for (const key in filterMap) {
    const list = filterMap[key]
    if(list.length === 0){
      continue
    }
    const listString = `[${list.join(', ')}]`;
    result += `${key}:=${listString} && `;
  }
  return result.slice(0, -4);//remove trailing ' && '
}

const fetchData = async (setData, q,page, filterMap) => {
  const filter_string = filter_map_to_string(filterMap)
  console.log(`fetching : query '${q}', page '${page}', filter '${filter_string}'`)
  const searchParameters = {
    q:q,
    query_by  : 'title,categories,authors',
    query_by_weights: '10,4,1',
    infix     : 'always',
    page: page,
    per_page: per_page,
    facet_by: 'categories,status,authors',
    filter_by:filter_string
    }
    try {
      const response = await fetch('http://localhost:3000/search',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({searchParameters:searchParameters})
        });
      const data = await response.json();
      console.log(data)
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
};

const SearchBar = ({textChange}) => {

  return(
    <div className='search-bar'>
    <input className="search-input" autoFocus
            type="text"
            onChange={(e) => textChange(e)}
    />
    <div className='search-icon' >
      <object data="search.drawio.svg" aria-label="search.drawio.svg"/>
    </div>
  </div>
  )
}

const Document = ({hit}) => {
  return(
    <div className="search-document">
      <img src={hit.document.thumbnailUrl} alt={hit.document.title} />
      <Title hit={hit} />
      <Authors hit={hit} />
      {hit.document.shortDescription &&
      <p className='search-description'>Description: {hit.document.shortDescription}</p>
      }
      <Categories hit={hit} />
    </div>
  )
}

const Title = ({hit}) => {
  if((hit.highlights.length > 0)&&(hit.highlight.title)){
    return (
      <h3 dangerouslySetInnerHTML={{__html: hit.highlight.title.snippet}}></h3>
    )  
  }
  else{
    return (<h3>{hit.document.title}</h3>)
  }
}

const Authors = ({hit}) => {
  if((hit.highlights.length > 0)&&(hit.highlight.authors)){
    const authors_snippets = hit.highlight.authors.map(author => author.snippet)
    const authors_html_string = `Authors: ${authors_snippets.join(', ')}`
    return (<p dangerouslySetInnerHTML={{
      __html: authors_html_string
    }}></p>)
  }
  else if(hit.document.authors){
    return (
      <p>Authors: {hit.document.authors?.join(', ')}</p>
    )  
  }
  else{
    return (<p>Authors: - </p>)
  }
}

const Categories = ({hit}) => {
  if((hit.highlights.length > 0)&&(hit.highlight.categories)){
    const categories_snippets = hit.highlight.categories.map(author => author.snippet)
    const categories_html_string = `Categories: ${categories_snippets.join(', ')}`
    return (<p dangerouslySetInnerHTML={{
      __html: categories_html_string
    }}></p>)
  }
  else if(hit.document.categories.length > 0){
    return (
      <p>Categories: {hit.document.categories?.join(', ')}</p>
    )  
  }
  else{
    return (<p>Categories: - </p>)
  }
}


const SearchStats = ({searchResults,page,nbPages,handleChangePage}) => {

  return (
    <>
      {searchResults &&
        <div className='search-stats'>
          <div className='search-found'>
          found {searchResults.found}
          </div>
          <div className='search-pagination'>
            {(nbPages > 1) && <Pagination 
              count={nbPages}
              page={page}
              onChange={handleChangePage}
            />}
          </div>
        </div>
      }
    </>
  )

}

const FacetSelector = ({facet_counts,filterMap, handleFacetSelect}) => {

  return (
    <div className='search-facets'>
      {facet_counts.map( (facet,index) => (
        <div key={index} className='search-one-facet' data-field-name={facet.field_name}>
          <h3>Filter by {facet.field_name}</h3>
          {facet.counts.map((field,field_index)=>(
            <label key={field_index} className="search-facet-field">
              <div>
                <input 
                  data-value={field.value}
                  type="checkbox"
                  checked={filterMap[facet.field_name]?.includes(field.value) || false}
                  onChange={handleFacetSelect}
                />
                <span className="facet-field-checkmark">{field.value}</span>
              </div>
              <span className='facet-field-count'>{field.count}</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  )
}

const InstantSearch = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setsearchResults] = useState(null);
  const [nbPages, setNbPages] = useState(0);
  const [page, setPage] = useState(1);
  const [filterMap, setFilterMap] = useState({});

  const textChange = (event) => {
    setQuery(event.target.value)
    setPage(1)
    fetchData(setsearchResults,event.target.value,page,filterMap);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchData(setsearchResults,query,newPage,filterMap);
  };

  const handleFacetSelect = (event) => {
    const field_name = event.target.parentElement.parentElement.parentElement.getAttribute("data-field-name")
    const value = event.target.getAttribute("data-value")
    const newFilterMap = JSON.parse(JSON.stringify(filterMap));
    if(!(field_name in newFilterMap)){
      newFilterMap[field_name] = []
    }
    const newSet = new Set(newFilterMap[field_name]);
    if(event.target.checked){
      newSet.add(value);
    }else{
      newSet.delete(value);
    }
    newFilterMap[field_name] = Array.from(newSet)
    if(newFilterMap[field_name].length === 0){
      delete newFilterMap[field_name]
    }
    console.log(newFilterMap)
    setFilterMap(newFilterMap)
    fetchData(setsearchResults,query,page,newFilterMap);
  }
  
  useEffect(() => {
    if (searchResults) {
        const newNbPages = Math.ceil(searchResults.found / per_page);
        setNbPages(newNbPages);
    }
  }, [searchResults]);
  return (
    <div className='search-container'>
      <SearchBar textChange={textChange} />
      {searchResults &&
        <div className='search-results'>
          <FacetSelector 
            filterMap={filterMap}
            facet_counts={searchResults.facet_counts}
            handleFacetSelect={handleFacetSelect} 
          />
          <div className='search-results-body'>
            <SearchStats 
              searchResults={searchResults}
              page              ={page}
              nbPages           ={nbPages}
              handleChangePage  ={handleChangePage }
            />
            <div className='search-hits' >
              {(searchResults.found >0) && 
                searchResults.hits.map((hit,index) => (
                  <Document key={index} hit={hit} />
                ))}
            </div>
            <SearchStats 
              searchResults={searchResults}
              page              ={page}
              nbPages           ={nbPages}
              handleChangePage  ={handleChangePage }
            />
          </div>
        </div>
      }
    </div>
  );
}
  
export default InstantSearch;
