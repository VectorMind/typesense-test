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
                  <img src={hit.document.image_url} alt={hit.document.title} />
                  <h3>{hit.highlight.title.snippet}</h3>
                  <p>Author: {hit.document.authors?.join(', ')}</p>
                  <p>Year: {hit.document.original_publication_year}</p>
                  <p>Average Rating: {hit.document.average_rating}</p>
                </div>
              ))
            }
          </div>
        </div>
      </>
    );
  }
  
export default InstantSearch;
