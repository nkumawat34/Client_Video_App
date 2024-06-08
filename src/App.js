import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from './screens/Lobby';
import './App.css';
import Room from './screens/Room';
function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomid" element={<Room/>}></Route>
      </Routes>
   
  );
}

export default App;
