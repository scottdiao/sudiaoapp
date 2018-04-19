import React, { Component } from 'react';
import './css/foundation.css';
import './css/app.css';

class Introduction extends Component {
  render() {
    return (
        <div className="row justify-content-center">
            <div className="col-6">
                <p>This is a building image recognition web application, you can go to the home page and upload a local
                image file (JPG, PNG), or you can enter any public image uri, system will then analysis your image and gives your the most
                possible result, along with top 5 candidate result, you can view the probability by the table, bar chart and
                pie chart. If the result is not accurate may be the building is not in our neural network model, checkout the building list tag
                list all buildings are currently in the model, if the result is still not
                accurate or you like to add your favorite building to our model, feel free to contact with scottdiao33@gmail.com</p>
            </div>
        </div>
    );
  }
}

export default Introduction;
