module.exports = (app) => {
  app.post('/uploadHandler', function (req, res, next) {
    res.send({ responseText: "success" }); // You can send any response to the user here
  });
}