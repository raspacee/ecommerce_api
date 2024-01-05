create table if not exists user_address(
    address_id serial primary key,
    address_line_1 text not null,
    address_line_2 text,
    city varchar(100) not null,
    postal_code varchar(100),
    country varchar(50) not null
);