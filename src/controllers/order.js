const Order = require('../models/order');

async function insert(req, res) {
  try {
    const newOrder = new Order({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      items: req.body.items.map((item) => item._id) || [],
    });
    await newOrder.save();
    res.status(200).send({ message: 'Se creo la orden con exito' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
}

async function findAll(req, res) {
  try {
    const orders = await Order.find().populate('items').exec();
    res.status(200).send(orders);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
}

async function destroy(req, res) {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Orden Eliminada' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
}

async function download(req, res) {
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
      filename: `Detalles-de-la-Orden-${new Date().getTime()}.pdf`,
      htmlContent: html,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

module.exports = {
  insert,
  findAll,
  destroy,
  download,
};
