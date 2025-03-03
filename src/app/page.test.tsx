import { getFilteredAdvocates } from './page';
import { expect, test, describe } from 'vitest';

describe('getFilteredAdvocate', () => {
  test('Specialty array returns on partial search term match', () => {
    const advocates = [
      {
        id: 1,
        firstName: 'Bob',
        lastName: 'Smith',
        city: 'Alexandria',
        degree: 'BSW',
        specialties: [
          'Human Development',
          'Awesomeness'
        ],
        yearsOfExperience: '1'
      }
    ]

    const result = getFilteredAdvocates(advocates, 'human')

    expect(result.length).toBe(1);
  });
  test('advocates array to return only those advocates with minimum years of experience from search', () => {
    const advocates = [
      {
        id: 1,
        firstName: 'Bob',
        lastName: 'Smith',
        city: 'Alexandria',
        degree: 'BSW',
        specialties: [
          'Human Development',
          'Awesomeness'
        ],
        yearsOfExperience: '6'
      }
    ]

    const result = getFilteredAdvocates(advocates, '5')
    const result2 = getFilteredAdvocates(advocates, '7')
    const result3 = getFilteredAdvocates(advocates, '6')

    // If they have more years of experience, they'll stay in the filtered list
    expect(result.length).toBe(1);
    // If they have fewers years of experience, they will be removed from the filtered list
    expect(result2.length).toBe(0);
    // If they have years of experience equal to the search term, they'll remain in the list
    expect(result3.length).toBe(1);
  });
});

