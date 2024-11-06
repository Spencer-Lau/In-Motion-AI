import React from 'react'; // import React
import { useState, useRef } from 'react'; // import useState (to manage state) and useRef (creates a reference) React hooks 
import './App.css'; // import App.css/styling

function App() {
  // const [searchEntry, setSearchEntry] = useState(''); // sets state for searchEntry to user input text (ref: unit6TicTacToe)
  const [responseResults, setResponseResults] = useState([]); // sets state for responseResults to results of search from backend
  const searchInputRef = useRef(null); // searchInputRef, a mutable obj, assigned to the reference obejct of the input DOM element/text input field once rendered
  // no need to re-render the text box, so no need to set state, only want the text

  const exerciseSearch = () => {
    const searchInput = searchInputRef.current.value; // input, assigned the value from the text box/DOM
    fetch(`http://localhost:8080/api/search?term=${encodeURIComponent(searchInput)}`) // searches database upon submitting search term
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setResponseResults(data);
        searchInputRef.current.value = '';
      })
      .catch((error) => console.error('Error: ', error))
    };

  return (
    <div className="searchContainer">
      <header className="searchHeader">
      </header>
        <h1>Exercise Search</h1>
        <input
        type="text"
        id="searchTerm"
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
