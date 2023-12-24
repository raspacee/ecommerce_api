create table product(
    product_id serial primary key,
    product_name varchar(255) not null,
    product_category varchar(255),
    unit_price int not null,
    stock_unit int not null,
    description text,
    supplier_id int,
    created_at timestamp not null,
    available_size varchar(255),
    available_color varchar(255),
    unit_weight real,
    pictures varchar(500)[],

    constraint fk_supplier
        foreign key(supplier_id)
            references supplier(supplier_id)
);
