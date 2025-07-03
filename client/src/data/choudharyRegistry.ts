export interface ChoudharyMember {
  id: string;
  firstName: string;
  lastName: string;
  aadharNumber: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  state: string;
  district: string;
  city: string;
  address: string;
  phoneNumber: string;
  email?: string;
  occupation?: string;
  registrationDate: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

export const choudharyRegistry: ChoudharyMember[] = [
  {
    id: "CH001",
    firstName: "Namit",
    lastName: "Choudhary",
    aadharNumber: "857315415666",
    dateOfBirth: "1995-03-15",
    gender: "Male",
    state: "Maharashtra",
    district: "Mumbai",
    city: "Mumbai",
    address: "Andheri West, Mumbai",
    phoneNumber: "+91-9876543210",
    email: "namit.choudhary@email.com",
    occupation: "Software Engineer",
    registrationDate: "2023-01-15",
    status: "Active"
  },
  {
    id: "CH002",
    firstName: "Rajesh",
    lastName: "Choudhary",
    aadharNumber: "123456789012",
    dateOfBirth: "1988-07-22",
    gender: "Male",
    state: "Delhi",
    district: "New Delhi",
    city: "New Delhi",
    address: "Connaught Place, New Delhi",
    phoneNumber: "+91-9876543211",
    email: "rajesh.choudhary@email.com",
    occupation: "Business Owner",
    registrationDate: "2023-02-10",
    status: "Active"
  },
  {
    id: "CH003",
    firstName: "Priya",
    lastName: "Choudhary",
    aadharNumber: "234567890123",
    dateOfBirth: "1992-11-08",
    gender: "Female",
    state: "Karnataka",
    district: "Bangalore",
    city: "Bangalore",
    address: "Koramangala, Bangalore",
    phoneNumber: "+91-9876543212",
    email: "priya.choudhary@email.com",
    occupation: "Doctor",
    registrationDate: "2023-03-05",
    status: "Active"
  },
  {
    id: "CH004",
    firstName: "Amit",
    lastName: "Choudhary",
    aadharNumber: "345678901234",
    dateOfBirth: "1990-04-12",
    gender: "Male",
    state: "Gujarat",
    district: "Ahmedabad",
    city: "Ahmedabad",
    address: "Satellite, Ahmedabad",
    phoneNumber: "+91-9876543213",
    email: "amit.choudhary@email.com",
    occupation: "Architect",
    registrationDate: "2023-04-20",
    status: "Active"
  },
  {
    id: "CH005",
    firstName: "Neha",
    lastName: "Choudhary",
    aadharNumber: "456789012345",
    dateOfBirth: "1993-09-30",
    gender: "Female",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    address: "T Nagar, Chennai",
    phoneNumber: "+91-9876543214",
    email: "neha.choudhary@email.com",
    occupation: "Teacher",
    registrationDate: "2023-05-12",
    status: "Active"
  },
  {
    id: "CH006",
    firstName: "Vikram",
    lastName: "Choudhary",
    aadharNumber: "567890123456",
    dateOfBirth: "1987-12-03",
    gender: "Male",
    state: "Punjab",
    district: "Chandigarh",
    city: "Chandigarh",
    address: "Sector 17, Chandigarh",
    phoneNumber: "+91-9876543215",
    email: "vikram.choudhary@email.com",
    occupation: "Police Officer",
    registrationDate: "2023-06-08",
    status: "Active"
  },
  {
    id: "CH007",
    firstName: "Sunita",
    lastName: "Choudhary",
    aadharNumber: "678901234567",
    dateOfBirth: "1991-06-18",
    gender: "Female",
    state: "Rajasthan",
    district: "Jaipur",
    city: "Jaipur",
    address: "C Scheme, Jaipur",
    phoneNumber: "+91-9876543216",
    email: "sunita.choudhary@email.com",
    occupation: "Designer",
    registrationDate: "2023-07-15",
    status: "Active"
  },
  {
    id: "CH008",
    firstName: "Rahul",
    lastName: "Choudhary",
    aadharNumber: "789012345678",
    dateOfBirth: "1989-02-25",
    gender: "Male",
    state: "Uttar Pradesh",
    district: "Lucknow",
    city: "Lucknow",
    address: "Gomti Nagar, Lucknow",
    phoneNumber: "+91-9876543217",
    email: "rahul.choudhary@email.com",
    occupation: "Engineer",
    registrationDate: "2023-08-22",
    status: "Active"
  },
  {
    id: "CH009",
    firstName: "Kavita",
    lastName: "Choudhary",
    aadharNumber: "890123456789",
    dateOfBirth: "1994-10-14",
    gender: "Female",
    state: "West Bengal",
    district: "Kolkata",
    city: "Kolkata",
    address: "Salt Lake, Kolkata",
    phoneNumber: "+91-9876543218",
    email: "kavita.choudhary@email.com",
    occupation: "Lawyer",
    registrationDate: "2023-09-30",
    status: "Active"
  },
  {
    id: "CH010",
    firstName: "Sanjay",
    lastName: "Choudhary",
    aadharNumber: "901234567890",
    dateOfBirth: "1986-05-07",
    gender: "Male",
    state: "Bihar",
    district: "Patna",
    city: "Patna",
    address: "Boring Road, Patna",
    phoneNumber: "+91-9876543219",
    email: "sanjay.choudhary@email.com",
    occupation: "Professor",
    registrationDate: "2023-10-18",
    status: "Active"
  },
  {
    id: "CH011",
    firstName: "Meera",
    lastName: "Choudhary",
    aadharNumber: "012345678901",
    dateOfBirth: "1996-01-20",
    gender: "Female",
    state: "Kerala",
    district: "Thiruvananthapuram",
    city: "Thiruvananthapuram",
    address: "Kovalam, Thiruvananthapuram",
    phoneNumber: "+91-9876543220",
    email: "meera.choudhary@email.com",
    occupation: "Artist",
    registrationDate: "2023-11-25",
    status: "Active"
  },
  {
    id: "CH012",
    firstName: "Arjun",
    lastName: "Choudhary",
    aadharNumber: "111111111111",
    dateOfBirth: "1990-08-11",
    gender: "Male",
    state: "Telangana",
    district: "Hyderabad",
    city: "Hyderabad",
    address: "Banjara Hills, Hyderabad",
    phoneNumber: "+91-9876543221",
    email: "arjun.choudhary@email.com",
    occupation: "Chef",
    registrationDate: "2023-12-03",
    status: "Active"
  },
  {
    id: "CH013",
    firstName: "Anjali",
    lastName: "Choudhary",
    aadharNumber: "222222222222",
    dateOfBirth: "1993-04-28",
    gender: "Female",
    state: "Odisha",
    district: "Bhubaneswar",
    city: "Bhubaneswar",
    address: "Nayapalli, Bhubaneswar",
    phoneNumber: "+91-9876543222",
    email: "anjali.choudhary@email.com",
    occupation: "Journalist",
    registrationDate: "2024-01-10",
    status: "Active"
  },
  {
    id: "CH014",
    firstName: "Deepak",
    lastName: "Choudhary",
    aadharNumber: "333333333333",
    dateOfBirth: "1988-12-16",
    gender: "Male",
    state: "Assam",
    district: "Guwahati",
    city: "Guwahati",
    address: "Fancy Bazaar, Guwahati",
    phoneNumber: "+91-9876543223",
    email: "deepak.choudhary@email.com",
    occupation: "Banker",
    registrationDate: "2024-02-14",
    status: "Active"
  },
  {
    id: "CH015",
    firstName: "Pooja",
    lastName: "Choudhary",
    aadharNumber: "444444444444",
    dateOfBirth: "1995-07-09",
    gender: "Female",
    state: "Jharkhand",
    district: "Ranchi",
    city: "Ranchi",
    address: "Kanke Road, Ranchi",
    phoneNumber: "+91-9876543224",
    email: "pooja.choudhary@email.com",
    occupation: "Nurse",
    registrationDate: "2024-03-08",
    status: "Active"
  }
];

export const getChoudharyByAadhar = (aadharNumber: string): ChoudharyMember | undefined => {
  return choudharyRegistry.find(member => member.aadharNumber === aadharNumber);
};

export const getChoudharyByName = (firstName: string, lastName: string): ChoudharyMember | undefined => {
  return choudharyRegistry.find(member => 
    member.firstName.toLowerCase() === firstName.toLowerCase() && 
    member.lastName.toLowerCase() === lastName.toLowerCase()
  );
};

export const getAllChoudharyMembers = (): ChoudharyMember[] => {
  return choudharyRegistry;
};

export const getChoudharyByState = (state: string): ChoudharyMember[] => {
  return choudharyRegistry.filter(member => member.state === state);
};

export const getChoudharyStats = () => {
  const total = choudharyRegistry.length;
  const male = choudharyRegistry.filter(m => m.gender === 'Male').length;
  const female = choudharyRegistry.filter(m => m.gender === 'Female').length;
  const states = [...new Set(choudharyRegistry.map(m => m.state))];
  
  return {
    total,
    male,
    female,
    states: states.length,
    active: choudharyRegistry.filter(m => m.status === 'Active').length
  };
}; 