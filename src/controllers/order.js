const Order = require('../models/order');
const orderCtrl = {};

orderCtrl.createOrder = async (req, res) => {
  const newOrder = new Order({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    items: req.body.items.map((item) => item._id) || [],
  });
  await newOrder.save().then(
    (rec) => {
      res.status(200).json(rec);
    },
    (err) => {
      res.status(500).json({ error: 'error' });
    }
  );
};

orderCtrl.getOrders = async (req, res) => {
  await Order.find()
    .populate('items')
    .exec()
    .then((rec) => {
      res.status(200).json(rec);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

orderCtrl.deleteOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ status: 'Orden Eliminada' });
};

orderCtrl.download = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('items');
    const templateBody = `<div class="container">
      <h1>${order.firstName} ${order.lastName}</h1>
      <p>${order.email}</p>
      <p>${order.phone}</p>
      <p>${order.items}</p>
    </div>`;

    const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <title>Internal</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
      </head>
      <body>
        ${templateBody}
      </body>
    </html>`;
    res.pdfFromHTML({
      filename: 'Detalles-de-la-Orden-' + new Date().getTime() + '.pdf',
      htmlContent: html,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

module.exports = orderCtrl;
