create table review(
    review_id serial primary key,
    description text not null,
    rating smallint not null,
    created_at timestamp not null,
    modified_at timestamp,
    product_id int,

    constraint fk_product
        foreign key(product_id)
            references product(product_id)
)