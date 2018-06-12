import React, { Component } from 'react';
import './css/foundation.css';
import './css/app.css';

class Introduction extends Component {
  render() {
    return (
        <div className="row justify-content-center">
            <div className="col-lg-9 col-sm-12">
                <div class="card" >
                    <div class="card-body">
                        <h5 class="card-title">Introduction</h5>
                        <p class="card-text">To submit an image you can either upload a
                        image file (JPG, PNG) or enter an image uri <br/>
                        (ie. <a href="https://upload.wikimedia.org/wikipedia/commons/e/e3/Hello%2C_I_live_here.jpg">https://upload.wikimedia.org/wikipedia/commons/e/e3/Hello%2C_I_live_here.jpg)</a>, system will analysis the image and gives your the most
                        possible 5 results, along with the possibilities.  You can also view the building detail by clicking the building name.
                        If the result is not accurate may be the building is not in the neural network, to see all buildings currently supported please checkout the <a href="/list">building list</a> tag. If the result is still not
                        accurate or you like to add your favorite building to our model, feel free to contact with scottdiao33@gmail.com</p>
                        You can check out source code <a href="https://github.com/scottdiao/sudiaoapp" target="_blank" class="card-link">here</a>
                    </div>
                </div>
            </div>
        </div>
    );
  }
}

export default Introduction;
