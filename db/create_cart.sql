create table if not exists cart(
    cart_id serial primary key,
    shipped_on timestamp,
    shipper_id int,
    created_at timestamp,
    fulfilled boolean not null,
    is_cancelled boolean,
    ordered_by int,
    total_cost int not null,
    verified boolean,
    payment_id int,
    
    constraint fk_shipper
        foreign key(shipper_id)
            references shipper(shipper_id),
    
    constraint fk_user
        foreign key(ordered_by)
            references user_(user_id),

    constraint fk_payment 
        foreign key(payment_id)
            references payment(payment_id)
);

alter table payment add constraint fk_cart foreign key(cart_id) references cart(cart_id);