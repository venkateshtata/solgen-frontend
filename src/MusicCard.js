import React from 'react';
import './MusicCard.css';

function MusicCard({ musician, color }) {
  const playAudio = (audioUrl) => {
    new Audio(audioUrl).play();
  };

  return (
    <div className="musicCard" style={{ backgroundColor: color }}>
      <h2>{musician.name}</h2>
      <p>User ID: {musician.userID}</p>
      <p>Followers: {musician.followers.toLocaleString()}</p>
      <p>Rating: {musician.rating} / 5</p>
      <button onClick={() => playAudio(musician.audioUrl)}>Play Music</button>
    </div>
  );
}

export default MusicCard;
