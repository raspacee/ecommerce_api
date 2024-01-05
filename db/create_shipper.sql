create table if not exists shipper(
    shipper_id serial primary key,
    name varchar(255) not null,
    telephone varchar(255) not null,
    email varchar(255) not null
);