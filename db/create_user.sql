create table if not exists user_(
    user_id serial primary key,
    email varchar(255) unique not null,
    address_id int,
    created_at timestamp not null,
    password varchar(255) not null,
    telephone varchar(100) not null,
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    
    constraint fk_address
        foreign key(address_id)
            references user_address(address_id)
);