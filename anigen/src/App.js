import React from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Avatar from './components/CreateAvatar/CreateAvatar';
import Home from './components/Home/home';
import Home2 from './components/Home2/Home2';
import About from './components/About/about';
import Difference from './components/Difference/difference';
import Service from './components/Services/services';
import Contact from './components/Contact/contact';
import Login from './components/LogIn/Login';
import TTS from './components/TTS/TTS';
import WebGL from './components/Web GL/WebGL';
import Register from './components/Register/Register';
import Footer from './components/Footer/footer';
import { Route, Routes} from 'react-router-dom';

function App() {
  const auth = localStorage.getItem("user");
  const isAuthenticated = auth !== null;

  const publicRoutes = (
    <Routes>
      <Route path="/" element={<><Navbar /><Home /></>} />
      <Route path="/home" element={<><Navbar /><Home /></>} />
      <Route path="/about" element={<><Navbar /><About /></>} />
      <Route path="/difference" element={<><Navbar /><Difference /></>} />
      <Route path="/avatar" element={<><Navbar /><Home /></>} />
      <Route path="/TTS" element={<><Navbar /><Home /></>} />
      <Route path="/video" element={<><Navbar /><Home /></>} />
      <Route path="/service" element={<><Navbar /><Service /></>} />
      <Route path="/contact" element={<><Navbar /><Contact /></>} />
      <Route path="/login" element={<><Navbar /><Login /></>} />
      <Route path="/register" element={<><Navbar /><Register /></>} />
    </Routes>
  );

  const privateRoutes = (
    <Routes>
      <Route path="/" element={<><Navbar /><Home /></>} />
      <Route path="/home" element={<><Navbar /><Home2 /></>} />
      <Route path="/about" element={<><Navbar /><About /></>} />
      <Route path="/difference" element={<><Navbar /><Difference /></>} />
      <Route path="/avatar" element={<><Navbar /><Avatar /></>} />
      <Route path="/TTS" element={<><Navbar /><TTS /></>} />
      <Route path="/video" element={<><Navbar /><WebGL /></>} />
      <Route path="/service" element={<><Navbar /><Service /></>} />
      <Route path="/contact" element={<><Navbar /><Contact /></>} />
    </Routes>
  );

  const routes = isAuthenticated ? privateRoutes : publicRoutes;

  return (
    <>
      {routes}
      <Footer />
    </>
  );
}

export default App;
