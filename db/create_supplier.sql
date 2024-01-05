create table if not exists supplier(
    supplier_id serial primary key,
    supplier_name varchar(255) not null,
    address varchar(255) not null,
    telephone varchar(255) not null,
    email varchar(255) not null,
    postal_code varchar(255)
);