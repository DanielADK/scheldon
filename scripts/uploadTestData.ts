// Subjects
import axios from 'axios';

const testSubjects = [
  { name: 'Praxe', abbreviation: 'DC' },
  { name: 'Technické dokumentace', abbreviation: 'TD' },
  { name: 'Multimédia a vývoj her', abbreviation: 'MVH' },
  { name: 'Informační a komunikační technologie', abbreviation: 'IT' },
  { name: 'Matematika', abbreviation: 'M' },
  { name: 'Aplikovaná matematika', abbreviation: 'AM' },
  { name: 'Databázové systémy', abbreviation: 'DS' },
  { name: 'Webové aplikace', abbreviation: 'WA' },
  { name: 'Programové vybavení', abbreviation: 'PV' },
  { name: 'Teoretická informatika', abbreviation: 'TI' },
  { name: 'Elektrotechnická měření', abbreviation: 'EM' },
  { name: 'Elektronika a mikroelektronika', abbreviation: 'EnM' },
  { name: 'Elektrotechnika', abbreviation: 'Ele' },
  { name: 'Základy elektrotechniky', abbreviation: 'ZE' },
  { name: 'Cvičení z elektrotechniky', abbreviation: 'CEL' },
  { name: 'Fyzika', abbreviation: 'F' },
  { name: 'Český jazyk a literatura', abbreviation: 'C' },
  { name: 'Dějepis', abbreviation: 'D' },
  { name: 'Cvičení z automatizace a robotiky', abbreviation: 'CAu' },
  { name: 'Mikroprocesorová technika', abbreviation: 'MT' },
  { name: 'Tělesná výchova', abbreviation: 'TV' },
  { name: 'Cvičení ze správy IT', abbreviation: 'CIT' },
  { name: 'Elektronické počítače', abbreviation: 'EP' },
  { name: 'Základy společenských věd', abbreviation: 'ZSV' },
  { name: 'Anglický jazyk', abbreviation: 'A' },
  { name: 'Počítačové systémy a sítě', abbreviation: 'PSS' },
  { name: 'Hardware', abbreviation: 'HW' },
  { name: 'Podnikové informační systémy', abbreviation: 'PIS' },
  { name: 'Automatizační technika a robotika', abbreviation: 'AuR' },
  { name: 'Číslicová technika', abbreviation: 'CT' },
  { name: 'Technický projekt', abbreviation: 'TP' },
  { name: 'Chemie', abbreviation: 'CH' },
  { name: 'Ekonomika', abbreviation: 'EK' }
];

const uploadTestData = async () => {
  for (const subject of testSubjects) {
    try {
      const response = await axios.post(
        'http://localhost:3000/subjects',
        subject
      );
      console.log(`Uploaded subject: ${response.data.name}`);
    } catch (error: Error | any) {
      console.error(
        'Error uploading test data:',
        error.response ? error.response.data : error.message
      );
    }
  }
};

uploadTestData();
