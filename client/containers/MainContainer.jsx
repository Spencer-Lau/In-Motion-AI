import React from 'react';
import { useSelector } from 'react-redux';
import Logo from '../components/Logo.jsx';
import SearchContainer from '../components/SearchContainer.jsx';
import ResultsDisplay from './ResultsDisplay.jsx';

// I WANT THIS TO BE THE MAIN CONTAINER THAT HAS THE LOGO, SEARCH, AND RETURN IN DIFFERENT ELEMENTS FROM DIFFERENT MODULES
const MainContainer = () => {
  return (
    <div className='mainContainer'>
      <Logo/>
      <h1 id='searchHeader'>Exercie Search</h1>
      <SearchContainer />
      <ResultsDisplay />
    </div>
  );
};

export default MainContainer;
