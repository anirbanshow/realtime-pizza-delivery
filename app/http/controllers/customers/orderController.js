const Order = require('../../../models/Order');
const moment = require('moment');

// 21:37 index-9
function orderController() {
    return {
        store: async (req, res) => {
            // Validate request
            const { phone, address } = req.body;

            if (!phone || !address) {
                req.flash('error', 'All fields are required');
                return res.redirect('/cart');
            }

            const order = new Order({
                customerId: "64afacab8c5e01e0ccaf5db5",
                items: req.session.cart.items,
                phone,
                address
            })

            order.save().then((result) => {
                delete req.session.cart;

                // Emit
                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderPlaced', { result });

                req.flash('success', 'Order placed successfully');
                return res.redirect('/customer/orders');
            }).catch((err) => {
                console.log(err);
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart');
            });
        },

        index: async (req, res) => {
            const orders = await Order.find(
                { customerId: "64afacab8c5e01e0ccaf5db5" }
            ).sort({ 'createdAt': -1 });

            res.render('customers/orders', { orders: orders, moment: moment });
        },

        show: async (req, res) => {
            const order = await Order.findById(req.params.id);
            // if (req.user._id.toString() === order.customerId.toString()) {
            //     res.render('customers/singleOrder', { order: order });
            // } else {
            //    res.render('/');
            // }
            res.render('customers/singleOrder', { order });
        }
    }
}

module.exports = orderController;