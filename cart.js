module.exports = function Cart(cart) {
    this.items = cart.items || {};
    this.totalItems = cart.totalItems || 0;
    this.totalPrice = cart.totalPrice || 0;

    this.add = function(item, id) {
        var cartItem = this.items[id];
        if (!cartItem) {
            cartItem = this.items[id] = {item: item, quantity: 0, discountedPrice: 0};
        }
        cartItem.quantity++;
        cartItem.discountedPrice = cartItem.item.discountedPrice * cartItem.quantity;
        this.totalItems++;
        this.totalPrice += cartItem.item.discountedPrice;
    };

    this.remove = function(id) {
        this.totalItems -= this.items[id].quantity;
        this.totalPrice -= this.items[id].discountedPrice;
        delete this.items[id];
    };

    this.getItems = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};
