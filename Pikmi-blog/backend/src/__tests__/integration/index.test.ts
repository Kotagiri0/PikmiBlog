import request from 'supertest';
import app from '../../index';

describe('Express App', () => {
  describe('GET /health', () => {
    it('should return health check status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'ok',
        message: expect.any(String)
      });
    });
  });

  describe('Middleware', () => {
    it('should handle CORS', async () => {
      const response = await request(app)
        .options('/api/posts')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should parse JSON body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
        .set('Content-Type', 'application/json');

      // Should not get 400 for JSON parsing error
      expect(response.status).not.toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route');

      expect(response.status).toBe(404);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      // This test would need to be adapted based on rate limit configuration
      const response = await request(app).get('/health');

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
    });
  });
});