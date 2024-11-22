import React, { useState, useRef, useEffect } from 'react'; // import React and useState (to manage state) and useRef (creates a reference) React hooks
import './App.css'; // import App.css/styling

function App() {
  // const [searchEntry, setSearchEntry] = useState(''); // sets state for searchEntry to user input text (ref: Unit6 TicTacToe)
  const [responseResults, setResponseResults] = useState([]); // sets state for responseResults to results of search from backend
  const [muscle, setMuscle] = useState('');
  const [category, setCategory] = useState('');
  const searchInputRef = useRef(null); // searchInputRef, a mutable obj, assigned to the reference obejct of the input DOM element/text input field once rendered
  // no need to re-render the text box, so no need to set state, only want the text

  const [muscleOptions, setMuscleOptions] = useState([]); // state for muscle options
  const [categoryOptions, setCategoryOptions] = useState([]); // state for category options
  const [expandedExerciseId, setExpandedExerciseId] = useState(null); // state to track expanded exercise on hover

  useEffect(() => {
    // console.log('Muscle selected:', muscle);  // log muscle selection
    // console.log('Category selected:', category);  // log category selection
  }, [muscle, category]); // Re-run this when either muscle or category changes
  
  useEffect(() => { // fetch muscle and category options from backend
    const fetchOptions = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/unique-values');
        if (!response.ok) throw new Error('Failed to fetch options');
        const data = await response.json();
        
        const sortedMuscles = data.muscles.sort((a, b) => a.localeCompare(b)); // sort muscle options
        const sortedCategories = data.categories.sort((a, b) => a.localeCompare(b)); // sort category options

        setMuscleOptions(sortedMuscles); // set muscle options/state after sorting
        setCategoryOptions(sortedCategories); // set category options/state after sorting
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
    fetchOptions();
  }, []); // empty dependency array means this effect runs once when the component mounts

  const getSearchInputs = () => { // input retrieval helper function
    return {
      searchTerm: searchInputRef.current?.value.trim() || '', // get the search term
      naturalLanguageQuery: naturalLanguageInputRef.current?.value.trim() || '', // get the AI-assist route search term
    };
  };
  
  const exerciseSearch = async () => {
    const { searchTerm } = getSearchInputs();
    const queryParams = {};
    
    // only add the parameters that are non-empty
    if (searchTerm) queryParams.id = searchTerm; // include the search term if provided
    if (muscle) queryParams.muscle = muscle; // include muscle if selected
    if (category) queryParams.category = category; // include category if selected

    if (Object.keys(queryParams).length === 0) { // if no filter or search term is provided, show an alert and stop the search
      alert('Please enter a search term or select a filter');
      return;
    }

    try {
      const query = new URLSearchParams(queryParams).toString(); // construct the query string using URLSearchParams
      const response = await fetch(`http://localhost:8080/api/search?${query}`);
      if (!response.ok) throw new Error('Failed to fetch data from the server');
      const data = await response.json();
      setResponseResults(data); // sets responseResults state with the search results
      searchInputRef.current.value = ''; // resets search box to an empty string after each search
    } catch (error) {
      console.error('Error: ', error);
      alert('Something went wrong. Please try again.');
    }
  };

  // AI functionality
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [aiResponse, setAIResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const naturalLanguageInputRef = useRef(null); // naturalLanguageInputRef, a mutable obj, assigned to the reference obejct of the input DOM element/text input field once rendered

  const aiExerciseSearch = async () => {
    const { naturalLanguageQuery, searchTerm } = getSearchInputs();

    const queryParams = { query: naturalLanguageQuery };
    if (searchTerm) queryParams.id = searchTerm;
    if (muscle) queryParams.muscle = muscle;
    if (category) queryParams.category = category;

    if (!naturalLanguageQuery) {
      alert('Please enter a search.');
      return;  
    }

    setLoading(true); // Start loading
    setError(''); // Clear previous errors
  
    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await fetch(`http://localhost:8080/api/aisearch?${queryString}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: naturalLanguageQuery,
          id: searchTerm,
          muscle,
          category
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch data from the server');
      const data = await response.json();
      setAIResponse(data); // sets responseResults state with the search results
      naturalLanguageInputRef.current.value = ''; // resets search box to an empty string after each search
      searchInputRef.current.value = '';
    } catch (error) {
      console.error('Error: ', error);
      alert('Something went wrong with the AI assisted query. Please try again.');
    }
  };
  
  return (
    <div id="appContainer">

      {/* DISPLAYS THE LOGO AND PROJECT / APPLICATION NAME */}

      <div id="browserLogo">
        <img src="/Shirt Logo Draft.png" alt="Logo" />
        {/* <img src="/l-intro-1630426166.jpg" alt="pic1" />
        <img src="/istockphoto-1322887164-612x612.jpg" alt="pic2" />
        <img src="/no-such-thing-as-a-bad-workout-1.jpg" alt="pic3" /> */}
      </div>

      {/* DISPLAYS THE SEARCH INPUT METHODS */}

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

      {/* AI Assisted Exercise Search Input*/}

          <h1>AI Assisted Exercise Search</h1>
          <input
            type="text"
            id="aiSearchId"
            placeholder="Search with AI-assisted search and response"
            ref={naturalLanguageInputRef} // once this element is rendered, React assigns the input field to searchInputRef.current, allows direct interaction after
            onKeyDown={(e) => { // search triggers on pressing enter or with button click below
              if (e.key === 'Enter') aiExerciseSearch();
            }}
          />
          <button id="searchButton" onClick={aiExerciseSearch}>Search</button>
        </div>
      </div>

      {/* DISPLAYS THE RETURNED EXERCISE RESULTS AS A UNORDERED LIST */}
      
      <div id="searchResults" className="resultsContainer">
        {loading && <div>Loading...</div>}
        {responseResults.length > 0 ? ( // if there is 1 or more results in the responseResults array
          <ul>
            {responseResults.map((exercise) => ( // map the array, a list item for each element
              <li key={exercise.id}>
                <h3>{exercise.name}</h3>
                {Array.isArray(exercise.images) ? (
                  exercise.images.map((imageUrl, index) => (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Exercise Image ${index + 1}`}
                      style={{ maxWidth: '20%', height: 'auto', marginBottom: '10px' }} // style the images if needed
                    />
                  ))
                ) : (
                  <p>No images available</p> // Fallback if `exercise.images` isn't an array
                )}
                <button
                  onMouseEnter={() => setExpandedExerciseId(exercise.id)}
                  onMouseLeave={() => setExpandedExerciseId(null)}
                >
                  Hover to Expand
                </button>
                {expandedExerciseId === exercise.id && (
                  <div className="expandedDetails">
                    <p>Force: {exercise.force}</p>
                    <p>Level: {exercise.level}</p>
                    <p>Mechanic: {exercise.mechanic}</p>
                    <p>Equipment: {exercise.equipment}</p>
                    <p>Instructions: {exercise.instructions}</p>
                  </div>
                )}
              </li> // each list item has the specified info from the db row/entry
            ))}
          </ul>
        ) : ( // if no results returned, display the <p>/string
          <p>Please search for an exercise</p>
        )}
      </div>
      
      {/* DISPLAYS THE AI RESPONSE */}
      
      {aiResponse && (
        <div id="aiResponseContainer">
          <h2>AI Recommendation</h2>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  );
}

export default App;
