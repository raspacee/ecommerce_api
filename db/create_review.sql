create table review(
    review_id serial primary key,
    description text not null,
    rating smallint not null,
    created_at timestamp not null,
    modified_at timestamp,
    product_id int not null,
    created_by int not null,

    constraint fk_product
        foreign key(product_id)
            references product(product_id),

    constraint fk_user
        foreign key(created_by)
            references user_(user_id)
)