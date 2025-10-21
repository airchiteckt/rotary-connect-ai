-- Set Stanislao Elefante account to premium (active subscription)
UPDATE profiles 
SET subscription_type = 'active', 
    account_status = 'active'
WHERE user_id = 'dae1e995-43d1-4e8a-bb18-5700d6b6836a';