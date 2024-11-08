import React, { useState, useRef, useEffect } from 'react'; // import React and useState (to manage state) and useRef (creates a reference) React hooks 
import './App.css'; // import App.css/styling

function App() {
  // const [searchEntry, setSearchEntry] = useState(''); // sets state for searchEntry to user input text (ref: unit6TicTacToe)
  const [responseResults, setResponseResults] = useState([]); // sets state for responseResults to results of search from backend
  const [muscle, setMuscle] = useState('');
  const [category, setCategory] = useState('');
  const searchInputRef = useRef(null); // searchInputRef, a mutable obj, assigned to the reference obejct of the input DOM element/text input field once rendered
  // no need to re-render the text box, so no need to set state, only want the text

  const [muscleOptions, setMuscleOptions] = useState([]); // state for muscle options
  const [categoryOptions, setCategoryOptions] = useState([]); // state for category options

  useEffect(() => {
    console.log('Muscle selected:', muscle);  // log muscle selection
    console.log('Category selected:', category);  // log category selection
  }, [muscle, category]); // Re-run this when either muscle or category changes
  
  useEffect(() => { // fetch muscle and category options from backend
    const fetchOptions = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/unique-values');
        if (!response.ok) {
          throw new Error('Failed to fetch options');
        }
        const data = await response.json();
        setMuscleOptions(data.muscles); // set muscle options
        setCategoryOptions(data.categories); // set category options
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
  
    fetchOptions();
  }, []); // empty dependency array means this effect runs once when the component mounts

  const exerciseSearch = () => {
    const searchInput = searchInputRef.current.value.trim(); // get the search term
    const queryParams = {};
    
    // only add the parameters that are non-empty
    if (searchInput) queryParams.id = searchInput; // include the search term if provided
    if (muscle && muscle !== "") queryParams.muscle = muscle; // include muscle if selected
    if (category && category !== "") queryParams.category = category; // include category if selected

    if (Object.keys(queryParams).length === 0) { // if no filter or search term is provided, show an alert and stop the search
      alert('Please enter a search term or select a filter');
      return;
    }

    const query = new URLSearchParams(queryParams).toString(); // construct the query string using URLSearchParams

    fetch(`http://localhost:8080/api/search?${query}`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch data from the server');
        return response.json();
      })
      .then((data) => {
        setResponseResults(data); // sets responseResults state with the search results
        searchInputRef.current.value = ''; // resets search box to an empty string after each search
      })
      .catch((error) => {
        console.error('Error: ', error);
        alert('Something went wrong. Please try again.');
      });
  };

  return (
    <div id="appContainer">
      <div id="browserLogo">
        <img src="/Shirt Logo Draft.png" alt="Logo" />
        {/* <img src="/l-intro-1630426166.jpg" alt="pic1" />
        <img src="/istockphoto-1322887164-612x612.jpg" alt="pic2" />
        <img src="/no-such-thing-as-a-bad-workout-1.jpg" alt="pic3" /> */}
      </div>
      <div className="searchContainer">
        <div className="inputContainer">
          <h1>Exercise Search</h1>
          <input
            type="text"
            id="searchId"
            placeholder="Search exercises by name"
            ref={searchInputRef} // once this element is rendered, React assigns the input field to searchInputRef.current, allows direct interaction after
            onKeyDown={(e) => { // search triggers on pressing enter or with button click below
              if (e.key === 'Enter') exerciseSearch();
            }}
          />
          <select
            value={muscle}
            onChange={(e) => setMuscle(e.target.value)} // update muscle state
            placeholder="Select Muscle"
          >
            <option value="">Select Muscle</option>
            {muscleOptions.map((m, index) => (
              <option key={index} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)} // update category state
            placeholder="Select Category"
          >
            <option value="">Select Category</option>
            {categoryOptions.map((c, index) => (
              <option key={index} value={c}>{c}</option>
            ))}
          </select>
          <button id="searchButton" onClick={exerciseSearch}>Search</button>
        </div>
      </div>
      <div id="searchResults" className="resultsContainer">
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
