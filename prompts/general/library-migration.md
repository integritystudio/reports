# library migration

**Category:** General
**For Developers:** False
**Contributor:** abhinavme1004@gmail.com
**Type:** TEXT

## Prompt

🔴 1. Data Access & Connection Management
These are critical because they affect performance, scalability, and outages.

🔹 Redis
❌ Jedis (older pattern, topology issues)

✅ Lettuce (reactive, auto-reconnect)

✅ Valkey Glide (AWS recommended)

🔹 JDBC Connection Pool
❌ Apache DBCP

❌ C3P0

✅ HikariCP (default in Spring Boot, fastest, stable)

 

🔹 ORM / Persistence
❌ Old Hibernate 4.x

❌ MyBatis legacy configs

✅ Hibernate 6+

✅ Spring Data JPA latest



---
*Source: [prompts.chat](https://prompts.chat) | License: CC0 1.0 (Public Domain)*
