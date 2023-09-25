import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import EditProfile from './EditProfile';
import '../styles/UserProfile.css';
import CreativeSpinner from './CreativeSpinner';
import { useNavigate, useLocation } from 'react-router-dom';

import axios from 'axios';

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = new URLSearchParams(location.search).get('token');

        if (!token) {
          navigate('/signin'); // Redirect the user to the login page if no token is found
          return;
        }

        const response = await axios.get('https://xcel-back.onrender.com/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data) {
          throw new Error('User profile not found');
        }

        setUserProfile(response.data);
        setLoading(false);
        setError(null);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, location.search]);


  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleUpdateProfile = async (updatedProfileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('https://xcel-back.onrender.com/api/profile', updatedProfileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserProfile(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      // Send a request to the server to log the user out
      await axios.post('https://xcel-back.onrender.com/api/logout');
      // Clear the token from local storage
      localStorage.removeItem('token');
      // Redirect the user to the login page using navigate
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="user-profile-container">
      <h1>User Profile</h1>
      {loading && (
        <motion.div
          className="loading-container"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
        >
          <CreativeSpinner />
          <p className="loading-text">Loading...</p>
        </motion.div>
      )}
      {error && <p className="error-message">Error: {error}</p>}
      {!loading && !error && userProfile && (
        <div className="profile-info">
          <div className="profile-image-container">
            <motion.img
              src={`https://xcel-back.onrender.com/${userProfile.profileImage}?key=${Date.now()}`}
              alt="Profile"
              className="profile-image"
              whileHover={{ scale: 1.1 }}
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite error loop
                e.target.src = 'https://sanjaybasket.s3.ap-south-1.amazonaws.com/image.webp'; // Display a default image on error
              }}
            />
          </div>
          <p>Username: {userProfile.username}</p>
          <p>Email: {userProfile.email}</p>
          <p>First Name: {userProfile.firstName}</p>
          <p>Last Name: {userProfile.lastName}</p>
          <p>Bio: {userProfile.bio}</p>
          <button className="edit-button" onClick={handleEditProfile}>
            Edit Profile
          </button>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
      )}
      {isEditing && (
        <EditProfile userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />
      )}
    </div>
  );
};

export default UserProfile;
