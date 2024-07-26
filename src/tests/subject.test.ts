import axios from 'axios';
import { expect } from 'chai';
import { testSubjects } from './data/subjectsData';

describe('Subjects API', () => {
  it('should add subjects', async () => {
    for (const subject of testSubjects) {
      const response = await axios.post(
        'http://localhost:3000/subjects',
        subject
      );
      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('name', subject.name);
    }
  });

  it('should not add duplicate abbreviations', async () => {
    try {
      await axios.post('http://localhost:3000/subjects', testSubjects[0]);
    } catch (error: any) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data).to.have.property(
        'error',
        'Abbreviation already exists'
      );
    }
  });

  it('should get paginated subjects', async () => {
    const response = await axios.get(
      'http://localhost:3000/subjects?page=1&limit=5'
    );
    expect(response.status).to.equal(200);
    expect(response.data)
      .to.have.property('data')
      .that.is.an('array')
      .with.lengthOf(5);
    expect(response.data).to.have.property('total').that.is.a('number');
    expect(response.data).to.have.property('page', 1);
    expect(response.data).to.have.property('limit', 5);
  });

  it('should get a subject by abbreviation', async () => {
    const response = await axios.get('http://localhost:3000/subjects/WA');
    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('abbreviation', 'WA');
    expect(response.data).to.have.property('name', 'Webové aplikace');
  });
});
