import React, { useState, useEffect } from 'react';
import axios from 'axios';
import defaultPic from "../assets/images/default-profile-pic.png"

function UploadFile() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [filePreview, setFilePreview] = useState(defaultPic);

  const handleChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setFilePreview(URL.createObjectURL(selectedFile));
    } else {
      setFilePreview(defaultPic);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:3001/upload', formData, {
        // headers: {
        //   'Content-Type': 'multipart/form-data'
        // }
      });
      setFilename(response.data.filename);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (filePreview) {
      return () => URL.revokeObjectURL(filePreview);
    }
  }, [filePreview]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleChange} />
        {filePreview && <img src={filePreview} alt="Preview" />}
        <button type="submit">Upload</button>
      </form>
      {filename && <p>Uploaded filename: {filename}</p>}
    </div>
  );
}

export default UploadFile;
