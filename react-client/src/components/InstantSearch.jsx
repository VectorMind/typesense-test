import { useState} from 'react';
import './InstantSearch.css'

const fetchData = async (setData, searchText) => {
  console.log(searchText)
    try {
      const response = await fetch('http://localhost:3000/search',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({q:searchText})
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
    const [searchResults, setsearchResults] = useState(null);
    const handleChange = (event) => {
      console.log("handleChange")
        fetchData(setsearchResults,event.target.value);
      };

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
