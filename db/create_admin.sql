create table admin_(
    admin_id serial primary key,
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    telephone varchar(100) not null,
    email varchar(255) unique not null,
    privilege smallint not null,
    password varchar(255) not null,
    created_at timestamp not null,
    modified_at timestamp
);