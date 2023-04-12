import { createServer } from '../dist/server.js';
import supertest from 'supertest';
import { expect } from 'chai';

const serverUrl = 'http://localhost:5000';

const request = supertest(
  createServer({ serverUrl }),
);

const token = process.env.TEST_AUTH_TOKEN;

describe('GET /api/me/drinks', () => {
  it('should return an array of drinks', async () => {
    const response = await request
      .get('/api/me/drinks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).to.have.property('status').that.equals('success');
    expect(response.body).to.have.property('result').that.is.an('array');
  });
  
  it('should return a 401 error if no authorization token is provided', async () => {
    await request.get('/api/me/drinks').expect(401);
  });
});

describe('GET /api/me/drinks/doppio', () => {
  it('should return an array of drinks', async () => {
    const response = await request
      .get('/api/me/drinks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body).to.have.property('status', 'success');
    expect(response.body)
      .to.have.property('result')
      .that.is.an('array')
      .and.has.lengthOf(20);    
  });
  
  it('should return a 401 error if no authorization token is provided', async () => {
    await request.get('/api/me/drinks').expect(401);
  });
});

describe('GET /api/me/drinks/:id', () => {
  const id = 'doppio';

  it('should return a doppio drink', async () => {
    const response = await request
      .get(`/api/me/drinks/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body).to.have.property('status', 'success');
    expect(response.body).to.have.property('result').that.deep.equals({
      id: 'doppio',
      name: 'Doppio',
      ordered: false,
      layers: [
        {
          color: '#613916',
          label: 'espresso'
        },
        ],
      image: `${serverUrl}/assets/cups/doppio.png`,
      url: `${serverUrl}/api/me/drinks/doppio`,
    });
  });

  it('should return a 404 error if the drink is not found', async () => {
    const invalidId = 'invalid-id';

    const response = await request
      .get(`/api/me/drinks/${invalidId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(response.body).to.have.property('status', 'fail');
    expect(response.body).to.have.property('errors').that.is.an('array');
    expect(response.body.errors[0]).to.have.property('code', 'not_found');
  });
});
