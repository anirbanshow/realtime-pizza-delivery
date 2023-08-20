const Order = require('../../../models/Order');
const moment = require('moment');

function orderController() {
    return {
        index: async (req, res) => {
            const orders = await Order.find(
                { status: { $ne: 'completed' } }
            ).sort({ 'createdAt': -1 }).populate('customerId', '-password');

            if (req.xhr) {
                return res.json(orders)
            } else {
                return res.render('admin/orders', { orders: orders, moment: moment });
            }

        }
    }
}

module.exports = orderController;