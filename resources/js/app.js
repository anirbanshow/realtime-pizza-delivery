import axios from 'axios';
import Noty from 'noty';
import moment from 'moment';

// Socket
let socket = io();

let addToCart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector("#cartCounter");

function updateCart(pizza) {
    axios.post('/update-cart', pizza).then((res) => {
        cartCounter.innerText = res.data.totalQty;
        new Noty({
            text: "Item added to cart",
            type: 'success',
            closeWith: ['click', 'button'],
            timeout: 1000
        }).show();
    }).catch((error) => {
        new Noty({
            text: "Something went wrong",
            type: 'error',
            closeWith: ['click', 'button'],
            timeout: 1000
        }).show();
    });
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {

        let pizza = JSON.parse(btn.getAttribute('data-pizza'));
        updateCart(pizza);
    });
});

// Remove aleart message after 2 Seconds
const alertMsg = document.querySelector('#success-alert');
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove();
    }, 2000);
}


// Admin JS
const orderTableBody = document.querySelector("#orderTableBody");
let orders = [];
let markup;

axios.get('/admin/orders', {
    headers: {
        "X-Requested-With": "XMLHttpRequest"
    }
}).then(res => {
    orders = res.data;
    markup = generateMarkup(orders);
    orderTableBody.innerHTML = markup;
}).catch(err => {
    console.log(err);
})

function renderItems(items) {
    let parsedItems = Object.values(items);
    console.log('PARS:', parsedItems);
    return parsedItems.map((menuItem) => {
        return `
            <p> ${menuItem.item.name} - ${menuItem.qty} </p>
        `
    }).join('');
}

function generateMarkup(orders) {
    return orders.map(order => {
        return `
            <tr>
                <td class="border px-4 py-2 text-green-900">
                    <p>${order._id}</p>
                    <div>${renderItems(order.items)}</div>
                </td>
                <td class="border px-4 py-2">${order.customerId.name}</td>
                <td class="border px-4 py-2">${order.address}</td>
                <td class="border px-4 py-2">
                    <div class="inline-block relative w-64">
                        <form action="/admin/order/status" method="post">
                            <input type="hidden" name="orderID" value="${order._id}">
                            <select name="status" onchange="this.form.submit()" class="block apprearance-none w-full bg-white 
                                border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight 
                                focus:outline-none focus:shadow-outline">
                        
                            <option value="order_placed" ${order.status === 'order_placed' ? 'selected' : ''} >
                                Placed
                            </option>
                        
                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''} >
                                Confirmed
                            </option>
                        
                            <option value="prepared" ${order.status === 'prepared' ? 'selected' : ''} >
                                Prepared
                            </option>
                        
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''} >
                                Delivered
                            </option>
                        
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''} >
                                Completed
                            </option>
                        
                            </select>
                        </form>
                    </div>
                </td>
                <td class="border px-4 py-2">
                    ${moment(order.createdAt).format('hh:mm A')}
                </td>
            </tr>
        `;
    }).join('');
}

socket.on('orderPlaced', (order) => {
    console.log('From Admin side', order);
    new Noty({
        type: 'success',
        text: "New order!!!",
        timeout: 1000,
        progressBar: false
    }).show();

    axios.get('/admin/orders', {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then(res => {
        orders = res.data;
        markup = generateMarkup(orders);
        orderTableBody.innerHTML = markup;
    }).catch(err => {
        console.log(err);
    })
});


// *** Change order status
let statuses = document.querySelectorAll(".status_line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement('small');

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed');
        status.classList.remove('current');
    });

    let stepCompleted = true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.status;
        if (stepCompleted) {
            status.classList.add('step-completed');
        }

        if (dataProp === order.status) {
            stepCompleted = false;
            time.innerText = moment(order.updatedAt).format('hh:mm A');
            status.appendChild(time);
            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current');
            }
        }
    });
}

updateStatus(order);



// Join
if (order) {
    socket.emit('join', `order_${order._id}`);
    // order_64b1025a0a484ad5f3f6e571
}

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes('admin')) {
    socket.emit('join', 'adminRoom');
}

socket.on('orderupdatedController', (data) => {
    let updatedOrder = { ...order };
    updatedOrder.updatedAt = moment().format();
    updatedOrder.status = data.status;

    console.log(order);

    updateStatus(updatedOrder);

    new Noty({
        type: 'success',
        text: "Order updated successfully",
        timeout: 1000,
        progressBar: false
    }).show();
});

// 2:17:48