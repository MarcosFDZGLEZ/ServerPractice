import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';

describe('User Endpoints', () => {
  let email;
  let accessToken;
  let refreshToken;
  let userId;

  beforeEach(async () => {
    email = `user-test-${Date.now()}@example.com`;
    const response = await request(app)
      .post('/api/user/register')
      .send({
        email,
        password: 'SecurePassword123'
      });

    expect(response.status).toBe(201);
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
    userId = response.body.user._id;
  });

  it('registers a user and returns tokens', async () => {
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
    expect(userId).toBeTruthy();
  });

  it('rejects duplicate registration', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({ email, password: 'SecurePassword123' });

    expect(response.status).toBe(409);
  });

  it('logs in successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({ email, password: 'SecurePassword123' });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.refreshToken).toBeTruthy();
  });

  it('rejects login with incorrect password', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({ email, password: 'WrongPassword123' });

    expect(response.status).toBe(401);
  });

  it('refreshes an access token when given a valid refresh token', async () => {
    const response = await request(app)
      .post('/api/user/refresh')
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeTruthy();
  });

  it('rejects refresh when no refresh token is provided', async () => {
    const response = await request(app)
      .post('/api/user/refresh')
      .send({});

    expect(response.status).toBe(401);
  });

  it('fails email validation with an incorrect code then succeeds with the correct code', async () => {
    const loginResponse = await request(app)
      .post('/api/user/login')
      .send({ email, password: 'SecurePassword123' });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.accessToken;

    const badResponse = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' });

    expect(badResponse.status).toBe(400);
    expect(badResponse.body.message).toMatch(/Incorrect code/);

    const user = await User.findOne({ email });
    const goodResponse = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: user.verificationCode });

    expect(goodResponse.status).toBe(200);
    expect(goodResponse.body.message).toBe('Email verified');
  });

  it('updates personal data and returns the current user', async () => {
    const updateResponse = await request(app)
      .put('/api/user/onboarding')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Jane', lastName: 'Doe', nif: '12345678' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('Jane');
    expect(updateResponse.body.lastName).toBe('Doe');

    const meResponse = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.email).toBe(email);
  });

  it('creates a new company and allows invite-only access for admin users', async () => {
    const companyResponse = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Company One',
        cif: `CIF-${Date.now()}`,
        isFreelance: false,
        address: {
          street: 'Street 1',
          number: '100',
          postal: '28001',
          city: 'Madrid',
          province: 'Madrid'
        }
      });

    expect(companyResponse.status).toBe(200);
    expect(companyResponse.body._id).toBeTruthy();

    const inviteResponse = await request(app)
      .post('/api/user/invite')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: `guest-${Date.now()}@example.com` });

    expect(inviteResponse.status).toBe(201);
    expect(inviteResponse.body.role).toBe('guest');
  });

  it('joins an existing company as guest when using a company cif already in use', async () => {
    const companyCIF = `CIF-${Date.now()}`;

    const ownerResponse = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Owner Company',
        cif: companyCIF,
        isFreelance: false,
        address: {
          street: 'Street 1',
          number: '100',
          postal: '28001',
          city: 'Madrid',
          province: 'Madrid'
        }
      });

    expect(ownerResponse.status).toBe(200);

    const secondEmail = `user2-test-${Date.now()}@example.com`;
    const secondRegister = await request(app)
      .post('/api/user/register')
      .send({ email: secondEmail, password: 'SecurePassword123' });

    expect(secondRegister.status).toBe(201);
    const secondToken = secondRegister.body.accessToken;

    const joinResponse = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${secondToken}`)
      .send({
        name: 'Ignored Company',
        cif: companyCIF,
        isFreelance: false,
        address: {
          street: 'Street 2',
          number: '200',
          postal: '28002',
          city: 'Barcelona',
          province: 'Barcelona'
        }
      });

    expect(joinResponse.status).toBe(200);
    const joinedUser = await User.findOne({ email: secondEmail });
    expect(joinedUser.role).toBe('guest');
  });

  it('returns 400 when uploading a logo without a file', async () => {
    const response = await request(app)
      .patch('/api/user/logo')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
  });

  it('logs out successfully', async () => {
    const logoutResponse = await request(app)
      .post('/api/user/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.message).toMatch(/ACK/i);
  });

  it('soft deletes the user when query soft=true', async () => {
    const deleteResponse = await request(app)
      .delete('/api/user?soft=true')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(deleteResponse.status).toBe(204);
    const user = await User.findById(userId);
    expect(user.deleted).toBe(true);
  });

  it('hard deletes the user when no soft query is provided', async () => {
    const response = await request(app)
      .delete('/api/user')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(204);
    const user = await User.findById(userId);
    expect(user).toBeNull();
  });
});
