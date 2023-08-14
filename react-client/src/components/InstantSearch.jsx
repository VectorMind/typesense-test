import { useState, useEffect } from 'react';

const InstantSearch = () => {

    const [fetchedData, setFetchedData] = useState(null);


    useEffect(() => {
        async function fetchData() {
          try {
            const response = await fetch('http://localhost:3001/api/test');
            const data = await response.json();
            setFetchedData(data);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        }
    
        fetchData();
      }, []);


    return (
      <div>
        <h2>This is MyComponent</h2>
        <p>It's a simple React component.</p>
        {fetchedData ? (
        <p>Fetched Message: {fetchedData.message}</p>
      ) : (
        <p>Loading...</p>
      )}
      </div>
    );
  }
  
export default InstantSearch;
