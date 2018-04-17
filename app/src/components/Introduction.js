import React, { Component } from 'react';
import logo from './logo.svg';
import './css/foundation.css';
import './css/app.css';
import {Row, Column, Colors, Button } from 'react-foundation';

class Introduction extends Component {
  render() {
    return (
        <div className="row justify-content-center">
            <div className="col-6">
                <p>This is a building image recognition web application, you can go to the home page and upload either a local
                image file (JPG, PNG), or you can enter the image uri, system will analysis your image and gives your the most
                possible result, and provide top 5 candidate result, you can view the probability by the table, bar chart and super
                pie chart, also you can click the building name to view the detail. If the result is not accurate may be the building
                is not in our neural network model, building list tag shows all buildings we currently support, if the result is not
                accurate or you like to add your favorite building to our model, feel free to contact with scottdiao33@gmail.com</p>
            </div>
        </div>
    );
  }
}

export default Introduction;
