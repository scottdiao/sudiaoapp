module.exports = (app) => {
  app.post('/uploadHandler', function (req, res, next) {
    res.send({ responseText: "success" }); // Fake response for dropzone default post url
  });
}
