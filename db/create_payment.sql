create table if not exists payment(
    payment_id serial primary key,
    created_at timestamp,
    transaction_uuid uuid not null,
    cart_id int
)