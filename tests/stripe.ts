import nock from 'nock';

const baseUrl = 'https://api.stripe.com';

export const mockCreateCustomer = (response = {}) => {
  nock(baseUrl)
    .post('/v1/customers')
    .reply(200, response);
};

export const mockUpdateCustomer = (customerId, response = {}) => {
  nock(baseUrl)
    .post(`/v1/customers/${customerId}`)
    .reply(200, response);
};

export const mockDeleteCustomer = (customerId, response = {}) => {
  nock(baseUrl)
    .delete(`/v1/customers/${customerId}`)
    .reply(200, response);
};
