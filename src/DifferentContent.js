import React, { useState, useRef } from 'react';
import AWS from 'aws-sdk';
import './DifferentContent.css';

function DifferentContent() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [userID, setUserID] = useState("");
  const [name, setName] = useState("");

  // Configure AWS S3
  AWS.config.update({
    region: 'ap-south-1', // Replace with your DynamoDB region
    credentials: new AWS.Credentials({
      accessKeyId: "AKIAQ3EGPPNKIMSTY64J", // Use environment variables
      secretAccessKey: "fH+BALS2qDrcLO5L7ZCdgeIorf5l9MEUWWmC1rpH",
    }),
  });
  
  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: 'encode-music-bucket' } // Your bucket name
  });
  const corsParams = {
    Bucket: 'encode-music-bucket',
    CORSConfiguration: { // This is where the JSON format comes into play
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'], // The methods you want to allow
          AllowedOrigins: ['http://localhost:3000'], // Origins you want to allow requests from
          ExposeHeaders: [],
          MaxAgeSeconds: 3000, // Optional
        },
      ],
    },
  };
  
  s3.putBucketCors(corsParams, function(err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Success', data);
    }
  });


  const docClient = new AWS.DynamoDB.DocumentClient();

  const handleUploadClick = () => {
    fileInputRef.current.click(); // Programmatically click the hidden file input
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Set selected file
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value); // Set description
  };

  const handleUserIDChange = (event) => {
    setUserID(event.target.value); // Set userID
  };

  const handleNameChange = (event) => {
    setName(event.target.value); // Set name
  };

  const handleUploadAndPost = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    const fileName = `${Date.now()}-${file.name}`;
    const params = {
      Bucket: 'encode-music-bucket',
      Key: fileName,
      Body: file,
      ACL: 'public-read', // Make file publicly accessible
    };

    try {
      // Upload the file to S3
      await s3.upload(params).promise();
      const fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;

      // Insert the URL along with userID and name into DynamoDB
      const dbParams = {
        TableName: "user-music-table",
        Item: {
          "music": userID, // Assuming id as the primary key
          "name": name,
          "description": description,
          "audioUrl": fileUrl,
          "followers": 50,
          "rating": 7.5,
          
          // Add any other data you want to store
        }
      };

      await docClient.put(dbParams).promise();
      alert('File uploaded and data saved to DynamoDB successfully!');

    } catch (err) {
      console.error("Error uploading file or saving to DynamoDB:", err);
      alert('Error uploading file or saving to DynamoDB. Check the console for more information.');
    }
  };

  return (
    <div className="differentContent">
      <input
        placeholder="User ID"
        value={userID}
        onChange={handleUserIDChange}
        className="inputField"
      />
      <input
        placeholder="Name"
        value={name}
        onChange={handleNameChange}
        className="inputField"
      />
      <button className="uploadButton" onClick={handleUploadClick}>Upload Audio</button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="audio/*"
      />
      <textarea placeholder="Describe your music" rows="5" value={description} onChange={handleDescriptionChange}></textarea>
      <div className="buttonsRow">
        <button className="actionButton" onClick={() => { /* Logic to play audio */ }}>Listen</button>
        <button className="actionButton" onClick={handleUploadAndPost}>Post</button>
      </div>
    </div>
  );
}

export default DifferentContent;
