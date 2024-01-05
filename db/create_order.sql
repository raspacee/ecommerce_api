create table if not exists order_(
    order_id serial primary key,
    product_id int,
    order_unit int not null,
    created_at timestamp not null,
    cart_id int not null,
    cost int not null,

    constraint fk_product
        foreign key(product_id)
            references product(product_id),
    constraint fk_cart
        foreign key(cart_id)
            references cart(cart_id)
)