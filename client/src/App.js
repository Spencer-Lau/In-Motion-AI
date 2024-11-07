import React from 'react'; // import React
import { useState, useRef } from 'react'; // import useState (to manage state) and useRef (creates a reference) React hooks 
import './App.css'; // import App.css/styling

function App() {
  // const [searchEntry, setSearchEntry] = useState(''); // sets state for searchEntry to user input text (ref: unit6TicTacToe)
  const [responseResults, setResponseResults] = useState([]); // sets state for responseResults to results of search from backend
  const searchInputRef = useRef(null); // searchInputRef, a mutable obj, assigned to the reference obejct of the input DOM element/text input field once rendered
  // no need to re-render the text box, so no need to set state, only want the text

  const exerciseSearch = () => {
    const searchInput = searchInputRef.current.value.trim();; // input, assigned the value from the text box/DOM
    if (searchInput) {
      fetch(`http://localhost:8080/api/search?id=${encodeURIComponent(searchInput)}`) // searches database upon submitting search Id/term
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch data from the server');
          }
          console.log(response);
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setResponseResults(data); // sets responseResults state to the data returned from the db
          searchInputRef.current.value = ''; // resets search box to an empty string after each search
        })
        .catch((error) => {
          console.error('Error: ', error);
          alert('Something went wrong. Please try again.');
        });
    } else {
      alert('Please enter a search term');
    }
  };

  return (
    <div className="searchContainer">
      <header className="searchHeader">
      </header>
        <h1>Exercise Search</h1>
        <input
        type="text"
        id="searchId"
        placeholder="Search exercises by name"
        ref={searchInputRef} // once this element is rendered, React assigns the input field to searchInputRef.current, allows direct interaction after
        onKeyDown={ // search triggers on pressing enter or with button click below
          (e) => {
            if (e.key === 'Enter') {
              exerciseSearch();
            }
          }
        }
        />
        <button id="searchButton" onClick={exerciseSearch}>Search</button>
        
        <div id="searchResults">
        {responseResults.length > 0 ? ( // if there is 1 or more results in the responseResults array
          <ul>
            {responseResults.map((exercise) => ( // map the array, a list item for each element
              <li key={exercise.id}>{exercise.name} - {exercise.instructions}</li> // each list item has the specified info from the db row/entry
            ))}
          </ul>
        ) : ( // if no results returned, display the <p>/string
          <p>No exercises found</p>
        )}
      </div>
    </div>
  );
}

export default App;
