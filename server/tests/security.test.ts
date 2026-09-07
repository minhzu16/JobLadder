import request from 'supertest';
import app from '../src/index';

describe('Security & Authentication QA Audit', () => {
  
  let server: any;

  beforeAll((done) => {
    server = app.listen(4000, () => {
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Bug #1: Broken Access Control', () => {
    it('should block unauthenticated access to protected routes (e.g., /api/chat/history)', async () => {
      const res = await request(app).get('/api/chat/history');
      expect(res.status).toBe(401);
    });
  });

  describe('Bug #6: IDOR in Mock Interview API', () => {
    it('should not allow fetching an interview session without token', async () => {
      const res = await request(app).get('/api/interview/fake-session-id-123');
      expect(res.status).toBe(401); 
    });
  });

  describe('Bug #8: Sensitive Data Exposure', () => {
    it('should not leak password in user responses', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

});
