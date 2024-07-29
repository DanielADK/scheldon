import axios from 'axios';
import { subjects } from '../data/subjectsData';
import { employee } from '../data/employeeData';
// import other data sets as needed

const uploadData = async (url: string, data: any[]) => {
  try {
    for (const item of data) {
      const response = await axios.post(url, item);
      console.log(`Uploaded: ${response.data.name}`);
    }
  } catch (error: any) {
    console.error(
      'Error uploading data:',
      error.response ? error.response.data : error.message
    );
  }
};

const uploadTestData = async () => {
  await uploadData('http://localhost:3000/subjects', subjects);
  await uploadData('http://localhost:3000/employee', employee);
  // Add more calls to uploadData for other data sets
};

uploadTestData();
