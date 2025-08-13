export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  unit?: string;
}

export type Vehicle = {
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
};

export type Resident = {
  displayName: string;
  email: string;
  phone: string;
  address: Address;
  vehicles: Vehicle[];
};
