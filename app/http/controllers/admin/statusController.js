const Order = require('../../../models/Order');
const moment = require('moment');

function statusController() {
    return {
        update: async (req, res) => {
            try {
                await Order.updateOne({ _id: req.body.orderID }, { $set: { status: req.body.status } });

                // Emit Event
                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderupdatedController',
                    {
                        id: req.body.orderID,
                        status: req.body.status
                    }
                );

                return res.redirect('/admin/orders');
            } catch (error) {
                console.log(error);
            }
        }
    }
}

module.exports = statusController;   