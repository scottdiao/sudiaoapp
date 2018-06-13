const express = require('express')
const app = express()
const path = require("path");

app.set('port', process.env.PORT || 3000)
app.use(express.static('public'))
app.use('/introduction', express.static('public'))
app.use('/list', express.static('public'))


require('./src-server/multerImpl')(app)

module.exports = app.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'))
  console.log('Visit http://localhost:' + app.get('port'))
})
