INSERT INTO`TB-Member`
 SET `key` = UUID()
, `id` = ?
, `password` = SHA2(?, 256)
, `name` = ?
, `update` = CURRENT_TIMESTAMP()
, `entry` = NOW();
