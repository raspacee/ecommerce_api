create table payment(
    payment_id serial primary key,
    created_at timestamp,
    transaction_uuid uuid not null,
    cart_id int not null,

    constraint fk_cart
        foreign key(cart_id)
            references cart(cart_id)
)