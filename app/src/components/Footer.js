import React from 'react'
import blocks from './blocks.svg';



const Footer = () => (
  <footer class="App-footer">
      <div class="Contact">
        <div class="row">
          <div class="col-md-12 mt-md-0 mt-3">
          	<div><i class="fas fa-envelope"></i> scottdiao33@gmail.com</div>
           	<div><i class="fas fa-phone"></i> 334-498-5045</div>
            <div><i class="fab fa-github"></i> GitHub</div>
          </div>
          <hr class="clearfix w-100 d-md-none pb-3"/>
        </div>
      </div>
      <div class="Version">
      	<i class="far fa-clone"></i> v 1.0.2
      </div>
    </footer>

)

export default Footer
