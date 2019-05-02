import redis from 'redis';

export const client = redis.createClient({
  port: 10077,
  host: 'redis-10077.c12.us-east-1-4.ec2.cloud.redislabs.com',
  password: '4GlynTzt3ea3CvrYjqwXesdLOI88BT3p',
});
