import { useState} from 'react';

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
    const [fetchedData, setFetchedData] = useState(null);
    const handleChange = (event) => {
        fetchData(setFetchedData,event.target.value);
  };

    return (
      <div>
        <h2>Instant Search Component</h2>
        <p>It's a simple React component.</p>
        <input
                type="text"
                onChange={(e) => handleChange(e)}
                placeholder="Enter search text"
            />
        {fetchedData ? (
        <p>Fetched Message: {fetchedData.message}</p>
      ) : (
        <p>Loading...</p>
      )}
      </div>
    );
  }
  
export default InstantSearch;
