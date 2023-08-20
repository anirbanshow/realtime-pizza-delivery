const Menu = require('../../models/menu');

function homeController() {
    // Function Factory
    return {
        index: async (req, res) => {

            const pizzas = await Menu.find();
            res.render('home', { pizzas: pizzas });
        }
    }
}


module.exports = homeController;