create table order_(
    order_id serial primary key,
    product_id int,
    order_unit int not null,
    created_at timestamp not null,
    cart_id int,

    constraint fk_product
        foreign key(product_id)
            references product(product_id),
    constraint fk_cart
        foreign key(cart_id)
            references cart(cart_id)
)