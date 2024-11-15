import React from 'react';

function SearchInput({ searchInputRef, muscleOptions, categoryOptions, muscle, setMuscle, category, setCategory, exerciseSearch }) {
  return (
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
  );
}

export default SearchInput;