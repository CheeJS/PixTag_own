import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {
  state = {
    selectedImage: null,
    imageUploadedSuccessfully: false,
  };

  onImageChange = (event) => {
    this.setState({ selectedImage: event.target.files[0] });
  };

  onImageUpload = () => {
    const { selectedImage } = this.state;

    if (!selectedImage) {
      console.error('No image selected');
      return;
    }

    const fileExtension = selectedImage.name.split('.').pop().toLowerCase(); // Get the file extension in lowercase
    let contentType;

    if (fileExtension === 'png') {
      contentType = 'image/png';
    } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      contentType = 'image/jpeg';
    } else {
      console.error('Unsupported file type');
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(selectedImage);

    reader.onload = () => {
      const imageData = reader.result;

      // Make a PUT request to upload the image data to S3, i think we have to use PUT instead of POST --https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html
      axios
        .put(`upload-image-s3bucket/${selectedImage.name}`, imageData, {
          headers: {
            'Content-Type': "image/" +fileExtension ,
          },
        })
        .then(() => {
          this.setState({ selectedImage: null, imageUploadedSuccessfully: true });
        })
        .catch((error) => {
          console.error('Error uploading the image:', error);
        });
    };

    reader.onerror = () => {
      console.error('Failed to read the image file');
    };
  };

  ImageData = () => {
    if (this.state.selectedImage) {
      return (
        <div>
          <h2>File Details</h2>
          <p>Name: {this.state.selectedImage.name}</p>
          <p>Type: {this.state.selectedImage.type}</p>
          <p>Size: {Math.round(this.state.selectedImage.size / 1024)} KB</p>
        </div>
      );
    } else if (this.state.imageUploadedSuccessfully) {
      return (
        <div>
          <br />
          <h4>The image has been successfully uploaded</h4>
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h4>Choose an image and press the upload button</h4>
        </div>
      );
    }
  };

  render() {
    return (
      <div className="container">
        <h2>Image Upload</h2>
        <div>
          <input type="file" onChange={this.onImageChange} />
          <button onClick={this.onImageUpload}>Upload</button>
        </div>
        {this.ImageData()}
      </div>
    );
  }
}

export default App;