create table cart(
    cart_id serial primary key,
    shipped_on timestamp,
    shipper_id int,
    created_at timestamp,
    fulfilled boolean not null,
    is_cancelled boolean,
    
    constraint fk_shipper
        foreign key(shipper_id)
            references shipper(shipper_id)
);