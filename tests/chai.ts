import chai from 'chai';
import chaiHttp from 'chai-http';
import sinonChai from 'sinon-chai';

chai.should();
chai.use(chaiHttp);
chai.use(sinonChai);

export default chai;
