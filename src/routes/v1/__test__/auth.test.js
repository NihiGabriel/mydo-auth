const request = require('supertest');
const app = require('../../../config/app');

// desc defines a grp
// test user registeration
describe('User Registeration', () => {
    it('Successfully registers a user', async() => {
        jest.useFakeTimers();

        return request(app)
        .post('/api/identity/v1/auth/register')
        .send({
            email: "adenijiopeyemi68@gmail.com",
            password: "#_sonofGod1",
            phoneNumber: "08164734220"
        })
        .expect(200)
        .expect((resp) => {
            resp.body.error = false;
            resp.body.errors.length = 0;
            resp.body.message = 'successful',
            resp.body.status = 200
        })
    }, 30000)
});