import React from 'react';
import Logo from '../components/Logo.jsx';
import SearchContainer from './SearchContainer.jsx';
import ResultsContainer from './ResultsContainer.jsx';

// I WANT THIS TO BE THE MAIN CONTAINER THAT HAS THE LOGO, SEARCH, AND RETURN IN DIFFERENT ELEMENTS FROM DIFFERENT MODULES
const MainContainer = () => {
  return (
    <div className='mainContainer'>
      <Logo/>
      <h1 id='searchHeader'>Exercise Search</h1>
      <SearchContainer />
      <ResultsContainer />
    </div>
  );
};

export default MainContainer;
