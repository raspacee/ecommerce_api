#!/usr/bin/env bash

cd "$(dirname "$0")" # change working directory to source file
psql -U $user -d $database -a -f ./create_user_address.sql
psql -U $user -d $database -a -f ./create_user.sql
psql -U $user -d $database -a -f ./create_admin.sql
psql -U $user -d $database -a -f ./create_shipper.sql
psql -U $user -d $database -a -f ./create_supplier.sql
psql -U $user -d $database -a -f ./create_product.sql
psql -U $user -d $database -a -f ./create_payment.sql
psql -U $user -d $database -a -f ./create_cart.sql
psql -U $user -d $database -a -f ./create_order.sql
psql -U $user -d $database -a -f ./create_review.sql