create table cart(
    cart_id serial primary key,
    shipped_on timestamp,
    shipper_id int,
    created_at timestamp,
    fulfilled boolean not null,
    is_cancelled boolean,
    ordered_by int,
    total_cost int not null,
    
    constraint fk_shipper
        foreign key(shipper_id)
            references shipper(shipper_id),
    
    constraint fk_user
        foreign key(ordered_by)
            references user_(user_id)
);