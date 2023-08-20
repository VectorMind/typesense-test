import * as React from 'react';
import { useState, useEffect} from 'react';
import './InstantSearch.css'
import Pagination from '@mui/material/Pagination';

const per_page = 5

const fetchData = async (setData, q,page, filter) => {
  console.log(q)
  const searchParameters = {
    q:q,
    query_by  : 'title,categories,authors',
    query_by_weights: '10,4,1',
    infix     : 'always',
    page: page,
    per_page: per_page,
    facet_by: 'categories,authors',
    filter_by:filter
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

const FacetSelector = ({facet_counts,handleFacetSelect}) => {

  return (
    <div className='search-facets'>
      {facet_counts.map( (facet,index) => (
        <div key={index} className='search-one-facet'>
          <h3>Filter by {facet.field_name}</h3>
          {facet.counts.map((field,field_index)=>(
            <label key={field_index} class="search-facet-field">
              <span className='facet-field-count'>{field.count}</span>
              <input type="checkbox" checked=""/>
              <span class="facet-field-checkmark">{field.value}</span>
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
  const [filter, setFilter] = useState('');

    const handleChange = (event) => {
        console.log("handleChange")
        setQuery(event.target.value)
        setPage(1)
        fetchData(setsearchResults,event.target.value,page,filter);
      };

      const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchData(setsearchResults,query,newPage,filter);
      };

      const handleFacetSelect = (event) => {
        const newFilter = ''
        setFilter(newFilter)
        fetchData(setsearchResults,query,page,newFilter);
      }
    
      useEffect(() => {
        if (searchResults) {
            const newNbPages = Math.ceil(searchResults.found / per_page);
            setNbPages(newNbPages);
        }
    }, [searchResults]);
    return (
        <div className='search-container'>
          <div className='search-bar'>
            <input className="search-input" autoFocus
                    type="text"
                    onChange={(e) => handleChange(e)}
            />
            <div className='search-icon' >
              <object data="search.drawio.svg"/>
            </div>
          </div>
          {searchResults &&
            <div className='search-results'>
              <FacetSelector facet_counts={searchResults.facet_counts} handleFacetSelect={handleFacetSelect} />
              <div className='search-results-body'>
                <SearchStats 
                  searchResults={searchResults}
                  page              ={page}
                  nbPages           ={nbPages}
                  handleChangePage  ={handleChangePage }
                />
                <div className='search-hits' >
                  {(searchResults.found >0) && 
                    searchResults.hits.map(hit => (
                      <div key={hit.document.id} className="search-document">
                        <img src={hit.document.thumbnailUrl} alt={hit.document.title} />
                        <Title hit={hit} />
                        <Authors hit={hit} />
                        {hit.document.shortDescription &&
                        <p className='search-description'>Description: {hit.document.shortDescription}</p>
                        }
                        <Categories hit={hit} />
                        <hr/>
                      </div>
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
