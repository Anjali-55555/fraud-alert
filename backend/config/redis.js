const EventEmitter = require('events');

class InMemoryPubSub extends EventEmitter {
  constructor() {
    super();
    this.store = {};
  }
  async connect() {
    console.log('[Cache] Using In-Memory fallback (Redis not running)');
    return true;
  }
  async get(key) {
    return this.store[key] || null;
  }
  async set(key, value, options) {
    this.store[key] = value;
    if (options && options.EX) {
      setTimeout(() => {
        delete this.store[key];
      }, options.EX * 1000);
    }
    return 'OK';
  }
  async del(key) {
    delete this.store[key];
    return 1;
  }
  async publish(channel, message) {
    this.emit(channel, message);
    return 1;
  }
  async subscribe(channel, callback) {
    this.on(channel, callback);
    return 1;
  }
}

let redisClient;

const getRedisClient = () => {
  if (redisClient) return redisClient;

  if (process.env.USE_REDIS === 'true') {
    try {
      const redis = require('redis');
      const client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
      });
      client.on('error', (err) => {
        console.log('[Cache] Redis error, switching to in-memory fallback:', err.message);
        redisClient = new InMemoryPubSub();
      });
      client.connect().then(() => {
        console.log('[Cache] Redis connected successfully');
        redisClient = client;
      }).catch(err => {
        console.log('[Cache] Redis connection failed, using in-memory fallback');
        redisClient = new InMemoryPubSub();
      });
    } catch (e) {
      console.log('[Cache] redis npm package not found or fail, using in-memory fallback');
      redisClient = new InMemoryPubSub();
    }
  } else {
    redisClient = new InMemoryPubSub();
  }
  return redisClient;
};

module.exports = {
  getRedisClient,
  InMemoryPubSub
};
