import * as React from 'react';
import { useState, useEffect} from 'react';
import './InstantSearch.css'
import Pagination from '@mui/material/Pagination';

const per_page = 5

const fetchData = async (setData, q,page) => {
  console.log(q)
  const searchParameters = {
    q:q,
    query_by  : 'title,authors',
    query_by_weights: '3,1',
    infix     : 'always',
    page: page,
    per_page: per_page
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

const InstantSearch = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setsearchResults] = useState(null);
  const [nbPages, setNbPages] = useState(0);
    const [page, setPage] = useState(1);

    const handleChange = (event) => {
        console.log("handleChange")
        setQuery(event.target.value)
        setPage(1)
        fetchData(setsearchResults,event.target.value,page);
      };

      const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchData(setsearchResults,query,newPage);
      };
    
      useEffect(() => {
        if (searchResults) {
            const newNbPages = Math.ceil(searchResults.found / per_page);
            setNbPages(newNbPages);
        }
    }, [searchResults]);
    return (
      <>
        <div className='search-box'>
          <div className='search-container'>
            <input className="search-input" autoFocus
                    type="text"
                    onChange={(e) => handleChange(e)}
                />
              <div className='search-icon' >
              <object data="search.drawio.svg"/>
          </div>
          </div>
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
          <div className='search-hits' >
            {searchResults &&
            (searchResults.found >0) && 
              searchResults.hits.map(hit => (
                <div key={hit.document.id} className="search-result">
                  <img src={hit.document.thumbnailUrl} alt={hit.document.title} />
                  <Title hit={hit} />
                  <Authors hit={hit} />
                  {hit.document.shortDescription &&
                  <p className='search-description'>Description: {hit.document.shortDescription}</p>
                  }
                  <hr/>
                </div>
              ))
            }
          </div>
        </div>
      </>
    );
  }
  
export default InstantSearch;
